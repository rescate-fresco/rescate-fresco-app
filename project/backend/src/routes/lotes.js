import express from "express";
import pool from "../database/index.js"; 

const router = express.Router();

// 1. **DEFINICIÓN DE LA FUNCIÓN DE REPOSITORIO (LOCAL)**
//    No la exportamos directamente, sino que la usamos dentro de este módulo.
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
            t.id_tienda 
        FROM 
            lotes l
        JOIN 
            tiendas t ON l.id_tienda = t.id_tienda
        WHERE 
            l.estado = 'PUBLICADO' 
            AND l.fecha_vencimiento > NOW()
            AND l.lotes_search_tsv @@ plainto_tsquery('spanish', $1)
        ORDER BY 
            ts_rank(l.lotes_search_tsv, plainto_tsquery('spanish', $1)) DESC,
            l.fecha_vencimiento ASC;
    `;
    
    // Añadimos try/catch para manejo de errores en la capa de datos
    try {
        const res = await pool.query(query, [searchTerm]);
        return res.rows;
    } catch (error) {
        console.error("Error en función buscarLotes (Repositorio):", error);
        throw error; // Propagamos el error para que el controlador lo maneje
    }
}
// Fin de la definición de la función de repositorio
// ----------------------------------------------------


// 2. CONSTANTES
const CAMPOS_LOTE = `
    id_lote, 
    nombre_lote, 
    descripcion,
    precio_original, 
    precio_rescate, 
    fecha_vencimiento,
    id_tienda, 
    estado
`;

const CONDICIONES_OFERTA = `
    precio_rescate < precio_original 
    AND estado = 'PUBLICADO' 
    AND fecha_vencimiento >= CURRENT_DATE
`;


// 3. RUTAS (Controlador)

// --- RUTA DE BÚSQUEDA INTELIGENTE ---
router.get("/buscar", async (req, res) => {
    const searchTerm = req.query.q; 
    
    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({ mensaje: "El término de búsqueda es requerido." });
    }

    try {
        // Usamos la función local buscarLotes
        const lotesEncontrados = await buscarLotes(searchTerm.trim()); 
        res.json(lotesEncontrados); 
    } catch (error) {
        // El error ya viene de la función buscarLotes
        res.status(500).json({ mensaje: "Error interno del servidor al realizar la búsqueda" });
    }
});
// ------------------------------------

// Ruta para obtener todos los lotes
router.get("/", async (req, res) => {
    const sqlQuery = `
        SELECT ${CAMPOS_LOTE}
        FROM lotes
        WHERE ${CONDICIONES_OFERTA}
        ORDER BY fecha_vencimiento ASC;
    `;
    try {
        const resultado = await pool.query(sqlQuery); 
        res.json(resultado.rows); 
    } catch (error) {
        console.error("Error al obtener lotes de oferta:", error);
        res.status(500).json({ mensaje: "Error interno del servidor al consultar lotes de oferta" });
    }
});


// Ruta para obtener el detalle del lote
router.get("/:id_lote", async (req, res) => {
    const { id_lote } = req.params;
    const sqlQuery = `
        SELECT ${CAMPOS_LOTE}
        FROM lotes
        WHERE id_lote = $1
        AND ${CONDICIONES_OFERTA}
        LIMIT 1;
    `;
    try {
        const resultado = await pool.query(sqlQuery, [id_lote]); 
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Lote no encontrado o no disponible como oferta." });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(`Error al obtener detalle del lote ${id_lote}:`, error);
        res.status(500).json({ mensaje: "Error interno del servidor al consultar el detalle del lote" });
    }
});

// 4. **EXPORT DEFAULT AL FINAL**
//    El export default SIEMPRE debe ir al final de la definición del módulo.
export default router;