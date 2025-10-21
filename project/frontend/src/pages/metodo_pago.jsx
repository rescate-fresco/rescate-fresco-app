import Navbar from "../components/navbar";
import './metodo_pago.css';
import { FaCreditCard, FaUniversity } from 'react-icons/fa';

const MetodoPago = () => {
    const handlePago = (metodo) => {
        alert(`¡Pago realizado con ${metodo}!`);
        // Aquí iría la lógica para procesar el pago y redirigir a una página de confirmación.
    };

    return (
        <div className="MetodoPago">
            <Navbar />
            <div className="Cuerpo">
                <div className="pago-container">
                    <h2>Selecciona tu método de pago</h2>
                    <div className="opciones-pago">
                        <button
                            className="btn-metodo-pago btn-tarjeta"
                            onClick={() => handlePago("tarjeta de crédito")}
                        >
                            <FaCreditCard className="icono-pago" />
                            <span>Tarjeta de Crédito / Débito</span>
                        </button>
                        <button
                            className="btn-metodo-pago btn-transferencia"
                            onClick={() => handlePago("transferencia")}
                        >
                            <FaUniversity className="icono-pago" />
                            <span>Transferencia Bancaria</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetodoPago;