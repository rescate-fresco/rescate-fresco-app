import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import './detalle_lote.css';

const API_URL = `${import.meta.env.VITE_API_URL}api/lotes`;

const DetalleLote = () => {
    const { id_lote } = useParams();                    // Obtiene el id_lote de los parámetros de la URL
    const [lote, setLote] = useState(null);             // Estado para almacenar los detalles del lote
    const [cargando, setCargando] = useState(true);     // Estado para manejar la carga
    const [error, setError] = useState(null);           // Estado para manejar errores
    const [enCarrito, setEnCarrito] = useState(false);  // Estado para verificar si el lote está en el carrito
    const [favorito, setFavorito] = useState({});       // Estado para verificar si el lote está en favoritos

    // ----------------------------------
    // Función para alternar el estado de favorito
    // ----------------------------------
    const toggleFavorito = async (id_categoria) => {
        const yaEsFavorito = favorito[id_categoria] === true;

        try {
            const url = `${import.meta.env.VITE_API_URL}api/favoritos/${id_categoria}`;

            const resp = await fetch(url, {
                method: yaEsFavorito ? "DELETE" : "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            if (!resp.ok) throw new Error("Error al actualizar favorito");

            // actualizar UI local
            setFavorito(prev => ({
                ...prev,
                [id_categoria]: !yaEsFavorito
            }));

        } catch (err) {
            console.error("Error al cambiar favorito:", err);
        }
    };

    // ----------------------------------
    // Función para agregar el lote al carrito en localStorage
    // ----------------------------------
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

    // ----------------------------------
    // useEffect para cargar los favoritos del usuario
    // ----------------------------------
    useEffect(() => {
        const checkFavorito = async () => {
            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}api/favoritos`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                });
                const data = await resp.json(); // [{id_categoria:1}, {...}]
                
                // Convertir a objeto: {1:true, 3:true}
                const mapa = {};
                data.forEach(cat => {
                    mapa[cat.id_categoria] = true;
                });

                setFavorito(mapa);
            } catch (err) {
                console.error("Error cargando favoritos:", err);
            }
        };

        if (lote) checkFavorito();
    }, [lote]);

    // ----------------------------------
    // useEffect para cargar los detalles del lote al montar el componente
    // ----------------------------------
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

    // ----------------------------------
    // Renderizado condicional basado en el estado
    // ----------------------------------
    if (cargando) return <div>Cargando detalles del lote...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!lote) return <div>No se encontró el lote.</div>;

    return (
        <div className="DetalleLote">
            <Navbar />
            <div className="Cuerpo">
                <div className="detalle-lote">
                    <h2>{lote.nombre_lote}</h2>
                    <div className="detalle-imagen">
                        {lote.imagenes?.length > 0 ? (
                        /* Si hay imágenes, muestra la primera */
                        <img
                            src={lote.imagenes[0]}
                            alt={lote.nombre_lote}
                        />
                        ) : (
                        <img
                            src="https://placehold.co/600x400/cccccc/000000?text=Producto"
                            alt="Sin imagen disponible"
                            className="detalle-imagen"
                        />
                        )}
                    </div>
                    <div className="detalle-info">
                        <p>
                            <strong>Categorías: </strong>

                            {lote.categorias?.length > 0 ? (
                                lote.categorias.map(c => (
                                    <span key={c.id_categoria} style={{ marginLeft: 5, marginRight: 10 }}>
                                        {c.nombre_categoria}
                                        
                                        <button
                                            onClick={() => toggleFavorito(c.id_categoria)}
                                            style={{ marginLeft: 5, cursor: "pointer" }}
                                        >
                                            {favorito[c.id_categoria] ? "★" : "☆"}
                                        </button>
                                    </span>
                                ))
                            ) : (
                                "Sin categoría"
                            )}
                        </p>
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