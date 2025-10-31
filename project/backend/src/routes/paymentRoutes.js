import express from 'express'; // <-- Necesitabas importar express aquí
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- RUTA PARA CREAR EL PAGO (Esta ya la tenías bien) ---
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; 

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: 'clp',
      automatic_payment_methods: {
        enabled: true,
      },
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
// Esta es la lógica que habías pegado en server.js
router.post(
  '/stripe-webhook', 
  // Usamos express.raw() para obtener el body crudo, que Stripe necesita
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    
    // El secreto lo obtienes del Stripe CLI, NO del Dashboard
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      // 1. Verificar la firma (¡Seguridad!)
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Error de firma: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Manejar el evento (¡Aquí confirmas el pago!)
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`✅ ¡Pago Exitoso! ID: ${paymentIntent.id}`);
        // TODO: Busca la orden en tu DB (usando paymentIntent.id o metadata)
        // Y marca la orden como "Pagada".
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log(`❌ Pago Fallido. ID: ${failedIntent.id}, Razón: ${failedIntent.last_payment_error?.message}`);
        // TODO: Marca la orden como "Fallida" en tu DB.
        break;
      
      // ... puedes manejar otros eventos si quieres
    }

    // 3. Responder a Stripe que todo salió bien
    res.status(200).send();
  }
);


export default router;
