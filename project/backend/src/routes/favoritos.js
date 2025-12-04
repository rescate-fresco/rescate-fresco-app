import express from "express";
import pool from "../database/index.js";
import verifyToken from "../middleware/auth.js"; // si usas JWT
const router = express.Router();

// ----------------------------------------------
// OBTENER FAVORITOS DEL USUARIO
// ----------------------------------------------
router.get("/", verifyToken, async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        const result = await pool.query(
            `SELECT f.id_categoria, c.nombre_categoria
             FROM favoritos f
             JOIN categorias c ON c.id_categoria = f.id_categoria
             WHERE f.id_usuario = $1`,
            [id_usuario]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error obteniendo favoritos:", err);
        res.status(500).json({ mensaje: "Error obteniendo favoritos" });
    }
});

// ----------------------------------------------
// AGREGAR FAVORITO
// ----------------------------------------------
router.post("/:id_categoria", verifyToken, async (req, res) => {
    const id_usuario = req.user.id_usuario;
    const { id_categoria } = req.params;

    try {
        await pool.query(
            `INSERT INTO favoritos (id_usuario, id_categoria)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [id_usuario, id_categoria]
        );

        res.json({ mensaje: "Categoría agregada a favoritos" });
    } catch (err) {
        console.error("Error agregando favorito:", err);
        res.status(500).json({ mensaje: "Error agregando favorito" });
    }
});

// ----------------------------------------------
// ELIMINAR FAVORITO
// ----------------------------------------------
router.delete("/:id_categoria", verifyToken, async (req, res) => {
    const id_usuario = req.user.id_usuario;
    const { id_categoria } = req.params;

    try {
        await pool.query(
            `DELETE FROM favoritos
             WHERE id_usuario = $1 AND id_categoria = $2`,
            [id_usuario, id_categoria]
        );

        res.json({ mensaje: "Categoría eliminada de favoritos" });
    } catch (err) {
        console.error("Error eliminando favorito:", err);
        res.status(500).json({ mensaje: "Error eliminando favorito" });
    }
});

export default router;
