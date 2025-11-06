import express from 'express';
import Stripe from 'stripe';
import pool from '../database/index.js'; 
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
        console.log(`✅ Usuario que pagó: ${userId}`);
        console.log(`✅ Lotes comprados: ${loteIds.join(', ')}`);

        try {
          // 🟢 1️⃣ Obtener los datos de los lotes antes de eliminarlos
          const selectQuery = `
            SELECT id_lote, nombre_lote, categoria, peso_qty, precio_original, precio_rescate
            FROM lotes
            WHERE id_lote = ANY($1::int[])
          `;
          const { rows: lotesComprados } = await pool.query(selectQuery, [loteIds]);

          // 🟢 2️⃣ Insertar los lotes en la tabla "rescates"
          const insertQuery = `
            INSERT INTO rescates (
              id_usuario, id_lote, nombre_lote, categoria, peso_qty, precio_original, precio_rescate
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;

          for (const lote of lotesComprados) {
            await pool.query(insertQuery, [
              userId,
              lote.id_lote,
              lote.nombre_lote,
              lote.categoria,
              lote.peso_qty,
              lote.precio_original,
              lote.precio_rescate
            ]);
          }

          console.log(`💾 ${lotesComprados.length} lotes registrados en la tabla "rescates"`);

          // 🟢 3️⃣ Luego eliminar los lotes originales
          const deleteQuery = "DELETE FROM lotes WHERE id_lote = ANY($1::int[])";
          await pool.query(deleteQuery, [loteIds]);
          console.log(`✅ Lotes [${loteIds.join(', ')}] eliminados de la tabla 'lotes'.`);

        } catch (dbError) {
          console.error("❌ Error al registrar rescates o eliminar lotes:", dbError);
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
