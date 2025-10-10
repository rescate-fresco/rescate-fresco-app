import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import './carrito.css';

const Carrito = () => {
    const [carrito, setCarrito] = useState([]);
    const navigate = useNavigate(); 

    useEffect(() => {
        const carritoGuardado = localStorage.getItem("carrito");
        if (carritoGuardado) {
        setCarrito(JSON.parse(carritoGuardado));
        }
    }, []);

    const eliminarDelCarrito = (id_lote) => {
        const nuevoCarrito = carrito.filter(item => item.id_lote !== id_lote);
        setCarrito(nuevoCarrito);
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
        window.dispatchEvent(new Event("storage")); 
    };

    const vaciarCarrito = () => {
        setCarrito([]);
        localStorage.removeItem("carrito");
        window.dispatchEvent(new Event("storage")); 
    };

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
                            <button className="btn-accion btn-confirmar" onClick={() => navigate("/carrito/pago")}>Confirmar y pagar</button>
                            <button className="btn-accion btn-vaciar" onClick={vaciarCarrito}>Vaciar carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;