import Navbar from "../components/navbar.jsx";
import './home.css';
import { useEffect, useState, useCallback } from "react";
import CartasProductos from "../components/cartas_productos";
import { useLocation } from "react-router-dom";
import FiltrosLotes from "../components/FiltrosLotes.jsx"; 

function Home() {
    const [productos, setProductos] = useState([]); 
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('q');
    const [filtros, setFiltros] = useState({
        categoria: '',
        sortBy: 'fecha_vencimiento',
        order: 'ASC',
    });

    
    const fetchProductos = useCallback(async () => {
        setCargando(true);
        setError(null);
        
        let url;
        const baseUrl = `${import.meta.env.VITE_API_URL}api/lotes`;

        if (searchQuery) {
            url = `${baseUrl}/buscar?q=${encodeURIComponent(searchQuery)}`;
        } else {
            const params = new URLSearchParams();
            if (filtros.categoria) params.append('categoria', filtros.categoria);
            if (filtros.sortBy) params.append('sortBy', filtros.sortBy);
            if (filtros.order) params.append('order', filtros.order);
            url = `${baseUrl}?${params.toString()}`;
        }

        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`Error al cargar productos: ${resp.statusText}`);
            const data = await resp.json();
            setProductos(data); 
        } catch (err) {
            setError(err.message);
            setProductos([]); 
        } finally {
            setCargando(false);
        }
    }, [searchQuery, filtros]); 

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    const handleFilterChange = (nuevosFiltros) => {
        setFiltros(nuevosFiltros);
    };

    return (
        <div className="Home">
            <Navbar />
            <div className="Cuerpo-1">
                <div className="contenido-principal">
                    <aside className="sidebar-filtros">
                        <FiltrosLotes onFilterChange={handleFilterChange} />
                    </aside>

                    <section className="productos-grid">
                        {cargando && <h2 className="info-msg">Cargando productos...</h2>}
                        {error && <h2 className="error-msg">Error: {error}</h2>}
                        {!cargando && !error && productos.length === 0 && (
                            <h2 className="info-msg">
                                {searchQuery
                                    ? `No se encontraron productos para "${searchQuery}"`
                                    : "No hay productos disponibles."}
                            </h2>
                        )}
                        {!cargando && !error && productos.length > 0 && (
                            <div className="productos-lista">
                                {productos.map((lote) => (
                                        <CartasProductos key={lote.id_lote} lote={lote} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Home;