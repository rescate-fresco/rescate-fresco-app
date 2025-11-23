import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function verifyToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    const token = header.split(" ")[1];

    if (!token) {
        return res.status(401).json({ mensaje: "Token inválido" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contiene id_usuario, rol, email, id_tienda
        next();
    } catch (err) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
}
