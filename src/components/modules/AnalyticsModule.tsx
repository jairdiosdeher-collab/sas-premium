import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  HeartHandshake, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ExportService } from '../../services/exportService';
import { StripeInvoice } from '../../types';

export const AnalyticsModule: React.FC = () => {
  const kpis = {
    mrr: 4890,
    arr: 58680,
    activeSubscribers: 114,
    churnRate: '1.8%',
    cac: '$24 USD',
    ltv: '$1,380 USD',
    conversionRate: '18.4%',
    patientImprovementRate: '78.2%', // % de consultantes con mejoría objetiva en escalas
  };

  const sampleInvoices: StripeInvoice[] = [
    { id: 'INV-2026-089', date: '2026-10-18', planName: 'Plan Profesional Anual', amount: 468, status: 'pagado', cardLast4: '4242' },
    { id: 'INV-2026-088', date: '2026-10-17', planName: 'Plan Premium Mensual', amount: 99, status: 'pagado', cardLast4: '1092' },
    { id: 'INV-2026-087', date: '2026-10-16', planName: 'Plan Profesional Mensual', amount: 49, status: 'pagado', cardLast4: '8831' },
    { id: 'INV-2026-086', date: '2026-10-15', planName: 'Plan Básico Mensual', amount: 19, status: 'pagado', cardLast4: '3421' },
  ];

  const handleExportInvoicesCsv = () => {
    ExportService.exportBillingToCsv(sampleInvoices);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Dashboard Ejecutivo & Métricas SaaS
            </span>
            <span className="text-xs text-slate-400">Salud Financiera & Eficacia Clínica</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <span>Analíticas de Negocio, Retención & Impacto Ministerial</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo en tiempo real de ingresos recurrentes, conversión y tasa de mejoría clínica en pacientes.
          </p>
        </div>

        <button
          onClick={handleExportInvoicesCsv}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Exportar Facturas (CSV)</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>MRR (Ingreso Mensual)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">${kpis.mrr.toLocaleString()} USD</p>
          <p className="text-[10px] text-emerald-300 mt-1 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs mes anterior
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ARR (Proyección Anual)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">${kpis.arr.toLocaleString()} USD</p>
          <p className="text-[10px] text-slate-400 mt-1">Suscripciones vigentes</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tasa de Churn (Baja)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-cyan-300 mt-2">{kpis.churnRate}</p>
          <p className="text-[10px] text-cyan-400 mt-1">Retención de grado Enterprise</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mejoría Psico-Espiritual</span>
            <HeartHandshake className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">{kpis.patientImprovementRate}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Reducción en PHQ-9 & GAD-7</p>
        </div>
      </div>

      {/* Comparative Bar & Funnel Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white">Eficiencia Económica & Rendimiento de Campaña</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Costo de Adquisición de Cliente (CAC)</span>
                <span className="font-bold text-white">{kpis.cac}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-[25%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Valor de Vida del Cliente (LTV)</span>
                <span className="font-bold text-emerald-400">{kpis.ltv}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ratio LTV / CAC</span>
                <span className="font-bold text-amber-400">57.5x (Excelente)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Por cada $1 invertido en marketing ministerial se recuperan $57.5 en suscripciones recurrentes.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white">Distribución de Ingresos por Tipo de Plan</h2>
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Plan Profesional ($49/m)</p>
                <p className="text-[10px] text-slate-400">62 suscriptores activos</p>
              </div>
              <span className="font-mono font-bold text-amber-400">$3,038 / mes (62%)</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Plan Premium ($99/m)</p>
                <p className="text-[10px] text-slate-400">14 iglesias y clínicas</p>
              </div>
              <span className="font-mono font-bold text-cyan-400">$1,386 / mes (28%)</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Plan Básico ($19/m)</p>
                <p className="text-[10px] text-slate-400">24 iniciantes</p>
              </div>
              <span className="font-mono font-bold text-slate-400">$456 / mes (10%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
        <h3 className="font-bold text-white uppercase tracking-wider">Historial Reciente de Cobros Stripe</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">Nº Factura</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2 text-right">Monto</th>
                <th className="pb-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sampleInvoices.map(inv => (
                <tr key={inv.id} className="text-slate-300">
                  <td className="py-2.5 font-mono text-white">{inv.id}</td>
                  <td className="py-2.5 text-slate-400">{inv.date}</td>
                  <td className="py-2.5">{inv.planName}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">${inv.amount} USD</td>
                  <td className="py-2.5 text-center">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      Pagado
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
