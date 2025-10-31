import React, { useState, useEffect } from 'react';
import Navbar from "../components/navbar";
import CheckoutForm from '../components/CheckoutForm'; // Asumimos que lo pones en components/
import './metodo_pago.css';

const MetodoPago = () => {
    const [totalAmount, setTotalAmount] = useState(0);

    // Efecto para calcular el total del carrito desde localStorage
    useEffect(() => {
        try {
            const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
            
            // Asegurarse de que precio_rescate sea un número
            const total = carrito.reduce((acc, item) => {
                const precio = Number(item.precio_rescate);
                return acc + (isNaN(precio) ? 0 : precio);
            }, 0);
            
            setTotalAmount(total);
        } catch (error) {
            console.error("Error al leer el carrito de localStorage:", error);
            setTotalAmount(0); // Poner 0 en caso de error
        }
    }, []); // Se ejecuta solo una vez al cargar el componente

    return (
        <div className="MetodoPago">
            <Navbar />
            <div className="Cuerpo">
                <div className="pago-container">
                    <h2>Completa tu pago</h2>
                    
                    <div className="resumen-pago">
                        <p>Total a Pagar:</p>
                        {/* Stripe maneja CLP como enteros (sin centavos).
                          Si totalAmount es 1000, Stripe lo interpreta como $1000 CLP.
                        */}
                        <h3>${totalAmount.toLocaleString('es-CL')} CLP</h3>
                    </div>

                    {/* Cargamos el formulario de Checkout.
                      Solo lo mostramos si el total es mayor a 0 
                      y si tenemos las claves de Stripe (lo cual maneja main.jsx).
                    */}
                    {totalAmount > 0 ? (
                        <CheckoutForm amount={totalAmount} />
                    ) : (
                        <p>Tu carrito está vacío o el total es cero.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetodoPago;
