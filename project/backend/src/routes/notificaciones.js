import { Router } from "express";
import pool from "../database/index.js"; 
import * as Sentry from "@sentry/node";

const router = Router();

// 🔹 Obtener notificaciones de un usuario
router.get("/", async (req, res) => {
  const idUsuario = req.query.id_usuario;
  if (!idUsuario) return res.status(400).json({ mensaje: "Falta id_usuario" });

  try {
    const { rows } = await pool.query(
      `SELECT id_notificacion, id_categoria, mensaje, leida, fecha_envio
       FROM notificaciones
       WHERE id_usuario = $1
       ORDER BY fecha_envio DESC
       LIMIT 50`,
      [idUsuario]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notificaciones:", err);
    Sentry.captureException(err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// 🔹 Eliminar notificación
router.delete("/:id", async (req, res) => {
  const idNotificacion = req.params.id;

  try {
    await pool.query(
      `DELETE FROM notificaciones WHERE id_notificacion = $1`,
      [idNotificacion]
    );
    res.json({ mensaje: "Notificación eliminada" });
  } catch (err) {
    console.error("Error eliminando notificación:", err);
    Sentry.captureException(err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// 🔹 Marcar notificación como leída
router.patch("/leer/:id", async (req, res) => {
  const idNotificacion = req.params.id;

  try {
    await pool.query(
      `UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = $1`,
      [idNotificacion]
    );
    res.json({ mensaje: "Notificación marcada como leída" });
  } catch (err) {
    console.error("Error actualizando notificación:", err);
    Sentry.captureException(err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

export default router;
