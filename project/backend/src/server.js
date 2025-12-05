import express from "express";
import cors from "cors";
import pool from "./database/index.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import lotesRouter from "./routes/lotes.js";
import paymentRoutes from "./routes/paymentRoutes.js"; 
import favoritosRouter from "./routes/favoritos.js";
import notificacionesRouter from "./routes/notificaciones.js";
import "./instrument.js";
import * as Sentry from "@sentry/node";

dotenv.config();
const app = express();

// Activa confianza en proxy (para cookies cross-origin)
app.set("trust proxy", 1);

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Header extra que Chrome necesita SIEMPRE cuando usas cookies
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// JSON excepto en Stripe Webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/stripe-webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/lotes", lotesRouter);
app.use("/api/payments", paymentRoutes);
app.use("/api/favoritos", favoritosRouter);
app.use("/api/notificaciones", notificacionesRouter);

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// Sentry
app.use(Sentry.expressErrorHandler({
  shouldHandleError(err) {
    return !err.status || err.status >= 500;
  }
}));

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: "Error interno del servidor.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Server + DB RDS
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ RDS conectada:", result.rows[0].now);
  } catch (err) {
    Sentry.captureException(err);
    console.error("❌ Error RDS:", err);
  }
  console.log(`Servidor corriendo en puerto ${PORT} 🚀`);
});

app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

// FIN
