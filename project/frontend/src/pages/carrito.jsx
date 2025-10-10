import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import './carrito.css';

const Carrito = () => {
    const [carrito, setCarrito] = useState([]);
    const navigate = useNavigate(); 

    // Cargar el carrito desde localStorage al montar el componente
    useEffect(() => {
        const cargarCarrito = () => {
            const carritoGuardado = localStorage.getItem("carrito");
            if (carritoGuardado) {
                setCarrito(JSON.parse(carritoGuardado));
            }
        };

        cargarCarrito(); // carga inicial

        window.addEventListener("storage", cargarCarrito); // escucha cambios en otras pestañas

        return () => window.removeEventListener("storage", cargarCarrito);
    }, []);

    // Eliminar un producto del carrito
    const eliminarDelCarrito = async (id_lote) => {
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}api/lotes/liberar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_lote }),
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || "Error al liberar lote");

            console.log("Lote liberado:", data.lote);
        } catch (err) {
            console.error("Error al liberar lote:", err.message);
        }

        const nuevoCarrito = carrito.filter(item => item.id_lote !== id_lote);
        setCarrito(nuevoCarrito);
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    };

    // Vaciar el carrito
    const vaciarCarrito = async () => {
        try {
            const lotesIds = carrito.map(item => item.id_lote);

            // Actualizar BD para liberar todos los lotes
            const resp = await fetch(`${import.meta.env.VITE_API_URL}api/lotes/liberar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lotes: lotesIds }), // CAMBIO: enviamos array
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || "Error al liberar lotes");

            console.log("Lotes liberados:", data.lotes); // CAMBIO: log de lotes liberados
        } catch (err) {
            console.error("Error al liberar lotes:", err.message);
        }

        setCarrito([]);
        localStorage.removeItem("carrito");
    };


    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}"); // CAMBIO
    const idUsuario = usuario.id_usuario || null; // CAMBIO

    const todosDisponibles = carrito.length > 0 && carrito.every(item =>
        item.estado === "DISPONIBLE" || 
        (item.estado === "RESERVADO" && item.reserva_user_id === idUsuario) // CAMBIO
    );

    if (carrito.length === 0) {
        return <div className="p-8 text-center">El carrito está vacío.</div>;
    }


    const confirmarYPagar = async () => {
        const lotesIds = carrito.map(item => item.id_lote);
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        const idUsuario = usuario.id_usuario || null;

        // 🔹 NUEVO: Verificar si algún lote está reservado por otro usuario
        const lotesReservadosPorOtro = carrito.some(item => 
            item.reserva_user_id && item.reserva_user_id !== idUsuario
        );

        if (lotesReservadosPorOtro) {
            alert("No puedes confirmar el pago porque uno o más lotes están reservados por otro usuario.");
            return; // ❌ Cancelamos si hay reservas de otros usuarios
        }

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}api/lotes/reservar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idUsuario, lotes: lotesIds }),
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || "Error al reservar");

            alert("Lotes reservados por 15 minutos ✅");
            navigate("/carrito/pago");
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="Carrito">
            <Navbar />
            <div className="Cuerpo">
                
                {carrito.length === 0 ? (
                <div className="carrito-vacio">El carrito está vacío.</div>
                ) : (
                <div className="carrito-contenedor">
                    <h2 className="carrito-titulo">Carrito de compras</h2>
                    <ul className="carrito-lista">
                    {carrito.map((item) => (
                        <li key={item.id_lote} className="carrito-item">
                        <div className="carrito-info">
                            <span className="carrito-nombre">{item.nombre_lote}</span>
                            <span className="carrito-precio">
                            ${Number(item.precio_rescate).toFixed(2)}
                            </span>
                            <p>
                            <strong>Estado:</strong>{' '}
                            <span className={`estado ${item.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {item.estado}
                            </span>
                            </p>
                        </div>
                        <button
                            className="carrito-boton quitar"
                            onClick={() => eliminarDelCarrito(item.id_lote)}
                        >
                            Quitar
                        </button>
                        </li>
                    ))}
                    </ul>
                    <div className="carrito-acciones">
                     <button
                        className="carrito-boton confirmar"
                        onClick={confirmarYPagar}
                        disabled={!todosDisponibles}
                    >
                        Confirmar y pagar
                    </button>
                    <button
                        className="carrito-boton vaciar"
                        onClick={vaciarCarrito}
                    >
                        Vaciar carrito
                    </button>
                    </div>
                    {!todosDisponibles && (
                        <p style={{color: "red", marginTop: "10px"}}>
                            Todos los productos deben estar disponibles para confirmar el pago.
                        </p>
                    )}
                </div>
                )}
                    
            </div>
        </div>
    );
};

export default Carrito;