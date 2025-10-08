import Navbar from "../components/navbar.jsx";
import './home.css';
import { useEffect, useState } from "react";
import CartasProductos from "../components/cartas_productos";

function Home() {
    const API_URL = `${import.meta.env.VITE_API_URL}api/lotes`;
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
    return (
        <div className="Home">
            <Navbar />
            <div className="Cuerpo">

                {(() => {
                    if (error) {
                        return <h2>Error: {error}</h2>;
                    }
                    if (cargando) {
                        return <h2>Cargando productos...</h2>;
                    }
                    if (productos.length === 0) {
                        return <h2>No hay productos disponibles</h2>;
                    }
                    return (
                        <div className="productos-lista">
                            {productos.map(lote => (
                                <CartasProductos key={lote.id_lote} lote={lote} />
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default Home;