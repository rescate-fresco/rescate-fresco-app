import { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import './MisCompras.css';

const MisCompras = () => {
  const [compras, setCompras] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarConfirm, setMostrarConfirm] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUsuario(storedUser);

    if (storedUser.id_usuario) {
      fetch(`${import.meta.env.VITE_API_URL}api/auth/compras/${storedUser.id_usuario}`)
        .then(res => res.json())
        .then(data => {
          setCompras(data);
          setCargando(false);
        })
        .catch(err => {
          console.error("Error:", err);
          setCargando(false);
        });
    }
  }, []);

  const handleCancelar = async (compra) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/payments/cancelar-compra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_compra: compra.id_compra,
          stripe_payment_intent_id: compra.stripe_payment_intent_id,
          precio_pagado: compra.precio_pagado
        })
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        // Actualizar lista de compras
        setCompras(compras.filter(c => c.id_compra !== compra.id_compra));
        setMostrarConfirm(null);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert("Error al cancelar la compra");
      console.error(error);
    }
  };

  if (cargando) return <div>Cargando...</div>;

  return (
    <div className="MisCompras">
      <Navbar />
      <div className="Cuerpo">
        <div className="compras-container">
          <h2>Mis Compras</h2>

          {compras.length === 0 ? (
            <p className="sin-compras">Aún no tienes compras.</p>
          ) : (
            <div className="compras-lista">
              {compras.map(compra => (
                <div key={compra.id_compra} className="compra-card">
                  <div className="compra-header">
                    <h3>{compra.nombre_lote}</h3>
                    <span className={`estado ${compra.estado_compra.toLowerCase()}`}>
                      {compra.estado_compra}
                    </span>
                  </div>

                  <div className="compra-detalles">
                    <div className="detalle-item">
                      <label>Tienda:</label>
                      <span>{compra.nombre_tienda}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Categoría:</label>
                      <span>{compra.categoria}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Peso:</label>
                      <span>{compra.peso_qty} kg</span>
                    </div>
                    <div className="detalle-item">
                      <label>Precio Pagado:</label>
                      <span>${compra.precio_pagado}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Fecha:</label>
                      <span>{new Date(compra.fecha_compra).toLocaleDateString('es-CL')}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Retiro:</label>
                      <span>
                        {new Date(compra.ventana_retiro_inicio).toLocaleDateString('es-CL')} - 
                        {new Date(compra.ventana_retiro_fin).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </div>

                  {compra.estado_compra === 'PENDIENTE' && (
                    <div className="compra-acciones">
                      {mostrarConfirm === compra.id_compra ? (
                        <div className="confirmar-cancelacion">
                          <p>¿Seguro que deseas cancelar? Se reembolsarán el 60% (${Math.round(compra.precio_pagado * 0.6)})</p>
                          <div className="botones-confirm">
                            <button 
                              className="btn-si"
                              onClick={() => handleCancelar(compra)}
                            >
                              Sí, cancelar
                            </button>
                            <button 
                              className="btn-no"
                              onClick={() => setMostrarConfirm(null)}
                            >
                              No, mantener
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="btn-cancelar"
                          onClick={() => setMostrarConfirm(compra.id_compra)}
                        >
                          Cancelar Pedido
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisCompras;