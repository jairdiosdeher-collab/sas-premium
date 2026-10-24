import { PlanType } from '../types';

/**
 * Función utilitaria segura para leer variables de entorno sin provocar excepciones
 */
function getSafeEnv(key: string, fallback: string = ''): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[key] === 'string') {
      return import.meta.env[key] || fallback;
    }
  } catch (_e) {
    // Silencioso ante cualquier restricción de entorno
  }
  return fallback;
}

export interface StripePlanConfig {
  planId: PlanType;
  name: string;
  priceMonthlyUsd: number;
  priceAnnualMonthlyUsd: number;
  features: string[];
}

export const STRIPE_PLANS: Record<PlanType, StripePlanConfig> = {
  free: {
    planId: 'free',
    name: 'Plan Explorador Gratuito',
    priceMonthlyUsd: 0,
    priceAnnualMonthlyUsd: 0,
    features: ['3 pacientes activos', 'Notas SOAP básicas', '1 escala clínica', 'Soporte estándar por comunidad'],
  },
  basico: {
    planId: 'basico',
    name: 'Plan Ministerial Básico',
    priceMonthlyUsd: 19,
    priceAnnualMonthlyUsd: 15,
    features: ['15 pacientes activos', 'Historial clínico completo', '3 escalas psicométricas', 'Generador homilético 5 sermones/mes'],
  },
  profesional: {
    planId: 'profesional',
    name: 'Plan Profesional Clínico & Pastoral',
    priceMonthlyUsd: 49,
    priceAnnualMonthlyUsd: 39,
    features: ['50 pacientes activos', '9 escalas psicométricas con scoring automático', 'CRM y Pipeline ministerial', 'IA Homilética y SOAP ilimitada'],
  },
  premium: {
    planId: 'premium',
    name: 'Plan Premium Multiministerial',
    priceMonthlyUsd: 99,
    priceAnnualMonthlyUsd: 79,
    features: ['Pacientes ilimitados', 'Múltiples consejeros y pastores', 'Escuela Bíblica y Discipulado', 'Auditoría HIPAA y exportaciones cifradas'],
  },
  enterprise: {
    planId: 'enterprise',
    name: 'Plan Red Denominacional Enterprise',
    priceMonthlyUsd: 199,
    priceAnnualMonthlyUsd: 159,
    features: ['Soporte para múltiples iglesias filiales', 'Base de datos Firestore dedicada', 'SLA 99.9% y soporte prioritario 24/7'],
  },
};

export interface StripeBackendStatus {
  configured: boolean;
  mode: 'live' | 'test' | 'not_configured';
  webhookConfigured: boolean;
  publishableKey?: string;
  message: string;
}

export interface StripeModeInfo {
  isConfigured: boolean;
  isLive: boolean;
  isTest: boolean;
  statusMessage: string;
  label: string;
  badgeClass: string;
  description: string;
}

export class StripeService {
  private static cachedStatus: StripeBackendStatus | null = null;
  private static lastStatusCheck = 0;

  public static getPublishableKey(): string {
    return getSafeEnv('VITE_STRIPE_PUBLISHABLE_KEY', '');
  }

  /**
   * Consulta el estado real del backend de Stripe (/api/stripe/status)
   */
  public static async fetchBackendStatus(forceRefresh = false): Promise<StripeBackendStatus> {
    const now = Date.now();
    if (!forceRefresh && this.cachedStatus && now - this.lastStatusCheck < 30000) {
      return this.cachedStatus;
    }

    try {
      const res = await fetch('/api/stripe/status');
      if (res.ok) {
        const data = await res.json();
        this.cachedStatus = data;
        this.lastStatusCheck = now;
        return data;
      }
    } catch (e) {
      console.warn('No se pudo verificar el estado de Stripe en el servidor:', e);
    }

    // Fallback basado en publishable key local si el backend no responde
    const pubKey = this.getPublishableKey();
    const isLive = pubKey.startsWith('pk_live_');
    const isTest = pubKey.startsWith('pk_test_') && !pubKey.includes('demo');
    const configured = isLive || isTest;

    const fallbackStatus: StripeBackendStatus = {
      configured,
      mode: isLive ? 'live' : isTest ? 'test' : 'not_configured',
      webhookConfigured: false,
      message: configured
        ? `Stripe detectado en modo ${isLive ? 'Live' : 'Test'}.`
        : 'Stripe no configurado en el servidor (falta STRIPE_SECRET_KEY).',
    };
    this.cachedStatus = fallbackStatus;
    this.lastStatusCheck = now;
    return fallbackStatus;
  }

