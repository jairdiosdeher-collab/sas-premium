import { PlanType } from '../types';

export interface PlanDefinition {
  id: PlanType;
  name: string;
  description: string;
  priceMonthlyUsd: number;
  priceAnnualUsdPerMonth: number;
  monthlyCredits: number;
  maxPatients: number;
  features: string[];
  stripePriceEnvKeyMonthly?: string;
  stripePriceEnvKeyAnnual?: string;
}

export const SERVER_PLANS: Record<PlanType, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Plan Explorador Gratuito',
    description: 'Para consejeros y líderes ministeriales que inician.',
    priceMonthlyUsd: 0,
    priceAnnualUsdPerMonth: 0,
    monthlyCredits: 10,
    maxPatients: 3,
    features: [
      '3 pacientes activos en seguimiento',
      'Notas de evolución SOAP-S básicas',
      '1 escala psicométrica (PHQ-9)',
      '10 créditos IA mensuales',
      'Soporte comunitario estándar'
    ],
  },
  basico: {
    id: 'basico',
    name: 'Plan Ministerial Básico',
    description: 'Para pastores y consejeros con consulta y ministerio regular.',
    priceMonthlyUsd: 19,
    priceAnnualUsdPerMonth: 15,
    monthlyCredits: 50,
    maxPatients: 15,
    features: [
      '15 pacientes activos simultáneos',
      'Historial clínico y timeline integral',
      '3 escalas psicométricas (PHQ-9, GAD-7, Maslach)',
      'Productor de sermones (5 sermones/mes)',
      '50 créditos IA mensuales',
      'Exportación de notas en PDF corporativo'
    ],
    stripePriceEnvKeyMonthly: 'STRIPE_PRICE_BASIC_MONTHLY',
    stripePriceEnvKeyAnnual: 'STRIPE_PRICE_BASIC_ANNUAL',
  },
  profesional: {
    id: 'profesional',
    name: 'Plan Profesional Clínico & Pastoral',
    description: 'Para psicólogos clínicos cristianos y directores de consejería.',
    priceMonthlyUsd: 49,
    priceAnnualUsdPerMonth: 39,
    monthlyCredits: 250,
    maxPatients: 50,
    features: [
      '50 pacientes activos en CRM clínico',
      'Batería completa de 9 escalas psicométricas con scoring automático',
      'IA Supervisora Clínica en notas SOAP-S',
      'Productor de sermones 10.0 con exégesis en griego/hebreo ilimitado',
      'Dictado clínico por voz en tiempo real',
      'Portal del Paciente con enlace privado',
      '250 créditos IA mensuales',
      'Exportación profesional a PDF, Word y Excel'
    ],
    stripePriceEnvKeyMonthly: 'STRIPE_PRICE_PRO_MONTHLY',
    stripePriceEnvKeyAnnual: 'STRIPE_PRICE_PRO_ANNUAL',
  },
  premium: {
    id: 'premium',
    name: 'Plan Premium Multiministerial',
    description: 'Para equipos pastorales y clínicas cristianas multidisciplinares.',
    priceMonthlyUsd: 99,
    priceAnnualUsdPerMonth: 79,
    monthlyCredits: 1000,
    maxPatients: 9999,
    features: [
      'Pacientes e historias clínicas ilimitadas',
      'Acceso multi-rol (Psicólogos, Pastores, Consejeros, Supervisores)',
      'Centro Documental inteligente con Firebase Storage optimizado',
      'Sistema de alertas críticas de riesgo suicida y burnout',
      'Biblioteca Clínica y Pastoral de 7 dominios',
      'Auditoría profesional de cambios e inicio de sesión',
      '1000 créditos IA mensuales',
      'Atención prioritaria y onboarding pastoral personalizado'
    ],
    stripePriceEnvKeyMonthly: 'STRIPE_PRICE_PREMIUM_MONTHLY',
    stripePriceEnvKeyAnnual: 'STRIPE_PRICE_PREMIUM_ANNUAL',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Plan Red Denominacional Enterprise',
    description: 'Para redes de iglesias, seminarios y asociaciones denominacionales.',
    priceMonthlyUsd: 199,
    priceAnnualUsdPerMonth: 159,
    monthlyCredits: 5000,
    maxPatients: 99999,
    features: [
      'Soporte multi-sede para iglesias filiales y misiones',
      'Panel ejecutivo global con analítica predictiva de salud pastoral',
      'Base de datos Firestore dedicada y respaldos automáticos en la nube',
      'Capacitación continua en homilética y psicología bíblica',
      '5000 créditos IA mensuales',
      'SLA 99.9% y gestor de cuenta asignado 24/7'
    ],
    stripePriceEnvKeyMonthly: 'STRIPE_PRICE_ENTERPRISE_MONTHLY',
    stripePriceEnvKeyAnnual: 'STRIPE_PRICE_ENTERPRISE_ANNUAL',
  },
};

export interface CouponDefinition {
  code: string;
  discountPercent: number;
  description: string;
}

export const VALID_COUPONS: Record<string, CouponDefinition> = {
  REINO30: {
    code: 'REINO30',
    discountPercent: 30,
    description: 'Descuento Ministerial Reino (30% de ahorro recurrente)',
  },
  PASTOR30: {
    code: 'PASTOR30',
    discountPercent: 30,
    description: 'Descuento Pastoral de Bienvenida (30% de ahorro)',
  },
  MINISTERIO50: {
    code: 'MINISTERIO50',
    discountPercent: 50,
    description: 'Beca Ministerial de Apoyo (50% de ahorro)',
  },
};
