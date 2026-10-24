import Stripe from 'stripe';
import { SERVER_PLANS, VALID_COUPONS } from '../config/stripeConfig';
import { PlanType } from '../types';

export interface StripeServerStatus {
  configured: boolean;
  mode: 'live' | 'test' | 'not_configured';
  webhookConfigured: boolean;
  publishableKeyAvailable: boolean;
  message: string;
}

// Registro en memoria de eventos procesados para idempotencia
const processedEventIds = new Set<string>();

export class StripeServerService {
  /**
   * Obtiene la instancia oficial del SDK de Stripe
   */
  public static getStripeInstance(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.trim().length === 0 || key === 'placeholder' || key === 'MY_STRIPE_SECRET_KEY') {
      return null;
    }

    return new Stripe(key, {
      apiVersion: '2025-02-24.acacia' as any,
      appInfo: {
        name: 'PastoralMente AI Premium',
        version: '10.0.0',
      },
    });
  }

  /**
   * Obtiene el estado actual de la integración de Stripe sin exponer secretos
   */
  public static getStatus(): StripeServerStatus {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const pubKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

    const isSecretConfigured = secretKey.length > 20 && !secretKey.includes('placeholder') && !secretKey.includes('MY_');
    const isWebhookConfigured = webhookSecret.length > 15 && !webhookSecret.includes('placeholder');
    const isPubKeyConfigured = pubKey.length > 15 && !pubKey.includes('placeholder');

    let mode: 'live' | 'test' | 'not_configured' = 'not_configured';
    if (isSecretConfigured) {
      mode = secretKey.startsWith('sk_live_') ? 'live' : 'test';
    }

    let message = 'Pasarela Stripe no configurada en las variables de entorno del servidor.';
    if (isSecretConfigured) {
      message = mode === 'live' 
        ? 'Stripe conectado en MODO PRODUCCIÓN REAL.' 
        : 'Stripe conectado en MODO SANDBOX DE PRUEBAS.';
    }

    return {
      configured: isSecretConfigured,
      mode,
      webhookConfigured: isWebhookConfigured,
      publishableKeyAvailable: isPubKeyConfigured,
      message,
    };
  }

  /**
   * Crea una sesión real de Stripe Checkout
   */
  public static async createCheckoutSession(params: {
    plan: PlanType;
    billingCycle?: 'monthly' | 'annual';
    userEmail: string;
    userId: string;
    couponCode?: string;
    hostUrl: string;
  }): Promise<{
    success: boolean;
    url?: string;
    sessionId?: string;
    error?: { code: string; message: string; hint?: string };
  }> {
    const { plan, billingCycle = 'annual', userEmail, userId, couponCode, hostUrl } = params;

    // 1. Validar identidad
    if (!userEmail || !userEmail.includes('@')) {
      return {
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Se requiere una dirección de correo electrónico válida para la facturación.',
        },
      };
    }

    if (!userId || userId.trim() === '') {
      return {
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'Identificador de usuario no proporcionado.',
        },
      };
    }

    // 2. Validar plan contra el catálogo de servidor
    const planDef = SERVER_PLANS[plan];
    if (!planDef) {
      return {
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: `El plan solicitado "${plan}" no existe en el catálogo de suscripciones permitidas.`,
        },
      };
    }

    if (plan === 'free') {
      return {
        success: false,
        error: {
          code: 'FREE_PLAN_NO_CHECKOUT',
          message: 'El plan Explorador Gratuito no requiere sesión de Checkout.',
        },
      };
    }

    // 3. Verificar inicialización de Stripe SDK
    const stripe = this.getStripeInstance();
    if (!stripe) {
      return {
        success: false,
        error: {
          code: 'STRIPE_NOT_CONFIGURED',
          message: 'La pasarela de Stripe no está configurada en el servidor (STRIPE_SECRET_KEY ausente).',
          hint: 'Agrega STRIPE_SECRET_KEY en las variables de entorno de tu servidor o en Vercel > Settings > Environment Variables.',
        },
      };
    }

    // 4. Calcular precio exacto en el servidor (servidor-autoritativo)
    const isAnnual = billingCycle === 'annual';
    const baseMonthlyPrice = isAnnual ? planDef.priceAnnualUsdPerMonth : planDef.priceMonthlyUsd;
    const totalUnitUsd = isAnnual ? baseMonthlyPrice * 12 : baseMonthlyPrice;

    // Calcular descuento de cupón validado en servidor
    let finalAmountCents = Math.round(totalUnitUsd * 100);
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    const couponDef = VALID_COUPONS[cleanCoupon];

    if (couponDef) {
      const discount = (100 - couponDef.discountPercent) / 100;
      finalAmountCents = Math.max(100, Math.round(finalAmountCents * discount)); // mínimo $1 USD
    }

    // Verificar si existe Price ID preconfigurado en las variables de entorno
    const envKey = isAnnual ? planDef.stripePriceEnvKeyAnnual : planDef.stripePriceEnvKeyMonthly;
    const configuredPriceId = envKey ? process.env[envKey] : undefined;

    const successUrl = `${hostUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
    const cancelUrl = `${hostUrl}/?payment=cancelled`;

    try {
      let sessionParams: Stripe.Checkout.SessionCreateParams;

      if (configuredPriceId && configuredPriceId.startsWith('price_')) {
        // Uso de Price ID oficial de Stripe pre-creado en dashboard
        sessionParams = {
          mode: 'subscription',
          customer_email: userEmail,
          client_reference_id: userId,
          line_items: [
            {
              price: configuredPriceId,
              quantity: 1,
            },
          ],
          metadata: {
            userId,
            planId: plan,
            billingCycle,
            couponCode: couponDef ? couponDef.code : '',
          },
          subscription_data: {
            metadata: {
              userId,
              planId: plan,
              billingCycle,
            },
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        };
      } else {
        // Creación dinámica de línea de suscripción (permite pruebas inmediatas sin configurar IDs en Stripe Dashboard)
        sessionParams = {
          mode: 'subscription',
          customer_email: userEmail,
          client_reference_id: userId,
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `PastoralMente AI - ${planDef.name}`,
                  description: `${planDef.description} (${isAnnual ? 'Facturación Anual' : 'Facturación Mensual'})`,
                  metadata: {
                    planId: plan,
                    billingCycle,
                  },
                },
                unit_amount: finalAmountCents,
                recurring: {
                  interval: isAnnual ? 'year' : 'month',
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId,
            planId: plan,
            billingCycle,
            couponCode: couponDef ? couponDef.code : '',
          },
          subscription_data: {
            metadata: {
              userId,
              planId: plan,
              billingCycle,
            },
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      if (!session.url) {
        return {
          success: false,
          error: {
            code: 'SESSION_URL_MISSING',
            message: 'Stripe creó la sesión pero no devolvió la URL de redirección.',
          },
        };
      }

      return {
        success: true,
        url: session.url,
        sessionId: session.id,
      };
    } catch (err: any) {
      console.error('Error al invocar stripe.checkout.sessions.create:', err?.message || err);
      return {
        success: false,
        error: {
          code: 'STRIPE_API_ERROR',
          message: err?.message || 'Error de comunicación con la API de Stripe.',
        },
      };
    }
  }

  /**
   * Verifica el estado real de una sesión de Checkout tras el retorno del navegador
   */
  public static async verifyCheckoutSession(sessionId: string): Promise<{
    success: boolean;
    verified: boolean;
    plan?: PlanType;
    userId?: string;
    customerId?: string;
    subscriptionId?: string;
    customerEmail?: string;
    amountTotal?: number;
    paymentStatus?: string;
    status?: string;
    error?: string;
  }> {
    if (!sessionId || sessionId.trim() === '') {
      return { success: false, verified: false, error: 'sessionId requerido' };
    }

    const stripe = this.getStripeInstance();
    if (!stripe) {
      return { success: false, verified: false, error: 'Stripe no configurado en servidor' };
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      });

      const isPaid = session.payment_status === 'paid' || session.status === 'complete';
      const plan = (session.metadata?.planId as PlanType) || 'profesional';
      const userId = session.metadata?.userId || session.client_reference_id || '';
      const customerId = typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id;

      return {
        success: true,
        verified: isPaid,
        plan,
        userId,
        customerId,
        subscriptionId,
        customerEmail: session.customer_details?.email || undefined,
        amountTotal: session.amount_total ? session.amount_total / 100 : undefined,
        paymentStatus: session.payment_status,
        status: session.status || undefined,
      };
    } catch (err: any) {
      console.error('Error verificando sesión de Stripe:', err?.message || err);
      return {
        success: false,
        verified: false,
        error: err?.message || 'No fue posible consultar la sesión en Stripe',
      };
    }
  }

  /**
   * Crea una sesión de Stripe Customer Portal para gestión de suscripciones
   */
  public static async createPortalSession(customerId: string, returnUrl: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    const stripe = this.getStripeInstance();
    if (!stripe) {
      return { success: false, error: 'Stripe no configurado' };
    }

    if (!customerId || !customerId.startsWith('cus_')) {
      return { success: false, error: 'Identificador de cliente de Stripe no válido' };
    }

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return {
        success: true,
        url: portalSession.url,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Error abriendo Customer Portal de Stripe',
      };
    }
  }

  /**
   * Procesa de forma segura e idempotente eventos de Webhook de Stripe
   */
  public static async processWebhookEvent(
    rawBody: Buffer | string,
    signature: string | undefined
  ): Promise<{
    success: boolean;
    received: boolean;
    eventId?: string;
    eventType?: string;
    message: string;
    actionTaken?: string;
    affectedUserId?: string;
  }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return {
        success: false,
        received: false,
        message: 'STRIPE_WEBHOOK_SECRET no está configurado en las variables de entorno.',
      };
    }

    if (!signature) {
      return {
        success: false,
        received: false,
        message: 'Firma "stripe-signature" ausente en la cabecera.',
      };
    }

    const stripe = this.getStripeInstance();
    if (!stripe) {
      return {
        success: false,
        received: false,
        message: 'Stripe SDK no inicializado.',
      };
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error('Fallo de verificación de firma de webhook Stripe:', err?.message || err);
      return {
        success: false,
        received: false,
        message: `Firma inválida de webhook: ${err?.message}`,
      };
    }

    // Idempotencia: evitar procesar dos veces el mismo evento
    if (processedEventIds.has(event.id)) {
      return {
        success: true,
        received: true,
        eventId: event.id,
        eventType: event.type,
        message: 'Evento ya procesado previamente (idempotente).',
        actionTaken: 'skipped_duplicate',
      };
    }
    processedEventIds.add(event.id);

    // Limitar tamaño del cache en memoria a 10,000 eventos
    if (processedEventIds.size > 10000) {
      const firstEntry = processedEventIds.values().next().value;
      if (firstEntry) processedEventIds.delete(firstEntry);
    }

    let actionTaken = 'unhandled_event';
    let affectedUserId: string | undefined = undefined;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        affectedUserId = session.metadata?.userId || session.client_reference_id || undefined;
        const planId = (session.metadata?.planId as PlanType) || 'profesional';
        actionTaken = `suscripcion_activada_plan_${planId}`;
        console.log(`[Stripe Webhook] Pago confirmado para usuario ${affectedUserId}, plan: ${planId}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription;
        actionTaken = `factura_pagada_sub_${subId}`;
        console.log(`[Stripe Webhook] Factura pagada con éxito: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        actionTaken = `pago_fallido_aviso_enviado`;
        console.warn(`[Stripe Webhook] Pago fallido en factura: ${invoice.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        affectedUserId = sub.metadata?.userId;
        actionTaken = `suscripcion_actualizada_status_${sub.status}`;
        console.log(`[Stripe Webhook] Suscripción actualizada: ${sub.id}, estado: ${sub.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        affectedUserId = sub.metadata?.userId;
        actionTaken = 'suscripcion_cancelada_revertir_a_free';
        console.log(`[Stripe Webhook] Suscripción cancelada: ${sub.id}`);
        break;
      }

      default:
        actionTaken = `evento_registrado_${event.type}`;
        break;
    }

    return {
      success: true,
      received: true,
      eventId: event.id,
      eventType: event.type,
      message: `Evento Stripe ${event.type} procesado con éxito.`,
      actionTaken,
      affectedUserId,
    };
  }
}
