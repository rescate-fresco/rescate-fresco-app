import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutForm.css';

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate(); 

  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null); 
  const [countdown, setCountdown] = useState(3);
  const [cartIds, setCartIds] = useState([]);

  useEffect(() => {
    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")); 
      if (usuarioLogueado && usuarioLogueado.id_usuario) {
        setUserId(usuarioLogueado.id_usuario);
      } else {
        throw new Error("No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.");
      }
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const ids = carrito.map(item => item.id_lote).filter(Boolean); 
      if (ids.length === 0) {
        throw new Error("Tu carrito está vacío.");
      }
      
      setCartIds(ids);

    } catch (err) {
      setError(err.message);
    }
  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements || !userId || cartIds.length === 0) {
      setError("Faltan datos (Stripe, Usuario o Carrito). Recargue la página.");
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amount,
          userId: userId,
          cartIds: JSON.stringify(cartIds)
        }),
      });
      
      const { clientSecret, error: backendError } = await res.json();

      if (backendError) {
        throw new Error(backendError);
      }
      if (!clientSecret) {
        throw new Error('No se recibió el clientSecret del servidor.');
      }

      // Confirmar el pago en Stripe
      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Cliente de Rescate Fresco',
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      //Pago Exitoso
      console.log('Pago exitoso:', paymentIntent);
      setSucceeded(true);
      setIsLoading(false);
      
      // Limpiamos el carrito
      localStorage.removeItem("carrito");

    } catch (err) {
      setError(err.message || "Ocurrió un error desconocido.");
      setIsLoading(false);
    }
  };

  //Lógica del contador y redirección
  useEffect(() => {
    if (succeeded) {
      if (countdown === 0) {
        navigate('/');
        return;
      }
      
      const intervalId = setInterval(() => {
        setCountdown((currentCountdown) => currentCountdown - 1);
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [succeeded, countdown, navigate]);

  if (succeeded) {
    return (
      <div className="checkout-success">
        <h3>¡Pago Exitoso!</h3>
        <p>Tu pago ha sido procesado correctamente.</p>
        <p>Gracias por tu compra.</p>
        <p><em>Serás redirigido al inicio en {countdown} segundos...</em></p> 
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <label className="form-label">Datos de la Tarjeta</label>
      <div className="FormGroup">
        <CardElement id="card-element" />
      </div>
      
      <button 
        className="pay-button"
        type="submit" 
        disabled={isLoading || !stripe || !elements || !userId || cartIds.length === 0}
      >
        <span>
          {isLoading ? 'Procesando...' : `Pagar $${amount.toLocaleString('es-CL')} CLP`}
        </span>
      </button>

      {error && <div id="payment-message" role="alert">{error}</div>}
    </form>
  );
};

export default CheckoutForm;
