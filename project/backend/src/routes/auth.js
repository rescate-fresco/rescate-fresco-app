import express from "express";
import bcrypt from "bcrypt";
import pool from "../database/index.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

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
      "SELECT id_usuario, nombre_usuario, email, contrasena_hash, rol, tienda FROM usuarios WHERE email=$1",
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
        rol: user.rol,
        tienda: user.tienda
      },
      token: "TokenDeMentira",
      message: "Login exitoso"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});


// POST → new tienda
router.post("/tiendas", async (req, res) => {
  const { nombre_tienda, direccion_tienda, telefono_tienda, id_usuario } = req.body;

  try {
    // Verificar si ya existe tienda con mismo usuario o nombre
    const exists = await pool.query(
      "SELECT * FROM tiendas WHERE id_usuario = $1 OR nombre_tienda = $2",
      [id_usuario, nombre_tienda]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Ya existe una tienda con ese nombre o usuario." });
    }

    // Crear la tienda (sin lat/lon)
    const result = await pool.query(
      `INSERT INTO tiendas 
        (id_usuario, nombre_tienda, direccion_tienda, telefono_tienda)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_usuario, nombre_tienda, direccion_tienda, telefono_tienda]
    );

    // Actualizar columna "tienda" del usuario a true
    await pool.query(
      "UPDATE usuarios SET tienda = true WHERE id_usuario = $1",
      [id_usuario]
    );

    res.status(201).json({
      message: "Tienda creada exitosamente",
      tienda: result.rows[0],
    });

  } catch (error) {
    console.error("Error creando tienda:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// POST → new PRODUCTO
router.post("/lotes", async (req, res) => {
  const {
    id_usuario,
    nombre_lote,
    categoria,
    descripcion,
    peso_qty,
    precio_original,
    precio_rescate,
    fecha_vencimiento,
    ventana_retiro_inicio,
    ventana_retiro_fin
  } = req.body;

  try {
    // Obtener id_tienda desde usuario
    const tiendaResult = await pool.query(
      "SELECT id_tienda FROM tiendas WHERE id_usuario = $1",
      [id_usuario]
    );

    if (tiendaResult.rows.length === 0) {
      return res.status(400).json({ message: "El usuario no tiene tienda registrada." });
    }

    const id_tienda = tiendaResult.rows[0].id_tienda;

    const result = await pool.query(
      `INSERT INTO lotes
        (id_tienda, nombre_lote, categoria, descripcion, peso_qty, precio_original, precio_rescate, fecha_vencimiento, ventana_retiro_inicio, ventana_retiro_fin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        id_tienda,
        nombre_lote,
        categoria,
        descripcion,
        peso_qty,
        precio_original,
        precio_rescate,
        fecha_vencimiento,
        ventana_retiro_inicio,
        ventana_retiro_fin
      ]
    );

    res.status(201).json({
      message: "Producto publicado exitosamente",
      lote: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/me/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const result = await pool.query(
      "SELECT id_tienda FROM tiendas WHERE id_usuario = $1",
      [id_usuario]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no tiene tienda registrada" });
    }
    
    res.json({ id_tienda: result.rows[0].id_tienda });
  } catch (error) {
    console.error("Error obteniendo id_tienda:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
