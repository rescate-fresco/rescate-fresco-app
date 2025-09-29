import express from "express";
import bcrypt from "bcrypt";
import pool from "../database/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();
// POST → registrar usuario
router.post("/register", async(req, res) => {
  try {
    const {
      nombre_usuario,
      email,
      contrasena,
      rol,
      direccion_usuario,
    } = req.body;

    // Validaciones básicas
    if (!nombre_usuario || !email || !contrasena || !rol)
      return res.status(400).json({ error: "Faltan campos" });

    if (!["tienda", "consumidor"].includes(rol))
      return res.status(400).json({ error: "Rol inválido" });

    // Revisar si el email ya existe
    const existe = await pool.query("SELECT 1 FROM usuarios WHERE email=$1", [email]);
    if (existe.rowCount > 0)
      return res.status(409).json({ error: "Email ya registrado" });

    // Hashear contraseña
    const SALT_ROUNDS = 12;
    const contrasena_hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

    // Insertar usuario en la DB
    const query = `
      INSERT INTO usuarios 
        (nombre_usuario, email, contrasena_hash, rol, direccion_usuario) 
      VALUES ($1,$2,$3,$4,$5) 
      RETURNING id_usuario`;

    const values = [nombre_usuario, email, contrasena_hash, rol, direccion_usuario];
    const result = await pool.query(query, values);

    res.status(201).json({ id_usuario: result.rows[0].id_usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});




// POST → login usuario
router.post("/login", async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    // Validación básica
    if (!email || !contrasena) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    // Buscar usuario por email
    const result = await pool.query(
      "SELECT id_usuario, nombre_usuario, email, contrasena_hash, rol FROM usuarios WHERE email=$1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Aquí normalmente se genera un token JWT, pero de momento devolvemos datos básicos
    res.json({
      usuario: {
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        email: user.email,
        rol: user.rol
      },
      token: "TokenDeMentira",
      message: "Login exitoso"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
