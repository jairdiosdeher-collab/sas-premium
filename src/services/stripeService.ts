import { PlanType } from '../types';

/**
 * Función utilitaria segura para leer variables de entorno sin provocar excepciones
 * en entornos de producción, desarrollo o AI Studio donde import.meta.env pueda estar restringido.
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
  priceId: string;
  features: string[];
}

export const STRIPE_PLANS: Record<PlanType, StripePlanConfig> = {
  free: {
    planId: 'free',
    name: 'Plan Explorador Gratuito',
    priceMonthlyUsd: 0,
    priceId: 'price_pastoralmente_free',
    features: ['3 pacientes activos', 'Notas SOAP básicas', '1 escala clínica', 'Soporte estándar'],
  },
  basico: {
    planId: 'basico',
    name: 'Plan Ministerial Básico',
    priceMonthlyUsd: 19,
    priceId: getSafeEnv('VITE_STRIPE_PRICE_BASIC', getSafeEnv('VITE_STRIPE_PRICE_BASICO', 'test_basic')),
    features: ['15 pacientes activos', 'Historial clínico completo', '3 escalas psicométricas', 'Generador homilético 5 sermones/mes'],
  },
  profesional: {
    planId: 'profesional',
    name: 'Plan Profesional Clínico & Pastoral',
    priceMonthlyUsd: 49,
    priceId: getSafeEnv('VITE_STRIPE_PRICE_PRO', getSafeEnv('VITE_STRIPE_PRICE_PROFESIONAL', 'test_pro')),
    features: ['50 pacientes activos', '9 escalas psicométricas con scoring automático', 'CRM y Pipeline ministerial', 'IA Homilética y SOAP ilimitada'],
  },
  premium: {
    planId: 'premium',
    name: 'Plan Premium Multiministerial',
    priceMonthlyUsd: 99,
    priceId: getSafeEnv('VITE_STRIPE_PRICE_PREMIUM', 'test_premium'),
    features: ['Pacientes ilimitados', 'Múltiples consejeros y pastores', 'Escuela Bíblica y Discipulado', 'Auditoría HIPAA y exportaciones cifradas'],
  },
  enterprise: {
    planId: 'enterprise',
    name: 'Plan Red Denominacional Enterprise',
    priceMonthlyUsd: 199,
    priceId: getSafeEnv('VITE_STRIPE_PRICE_ENTERPRISE', 'test_enterprise'),
    features: ['Soporte para múltiples iglesias filiales', 'Base de datos Firestore dedicada', 'SLA 99.9% y soporte prioritario 24/7'],
  },
};

export interface StripeModeInfo {
  isConfigured: boolean;
  isLive: boolean;
  isTest: boolean;
  isDemo: boolean;
  statusMessage: string;
  label: string;
  badgeClass: string;
  description: string;
}

export class StripeService {
  /**
   * Obtiene la publishable key de manera 100% segura
   */
  private static getPublishableKeySafe(): string {
    return getSafeEnv('VITE_STRIPE_PUBLISHABLE_KEY', '');
  }

  /**
   * Determina si la llave configurada es de producción real
   */
  public static isLiveMode(): boolean {
    try {
      const key = this.getPublishableKeySafe();
      return key.startsWith('pk_live_');
    } catch (_e) {
      return false;
    }
  }

  /**
   * Determina si la llave configurada es un test key real (no demo genérico)
   */
  public static isTestMode(): boolean {
    try {
      const key = this.getPublishableKeySafe();
      return key.startsWith('pk_test_') && key !== 'pk_test_demo' && !key.includes('placeholder');
    } catch (_e) {
      return false;
    }
  }

  /**
   * Verifica si Stripe está configurado correctamente con credenciales reales.
   * Si no está configurado, la aplicación nunca falla y activa el modo seguro.
   */
  public static isConfigured(): boolean {
    try {
      const key = this.getPublishableKeySafe();
      if (!key || key === 'pk_test_demo' || key === 'placeholder' || key.trim() === '') {
        return false;
      }
      return this.isLiveMode() || this.isTestMode();
    } catch (_e) {
      return false;
    }
  }

  /**
   * Retorna información descriptiva del estado de la suscripción/pasarela
   */
  public static getModeInfo(): StripeModeInfo {
    try {
      if (this.isLiveMode()) {
        return {
          isConfigured: true,
          isLive: true,
          isTest: false,
          isDemo: false,
          statusMessage: 'Stripe Producción Activo',
          label: 'Stripe Producción',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          description: 'Pasarela de pagos en vivo activa y conectada con Stripe.',
        };
      }

      if (this.isTestMode()) {
        return {
          isConfigured: true,
          isLive: false,
          isTest: true,
          isDemo: true,
          statusMessage: 'Stripe Sandbox de Prueba',
          label: 'Stripe Modo Test',
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          description: 'Pasarela en modo de pruebas con credenciales sandbox.',
        };
      }

      // Si Stripe no está configurado correctamente:
      return {
        isConfigured: false,
        isLive: false,
        isTest: false,
        isDemo: true,
        statusMessage: 'Sistema de suscripciones en configuración',
        label: 'Suscripciones en Configuración',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        description: 'Sistema de suscripciones en configuración. Plataforma en modo demostración sin cargos.',
      };
    } catch (_e) {
      return {
        isConfigured: false,
        isLive: false,
        isTest: false,
        isDemo: true,
        statusMessage: 'Sistema de suscripciones en configuración',
        label: 'Suscripciones en Configuración',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        description: 'Sistema en modo seguro.',
      };
    }
  }

  public static getPublishableKey(): string {
    return this.getPublishableKeySafe();
  }

  public static getPriceIdForPlan(plan: PlanType): string {
    try {
      return STRIPE_PLANS[plan]?.priceId || 'price_demo_plan';
    } catch (_e) {
      return 'price_demo_plan';
    }
  }

  /**
   * Prepara e inicia una sesión de checkout de Stripe.
   * Si Stripe no está configurado correctamente:
   * - desactiva temporalmente el sistema de pagos externo;
   * - evita que la aplicación falle;
   * - activa el plan en modo demo inmediatamente;
   * - permite acceder al resto de la plataforma sin interrupciones.
   */
  public static async createCheckoutSession(
    plan: PlanType,
    userEmail: string,
    userId: string,
    couponCode?: string
  ): Promise<{ success: boolean; checkoutUrl?: string; message: string; priceId: string; isDemo: boolean }> {
    try {
      const planConfig = STRIPE_PLANS[plan] || STRIPE_PLANS.profesional;
      const priceId = planConfig.priceId;

      // Si Stripe NO está configurado con claves en vivo, no invocar checkout externo:
      if (!this.isConfigured() || !this.isLiveMode()) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          success: true,
          message: `Sistema de suscripciones en configuración: Plan ${planConfig.name} activado en modo demostración.`,
          priceId,
          isDemo: true,
        };
      }

      // Solo intentar checkout si está en modo Live configurado
      try {
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId,
            plan,
            userEmail,
            userId,
            couponCode,
            publishableKey: this.getPublishableKeySafe(),
            successUrl: `${window.location.origin}/?payment=success&plan=${plan}`,
            cancelUrl: `${window.location.origin}/?payment=cancelled`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.url) {
            return {
              success: true,
              checkoutUrl: data.url,
              message: 'Redirigiendo a pasarela Stripe segura...',
              priceId,
              isDemo: false,
            };
          }
        }
      } catch (err) {
        console.warn('Pasarela Stripe no respondió; activando fallback seguro:', err);
      }

      // Fallback seguro: activar sin bloquear jamás al usuario
      return {
        success: true,
        message: `Plan ${planConfig.name} activado en modo seguro de contingencia.`,
        priceId,
        isDemo: true,
      };
    } catch (unexpectedError) {
      console.warn('Aviso controlado en createCheckoutSession:', unexpectedError);
      return {
        success: true,
        message: 'Sistema de suscripciones en configuración. Plan activado en modo demostración.',
        priceId: 'price_demo_plan',
        isDemo: true,
      };
    }
  }

  /**
   * Valida cupones de descuento institucionales de forma segura
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
