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

          // ---HTML para los detalles de retiro ---
          const detallesRetiroHtml = detallesLotes.map(lote => {
            const inicio = new Date(lote.ventana_retiro_inicio);
            const fin = new Date(lote.ventana_retiro_fin);
            const fechaStr = inicio.toLocaleDateString('es-CL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const horaInicioStr = inicio.toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            const horaFinStr = fin.toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            const horarioFormateado = `${fechaStr}, de ${horaInicioStr} a ${horaFinStr} hrs.`;
            return `
              <div class="pickup-item">
                <p><strong>Producto:</strong> ${lote.nombre_lote}</p>
                <p><strong>Tienda:</strong> ${lote.nombre_tienda} - ${lote.direccion_tienda}</p>
                <p><strong>Horario de Retiro:</strong> ${horarioFormateado}</p>
              </div>
            `;
          }).join('');


          // Enviar correo electrónico de confirmación
          console.log(`... Enviando correo de confirmación a ${email}...`);
          const montoFormateado = (paymentIntent.amount).toLocaleString('es-CL');
          const codigoRetiro = paymentIntent.id.slice(-6).toUpperCase();
          await resend.emails.send({
            from: 'onboarding@resend.dev', // Dominio de prueba de Resend
            to: email, // El email que sacamos de la DB
            subject: `🥕 Confirmación de tu compra en Rescate Fresco`,
            html: `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Confirmación de Compra - Rescate Fresco</title>
                  <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f3ef; }
                      .container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
                      .header { background-color: #2E7D32; color: #ffffff; padding: 25px; text-align: center; }
                      .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                      .content { padding: 30px; color: #333333; }
                      .content h2 { color: #2E7D32; font-size: 22px; margin-top: 0; }
                      .content p { line-height: 1.6; font-size: 16px; margin: 10px 0; }
                      .receipt-details { border-top: 2px solid #eeeeee; padding: 20px 0; margin: 25px 0; }
                      .detail-item { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; border-bottom: 1px solid #f0f0f0; }
                      .detail-item:last-child { border-bottom: none; }
                      .detail-item span { color: #555555; text-align: left; flex-shrink: 0;margin-right: 10px; }
                      .detail-item strong { color: #333333; word-break: break-all;max-width: 60%;  text-align: right;}
                      .total { font-weight: bold; font-size: 20px; color: #2E7D32; padding-top: 10px; }
                      .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
                      .pickup-code-wrapper { background-color: #f7fdf9; border: 8px; padding: 20px; text-align: center; margin-bottom: 25px; border-radius: 8px; }
                      .pickup-code-label { font-size: 16px; color: #555; margin: 0; }
                      .pickup-code {font-size: 36px; font-weight: bold; color: #2E7D32; letter-spacing: 4px; margin: 10px 0;  padding: 10px 20px;  border: 2px dashed #2E7D32; border-radius: 8px; display: inline-block;}
                      .pickup-info { margin-top: 30px; padding-top: 20px;}
                      .pickup-item { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #2E7D32; }
                      .footer a { color: #2E7D32; text-decoration: none; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <h1>Rescate Fresco 🥕</h1>
                      </div>
                      <div class="content">
                          <h2>¡Gracias por tu compra, ${nombre_usuario}!</h2>
                          <p>Tu pago se ha procesado correctamente. Con esta acción, no solo ahorras dinero, sino que también ayudas a reducir el desperdicio de alimentos. ¡Eres un héroe!</p>
                          
                          <div class="pickup-code-wrapper">
                            <p class="pickup-code-label">Tu Código de Retiro es:</p>
                            <div class="pickup-code">${codigoRetiro}</div>
                            <p style="font-size: 14px; color: #555; margin: 0;">Por favor, muéstrale este código al personal de la tienda.</p>
                          </div>

                          <div class="receipt-details">
                              <div class="detail-item">
                                  <span>ID de Transacción:</span>
                                  <strong>${paymentIntent.id}</strong>
                              </div>
                              <div class="detail-item">
                                  <span>Fecha de Compra:</span>
                                  <strong>${new Date().toLocaleDateString('es-CL')}</strong>
                              </div>
                              <div class="detail-item total">
                                  <span>Monto Total:</span>
                                  <strong>$${montoFormateado} CLP</strong>
                              </div>
                          </div>

                          <div class="pickup-info">
                              <h3>Detalles para el Retiro</h3>
                              ${detallesRetiroHtml}
                          </div>

                          <p>Recuerda presentar tu confirmación de compra al momento de retirar tus productos.</p>
                          <p>¡Gracias por ser parte de la solución!</p>
                      </div>
                      <div class="footer">
                          <p>&copy; ${new Date().getFullYear()} Rescate Fresco. Todos los derechos reservados.</p>
                          <p>Si tienes alguna pregunta, contáctanos a <a href="mailto:soporte@rescatefresco.com">soporte@rescatefresco.com</a>.</p>
                      </div>
                  </div>
              </body>
              </html>
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
