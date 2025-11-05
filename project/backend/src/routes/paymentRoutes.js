// link https://github.com/stripe/stripe-cli/releases/tag/v1.32.0 y descargar stripe_1.32.0_windows_i386.zip
// \stripe.exe listen --forward-to http://localhost:5000/api/payments/stripe-webhook

// comando que va en la terminal del archivo .exe de descargas

import express from 'express';
import Stripe from 'stripe';
import pool from '../database/index.js';
import { Resend } from 'resend';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// --- RUTA PARA CREAR EL PAGO ---
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, userId, cartIds } = req.body; 

    if (!userId) {
      return res.status(400).json({ error: 'Falta el ID del usuario (userId)' });
    }
    if (!cartIds || JSON.parse(cartIds).length === 0) {
      return res.status(400).json({ error: 'Faltan los IDs del carrito (cartIds)' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: 'clp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId,
        cartIds: cartIds,
      }
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error al crear Payment Intent:", error);
    res.status(500).json({ error: error.message });
  }
});


// --- RUTA PARA RECIBIR EL WEBHOOK DE STRIPE ---
router.post(
  '/stripe-webhook', 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Error de firma: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { userId, cartIds } = paymentIntent.metadata;
        const loteIds = JSON.parse(cartIds); 
        console.log(`✅ ¡Pago Exitoso! ID: ${paymentIntent.id}`);
        console.log(`✅ Usuario que pagó (desde metadata): ${userId}`);
        console.log(`✅ Lotes comprados (desde metadata): ${loteIds.join(', ')}`);
        
        try {
          // Enviar correo de confirmación al usuario
          const userQuery = 'SELECT email FROM usuarios WHERE id_usuario = $1';
          const userResult = await pool.query(userQuery, [userId]);
          if (userResult.rowCount === 0) {
            throw new Error(`Usuario ${userId} no encontrado en la DB.`);
          }
          const { email, nombre_usuario } = userResult.rows[0];
          console.log(`... Email encontrado: ${email}`);

          // Eliminar los lotes comprados de la base de datos
          const deleteQuery = "DELETE FROM lotes WHERE id_lote = ANY($1::int[])";
          await pool.query(deleteQuery, [loteIds]);
          console.log(`✅ Base de datos actualizada: Lotes [${loteIds.join(', ')}] eliminados.`);

          // Enviar correo electrónico de confirmación
          console.log(`... Enviando correo de confirmación a ${email}...`);
          await resend.emails.send({
            from: 'onboarding@resend.dev', // Dominio de prueba de Resend
            to: email, // El email que sacamos de la DB
            subject: '¡Confirmación de tu compra en Rescate Sabor!',
            html: `
              <h1>¡Gracias por tu compra, ${nombre_usuario}!</h1>
              <p>Tu pago se ha procesado correctamente.</p>
              <p>ID de Pago de Stripe: ${paymentIntent.id}</p>
              <p>Monto: $${(paymentIntent.amount / 100).toLocaleString('es-CL')} CLP</p>
              <p>¡Gracias por ayudarnos a rescatar alimentos!</p>
            `
          });
          console.log(`✅ Email enviado exitosamente.`);

        } catch (dbError) {
          console.error("❌ Error al eliminar los lotes de la base de datos tras el pago:", dbError);
          Sentry.captureException(dbError);
        }

        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log(`❌ Pago Fallido. ID: ${failedIntent.id}, Razón: ${failedIntent.last_payment_error?.message}`);
        break;
    }

    res.status(200).send();
  }
);


export default router;
