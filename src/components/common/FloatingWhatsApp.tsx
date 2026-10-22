import React, { useState } from 'react';
import { MessageSquare, X, Send, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';

const WHATSAPP_NUMBER = '573124710702'; // +57 3124710702

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const predefinedMessages = [
    {
      title: 'Quiero una Demostración en Vivo',
      desc: 'Agendar tour guiado de 15 minutos para mi iglesia o clínica.',
      msg: 'Hola, equipo de PastoralMente AI. Me gustaría agendar una demostración en vivo de la plataforma para mi ministerio/clínica.',
    },
    {
      title: 'Dudas sobre Planes y Facturación',
      desc: 'Planes Básico ($19), Profesional ($49) y Premium ($99).',
      msg: 'Hola, tengo una consulta sobre los planes de suscripción de PastoralMente AI y las formas de pago en mi país.',
    },
    {
      title: 'Soporte Técnico Especializado',
      desc: 'Asistencia prioritaria para usuarios activos.',
      msg: 'Hola, requiero asistencia técnica con mi cuenta en PastoralMente AI.',
    },
  ];

  const handleSendMessage = (message: string) => {
    try {
      const encoded = encodeURIComponent(message);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_e) {
      // Safe fallback
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end no-print">
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 text-xs space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✝️
              </div>
              <div>
                <p className="font-bold text-white text-sm">PastoralMente Concierge</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En línea • WhatsApp Oficial
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            Paz y gracia. ¿Cómo podemos apoyarte hoy en tu ministerio o consultorio?
          </p>

          <div className="space-y-2">
            {predefinedMessages.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.msg)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-200 font-bold group-hover:text-emerald-300">
                  <span>{item.title}</span>
                  <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>Atención: Lunes a Sábado</span>
            <span className="font-mono text-emerald-400">+57 312 4710702</span>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir WhatsApp de soporte y ventas"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageSquare className="w-4 h-4 fill-slate-950" />
        <span className="hidden sm:inline font-extrabold tracking-tight">WhatsApp Directo</span>
      </button>
    </div>
  );
};
