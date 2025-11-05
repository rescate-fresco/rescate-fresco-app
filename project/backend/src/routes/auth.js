import express from "express";
import bcrypt from "bcrypt";
import pool from "../database/index.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/node";

const router = express.Router();

dotenv.config();


const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;

function checkRateLimit(email) {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false; 
  }

  recentAttempts.push(now);
  loginAttempts.set(email, recentAttempts);
  return true;
}



// POST → registrar usuario
router.post("/register", async(req, res) => {
  try {
    let {
      nombre_usuario,
      email,
      contrasena,
      rol,
      direccion_usuario,
    } = req.body;

    // Validaciones básicas
    if (!nombre_usuario || !email || !contrasena || !rol)
      return res.status(400).json({ error: "Faltan campos" });

    // Normalizar y validar email
    const emailLimpio = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (/\s/.test(req.body.email)) {
      return res.status(400).json({ error: "El email no puede contener espacios" });
    }

    if (!emailRegex.test(emailLimpio) || emailLimpio.length < 5 || emailLimpio.length > 255) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }
  
    

    nombre_usuario = String(nombre_usuario).trim();
    if (nombre_usuario.length === 0 || nombre_usuario.length > 100) {
      return res.status(400).json({ error: "Nombre de usuario inválido (1-100 caracteres)" });
    }

    // Sanitizar caracteres peligrosos en nombre (prevenir XSS básico)
    if (/<script|javascript:|on\w+=/i.test(nombre_usuario)) {
      return res.status(400).json({ error: "Nombre de usuario contiene caracteres no permitidos" });
    }

    if (typeof contrasena !== "string" || contrasena.length < 3) {
      return res.status(400).json({ error: "Contraseña muy corta (mínimo 3 caracteres)" });
    }

    
    if (contrasena.length > 128) {
      return res.status(400).json({ error: "Contraseña demasiado larga (máximo 128 caracteres)" });
    }

    if (!["tienda", "consumidor"].includes(rol))
      return res.status(400).json({ error: "Rol inválido" });

    // Revisar si el email ya existe
    const existe = await pool.query(
      "SELECT 1 FROM usuarios WHERE LOWER(email) = LOWER($1)", 
      [emailLimpio]
    );
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

    const values = [nombre_usuario, emailLimpio, contrasena_hash, rol, direccion_usuario];
    
    try {
      const result = await pool.query(query, values);
      return res.status(201).json({ id_usuario: result.rows[0].id_usuario });
    } catch (error_) {
      // Manejar duplicado por constraint único (race condition)
      if (error_.code === "23505" || (error_.constraint && error_.constraint.includes("email"))) {
        return res.status(409).json({ error: "Email ya registrado" });
      }
      throw error_; // Re-lanzar otros errores
    }
  } catch (err) {
    Sentry.captureException(err); 
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});


// POST → login usuario
router.post("/login", async (req, res) => {
  try {
    const { email, contrasena, captcha } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

     // Validar longitudes ANTES de procesar
    if (typeof email !== "string" || email.length > 255) {
      return res.status(400).json({ error: "Email demasiado largo" });
    }
    if (typeof contrasena !== "string" || contrasena.length > 128) {
      return res.status(400).json({ error: "Contraseña demasiado larga" });
    }

    const emailLimpio = email.trim().toLowerCase();
    
    if (!checkRateLimit(emailLimpio)) {
      return res.status(429).json({ 
        error: "Demasiados intentos fallidos. Intente nuevamente en 15 minutos" 
      });
    }

    // Validar formato de email
    if (emailLimpio.length < 5 || emailLimpio.length > 50 || !/\S+@\S+\.\S+/.test(emailLimpio)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }
    
    // Validar longitud mínima de contraseña
    if (contrasena.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }

    if (process.env.NODE_ENV === "production"){ // este if solo sirve para las pruebas

      if (!captcha) {
        return res.status(400).json({ error: "Token CAPTCHA requerido" });
      }
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
      const captchaRes = await fetch(verifyURL, { method: "POST" });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        console.warn("reCAPTCHA fallido (success: false)", captchaData["error-codes"]);
        return res.status(401).json({ error: "Verificación CAPTCHA fallida" });
      }
      
      if (captchaData.score < 0.5) {
        return res.status(401).json({ error: "Verificación fallida (score bajo), posible bot." });
      }
    }
    
    

    // Buscar usuario por email
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.email, u.contrasena_hash, 
              u.rol, u.tienda, t.id_tienda
       FROM usuarios u
       LEFT JOIN tiendas t ON u.id_usuario = t.id_usuario
       WHERE LOWER(u.email) = LOWER($1)`,
      [emailLimpio]
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

     // Limpiar intentos fallidos tras login exitoso
    loginAttempts.delete(emailLimpio);

    const tokenPayload = {
      id_usuario: user.id_usuario,
      rol: user.rol,
      email: user.email,
      id_tienda: user.id_tienda || null, // agregado
    };

    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } 
    );
    res.json({
      usuario: {
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        email: user.email,
        rol: user.rol,
        tienda: user.tienda,
        id_tienda: user.id_tienda || null,
      },
      token: token,
      message: "Login exitoso"
    });
  } catch (err) {
    Sentry.captureException(err); 
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});


// POST → new tienda
router.post("/tiendas", async (req, res) => {
  const { nombre_tienda, direccion_tienda, telefono_tienda, id_usuario } = req.body;

  try {
    const exists = await pool.query(
      "SELECT * FROM tiendas WHERE id_usuario = $1 OR nombre_tienda = $2",
      [id_usuario, nombre_tienda]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Ya existe una tienda con ese nombre o usuario." });
    }

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
    Sentry.captureException(error); 
    console.error("Error creando tienda:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// GET → obtener id_tienda por id_usuario
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
    Sentry.captureException(error); 
    console.error("Error obteniendo id_tienda:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;