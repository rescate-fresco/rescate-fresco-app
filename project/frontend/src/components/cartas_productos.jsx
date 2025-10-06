import { Link } from 'react-router-dom';
import { aplicarDescuentoPorVencimiento } from '../utils/descuentos'; 

const agregarAlCarrito = (lote) => {
    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    // Evita duplicados
    if (!carritoActual.some(item => item.id_lote === lote.id_lote)) {
        carritoActual.push(lote);
        localStorage.setItem("carrito", JSON.stringify(carritoActual));
        alert("¡Producto agregado al carrito!");
    } else {
        alert("Este producto ya está en el carrito.");
    }
};

const CartasProductos = ({ lote }) => {
    const{
        nombre_lote,
        precio_original, 
        precio_rescate, 
        imagen, 
        fecha_vencimiento
    } = lote

    const precioInicial = precio_rescate; 
    let precioFinal = precioInicial; 
    let descuentoExtraPorVencimiento = 0;
    let diasRestantes = 999;
    let estaVencido = false;
    
    if (fecha_vencimiento) {
        const resultadoDescuento = aplicarDescuentoPorVencimiento(precioInicial, fecha_vencimiento);
        precioFinal = resultadoDescuento.precioFinal;
        descuentoExtraPorVencimiento = resultadoDescuento.descuentoExtraPorVencimiento;
        diasRestantes = resultadoDescuento.diasRestantes;
        estaVencido = diasRestantes < 0;
    }
    const descuentoTotalPorcentaje = Math.round(((precioInicial - precioFinal) / precioInicial) * 100);
    if (estaVencido) {
        return (
            <div className="lote-card vencido">
                <h3>{nombre_lote}</h3>
                <p>VENCIDO</p>
            </div>
        );
    }

    return (
        <div className="producto-card">
            <img src={imagen || "https://placehold.co/300x200/50B498/ffffff?text=Producto"} alt={nombre_lote} className="imagen-producto" />
            <h3>{nombre_lote}</h3>
            <p className="precio-original">${Number(precio_original).toFixed(2)}</p>

            <p className="precio-oferta">
            ¡Ahora solo ${Number(precioFinal).toFixed(2)}!
            {descuentoTotalPorcentaje > 0 && 
                <span className="descuento"> -{descuentoTotalPorcentaje}%</span>
            }
            </p>
            {descuentoExtraPorVencimiento > 0 && (
                <p className="alerta-vencimiento">¡Vence en {diasRestantes} días! ({descuentoExtraPorVencimiento}% extra)</p>
            )}
            <Link to={`/ofertas/${lote.id_lote}`}>
                <button>Ver Lote</button>
            </Link>
            <button onClick={() => agregarAlCarrito(lote)}>Agregar al Carrito</button>
        </div>
    );
}

export default CartasProductos;