  /**
   * Obtiene la información visual del estado de Stripe
   */
  public static getModeInfo(status?: StripeBackendStatus | null): StripeModeInfo {
    const pubKey = this.getPublishableKey();
    const isLive = status?.mode === 'live' || pubKey.startsWith('pk_live_');
    const isTest = status?.mode === 'test' || (pubKey.startsWith('pk_test_') && !pubKey.includes('demo'));
    const isConfigured = status ? status.configured : (isLive || isTest);

    if (isLive) {
      return {
        isConfigured: true,
        isLive: true,
        isTest: false,
        statusMessage: 'Stripe Producción Activo',
        label: 'Stripe Producción (Live)',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        description: 'Pasarela de pagos en vivo conectada con Stripe. Transacciones monetarias reales.',
      };
    }

    if (isTest) {
      return {
        isConfigured: true,
        isLive: false,
        isTest: true,
        statusMessage: 'Stripe Sandbox de Prueba (Test Mode)',
        label: 'Stripe Sandbox (Test)',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        description: 'Pasarela conectada en entorno de pruebas de Stripe. Utiliza tarjetas de prueba 4242.',
      };
    }

    return {
      isConfigured: false,
      isLive: false,
      isTest: false,
      statusMessage: 'Stripe Requiere Configuración',
      label: 'Stripe No Configurado',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      description: 'El servidor no tiene configurada la variable STRIPE_SECRET_KEY. Configure sus claves en el servidor para procesar cobros reales.',
    };
  }

  /**
   * Crea una sesión real en Stripe Checkout y devuelve la URL para redirigir
   * NUNCA genera identificadores ficticios ni simula cobros falsos.
   */
  public static async createCheckoutSession(params: {
    plan: PlanType;
    billingCycle?: 'monthly' | 'annual';
    userEmail: string;
    userId: string;
    userName?: string;
    couponCode?: string;
  }): Promise<{
    success: boolean;
    url?: string;
    sessionId?: string;
    error?: string;
    errorCode?: string;
  }> {
    if (params.plan === 'free') {
      return {
        success: true,
        error: undefined,
      };
    }

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: params.plan,
          billingCycle: params.billingCycle || 'annual',
          userEmail: params.userEmail,
          userId: params.userId,
          userName: params.userName,
          couponCode: params.couponCode,
          successUrl: `${window.location.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&plan=${params.plan}`,
          cancelUrl: `${window.location.origin}/?payment=cancelled`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error del servidor Stripe (${response.status})`,
          errorCode: data.code || 'HTTP_ERROR',
        };
      }

      if (data.url) {
        return {
          success: true,
          url: data.url,
          sessionId: data.sessionId,
        };
      }

      return {
        success: false,
        error: 'El servidor de Stripe no devolvió la URL de redirección.',
        errorCode: 'NO_CHECKOUT_URL',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Error de conexión con el servidor de pagos.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Verifica formalmente una sesión de checkout completada con el servidor
   */
  public static async verifyCheckoutSession(sessionId: string): Promise<{
    verified: boolean;
    plan?: PlanType;
    customerId?: string;
    subscriptionId?: string;
    amountTotal?: number;
    currency?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          verified: false,
          error: data.error || 'No se pudo verificar la sesión de pago.',
        };
      }

      return {
        verified: data.verified === true,
        plan: data.plan,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        amountTotal: data.amountTotal,
        currency: data.currency,
        message: data.message,
      };
    } catch (err: any) {
      return {
        verified: false,
        error: err?.message || 'Error de red al verificar la sesión.',
      };
    }
  }

  /**
   * Crea una sesión en el Portal del Cliente de Stripe (Customer Portal)
   */
  public static async createPortalSession(customerId: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'No se pudo generar la sesión del portal.',
        };
      }

      return {
        success: true,
        url: data.url,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Error al conectar con el portal de Stripe.',
      };
    }
  }

  /**
   * Valida cupones de descuento institucionales de forma estricta
   */
  public static validateCoupon(code: string): { valid: boolean; discountPercent: number; name?: string } {
    try {
      const clean = (code || '').trim().toUpperCase();
      if (clean === 'REINO30') {
        return { valid: true, discountPercent: 30, name: 'Descuento Ministerial Reino 30%' };
      }
      if (clean === 'MINISTERIO50') {
        return { valid: true, discountPercent: 50, name: 'Beca Pastoral 50%' };
      }
      if (clean === 'PASTOR30') {
        return { valid: true, discountPercent: 30, name: 'Descuento Pastoral 30%' };
      }
      return { valid: false, discountPercent: 0 };
    } catch (_e) {
      return { valid: false, discountPercent: 0 };
    }
  }
}
