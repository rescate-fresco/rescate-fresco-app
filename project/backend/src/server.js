import express from "express";
import cors from "cors";
import pool from "./database/index.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import lotesRouter from "./routes/lotes.js";
import paymentRoutes from './routes/paymentRoutes.js'; 

dotenv.config();
import "./instrument.js";
import * as Sentry from "@sentry/node";
const app = express();

// --- INICIO CORRECCIÓN DE WEBHOOK ---
// IMPORTANTE: Esta lógica debe ir ANTES de tus rutas (app.use('/api/...'))

// Usamos un middleware para parsear JSON, EXCEPTO para el webhook de Stripe
app.use((req, res, next) => {
  // Comprobamos si la ruta es la del webhook
  if (req.originalUrl === '/api/payments/stripe-webhook') {
    next(); // Si es el webhook, no usamos express.json() y pasamos al siguiente
  } else {
    express.json()(req, res, next); // Para todas las demás rutas, sí usamos express.json()
  }
});
// --- FIN CORRECCIÓN DE WEBHOOK ---

app.use(cors());

// --- Tus Rutas ---
app.use("/api/auth", authRoutes);
app.use("/api/lotes", lotesRouter); 
app.use('/api/payments', paymentRoutes); // Esto ya estaba perfecto
app.get("/", (req, res) => {res.send("Servidor funcionando 🚀");});

// v8: error handler de Sentry
app.use(Sentry.expressErrorHandler({
  shouldHandleError(err) {
    return !err.status || err.status >= 500;
  }
}));

// Tu error handler final
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: "Error interno del servidor.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000; // Añadido un puerto por defecto

app.listen(PORT, async () => {
  // Conexión a la base de datos
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ DB conectada:", result.rows[0].now);
  } catch (err) {
    Sentry.captureException(err);
    console.error("❌ Error DB:", err);
  }
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// NO DEBE HABER NINGUNA LÓGICA DE RUTAS AQUÍ ABAJO
