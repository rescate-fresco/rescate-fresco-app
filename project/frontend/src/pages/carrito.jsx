import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";

import './carrito.css';

const Carrito = () => {
    const [carrito, setCarrito] = useState([]);
    const navigate = useNavigate(); 

    useEffect(() => {
        const cargarCarrito = async () => {
            const carritoGuardado = JSON.parse(localStorage.getItem("carrito") || "[]");
            if (carritoGuardado.length === 0) return;

            try {
                const ids = carritoGuardado.map(item => item.id_lote);
                const resp = await fetch(`${import.meta.env.VITE_API_URL}api/lotes/por-ids`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids })
                });
                const data = await resp.json();
                setCarrito(data.lotes);  // actualizamos con datos frescos de la BD
                localStorage.setItem("carrito", JSON.stringify(data.lotes));
            } catch (err) {
                console.error(err);
                setCarrito(carritoGuardado); // fallback
            }
        };

        cargarCarrito();
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
        window.dispatchEvent(new Event("storage")); 
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
        window.dispatchEvent(new Event("storage")); 
    };

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}"); // CAMBIO
    const idUsuario = usuario.id_usuario || null; // CAMBIO

    const todosDisponibles = carrito.length > 0 && carrito.every(item =>
        item.estado === "DISPONIBLE" || 
        (item.estado === "RESERVADO" && item.reserva_user_id === idUsuario) // CAMBIO
    );

    const totalOriginal = carrito.reduce((acc, item) => acc + Number(item.precio_original), 0);
    const totalRescate = carrito.reduce((acc, item) => acc + Number(item.precio_rescate), 0);
    const descuentoTotal = totalOriginal - totalRescate;

    if (carrito.length === 0) {
        return (
            <div className="Carrito">
                <Navbar />
                <div className="Cuerpo">
                    <div className="carrito-container">
                        <div className="carrito-vacio-content">
                            <h2>Tu carrito está vacío</h2>
                            <p>Parece que aún no has agregado productos. ¡Explora nuestras ofertas!</p>
                            <button className="btn-accion btn-confirmar" onClick={() => navigate("/")}>Ver productos</button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                <div className="carrito-container">
                    <h2 className="titulo-carrito">Carrito de compras</h2>
                    <div className="carrito-layout">
                        <div className="carrito-productos">
                            <ul className="carrito-lista">
                                {carrito.map(item => (
                                    <li key={item.id_lote} className="carrito-item">
                                        <span className="item-info">
                                            <span className="item-nombre">{item.nombre_lote}</span> - ${Number(item.precio_rescate).toFixed(2)}
                                        </span>
                                        <p>
                                        <strong>Estado:</strong>{' '}
                                        <span className={`estado ${item.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {item.estado}
                                        </span>
                                        </p>
                                        <button className="btn-quitar" onClick={() => eliminarDelCarrito(item.id_lote)}>
                                            Quitar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="carrito-resumen">
                            <h3>Resumen del pedido</h3>
                            <div className="resumen-fila">
                                <span>Total Original:</span>
                                <span>${totalOriginal.toFixed(2)}</span>
                            </div>
                            <div className="resumen-fila descuento-total">
                                <span>Descuento Total:</span>
                                <span>-${descuentoTotal.toFixed(2)}</span>
                            </div>
                            <div className="resumen-fila total-pagar">
                                <span>Total a Pagar:</span>
                                <span>${totalRescate.toFixed(2)}</span>
                            </div>
                            <button className="btn-accion btn-confirmar" onClick={confirmarYPagar} disabled={!todosDisponibles}>Confirmar y pagar</button>
                            <button className="btn-accion btn-vaciar" onClick={vaciarCarrito}>Vaciar carrito</button>
                            {!todosDisponibles && (
                                <p style={{color: "red", marginTop: "10px"}}>
                                    Todos los productos deben estar disponibles para confirmar el pago.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;