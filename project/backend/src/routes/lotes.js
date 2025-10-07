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
    estado
`;

const CONDICIONES_OFERTA = `
    precio_rescate < precio_original 
    AND estado = 'PUBLICADO' 
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

export default router;

