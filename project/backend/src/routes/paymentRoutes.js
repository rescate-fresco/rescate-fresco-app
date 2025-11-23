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
          // --- Obtener peso total de los lotes ---
          const pesosQuery = `
            SELECT id_lote, peso_qty
            FROM lotes
            WHERE id_lote = ANY($1::int[])
          `;
          const pesosResult = await pool.query(pesosQuery, [loteIds]);
          console.log("📦 Lotes encontrados:", pesosResult.rows);
          
          const pesoTotal = pesosResult.rows.reduce((sum, lote) => sum + parseFloat(lote.peso_qty || 0), 0);
          console.log("⚖️ Peso total calculado:", pesoTotal);
          if (pesoTotal === 0) {
            console.warn("⚠️ ADVERTENCIA: peso_total es 0. Verifica que los lotes tengan peso_qty");
          }

         // --- Actualizar kg_rescatados del usuario ---
          const updateUserQuery = `
            UPDATE usuarios
            SET kg_rescatados = kg_rescatados + $1
            WHERE id_usuario = $2
            RETURNING id_usuario, nombre_usuario, email, kg_rescatados
          `;
          const updateResult = await pool.query(updateUserQuery, [pesoTotal, userId]);
          console.log("✅ Usuario actualizado:", updateResult.rows[0]);

          // --- Eliminar los lotes comprados ---
          // Enviar correo de confirmación al usuario
          const userQuery = 'SELECT email,nombre_usuario FROM usuarios WHERE id_usuario = $1';
          const userResult = await pool.query(userQuery, [userId]);
          if (userResult.rowCount === 0) {
            throw new Error(`Usuario ${userId} no encontrado en la DB.`);
          }
          const { email, nombre_usuario } = userResult.rows[0];
          console.log(`... Email encontrado: ${email}`);

          // --- NUEVO: Obtener detalles de los lotes y tiendas ANTES de borrarlos ---
          const lotesQuery = `
            SELECT 
              l.nombre_lote,
              l.ventana_retiro_inicio,
              l.ventana_retiro_fin,
              t.nombre_tienda,
              t.direccion_tienda
            FROM lotes l
            JOIN tiendas t ON l.id_tienda = t.id_tienda
            WHERE l.id_lote = ANY($1::int[])
          `;
          const lotesResult = await pool.query(lotesQuery, [loteIds]);
          const detallesLotes = lotesResult.rows;

          // --- Eliminar los lotes comprados de la base de datos ---
          const deleteQuery = "DELETE FROM lotes WHERE id_lote = ANY($1::int[])";
          await pool.query(deleteQuery, [loteIds]);
          console.log(`✅ Base de datos actualizada: Lotes [${loteIds.join(', ')}] eliminados.`);
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
