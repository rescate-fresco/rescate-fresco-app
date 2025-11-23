import express from "express";
import pool from "../database/index.js"; 
import * as Sentry from "@sentry/node";

// --- IMPORTACIONES S3 ---
import multer from 'multer'; // Para manejar la subida de archivos
import s3Client from '../config/s3.js'; // Importamos el cliente S3 que creamos
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'; // Para subir y borrar

// --- CONFIG DE MULTER ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// ----------------------------------------------
// Función para buscar lotes usando full-text search
// ----------------------------------------------
async function buscarLotes(searchTerm) {
    const query = `
        SELECT 
            l.id_lote,
            l.nombre_lote, 
            l.descripcion, 
            l.precio_rescate, 
            l.precio_original,
            l.fecha_vencimiento,
            t.nombre_tienda,
            t.id_tienda,
            (
                SELECT json_agg(img.url) 
                FROM imagenes_lotes img 
                WHERE img.id_lote = l.id_lote
            ) as imagenes
        FROM 
            lotes l
        JOIN 
            tiendas t ON l.id_tienda = t.id_tienda
        WHERE 
            l.estado = 'DISPONIBLE' 
            AND l.fecha_vencimiento > NOW()
            AND l.lotes_search_tsv @@ plainto_tsquery('spanish', $1)
        ORDER BY 
            ts_rank(l.lotes_search_tsv, plainto_tsquery('spanish', $1)) DESC,
            l.fecha_vencimiento ASC;
    `;
    try {
        const res = await pool.query(query, [searchTerm]);
        return res.rows;
    } catch (error) {
        console.error("Error en función buscarLotes (Repositorio):", error);
        throw error;
    }
}

// ----------------------------------------------
// Campos comunes para las consultas de lotes
// ----------------------------------------------
const CAMPOS_LOTE = `
    id_lote, 
    nombre_lote, 
    descripcion,
    precio_original, 
    precio_rescate, 
    fecha_vencimiento,
    id_tienda, 
    estado,
    ventana_retiro_inicio,
    ventana_retiro_fin,
    peso_qty
`;

// ----------------------------------------------
// -- Condiciones comunes para filtrar lotes como ofertas válidas --
// ----------------------------------------------
const CONDICIONES_OFERTA = `
    precio_rescate < precio_original
    AND estado IN ('RESERVADO', 'DISPONIBLE', 'NO DISPONIBLE')
    AND fecha_vencimiento >= CURRENT_DATE
`;

// ----------------------------------------------
// -- Ruta para buscar lotes por término --
// ----------------------------------------------
router.get("/buscar", async (req, res) => {
    const searchTerm = req.query.q; 
    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({ mensaje: "El término de búsqueda es requerido." });
    }
    try {
        const lotesEncontrados = await buscarLotes(searchTerm.trim()); 
        res.json(lotesEncontrados); 
    } catch (error) {
        Sentry.captureException(error);   
        res.status(500).json({ mensaje: "Error interno del servidor al realizar la búsqueda" });
    }
});

// ----------------------------------------------
// Ruta para obtener todos los lotes con opciones de filtrado y ordenamiento
// ----------------------------------------------
router.get("/", async (req, res) => {  
    const { categoria, sortBy = 'fecha_vencimiento', order = 'ASC' } = req.query;

    const queryParams = [];
    let baseQuery = `
        SELECT l.*, 
        (
            SELECT json_agg(img.url) 
            FROM imagenes_lotes img 
            WHERE img.id_lote = l.id_lote
        ) AS imagenes
        FROM lotes l
        LEFT JOIN lotes_categorias lc ON lc.id_lote = l.id_lote
        LEFT JOIN categorias c ON c.id_categoria = lc.id_categoria
    `;

    const whereClauses = ["l.estado = 'DISPONIBLE'"]; // ejemplo de filtro base

    if (categoria) {
        queryParams.push(categoria);
        whereClauses.push(`c.id_categoria = $${queryParams.length}`);
    }

    baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;

    const allowedSortBy = ['fecha_vencimiento', 'precio_rescate', 'ventana_retiro_inicio'];
    const sortColumn = allowedSortBy.includes(sortBy) ? sortBy : 'fecha_vencimiento'; 
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; 

    baseQuery += ` ORDER BY ${sortColumn} ${sortOrder}`;

    try {
        const resultado = await pool.query(baseQuery, queryParams);
        res.json(resultado.rows);
    } catch (error) {
        Sentry.captureException(error);   
        console.error("Error al obtener lotes:", error);
        res.status(500).json({ mensaje: "Error interno del servidor al consultar lotes" });
    }
});


