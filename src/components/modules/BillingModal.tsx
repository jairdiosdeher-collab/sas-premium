import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Loader2,
  Tag,
  Receipt,
  AlertTriangle,
  Info,
  ExternalLink,
  CreditCard,
  Building,
  Users,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { PlanType, UserProfile, StripeInvoice } from '../../types';
import { StripeService, STRIPE_PLANS, StripeBackendStatus } from '../../services/stripeService';

interface BillingModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (plan: PlanType, newCredits: number) => void;
  initialPlan?: PlanType;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdatePlan,
  initialPlan,
}) => {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan || user.plan || 'profesional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [promoCode, setPromoCode] = useState('REINO30');
  const [promoMessage, setPromoMessage] = useState<string | null>('Cupón REINO30 activo: 30% de descuento');
  const [promoApplied, setPromoApplied] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices' | 'cancel'>('plans');
  const [stripeStatus, setStripeStatus] = useState<StripeBackendStatus | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    StripeService.fetchBackendStatus().then((status) => {
      setStripeStatus(status);
    });
  }, []);

  const modeInfo = StripeService.getModeInfo(stripeStatus);

  const getMonthlyRate = (plan: PlanType) => {
    try {
      const cfg = STRIPE_PLANS[plan];
      if (!cfg || cfg.priceMonthlyUsd === 0) return 0;
      let rate = billingCycle === 'annual' ? cfg.priceAnnualMonthlyUsd : cfg.priceMonthlyUsd;
      if (promoApplied) {
        rate = rate * 0.7; // 30% descuento ministerial
      }
      return Math.round(rate);
    } catch (_e) {
      return 0;
    }
  };

  const sampleInvoices: StripeInvoice[] = [
    { 
      id: 'INV-2026-001', 
      date: new Date().toISOString().split('T')[0], 
      planName: `Plan ${user.plan?.toUpperCase() || 'PRO'}`, 
      amount: getMonthlyRate(user.plan || 'profesional'), 
      status: 'pagado', 
      cardLast4: 'Stripe Verified' 
    },
  ];

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = StripeService.validateCoupon(promoCode);
    if (result.valid) {
      setPromoApplied(true);
      setPromoMessage(`¡Cupón aplicado con éxito! ${result.name} (${result.discountPercent}% OFF).`);
    } else {
      setPromoApplied(false);
      setPromoMessage('Cupón no reconocido. Puedes usar REINO30 para obtener un 30% de descuento.');
    }
  };

  const handleInitiateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Caso plan gratuito: no requiere pasarela de pago Stripe
      if (selectedPlan === 'free') {
        onUpdatePlan('free', 10);
        setIsProcessing(false);
        onClose();
        return;
      }

      // Si Stripe no está configurado en el servidor
      if (stripeStatus && !stripeStatus.configured) {
        setIsProcessing(false);
        setErrorMessage(
          'La pasarela de Stripe no está configurada en este entorno (falta la variable STRIPE_SECRET_KEY en el servidor). Agrega tu clave secreta de Stripe para procesar suscripciones.'
        );
        return;
      }

      // Iniciar sesión real en Stripe Checkout
      const result = await StripeService.createCheckoutSession({
        plan: selectedPlan,
        billingCycle,
        userEmail: user.email || 'pastor@iglesia.org',
        userId: user.id || 'usr_default',
        userName: user.name || 'Pastor Usuario',
        couponCode: promoApplied ? promoCode : undefined,
      });

      if (result.success && result.url) {
        // Redirigir a la pasarela oficial y segura de Stripe Checkout
        window.location.href = result.url;
        return;
      }

      setIsProcessing(false);
      setErrorMessage(result.error || 'No fue posible iniciar la sesión segura con Stripe.');
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Error inesperado al conectar con Stripe Checkout.');
    }
  };

  const handleOpenCustomerPortal = async () => {
    if (!user.stripeCustomerId) return;
    setLoadingPortal(true);
    setErrorMessage(null);
    try {
      const res = await StripeService.createPortalSession(user.stripeCustomerId);
      if (res.success && res.url) {
        window.location.href = res.url;
        return;
      }
      setErrorMessage(res.error || 'No se pudo abrir el portal de facturación de Stripe.');
    } catch (e: any) {
      setErrorMessage(e?.message || 'Error de conexión con el portal de Stripe.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCancelSubscription = () => {
    onUpdatePlan('free', 10);
    setActiveTab('plans');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Crown className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Planes & Suscripciones PastoralMente AI
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${modeInfo.badgeClass}`}>
                    {modeInfo.label}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Plan actual: <span className="font-bold text-amber-400 uppercase">{user.plan || 'Free'}</span> • {user.credits || 0} Créditos de IA restantes
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification banner */}
        {!modeInfo.isConfigured ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-300">Modo de Configuración Stripe</p>
              <p className="text-slate-300 leading-relaxed">
                El backend no tiene configurada la variable <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-200">STRIPE_SECRET_KEY</code>. Para procesar transacciones monetarias reales en producción o sandbox, configure sus credenciales de Stripe en el servidor.
              </p>
            </div>
          </div>
        ) : modeInfo.isTest ? (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-blue-300">Entorno Stripe Sandbox de Prueba Activo</p>
              <p className="text-slate-300 leading-relaxed">
                Las transacciones se procesan mediante Stripe Checkout en modo Test. Puedes usar tarjetas de prueba oficiales como <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-200 font-mono">4242 4242 4242 4242</code> sin cobro real a tarjetas bancarias.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-300">Stripe Checkout Producción Activo</p>
              <p className="text-slate-300 leading-relaxed">
                Conexión cifrada de extremo a extremo. Los pagos son procesados de forma segura cumpliendo la normativa internacional PCI-DSS Nivel 1.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'plans' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Planes Disponibles
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'invoices' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Facturación & Recibos</span>
          </button>
          {user.stripeCustomerId && (
            <button
              onClick={handleOpenCustomerPortal}
              disabled={loadingPortal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-amber-400 hover:text-amber-300 flex items-center gap-1.5 border border-amber-500/30 hover:bg-amber-500/10"
            >
              {loadingPortal ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
              <span>Portal de Facturación Stripe</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('cancel')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ml-auto text-slate-500 hover:text-rose-400"
          >
            Pausar Suscripción
          </button>
        </div>

        {activeTab === 'plans' && (
          <div className="space-y-4">
            {/* Billing Cycle Switch */}
            <div className="flex items-center justify-between p-1 bg-slate-950 rounded-xl border border-slate-800 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Facturación Mensual
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                <span>Facturación Anual</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold border border-emerald-500/40">
                  -20% AHORRO
                </span>
              </button>
            </div>

            {/* 5 Plans Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {(['free', 'basico', 'profesional', 'premium', 'enterprise'] as PlanType[]).map((plan) => {
                const isSelected = selectedPlan === plan;
                const isCurrent = user.plan === plan;
                const price = getMonthlyRate(plan);
                const cfg = STRIPE_PLANS[plan];

                return (
                  <div
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3.5 rounded-xl border cursor-pointer text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-amber-200 shadow-lg ring-1 ring-amber-500/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2 right-2 text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                        Plan Actual
                      </span>
                    )}
                    <div>
                      <p className="font-bold uppercase text-[11px] tracking-wider text-slate-200">
                        {cfg.name.replace('Plan ', '')}
                      </p>
                      <div className="mt-2 mb-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">${price}</span>
                        <span className="text-[10px] text-slate-500">USD / mes</span>
                      </div>
                      <p className="text-[10px] text-slate-400 min-h-[30px] line-clamp-2">
                        {cfg.features[0]}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                      {cfg.features.slice(1, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Plan Details & Summary */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {STRIPE_PLANS[selectedPlan]?.name}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    ${getMonthlyRate(selectedPlan)} USD / mes {billingCycle === 'annual' && '(facturado anualmente)'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  {STRIPE_PLANS[selectedPlan]?.features.map((f, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Promo Code Input */}
              {selectedPlan !== 'free' && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-56">
                    <Tag className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Cupón (REINO30)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>

            {promoMessage && (
              <div className={`text-xs flex items-center gap-2 p-2.5 rounded-lg border ${
                promoApplied 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
                {promoApplied ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
                <span>{promoMessage}</span>
              </div>
            )}

            {/* Checkout Action Section */}
            <form onSubmit={handleInitiateCheckout} className="space-y-3">
              {selectedPlan === 'free' ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    El Plan Explorador Gratuito incluye 3 expedientes clínicos, escalas básicas y notas SOAP sin necesidad de tarjeta ni pagos.
                  </p>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                  >
                    Confirmar Plan Gratuito
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Pago Seguro alojado en <strong>Stripe Checkout</strong></span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">VISA</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">MASTERCARD</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">AMEX</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">APPLE PAY</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">GOOGLE PAY</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Al hacer clic en el botón de abajo, serás redirigido a la pasarela cifrada de Stripe para ingresar tu método de pago de forma 100% segura. PastoralMente AI nunca almacena información sensible ni números de tarjeta en sus servidores.
                  </p>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-98 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generando sesión segura en Stripe...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>
                          Suscribirme al Plan {STRIPE_PLANS[selectedPlan]?.name.replace('Plan ', '')} — ${getMonthlyRate(selectedPlan)} USD/mes
                        </span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Historial de Recibos y Facturación</h3>
              {user.stripeCustomerId && (
                <button
                  onClick={handleOpenCustomerPortal}
                  disabled={loadingPortal}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver todas en Stripe Portal</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {sampleInvoices.map((inv) => (
                <div key={inv.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-xs">{inv.planName}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{inv.id} • {inv.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-emerald-400 text-sm">${inv.amount} USD</p>
                    <span className="text-[10px] text-slate-400 capitalize">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cancel' && (
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="font-bold text-white text-sm">¿Deseas pausar o modificar tu suscripción?</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg mx-auto">
              Al cambiar al plan gratuito, tus expedientes clínicos, notas SOAP, sermones y escalas psicométricas permanecerán completamente seguros y disponibles para consulta sin riesgo de pérdida de información.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Mantener Mi Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Cambiar a Plan Gratuito
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
