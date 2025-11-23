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

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { userId, cartIds } = paymentIntent.metadata;
        
        if (!userId || !cartIds) {
          console.error("❌ Faltan userId o cartIds en metadata");
          res.status(200).send();
          break;
        }

        let loteIds;
        try {
          loteIds = JSON.parse(cartIds);
        } catch (parseError) {
          console.error("❌ Error parseando cartIds:", parseError);
          res.status(200).send();
          break;
        }
        
        console.log(`✅ ¡Pago Exitoso! ID: ${paymentIntent.id}`);
        console.log(`✅ Usuario: ${userId}, Lotes: ${loteIds.join(', ')}`);
        
        try {
          // --- 1️⃣ Obtener datos de los lotes ---
          const lotesQuery = `
            SELECT 
              l.id_lote, 
              l.nombre_lote,
              c.nombre_categoria,
              l.peso_qty,
              l.precio_rescate,
              l.ventana_retiro_inicio,
              l.ventana_retiro_fin,
              l.id_tienda,
              t.nombre_tienda,
              t.direccion_tienda
            FROM lotes l
            LEFT JOIN lotes_categorias lc ON l.id_lote = lc.id_lote
            LEFT JOIN categorias c ON lc.id_categoria = c.id_categoria
            JOIN tiendas t ON l.id_tienda = t.id_tienda
            WHERE l.id_lote = ANY($1::int[])
          `;
          const lotesResult = await pool.query(lotesQuery, [loteIds]);
          const lotes = lotesResult.rows;

          console.log("📦 Lotes encontrados:", lotes.length);

          if (lotes.length === 0) {
            console.warn("⚠️ No se encontraron lotes");
            res.status(200).send();
            break;
          }

          const pesoTotal = lotes.reduce((sum, lote) => sum + parseFloat(lote.peso_qty || 0), 0);
          console.log("⚖️ Peso total:", pesoTotal, "kg");

          // --- 2️⃣ Actualizar kg_rescatados ---
          const updateUserQuery = `
            UPDATE usuarios
            SET kg_rescatados = kg_rescatados + $1
            WHERE id_usuario = $2
            RETURNING id_usuario, nombre_usuario, email, kg_rescatados
          `;
          const updateResult = await pool.query(updateUserQuery, [pesoTotal, userId]);
          console.log("✅ Usuario actualizado:", updateResult.rows[0]);

          // --- 3️⃣ Obtener email del usuario ---
          const userQuery = 'SELECT email, nombre_usuario FROM usuarios WHERE id_usuario = $1';
          const userResult = await pool.query(userQuery, [userId]);
          if (userResult.rowCount === 0) {
            throw new Error(`Usuario ${userId} no encontrado`);
          }
          const { email, nombre_usuario } = userResult.rows[0];
          console.log(`📧 Email encontrado: ${email}`);

          // --- 4️⃣ Guardar en historial_compras ---
          const insertHistorialQuery = `
            INSERT INTO historial_compras 
            (id_usuario, id_lote, nombre_lote, categoria, peso_qty, precio_pagado, 
            nombre_tienda, id_tienda, ventana_retiro_inicio, ventana_retiro_fin, 
            estado_compra, stripe_payment_intent_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `;

          for (const lote of lotes) {
            await pool.query(insertHistorialQuery, [
              userId,
              lote.id_lote,
              lote.nombre_lote,
              lote.nombre_categoria || 'Sin categoría',
              lote.peso_qty,
              lote.precio_rescate,
              lote.nombre_tienda,
              lote.id_tienda,
              lote.ventana_retiro_inicio,
              lote.ventana_retiro_fin,
              'PENDIENTE',
              paymentIntent.id
            ]);
          }

          // --- 5️⃣ Eliminar lotes ---
          const deleteQuery = "DELETE FROM lotes WHERE id_lote = ANY($1::int[])";
          await pool.query(deleteQuery, [loteIds]);
          console.log("✅ Lotes eliminados");

          // --- 6️⃣ Construir HTML de detalles de retiro ---
          const detallesRetiroHtml = lotes.map(lote => {
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
            return `
              <div class="pickup-item">
                <p><strong>Producto:</strong> ${lote.nombre_lote}</p>
                <p><strong>Tienda:</strong> ${lote.nombre_tienda} - ${lote.direccion_tienda}</p>
                <p><strong>Horario de Retiro:</strong> ${fechaStr}, de ${horaInicioStr} a ${horaFinStr} hrs.</p>
              </div>
            `;
          }).join('');

          // --- 7️⃣ Enviar email ---
          const montoFormateado = (paymentIntent.amount).toLocaleString('es-CL');
          const codigoRetiro = paymentIntent.id.slice(-6).toUpperCase();
          
          console.log(`📧 Enviando correo a ${email}...`);
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
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
                      .detail-item span { color: #555555; }
                      .detail-item strong { color: #333333; }
                      .total { font-weight: bold; font-size: 20px; color: #2E7D32; padding-top: 10px; }
                      .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
                      .pickup-code-wrapper { background-color: #f7fdf9; padding: 20px; text-align: center; margin-bottom: 25px; border-radius: 8px; }
                      .pickup-code { font-size: 36px; font-weight: bold; color: #2E7D32; letter-spacing: 4px; margin: 10px 0; padding: 10px 20px; border: 2px dashed #2E7D32; border-radius: 8px; display: inline-block; }
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
                            <p>Tu Código de Retiro es:</p>
                            <div class="pickup-code">${codigoRetiro}</div>
                            <p style="font-size: 14px; color: #555;">Por favor, muéstrale este código al personal de la tienda.</p>
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
          console.log("✅ Email enviado exitosamente");
          
        } catch (dbError) {
          console.error("❌ Error:", dbError);
          Sentry.captureException(dbError);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log(`❌ Pago Fallido. ID: ${failedIntent.id}`);
        break;
    }

    res.status(200).send();
  }
);

// POST → Cancelar compra y reembolsar 60%
router.post('/cancelar-compra', async (req, res) => {
  try {
    const { id_compra, stripe_payment_intent_id, precio_pagado } = req.body;

    if (!id_compra || !stripe_payment_intent_id || !precio_pagado) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const compraQuery = `
      SELECT 
        id_usuario,
        nombre_lote,
        categoria,
        peso_qty,
        id_tienda,
        nombre_tienda,
        ventana_retiro_inicio,
        ventana_retiro_fin
      FROM historial_compras
      WHERE id_compra = $1 AND estado_compra = 'PENDIENTE'
    `;
    
    const compraResult = await pool.query(compraQuery, [id_compra]);
    
    if (compraResult.rows.length === 0) {
      return res.status(400).json({ error: 'Compra no encontrada o ya fue retirada/cancelada' });
    }

    const compra = compraResult.rows[0];
    const montoReembolso = Math.round(precio_pagado * 0.6);

    // Procesar reembolso
    try {
      const refund = await stripe.refunds.create({
        payment_intent: stripe_payment_intent_id,
        amount: montoReembolso,
        reason: 'requested_by_customer'
      });
      console.log("✅ Reembolso procesado:", refund.id);
    } catch (stripeError) {
      console.error("❌ Error en Stripe:", stripeError);
      return res.status(500).json({ error: 'Error al procesar el reembolso' });
    }

    // Restar kg_rescatados
    await pool.query(`
      UPDATE usuarios
      SET kg_rescatados = kg_rescatados - $1
      WHERE id_usuario = $2
    `, [compra.peso_qty, compra.id_usuario]);

    // Actualizar estado
    await pool.query(`
      UPDATE historial_compras
      SET estado_compra = 'CANCELADO'
      WHERE id_compra = $1
    `, [id_compra]);

    // Recrear lote
    const nuevoLoteResult = await pool.query(`
      INSERT INTO lotes 
      (id_tienda, nombre_lote, descripcion, peso_qty, precio_original, precio_rescate, 
       fecha_vencimiento, ventana_retiro_inicio, ventana_retiro_fin)
      VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days', $7, $8)
      RETURNING id_lote
    `, [
      compra.id_tienda,
      compra.nombre_lote,
      'Rescatado',
      compra.peso_qty,
      precio_pagado * 1.67,
      precio_pagado,
      compra.ventana_retiro_inicio,
      compra.ventana_retiro_fin
    ]);

    const nuevoIdLote = nuevoLoteResult.rows[0].id_lote;

    // Vincular categoría
    if (compra.categoria) {
      const categoriaResult = await pool.query(`
        SELECT id_categoria FROM categorias WHERE nombre_categoria = $1 LIMIT 1
      `, [compra.categoria]);

      if (categoriaResult.rows.length > 0) {
        await pool.query(`
          INSERT INTO "lotes categorias" (id_lote, id_categoria)
          VALUES ($1, $2)
        `, [nuevoIdLote, categoriaResult.rows[0].id_categoria]);
      }
    }

    console.log("✅ Lote recreado con ID:", nuevoIdLote);

    res.json({
      success: true,
      message: `Compra cancelada. Se reembolsaron $${montoReembolso}`,
      monto_reembolsado: montoReembolso
    });

  } catch (error) {
    console.error("❌ Error cancelando compra:", error);
    Sentry.captureException(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;