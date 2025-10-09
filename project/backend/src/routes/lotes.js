import express from "express";
import pool from "../database/index.js"; 

const router = express.Router();

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
    try {
        const res = await pool.query(query, [searchTerm]);
        return res.rows;
    } catch (error) {
        console.error("Error en función buscarLotes (Repositorio):", error);
        throw error;
    }
}

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



router.get("/buscar", async (req, res) => {
    const searchTerm = req.query.q; 
    
    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({ mensaje: "El término de búsqueda es requerido." });
    }

    try {
        
        const lotesEncontrados = await buscarLotes(searchTerm.trim()); 
        res.json(lotesEncontrados); 
    } catch (error) {
        
        res.status(500).json({ mensaje: "Error interno del servidor al realizar la búsqueda" });
    }
});

router.get("/", async (req, res) => {  
    const { categoria, sortBy = 'fecha_vencimiento', order = 'ASC' } = req.query;
   
    let baseQuery = `SELECT ${CAMPOS_LOTE} FROM lotes`;
    const whereClauses = [CONDICIONES_OFERTA];
    const queryParams = [];

    
    if (categoria) {
        queryParams.push(categoria);
        whereClauses.push(`categoria ILIKE $${queryParams.length}`);
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
        console.error("Error al obtener lotes:", error);
        res.status(500).json({ mensaje: "Error interno del servidor al consultar lotes" });
    }
});


router.get("/categorias", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT DISTINCT categoria FROM lotes WHERE categoria IS NOT NULL AND categoria <> '' ORDER BY categoria ASC");
        res.json(resultado.rows.map(row => row.categoria));
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
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