// ----------------------------------------------
// Ruta para obtener todas las categorías únicas de lotes
// ----------------------------------------------
router.get("/categorias", async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id_categoria, nombre_categoria 
             FROM categorias 
             ORDER BY nombre_categoria ASC`
        );
        res.json(resultado.rows);
    } catch (error) {
        Sentry.captureException(error);   
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// ----------------------------------------------
// Ruta para obtener el detalle de un lote por su ID
+// ----------------------------------------------
router.get("/:id_lote", async (req, res) => {
    // Obtener el ID del lote desde los parámetros de la ruta
    const { id_lote } = req.params;
    const sqlQuery = `
        SELECT l.*,
          (SELECT json_agg(img.url) 
            FROM imagenes_lotes img 
            WHERE img.id_lote = l.id_lote
          ) as imagenes,
          (SELECT json_agg(c.*) 
            FROM lotes_categorias lc
            JOIN categorias c ON lc.id_categoria = c.id_categoria
            WHERE lc.id_lote = l.id_lote
          ) as categorias
        FROM lotes l
        WHERE l.id_lote = $1
        AND ${CONDICIONES_OFERTA}
        LIMIT 1;
    `;
    try {
        // Ejecutar la consulta para obtener el detalle del lote
        const resultado = await pool.query(sqlQuery, [id_lote]); 
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Lote no encontrado o no disponible como oferta." });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        Sentry.captureException(error);   
        console.error(`Error al obtener detalle del lote ${id_lote}:`, error);
        res.status(500).json({ mensaje: "Error interno del servidor al consultar el detalle del lote" });
    }
});

// ----------------------------------------------
// Ruta para reservar lotes 
// ----------------------------------------------
router.post("/reservar", async (req, res) => {
    const { idUsuario, lotes } = req.body;

    if (!idUsuario || !Array.isArray(lotes) || lotes.length === 0) {
        return res.status(400).json({ message: "Datos inválidos" });
    }

    try {
        const query = `
        UPDATE public.lotes
        SET estado = 'RESERVADO',
            reserva_expires_at = NOW() + INTERVAL '15 minutes',
            reserva_user_id = $1
        WHERE id_lote = ANY($2::int[])
            AND (
                estado = 'DISPONIBLE'
                OR (estado = 'RESERVADO' AND reserva_user_id = $1)
            )
        RETURNING id_lote;
        `;
        const result = await pool.query(query, [idUsuario, lotes]);

        if (result.rowCount === 0)
        return res.status(400).json({ message: "No se pudo reservar los lotes" });

        res.json({ message: "Lotes reservados por 15 minutos", reservados: result.rows });
    } catch (err) {
        Sentry.captureException(err);   
        console.error("❌ Error en /reservar:");
        console.error("Mensaje:", err.message);
        console.error("Detalle:", err.stack);
        res.status(500).json({ message: "Error al reservar los lotes", error: err.message });
    }
});

// ----------------------------------------------
// Ruta para liberar lotes
// ----------------------------------------------
router.post("/liberar", async (req, res) => {
    const { lotes } = req.body;

    if (!Array.isArray(lotes) || lotes.length === 0) {
        return res.status(400).json({ message: "Datos inválidos" });
    }

    try {
        const query = `
            UPDATE public.lotes
            SET estado = 'DISPONIBLE',
                reserva_expires_at = NULL,
                reserva_user_id = NULL
            WHERE id_lote = ANY($1::int[])
            RETURNING id_lote;
        `;
        const result = await pool.query(query, [lotes]);

        if (result.rowCount === 0)
            return res.status(400).json({ message: "No se pudieron liberar los lotes" });

        res.json({ message: "Lotes liberados", lotes: result.rows });
    } catch (err) {
        Sentry.captureException(err);   
        console.error(err);
        res.status(500).json({ message: "Error al liberar los lotes" });
    }
});

// ----------------------------------------------
// -- Ruta para obtener lotes por un array de IDs --
+// ----------------------------------------------
router.post('/por-ids', async (req, res) => {
    const { ids } = req.body; // array de id_lote
    const sqlQuery = `
        SELECT *
        FROM lotes
        WHERE id_lote = ANY($1)
    `;
    try {
        const resultado = await pool.query(sqlQuery, [ids]);
        res.json({ lotes: resultado.rows });
    } catch (error) {
        Sentry.captureException(error);   
        console.error(error);
        res.status(500).json({ message: "Error al consultar lotes" });
    }
});

// ----------------------------------------------
// -- Ruta para obtener lotes de una tienda específica --
// ----------------------------------------------
router.get("/tienda/:id_tienda", async (req, res) => {
    const { id_tienda } = req.params;
    const sqlQuery = `
        SELECT ${CAMPOS_LOTE}
        FROM lotes
        WHERE id_tienda = $1
        ORDER BY fecha_vencimiento ASC;
    `;
    try {
        const resultado = await pool.query(sqlQuery, [id_tienda]); 
        res.json(resultado.rows);
    } catch (error) {
        Sentry.captureException(error);   
        console.error(`Error al obtener lotes de la tienda ${id_tienda}:`, error);
        res.status(500).json({ mensaje: "Error interno del servidor al consultar los lotes de la tienda" });
    }
});

// ----------------------------------------------
// -- Ruta para actualizar el estado de un lote --
// ----------------------------------------------
router.put("/:id_lote/estado", async (req, res) => {
  const { id_lote } = req.params;
  const { estado_producto } = req.body;

  const estadosPermitidos = ["DISPONIBLE", "NO DISPONIBLE", "OCULTO", "ELIMINADO"];
  if (!estadosPermitidos.includes(estado_producto.toUpperCase())) {
    return res.status(400).json({ mensaje: "Estado no permitido" });
  }

  try {
    const query = `
      UPDATE lotes
      SET estado = $1
      WHERE id_lote = $2
      RETURNING id_lote, estado;
    `;
    const resultado = await pool.query(query, [estado_producto.toUpperCase(), id_lote]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensaje: "Lote no encontrado" });
    }

    res.json({ mensaje: "Estado actualizado", lote: resultado.rows[0] });
  } catch (err) {
    Sentry.captureException(err);   
    console.error("Error al actualizar estado:", err);
    res.status(500).json({ mensaje: "Error interno al actualizar estado" });
  }
});

// ----------------------------------------------
// -- Ruta para crear un nuevo lote con múltiples imágenes --
// ----------------------------------------------
router.post('/', upload.array('imagenes', 5), async (req, res, next) => {
  const {
    nombre_lote, descripcion, precio_original, precio_rescate,
    fecha_vencimiento, id_tienda, ventana_retiro_inicio,
    ventana_retiro_fin, categorias, categorias_nuevas, peso_qty
  } = req.body;

  const archivos = req.files;
  if (!archivos || archivos.length === 0) {
    return res.status(400).json({ mensaje: "Se requiere al menos una imagen." });
  }

  let categoriasArray, categoriasNuevasArray;
  try {
    categoriasArray = JSON.parse(categorias);         // IDs existentes
    categoriasNuevasArray = JSON.parse(categorias_nuevas); // nombres de nuevas
  } catch (e) {
    return res.status(400).json({ mensaje: "Formato inválido de categorías" });
  }

  
  if ( // Validación: al menos una categoría (existente o nueva)
    (!Array.isArray(categoriasArray) || categoriasArray.length === 0) &&
    (!Array.isArray(categoriasNuevasArray) || categoriasNuevasArray.length === 0)
  ) {
    return res.status(400).json({ mensaje: "El lote debe incluir al menos una categoría" });
  }

  const clientePool = await pool.connect();

  try {
    await clientePool.query('BEGIN');

    // 1️⃣ Crear lote
    const sqlLote = `
      INSERT INTO lotes (
        nombre_lote, descripcion, precio_original, precio_rescate,
        fecha_vencimiento, id_tienda, ventana_retiro_inicio,
        ventana_retiro_fin, peso_qty, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'DISPONIBLE')
      RETURNING id_lote;
    `;
    const valuesLote = [
      nombre_lote, descripcion, precio_original, precio_rescate,
      fecha_vencimiento, id_tienda, ventana_retiro_inicio,
      ventana_retiro_fin, peso_qty
    ];
    const resLote = await clientePool.query(sqlLote, valuesLote);
    const idLoteCreado = resLote.rows[0].id_lote;

    // 2️⃣ Crear categorías nuevas y obtener sus IDs
    const nuevasIds = [];
    for (const nombre of categoriasNuevasArray) {
      if (!nombre.trim()) continue;
      const { rows: existing } = await clientePool.query(
        'SELECT id_categoria FROM categorias WHERE nombre_categoria = $1',
        [nombre]
      );
      if (existing.length > 0) {
        nuevasIds.push(existing[0].id_categoria);
      } else {
        const { rows: newCat } = await clientePool.query(
          'INSERT INTO categorias (nombre_categoria) VALUES ($1) RETURNING id_categoria',
          [nombre]
        );
        nuevasIds.push(newCat[0].id_categoria);
      }
    }

    // 3️⃣ Combinar IDs existentes y nuevos
    const todasCategorias = [...categoriasArray, ...nuevasIds];

    // 4️⃣ Insertar relación lote ↔ categorías
    for (const idCategoria of todasCategorias) {
      await clientePool.query(
        'INSERT INTO lotes_categorias (id_lote, id_categoria) VALUES ($1, $2)',
        [idLoteCreado, idCategoria]
      );
    }

    // 5️⃣ Notificaciones
    const { rows: usuariosFav } = await clientePool.query(
      `SELECT DISTINCT id_usuario
      FROM favoritos
      WHERE id_categoria = ANY($1)`,
      [todasCategorias]
    );

    for (const usuario of usuariosFav) {
      for (const idCategoria of todasCategorias) {
        await clientePool.query(
          `INSERT INTO notificaciones (id_usuario, id_categoria, mensaje)
          VALUES ($1, $2, $3)`,
          [
            usuario.id_usuario,
            idCategoria,
            `Se ha publicado un nuevo lote "${nombre_lote}" en una categoría que sigues 🎉`
          ]
        );
      }
    }


    // 6️⃣ Subir imágenes a S3
    const urlsImagenes = [];
    for (const archivo of archivos) {
      const nombreArchivoS3 = `lotes/${idLoteCreado}/${Date.now()}-${archivo.originalname}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: nombreArchivoS3,
        Body: archivo.buffer,
        ContentType: archivo.mimetype
      });
      await s3Client.send(command);
      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${nombreArchivoS3}`;
      urlsImagenes.push(url);
    }

    for (const url of urlsImagenes) {
      await clientePool.query(
        'INSERT INTO imagenes_lotes (id_lote, url) VALUES ($1, $2)',
        [idLoteCreado, url]
      );
    }

    await clientePool.query('COMMIT');

    res.status(201).json({
      message: `Lote creado con ${archivos.length} imágenes.`,
      id_lote: idLoteCreado
    });

  } catch (err) {
    await clientePool.query('ROLLBACK');
    console.error("❌ Error al crear lote:", err);
    Sentry.captureException(err);
    res.status(500).json({ mensaje: "Error al crear lote", detalle: err.message });
  } finally {
    clientePool.release();
  }
});

export default router;