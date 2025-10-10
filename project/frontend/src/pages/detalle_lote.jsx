import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import './detalle_lote.css';

const API_URL = `${import.meta.env.VITE_API_URL}api/lotes`;



const DetalleLote = () => {
    const { id_lote } = useParams();
    const [lote, setLote] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [enCarrito, setEnCarrito] = useState(false);

    const agregarAlCarrito = (lote) => {
        const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
        // Evita duplicados
        if (!carritoActual.some(item => item.id_lote === lote.id_lote)) {
            carritoActual.push(lote);
            localStorage.setItem("carrito", JSON.stringify(carritoActual));
            setEnCarrito(true); 
            alert("¡Producto agregado al carrito!");
        } else {
            alert("Este producto ya está en el carrito.");
        }
    };    

    useEffect(() => {
        const fetchLote = async () => {
        try {
            const resp = await fetch(`${API_URL}/${id_lote}`);
            if (!resp.ok) throw new Error("No se pudo cargar el lote");
            const data = await resp.json();
            setLote(data);

            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            const estaEnCarrito = carrito.some(item => item.id_lote === Number(id_lote));
            setEnCarrito(estaEnCarrito);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
        };
        fetchLote();
    }, [id_lote]);

    if (cargando) return <div>Cargando detalles del lote...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!lote) return <div>No se encontró el lote.</div>;

    return (
        <div className="DetalleLote">
            <Navbar />
            <div className="Cuerpo">
                <div className="detalle-lote">
                    <h2>{lote.nombre_lote}</h2>
                    <div className="detalle-info">
                        <p><strong>Categoría:</strong> {lote.categoria || 'Sin categoría'}</p>
                        <p><strong>Descripción:</strong> {lote.descripcion || 'No disponible'}</p>
                        <p><strong>Peso:</strong> {lote.peso_qty} kg</p>
                        <p><strong>Precio original:</strong> <span className="precio-original"> ${Number(lote.precio_original).toFixed(2)}</span></p>
                        <p><strong>Precio oferta:</strong> <span className="precio-rescate">${Number(lote.precio_rescate).toFixed(2)}</span></p>
                        <p><strong>Fecha de vencimiento:</strong> {new Date(lote.fecha_vencimiento).toLocaleDateString()}</p>
                        <p><strong>Ventana de retiro:</strong>{' '}
                        {lote?.ventana_retiro_inicio && lote?.ventana_retiro_fin
                            ? `${new Date(lote.ventana_retiro_inicio.replace(' ', 'T')).toLocaleString('es-CL', { hour12: false })} - ${new Date(lote.ventana_retiro_fin.replace(' ', 'T')).toLocaleString('es-CL', { hour12: false })}`
                            : 'No definida'}
                        </p>
                        <p>
                        <strong>Estado:</strong>{' '}
                        <span className={`estado ${lote.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {lote.estado}
                        </span>
                        </p>
                    </div>
                    <div className="boton-carrito-container">
                        {enCarrito ? (
                            <p className="en-carrito">¡En el carrito!</p>
                        ) : (
                            <button
                                onClick={() => agregarAlCarrito(lote)}
                                disabled={lote.estado !== "DISPONIBLE"} 
                            >
                                Agregar al Carrito
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default DetalleLote;