import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutForm.css'; // Crearemos este archivo para los estilos

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements) {
      // Stripe.js no ha cargado aún.
      setIsLoading(false);
      return;
    }

    try {
      // 1. Llamamos a NUESTRO backend para crear el Payment Intent
      // Usamos la ruta relativa para que el proxy de Vite funcione
      const res = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount }), // Enviamos el monto (ej: 1000)
      });
      
      const { clientSecret, error: backendError } = await res.json();

      if (backendError) {
        throw new Error(backendError);
      }
      
      if (!clientSecret) {
         throw new Error('No se recibió el clientSecret del servidor.');
      }

      // 2. Obtenemos la referencia al CardElement
      const cardElement = elements.getElement(CardElement);

      // 3. Confirmamos el pago en Stripe desde el frontend
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret, // El "token" de pago que nos dio el backend
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Cliente de Rescate Sabor', // Puedes hacer esto dinámico
            },
          },
        }
      );

      if (stripeError) {
        // Errores de Stripe (ej. tarjeta rechazada, fondos insuficientes)
        throw new Error(stripeError.message);
      }

      // 4. ¡Pago Exitoso!
      console.log('Pago exitoso:', paymentIntent);
      setSucceeded(true);
      setIsLoading(false);
      // Aquí podrías limpiar el carrito de localStorage
      // localStorage.removeItem("carrito");

    } catch (err) {
      setError(err.message || "Ocurrió un error desconocido.");
      setIsLoading(false);
    }
  };

  // Si el pago fue exitoso, muestra un mensaje de éxito.
  if (succeeded) {
    return (
      <div className="checkout-success">
        <h3>¡Pago Exitoso!</h3>
        <p>Tu pago ha sido procesado correctamente.</p>
        <p>Gracias por tu compra.</p>
      </div>
    );
  }

  // Si no, muestra el formulario de pago
  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <label className="form-label">Datos de la Tarjeta</label>
      <div className="FormGroup">
        {/* Este componente renderiza el formulario de Tarjeta */}
        <CardElement id="card-element" />
      </div>
      
      <button 
        className="pay-button"
        type="submit" 
        disabled={isLoading || !stripe || !elements}
      >
        <span>
          {isLoading ? 'Procesando...' : `Pagar $${amount.toLocaleString('es-CL')} CLP`}
        </span>
      </button>

      {/* Muestra errores de pago si los hay */}
      {error && <div id="payment-message" role="alert">{error}</div>}
    </form>
  );
};

export default CheckoutForm;
