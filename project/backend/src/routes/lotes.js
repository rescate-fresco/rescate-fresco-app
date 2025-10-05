

import express from "express";
import pool from "../database/index.js"; 

const router = express.Router();
router.get("/ofertas", async (req, res) => {
    
    // Consulta SQL para obtener lotes PUBLICADOS que son ofertas y que no están vencidos hoy
    const sqlQuery = `
        SELECT 
            id_lote, 
            nombre_lote, 
            precio_original, 
            precio_rescate, 
            fecha_vencimiento,
            -- IMPORTANTE: Añade 'imagen' u otros campos si los usas en el frontend
            id_tienda, 
            estado 
        FROM 
            lotes
        WHERE 
            precio_rescate < precio_original 
            AND estado = 'PUBLICADO' 
            -- Asegúrate de que esta columna es de tipo DATE/TIMESTAMP
            AND fecha_vencimiento >= CURRENT_DATE 
        ORDER BY 
            fecha_vencimiento ASC;
    `;

    try {
        const resultado = await pool.query(sqlQuery); 
        
        // El backend responde a React con un array de lotes en formato JSON
        res.json(resultado.rows); 
    } catch (error) {
        console.error("Error al obtener lotes de oferta:", error);
        // Responde con un error 500 en caso de fallo en la BD
        res.status(500).json({ 
            mensaje: "Error interno del servidor al consultar lotes de oferta" 
        });
    }
});

export default router;