import dotenv from "dotenv";
import pkg from "pg";
import { S3Client } from "@aws-sdk/client-s3";

// Cargar todas las variables del archivo .env
dotenv.config();
const { Pool } = pkg;

// --- 1. Probar Conexión a RDS (PostgreSQL) ---

// Configura el "pool" de conexiones usando las variables .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ¡MUY IMPORTANTE! 
  // Ya que tu RDS requiere encriptación (como vimos en pgAdmin)
  // debes agregar esta línea:
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Intentando conectar a RDS (PostgreSQL)...');

// Hacemos una consulta de prueba
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('¡¡ERROR AL CONECTAR A RDS!!', err);
  } else {
    console.log('✅ ¡ÉXITO! Conectado a RDS. Hora del servidor:', res.rows[0].now);
  }
  pool.end(); // Cierra la conexión de prueba
});


// --- 2. Probar Conexión a S3 ---

// El SDK de AWS es inteligente. Automáticamente buscará
// las variables AWS_ACCESS_KEY_ID y AWS_SECRET_KEY en .env
try {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION
  });

  console.log('✅ ¡ÉXITO! Cliente de S3 creado. Listo para subir imágenes a:', process.env.AWS_BUCKET_NAME);
} catch (err) {
  console.error('¡¡ERROR AL INICIAR S3!!', err);
}