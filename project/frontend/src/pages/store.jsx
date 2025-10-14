import { useEffect, useState } from "react";
import CartasProductos from "../components/cartas_productos";


const API_URL = `${import.meta.env.VITE_API_URL}api/lotes/tienda`;

function Store() {
    const [misProductos, setMisProductos] = useState([]);
    const [cargado, setCargado] = useState(true);
    const [error, setError] = useState(null);

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const ID_TIENDA = usuario?.id_tienda || 1;
    console.log("ID_TIENDA:", ID_TIENDA);
    console.log("Usuario:", usuario);


    useEffect(() => {
        const fetchMisProductos = async () => {
            try {
                const response = await fetch(`${API_URL}/${ID_TIENDA}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMisProductos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargado(false);
            }
        };
        fetchMisProductos();
    }, [ID_TIENDA]);
    
    if (cargado) {
        return <div>Cargando...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    if (!misProductos || misProductos.length === 0) {
        return <div>No hay productos disponibles en tu tienda.</div>;
    }
    return (    
        <div>
            <h2> Mi tienda - Productos publicados
                <div className="productos-lista">
                    {misProductos.map(lote => (
                        <CartasProductos key={lote.id_lote} lote={lote} />
                    ))}
                </div>
            </h2>
        </div>
    );  
}

export default Store;
