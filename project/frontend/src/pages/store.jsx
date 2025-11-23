import { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import CartasTienda from "../components/cartas_tienda";
import './store.css';

const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE}api/lotes/tienda`; // <-- Agregué la barra faltante

function Store() {
    const [misProductos, setMisProductos] = useState([]);
    const [cargando, setCargando] = useState(true); // <-- Cambié 'cargado' por 'cargando'
    const [error, setError] = useState(null);
    const [idTienda, setIdTienda] = useState(null);

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    useEffect(() => {
        const fetchIdTienda = async () => {
            if (!usuario?.id_usuario) {
                setError("No hay usuario logueado");
                setCargando(false); // <-- Cambié de setCargando
                return;
            }
            try {
                const response = await fetch(`${API_BASE}api/auth/me/${usuario.id_usuario}`); // <-- Agregué barra
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setIdTienda(data.id_tienda);
                console.log("ID_TIENDA obtenido:", data.id_tienda);
            } catch (err) {
                console.error("Error obteniendo id_tienda:", err);
                setError(err.message);
                setCargando(false); // <-- Cambié de setCargando
            }
        };
        fetchIdTienda();
    }, [usuario?.id_usuario]);

    useEffect(() => {
        const fetchMisProductos = async () => {
            if (!idTienda) return;
            
            try {
                console.log(`Fetch URL: ${API_URL}/${idTienda}`);
                const response = await fetch(`${API_URL}/${idTienda}`);
                console.log("Response status:", response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log("Productos recibidos:", data);
                setMisProductos(data);
            } catch (err) {
                console.error("Error obteniendo productos:", err);
                setError(err.message);
            } finally {
                setCargando(false); // <-- Cambié de setCargando
            }
        };
        
        fetchMisProductos();
    }, [idTienda]);

    if (cargando) { // <-- Cambié de cargando
        return <div>Cargando...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    if (!misProductos || misProductos.length === 0) {
        return <div>No hay productos disponibles en tu tienda.</div>;
    }

    return (    
        <div className="Store">
            <Navbar />
            <div className="Cuerpo">
                <div className="productos-lista2">
                    {misProductos.map(lote => (
                        <CartasTienda key={lote.id_lote} lote={lote} />
                    ))}
                </div>
            </div>
        </div>
    );  
}

export default Store;