import Navbar from "../components/navbar.jsx";
import './home.css';
import { useEffect, useState } from "react";
import CartasProductos from "../components/cartas_productos";

const API_URL = `${import.meta.env.VITE_API_URL}/api/lotes`;

function Home() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const resp = await fetch(API_URL);
                if (!resp.ok) throw new Error("No se pudieron cargar los productos");
                const data = await resp.json();
                setProductos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        fetchProductos();
    }, []);

    if (cargando) return <div>Cargando productos...</div>;
    if (error) return <div>Error: {error}</div>;
    if (productos.length === 0) return <div>No hay productos disponibles.</div>;
    
    return (
        <div className="Home">
            <Navbar />
            <div className="Cuerpo">
                <h2>Todos los productos</h2>
                <div className="productos-lista">
                    {productos.map(lote => (
                        <CartasProductos key={lote.id_lote} lote={lote} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;