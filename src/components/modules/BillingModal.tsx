import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Loader2,
  Tag,
  Receipt,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlanType, UserProfile, StripeInvoice } from '../../types';

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
  const [promoApplied, setPromoApplied] = useState(true);
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('889');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices' | 'cancel'>('plans');

  // Prices
  const baseMonthlyPrices: Record<PlanType, number> = {
    free: 0,
    basico: 19,
    profesional: 49,
    premium: 99,
    enterprise: 199,
  };

  const getMonthlyRate = (plan: PlanType) => {
    let rate = baseMonthlyPrices[plan];
    if (rate === 0) return 0;
    if (billingCycle === 'annual') {
      rate = rate * 0.8; // 20% descuento
    }
    if (promoApplied) {
      rate = rate * 0.7; // 30% cupón
    }
    return Math.round(rate);
  };

  const sampleInvoices: StripeInvoice[] = [
    { id: 'INV-2026-001', date: '2026-10-18', planName: `Plan ${user.plan?.toUpperCase() || 'PRO'}`, amount: getMonthlyRate(selectedPlan), status: 'pagado', cardLast4: '4242' },
    { id: 'INV-2026-000', date: '2026-09-18', planName: 'Plan Profesional Mensual', amount: 49, status: 'pagado', cardLast4: '4242' },
  ];

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'REINO30' || promoCode.trim().toUpperCase() === 'PASTOR30') {
      setPromoApplied(true);
      alert('¡Cupón vitalicio del 30% aplicado con éxito!');
    } else {
      alert('Cupón no válido.');
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });

      const credits = 
        selectedPlan === 'free' ? 10 :
        selectedPlan === 'basico' ? 50 : 
        selectedPlan === 'profesional' ? 250 : 
        selectedPlan === 'premium' ? 1000 : 5000;

      onUpdatePlan(selectedPlan, credits);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2200);
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (confirm('¿Estás seguro de cancelar tu renovación automática? Mantendrás el acceso hasta el final del ciclo.')) {
      onUpdatePlan('free', 10);
      alert('Suscripción cancelada. Tu cuenta ha pasado al Plan Gratuito.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-5 my-8 text-xs relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">
              ✓
            </div>
            <h2 className="text-xl font-extrabold text-white">¡Suscripción Confirmada!</h2>
            <p className="text-slate-300">
              Tu plan <strong>{selectedPlan.toUpperCase()}</strong> está activo. Recibirás tu recibo en {user.email}.
            </p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Pasarela Segura Stripe Enterprise
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Garantía 30 Días</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Gestión de Suscripción & Facturación Stripe</span>
              </h2>
            </div>

            {/* Sub-navigation tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === 'plans' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Elegir Plan
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'invoices' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Facturas & Recibos</span>
              </button>
              <button
                onClick={() => setActiveTab('cancel')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ml-auto text-slate-500 hover:text-rose-400`}
              >
                Cancelar Suscripción
              </button>
            </div>

            {activeTab === 'plans' && (
              <>
                {/* Billing Cycle Switch */}
                <div className="flex items-center justify-between p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Facturación Mensual
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                      billingCycle === 'annual' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    <span>Facturación Anual</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                      -20% Ahorro
                    </span>
                  </button>
                </div>

                {/* 4 Plans Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['free', 'profesional', 'premium', 'enterprise'] as PlanType[]).map((plan) => {
                    const isSelected = selectedPlan === plan;
                    const price = getMonthlyRate(plan);

                    return (
                      <div
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <p className="font-bold uppercase text-[10px] tracking-wider capitalize">{plan}</p>
                        <p className="text-xl font-extrabold text-white mt-1">${price}</p>
                        <p className="text-[9px] text-slate-500">/ mes</p>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Cupón de descuento"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                  >
                    Aplicar
                  </button>
                </div>

                {promoApplied && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cupón REINO30 activo: 30% de descuento recurrente en tu plan.</span>
                  </div>
                )}

                {/* Credit Card Form */}
                <form onSubmit={handlePay} className="space-y-3">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
                      <span className="text-[11px] font-semibold flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span>Tarjeta de Débito / Crédito</span>
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                        <span className="bg-slate-800 px-1.5 py-0.2 rounded">VISA</span>
                        <span className="bg-slate-800 px-1.5 py-0.2 rounded">MASTERCARD</span>
                        <span className="bg-slate-800 px-1.5 py-0.2 rounded">AMEX</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Número de Tarjeta</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Vencimiento (MM/AA)</label>
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">CVC / CVC2</label>
                        <input
                          type="text"
                          required
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Procesando pago con Stripe Seguro...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>
                          {selectedPlan === 'free' ? 'Confirmar Plan Gratuito' : `Confirmar Suscripción ($${getMonthlyRate(selectedPlan)}/mes)`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-3">
                <h3 className="font-bold text-white">Comprobantes & Facturación Oficial</h3>
                <div className="space-y-2">
                  {sampleInvoices.map((inv) => (
                    <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{inv.planName}</p>
                        <p className="text-slate-500 text-[10px]">{inv.id} • {inv.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-400">${inv.amount} USD</p>
                        <span className="text-[10px] text-slate-400">Pagado con {inv.cardLast4}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cancel' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-center">
                <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="font-bold text-white text-sm">¿Deseas pausar o cancelar tu plan?</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Al cancelar, perderás el acceso ilimitado a escalas clínicas avanzadas y créditos mensuales de IA. Tus notas y expedientes se mantendrán seguros.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                  >
                    Mantener Mi Suscripción
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Confirmar Cancelación
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
