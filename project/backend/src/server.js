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


app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/stripe-webhook') {
    next(); 
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/lotes", lotesRouter);
app.use('/api/payments', paymentRoutes);
app.get("/", (req, res) => { res.send("Servidor funcionando 🚀"); });

app.use(Sentry.expressErrorHandler({
  shouldHandleError(err) {
    return !err.status || err.status >= 500;
  }
}));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: "Error interno del servidor.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000; 

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
