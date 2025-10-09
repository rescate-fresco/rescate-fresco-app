import Navbar from "../components/navbar.jsx";
import './home.css';
import { useEffect, useState } from "react";
import CartasProductos from "../components/cartas_productos";
import { useLocation } from "react-router-dom";

function Home() {
    // 💡 Ajuste: Usa una URL base, el endpoint se define en el fetch
    const API_BASE_URL = `${import.meta.env.VITE_API_URL}api/lotes`;
    
    const [productos, setProductos] = useState([]); 
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('q'); 

    useEffect(() => {
        const fetchProductos = async () => {
            setCargando(true);
            setError(null);
            let fetchURL = `${API_BASE_URL}`;
            if (searchQuery) {
                fetchURL = `${API_BASE_URL}/buscar?q=${searchQuery}`;
            } else {
                fetchURL = `${API_BASE_URL}`;
            }

            try {
                const resp = await fetch(fetchURL);
                if (!resp.ok) {
                    throw new Error(`Error al cargar productos: ${resp.statusText}`);
                }
                const data = await resp.json();
                setProductos(data); 
            } catch (err) {
                setError(err.message);
                setProductos([]); 
            } finally {
                setCargando(false);
            }
        };
        fetchProductos();
        
    }, [API_BASE_URL, searchQuery]);
    return (
        <div className="Home">
            <Navbar />
            <div className="Cuerpo">
                {searchQuery && productos.length > 0 && (
                    <h2 className="titulo-busqueda">Mostrando resultados para: "{searchQuery}"</h2>
                )}
                {(() => {
                    if (error) {
                        return <h2 className="error-msg">Error: {error}</h2>;
                    }
                    if (cargando) {
                        return <h2>Cargando productos...</h2>;
                    }
                    if (productos.length === 0) {
                        const mensaje = searchQuery 
                            ? `No se encontraron productos para: "${searchQuery}"`
                            : 'No hay productos disponibles en este momento.';
                        return <h2 className="no-productos">{mensaje}</h2>;
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