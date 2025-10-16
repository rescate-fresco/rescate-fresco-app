import express from "express";
import cors from "cors";
import pool from "./database/index.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import lotesRouter from "./routes/lotes.js"; 

dotenv.config();
import "./instrument.js";
import * as Sentry from "@sentry/node";
const app = express();




app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/lotes", lotesRouter); 
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

const PORT = process.env.PORT;


app.listen(PORT, async () => {
  // Conexión a la base de datos
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ DB conectada:", result.rows[0].now);
  } catch (err) {
    Sentry.captureException(err);
    console.error("❌ Error DB:", err);
  }
  console.log("Servidor corriendo en puerto 5000");
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
