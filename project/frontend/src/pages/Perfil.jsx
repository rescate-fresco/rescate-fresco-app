import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar.jsx";
import "./PerfilUsuario.css";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const usuarioData = JSON.parse(localStorage.getItem("usuario"));
    if (!usuarioData) {
      setError("No se encontró sesión activa. Por favor inicia sesión.");
      setCargando(false);
      return;
    }
    setUsuario(usuarioData);

    const fetchData = async () => {
      try {
        const [resumenRes, historialRes] = await Promise.all([
          fetch(`http://localhost:5000/api/auth/${usuarioData.id_usuario}/resumen-rescates`),
          fetch(`http://localhost:5000/api/auth/${usuarioData.id_usuario}/historial-rescates`)
        ]);

        if (!resumenRes.ok || !historialRes.ok) {
          throw new Error("Error al cargar datos del perfil");
        }

        const resumenData = await resumenRes.json();
        const historialData = await historialRes.json();

        setResumen(resumenData);
        setHistorial(historialData);
      } catch (err) {
        console.error("❌ Error cargando datos del perfil:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="Perfil">
      <Navbar />

      <div className="CuerpoPerfil">
        {cargando && <h2 className="info-msg">Cargando perfil...</h2>}
        {error && <h2 className="error-msg">{error}</h2>}

        {!cargando && !error && usuario && resumen && (
          <div className="perfil-contenido">
            <section className="perfil-resumen">
              <h2>👤 Mi Perfil</h2>
              <div className="perfil-info">
                <p><strong>Nombre:</strong> {usuario.nombre_usuario}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Rol:</strong> {usuario.rol}</p>
              </div>

              <div className="perfil-resumen-datos">
                <h3>🌱 Tu impacto</h3>
                <p><strong>Total de lotes rescatados:</strong> {resumen.total_lotes}</p>
                <p><strong>Total de kilos rescatados:</strong> {parseFloat(resumen.total_kg).toFixed(2)} kg</p>
                <p><strong>Total ahorrado:</strong> ${parseInt(resumen.total_ahorro).toLocaleString("es-CL")} CLP</p>
              </div>
            </section>

            <section className="perfil-historial">
              <h2>📦 Historial de rescates</h2>
              {historial.length === 0 ? (
                <p className="info-msg">Aún no has realizado rescates.</p>
              ) : (
                <table className="tabla-historial">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Lote</th>
                      <th>Categoría</th>
                      <th>Peso</th>
                      <th>Ahorro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((r) => (
                      <tr key={r.id_rescate}>
                        <td>{new Date(r.fecha_rescate).toLocaleDateString("es-CL")}</td>
                        <td>{r.nombre_lote}</td>
                        <td>{r.categoria}</td>
                        <td>{r.peso_qty} kg</td>
                        <td>${parseInt(r.ahorro).toLocaleString("es-CL")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;
