import express from "express";
import cors from "cors";
import pool from "./database/index.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.get("/", (req, res) => {res.send("Servidor funcionando 🚀");});
const PORT = process.env.PORT;

app.listen(PORT, async () => {
  // Conexión a la base de datos
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ DB conectada:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Error DB:", err);
  }
  console.log("Servidor corriendo en puerto 5000");
});

