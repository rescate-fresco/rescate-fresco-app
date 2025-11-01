import React, { useState, useEffect } from 'react';
import Navbar from "../components/navbar";
import CheckoutForm from '../components/CheckoutForm';
import './metodo_pago.css';
import { FaCreditCard, FaUniversity, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { FaPaypal } from 'react-icons/fa6';

const MetodoPago = () => {
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState(null); 

    useEffect(() => {
        try {
            const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
            const total = carrito.reduce((acc, item) => {
                const precio = Number(item.precio_rescate);
                return acc + (isNaN(precio) ? 0 : precio);
            }, 0);
            setTotalAmount(total);
        } catch (error) {
            console.error("Error al leer el carrito:", error);
            setTotalAmount(0);
        }
    }, []);

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
    };

    return (
        <div className="MetodoPago">
            <Navbar />
            <div className="Cuerpo">
                <div className="pago-container">
                    <h2>Selecciona tu método de pago</h2>
                    
                    <div className="resumen-pago">
                        <p>Total a Pagar:</p>
                        <h3>${totalAmount.toLocaleString('es-CL')} CLP</h3>
                    </div>

                    <div className="payment-options-list">

                        <label 
                            className={`payment-option ${selectedMethod === 'stripe' ? 'selected' : ''}`}
                            htmlFor="stripe-option"
                        >
                            <input 
                                type="radio" 
                                id="stripe-option"
                                name="payment-method" 
                                value="stripe"
                                onChange={() => handleSelectMethod('stripe')} 
                            />
                            <div className="payment-option-label">
                                <FaCreditCard className="icono-pago" />
                                <span>Tarjeta de Crédito / Débito</span>
                                <FaCcVisa className="logo-tarjeta" />
                                <FaCcMastercard className="logo-tarjeta" />
                            </div>
                        </label>

                        {/*PayPal - Próximamente */}
                        <label 
                            className={`payment-option disabled ${selectedMethod === 'paypal' ? 'selected' : ''}`}
                            htmlFor="paypal-option"
                        >
                            <input 
                                type="radio" 
                                id="paypal-option"
                                name="payment-method" 
                                value="paypal"
                                disabled
                            />
                            <div className="payment-option-label">
                                <FaPaypal className="icono-pago" />
                                <span>PayPal</span>
                                <span className="pronto">(Próximamente)</span>
                            </div>
                        </label>

                        {/* Transferencia - Próximamente */}
                        <label 
                            className={`payment-option disabled ${selectedMethod === 'transfer' ? 'selected' : ''}`}
                            htmlFor="transfer-option"
                        >
                            <input 
                                type="radio" 
                                id="transfer-option"
                                name="payment-method" 
                                value="transfer"
                                disabled
                            />
                            <div className="payment-option-label">
                                <FaUniversity className="icono-pago" />
                                <span>Transferencia Bancaria</span>
                                <span className="pronto">(Próximamente)</span>
                            </div>
                        </label>
                    </div>

                    {selectedMethod === 'stripe' && (
                        <div className="checkout-form-container">
                            <CheckoutForm amount={totalAmount} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MetodoPago;

