import React, { useState } from 'react';
import { 
  Share2, 
  DollarSign, 
  Users, 
  MousePointerClick, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Wallet, 
  Gift, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AffiliateRecord } from '../../types';
import confetti from 'canvas-confetti';

interface AffiliateModuleProps {
  affiliateData: AffiliateRecord;
}

export const AffiliateModule: React.FC<AffiliateModuleProps> = ({ affiliateData }) => {
  const [data, setData] = useState<AffiliateRecord>(affiliateData);
  const [copied, setCopied] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRequestPayout = () => {
    if (data.pendingPayout <= 0) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    setPayoutRequested(true);
    setData(prev => ({
      ...prev,
      totalPaid: prev.totalPaid + prev.pendingPayout,
      pendingPayout: 0
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Programa de Afiliados PastoralMente
            </span>
            <span className="text-xs text-emerald-400 font-semibold">30% Comisión Recurrente Vitalicia</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-amber-400" />
            <span>Portal de Afiliados & Sistema de Referidos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Genera ingresos pasivos recomendando PastoralMente AI a pastores amigos, seminarios y psicólogos cristianos.
          </p>
        </div>

        <button
          onClick={handleRequestPayout}
          disabled={data.pendingPayout <= 0}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Wallet className="w-4 h-4" />
          <span>Solicitar Liquidación (${data.pendingPayout.toFixed(2)})</span>
        </button>
      </div>

      {payoutRequested && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>¡Solicitud de pago procesada con éxito! La transferencia se reflejará en tu cuenta en 24 a 48 horas.</span>
        </div>
      )}

      {/* Referral Link Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Tu Enlace Exclusivo de Afiliado</span>
          <p className="text-xs font-mono text-slate-200 mt-0.5 select-all">{data.referralUrl}</p>
        </div>
        <button
          onClick={handleCopyLink}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Clics Recibidos</span>
            <MousePointerClick className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{data.totalClicks}</p>
          <p className="text-[10px] text-cyan-300 mt-1">Tráfico referido</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Suscripciones Activas</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{data.activeSubscribers}</p>
          <p className="text-[10px] text-amber-300 mt-1">Pastores e iglesias</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Comisión Mensual</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">${data.monthlyCommission.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-300 mt-1">Ingreso recurrente</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Cobrado</span>
            <Wallet className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">${data.totalPaid.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Pagos acumulados</p>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Detalle de Suscriptores Referidos ({data.referrals.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">Colega / Ministerio</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">Fecha de Alta</th>
                <th className="pb-2 text-right">Valor Mensual</th>
                <th className="pb-2 text-right">Tu 30% (Mensual)</th>
                <th className="pb-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.referrals.map((ref) => (
                <tr key={ref.id} className="text-slate-300">
                  <td className="py-3 font-semibold text-white">{ref.name}</td>
                  <td className="py-3 text-slate-400">{ref.plan}</td>
                  <td className="py-3 text-slate-400">{ref.date}</td>
                  <td className="py-3 text-right font-mono">${ref.monthlyValue} USD</td>
                  <td className="py-3 text-right font-mono font-bold text-emerald-400">+${ref.commission30.toFixed(2)} USD</td>
                  <td className="py-3 text-center">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      Activa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
