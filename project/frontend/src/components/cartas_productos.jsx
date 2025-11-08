import { Link } from 'react-router-dom';
import { aplicarDescuentoPorVencimiento } from '../utils/descuentos';
import './cartas_productos.css';

const CartasProductos = ({ lote }) => {
    const{
        nombre_lote,
        precio_original, 
        precio_rescate, 
        imagenes = [], 
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
            <div className="detalle-imagen">
                {Array.isArray(lote.imagenes) && lote.imagenes.length > 0 ? (
                    <img src={lote.imagenes[0]} alt={lote.nombre_lote} />
                ) : (
                    <img
                        src="https://placehold.co/600x400/cccccc/000000?text=Producto"
                        alt="Sin imagen disponible"
                    />
                )}
            </div>
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
            <Link to={`/lote/${lote.id_lote}`}>
                <button>Ver Detalle</button>
            </Link>
        </div>
    );
}

export default CartasProductos;