import express from "express";
import pool from "../database/index.js"; 

const router = express.Router();
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
    categoria,
    peso_qty
`;

const CONDICIONES_OFERTA = `
    precio_rescate < precio_original
    AND estado IN ('PUBLICADO', 'RESERVADO', 'DISPONIBLE', 'NO DISPONIBLE')
    AND fecha_vencimiento >= CURRENT_DATE
`;


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
    console.error("❌ Error en /reservar:");
    console.error("Mensaje:", err.message);
    console.error("Detalle:", err.stack);
    res.status(500).json({ message: "Error al reservar los lotes", error: err.message });
  }
});

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
        console.error(err);
        res.status(500).json({ message: "Error al liberar los lotes" });
    }
});


export default router;

