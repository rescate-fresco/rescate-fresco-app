import Navbar from "../components/navbar.jsx";
import './home.css';
import { useEffect, useState } from "react";
import CartasProductos from "../components/cartas_productos";
import { useLocation } from "react-router-dom";

function Home() {
    const API_URL = `${import.meta.env.VITE_API_URL}api/lotes`;
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const resp = await fetch(API_URL);
                if (!resp.ok) throw new Error("No se pudieron cargar los productos");
                const data = await resp.json();
                setProductos(data);
                setFilteredProductos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        fetchProductos();
    }, []);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('q')?.toLowerCase().trim() || '';  
        if (searchQuery) {
            const productosFiltrados = productos.filter(p =>
                p.nombre_lote.toLowerCase().includes(searchQuery)
            );
            setFilteredProductos(productosFiltrados);
            return;
        } else {
            setFilteredProductos(productos);
        }
    }, [location.search, productos]);

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
                    if (filteredProductos.length === 0) {
                        return <h2>No hay productos disponibles</h2>;
                    }
                    return (
                        <div className="productos-lista">
                            {filteredProductos.map(lote => (
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