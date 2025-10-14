import { Link } from 'react-router-dom';
import { aplicarDescuentoPorVencimiento } from '../utils/descuentos';
import './cartas_tienda.css';

const CartasTienda = ({ lote }) => {
    const{
        nombre_lote,
        precio_original, 
        precio_rescate, 
        imagen, 
        fecha_vencimiento,
        estado
    } = lote

    const precioInicial = precio_rescate; 
    let precioFinal = precioInicial; 
    let descuentoExtraPorVencimiento = 0;
    let diasRestantes = 999;
    let estaVencido = false;
    let estado_producto = estado
    
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

    const handleEstadoChange = async (nuevoEstado, idLote) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}api/lotes/${idLote}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado_producto: nuevoEstado })
            });

            if (!res.ok) throw new Error("Error al actualizar estado");
            const data = await res.json();
            alert(`Estado actualizado a: ${data.lote.estado}`);
        } catch (err) {
            console.error(err);
            alert("No se pudo actualizar el estado");
        }
    };

    return (
        <div className="producto-tienda">
            <img src={imagen || "https://placehold.co/300x200/50B498/ffffff?text=Producto"} alt={nombre_lote} className="imagen-producto-tienda" />
            <h3>{nombre_lote}</h3>
            
            {descuentoExtraPorVencimiento > 0 && (
                <p className="alerta-vencimiento-tienda">¡Vence en {diasRestantes} días!</p>
            )}
             <label>
                Estado:
                <select 
                value={estado_producto} 
                onChange={(e) => handleEstadoChange(e.target.value, lote.id_lote)}
                >
                <option value="DISPONIBLE">Disponible</option>
                <option value="NO DISPONIBLE">No disponible</option>
                <option value="OCULTO">Oculto</option>
                <option value="ELIMINADO">Eliminado</option>
                </select>
            </label>
            <Link to={`/lote/${lote.id_lote}`}>
                <button>Ver Detalle</button>
            </Link>
        </div>
    );
}

export default CartasTienda;