import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { BookOpen, Download, Feather, Shield, Sparkles, Loader2, AlertTriangle, Copy, Check } from 'lucide-react';
import { callGeminiApi } from '../../services/geminiService';

type Palette = { field: string; accent: string; secondary: string; symbol: string };

const palettes: Palette[] = [
  { field: '#10243b', accent: '#d7b56d', secondary: '#f1e7d0', symbol: '✦' },
  { field: '#254c3b', accent: '#d9bd72', secondary: '#f4ead1', symbol: '⚜' },
  { field: '#4a2638', accent: '#e2c17c', secondary: '#f7e9d7', symbol: '✶' },
  { field: '#253b66', accent: '#d9b56d', secondary: '#e9eff8', symbol: '✧' },
];

function escapeXml(value: string) {
  const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' };
  return value.replace(/[<>&"']/g, (character) => entities[character] || character);
}

function buildShieldSvg(name: string, surname: string, palette: Palette, variant: number) {
  const display = (surname || name || 'NOMBRE').toLocaleUpperCase('es').slice(0, 28);
  const initials = (name.trim().charAt(0) + (surname.trim().charAt(0) || '')).toLocaleUpperCase('es') || '✦';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1080" viewBox="0 0 900 1080" role="img" aria-labelledby="title desc">
<title id="title">Emblema simbólico de ${escapeXml([name, surname].filter(Boolean).join(' '))}</title>
<desc id="desc">Diseño ilustrativo generado para reflexión familiar. No certifica un escudo histórico de linaje.</desc>
<rect width="900" height="1080" fill="#f8f4ea"/>
<rect x="28" y="28" width="844" height="1024" rx="24" fill="none" stroke="${palette.accent}" stroke-width="5"/>
<text x="450" y="105" text-anchor="middle" font-family="Georgia,serif" font-size="28" letter-spacing="5" fill="${palette.field}">MEMORIA · IDENTIDAD · HISTORIA</text>
<path d="M450 150 L700 235 L670 600 Q620 755 450 850 Q280 755 230 600 L200 235 Z" fill="${palette.field}" stroke="${palette.accent}" stroke-width="14"/>
<path d="M450 180 L665 253 L638 590 Q594 724 450 808 Q306 724 262 590 L235 253 Z" fill="none" stroke="${palette.secondary}" stroke-width="3"/>
${[
  `<path d="M450 260 L450 720 M300 480 L600 480" stroke="${palette.accent}" stroke-width="4" opacity=".8"/><circle cx="450" cy="480" r="115" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="8"/><text x="450" y="505" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="82" fill="${palette.field}">${escapeXml(initials)}</text><text x="450" y="390" text-anchor="middle" font-family="Georgia,serif" font-size="35" fill="${palette.accent}">${palette.symbol}</text>`,
  `<path d="M450 265 L450 700 M270 340 L630 650 M630 340 L270 650" stroke="${palette.accent}" stroke-width="5" opacity=".8"/><path d="M450 350 L560 480 L450 610 L340 480 Z" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="8"/><text x="450" y="505" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="78" fill="${palette.field}">${escapeXml(initials)}</text><text x="450" y="315" text-anchor="middle" font-family="Georgia,serif" font-size="42" fill="${palette.accent}">${palette.symbol}</text>`,
  `<path d="M450 300 L610 430 L450 560 L290 430 Z" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="8"/><path d="M310 590 Q450 500 590 590" fill="none" stroke="${palette.accent}" stroke-width="10"/><text x="450" y="460" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="82" fill="${palette.field}">${escapeXml(initials)}</text><text x="450" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="45" fill="${palette.accent}">${palette.symbol}</text>`,
  `<path d="M450 290 L560 400 L450 510 L340 400 Z" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="8"/><path d="M300 560 L600 560 M330 620 L570 620" stroke="${palette.accent}" stroke-width="8"/><circle cx="450" cy="400" r="55" fill="none" stroke="${palette.field}" stroke-width="5"/><text x="450" y="430" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="60" fill="${palette.field}">${escapeXml(initials)}</text><text x="450" y="720" text-anchor="middle" font-family="Georgia,serif" font-size="45" fill="${palette.accent}">${palette.symbol}</text>`
][variant]}
<text x="450" y="900" text-anchor="middle" font-family="Georgia,serif" font-size="38" font-weight="bold" fill="${palette.field}">${escapeXml(display)}</text>
<text x="450" y="950" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#5c6470">EMBLEMA SIMBÓLICO PERSONALIZADO</text>
<text x="450" y="990" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#6b7280">Diseño ilustrativo; no acredita armas históricas ni parentesco.</text>
</svg>`;
}

export const NameHeraldryModule: React.FC = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [country, setCountry] = useState('');
  const [lineage, setLineage] = useState('');
  const [focus, setFocus] = useState<'complete' | 'biblical' | 'heraldic'>('complete');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const designSeed = useMemo(() => Array.from((name.trim() + '|' + surname.trim()).toLocaleLowerCase('es')).reduce((sum, char) => sum + char.codePointAt(0)!, 0), [name, surname]);
  const palette = useMemo(() => palettes[designSeed % palettes.length], [designSeed]);
  const designVariant = designSeed % 4;
  const fullName = [name.trim(), surname.trim()].filter(Boolean).join(' ');
  const shieldSvg = useMemo(() => buildShieldSvg(name.trim(), surname.trim(), palette, designVariant), [name, surname, palette, designVariant]);

  const generate = async () => {
    if (!name.trim() && !surname.trim()) {
      setError('Escribe al menos un nombre o un apellido para comenzar.');
      return;
    }
    setLoading(true);
    setError('');
    setReport('');
    const prompt = `Redacta un informe en español para la experiencia de PastoralMente “Mi nombre ante la Palabra”, sobre: ${fullName || name || surname}.
País o región familiar (si se conoce): ${country.trim() || 'no indicado'}.
Datos de linaje aportados voluntariamente: ${lineage.trim() || 'no indicados'}.
Enfoque: ${focus === 'complete' ? 'etimología, exégesis bíblica, devocional y heráldica crítica' : focus === 'biblical' ? 'exégesis bíblica y reflexión devocional' : 'heráldica e historia del apellido'}.

Reglas obligatorias de investigación:
- Antes de concluir sobre heráldica, realiza una búsqueda web real con Google Search grounding; no respondas solo desde memoria del modelo.
- Busca primero si hay armas históricas documentadas para el apellido y, cuando sea posible, la región o rama familiar indicada. Incluye URLs y explica qué evidencia aporta cada fuente.
- Distingue fuentes históricas o institucionales de páginas comerciales genéricas de escudos por apellido. Que un escudo aparezca junto a un apellido no demuestra que la persona descienda de esa rama.
- Usa uno de estos estados en la sección heráldica: ESCUDO DOCUMENTADO PARA UNA PERSONA O RAMA CONCRETA, NO SE HA VERIFICADO UN ESCUDO APLICABLE A ESTA FAMILIA o INVESTIGACIÓN INCONCLUSA.
- Si encuentras un escudo documentado, describe quién lo usó y cita la fuente, pero no lo atribuyas al usuario sin pruebas genealógicas. Si no hay evidencia suficiente, dilo claramente y presenta el emblema de la aplicación como simbólico, no histórico. No afirmes que ningún escudo existe cuando solo significa que no se pudo verificar.
- Explica que la composición, figuras, colores y símbolos del emblema simbólico son una creación original para esta persona, no elementos heredados de un escudo antiguo.
- No afirmes que el nombre determina la personalidad, el destino, la espiritualidad ni un perfil psicológico.
- Distingue claramente hechos documentados, hipótesis etimológicas, tradición popular y reflexión devocional.
- No inventes referencias bíblicas, palabras en hebreo/arameo/griego, fuentes, linajes ni blasones.
- En heráldica, aclara que no existe un escudo universal para cada apellido: las armas pertenecen a personas o ramas familiares concretas. Sin evidencia verificable, no atribuyas un escudo histórico a esta persona.
- Si no puedes verificar una etimología o un escudo histórico, dilo claramente y ofrece pasos concretos para investigar archivos civiles, parroquiales y fuentes heráldicas fiables.
- Si el nombre no tiene conexión bíblica directa demostrable, no la inventes; puedes seleccionar un pasaje temáticamente relacionado y explicar que la conexión es devocional, no etimológica.
- Incluye títulos: 1) Resumen del nombre; 2) Origen y grado de certeza; 3) Relación bíblica y lenguas originales cuando sea pertinente; 4) Pasaje y exégesis contextual; 5) Reflexión devocional y oración; 6) Autoconocimiento psicológico responsable (preguntas abiertas, sin diagnóstico ni inferencias desde el nombre); 7) Historia heráldica: qué puede y qué no puede afirmarse; 8) Relato simbólico del emblema adjunto, indicando explícitamente que es una creación ilustrativa si no se verifica un escudo histórico; 9) Fuentes o rutas de verificación recomendadas.
- Escribe de forma cálida, comprensible y rigurosa. No presentes una narración simbólica como historia real.`;
    try {
      const result = await callGeminiApi(prompt, 'Eres especialista prudente en exégesis bíblica, lingüística histórica, devocional cristiano y heráldica crítica. Investiga en la web cuando se solicite, cita fuentes reales devueltas por la búsqueda y no inventes hechos ni presentes inferencias como certezas.', undefined, true);
      if (result.error && result.source !== 'gemini-live') {
        setError('El servicio de IA en vivo no estuvo disponible; se muestra el resultado alternativo del sistema. Para un informe histórico fiable, vuelve a intentarlo cuando Gemini esté disponible.');
      }
      const sources = result.groundingSources || [];
      const sourceSection = sources.length
        ? '\n\n### Fuentes web consultadas por el sistema\n' + sources.map((source, index) => `${index + 1}. ${source.title} — ${source.url}`).join('\n')
        : '\n\n### Estado de verificación web\nNo se recibieron fuentes web verificables en esta respuesta. La investigación heráldica debe considerarse inconclusa y no debe interpretarse como confirmación histórica.';
      setReport(result.text + sourceSection);
    } catch {
      setError('No fue posible generar el informe. Comprueba la conexión y vuelve a intentarlo.');
    } finally {
      setLoading(false);
    }
  };

  const downloadText = () => {
    const text = `MI NOMBRE ANTE LA PALABRA\n${fullName}\n\nNOTA SOBRE EL EMBLEMA\nEl escudo descargable de esta experiencia es un diseño simbólico ilustrativo. No certifica armas históricas ni parentesco genealógico.\n\n${report}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-nombre-${(fullName || 'personal').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const downloadPdf = async () => {
    if (!report.trim()) {
      setError('Primero genera el informe para poder descargar el PDF completo.');
      return;
    }
    setPdfLoading(true);
    setError('');
    let imageUrl: string | undefined;
    try {
      // Convertir el SVG actual a PNG para que el emblema quede incrustado en el PDF.
      // Usar un SVG codificado como data URI evita fallos de carga del Blob URL
      // en algunos navegadores y permite rasterizar el emblema antes de crear el PDF.
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shieldSvg)}`;
      const emblemImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('No se pudo cargar el emblema simbólico para el PDF.'));
        image.src = svgDataUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1440;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('El navegador no permite preparar la imagen del emblema.');
      context.fillStyle = '#f8f4ea';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(emblemImage, 0, 0, canvas.width, canvas.height);
      const emblemPng = canvas.toDataURL('image/png');
      if (!emblemPng.startsWith('data:image/png;base64,') || canvas.width < 1 || canvas.height < 1) {
        throw new Error('La conversión del emblema a PNG no produjo una imagen válida.');
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const textWidth = pageWidth - margin * 2;
      const safeText = (value: string) => value
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[—–]/g, '-')
        .replace(/•/g, '-')
        .replace(/…/g, '...')
        .replace(/[^\u0000-\u00FF]/g, '');
      const printableName = safeText(fullName || 'Nombre personal');
      pdf.setTextColor(24, 38, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(19);
      pdf.text('MI NOMBRE ANTE LA PALABRA', pageWidth / 2, 20, { align: 'center', maxWidth: textWidth });
      pdf.setFontSize(14);
      pdf.text(printableName, pageWidth / 2, 29, { align: 'center', maxWidth: textWidth });
      // Incrustar el PNG con compresión sin pérdida y un alias explícito para evitar
      // que jsPDF reutilice por error otra imagen en documentos con varias páginas.
      pdf.addImage(emblemPng, 'PNG', (pageWidth - 76) / 2, 35, 76, 91, 'emblema-personal-mi-nombre', 'NONE');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('NOTA SOBRE EL EMBLEMA', margin, 136);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const disclaimer = 'Este emblema es un diseño simbólico ilustrativo. No certifica armas históricas, linaje ni parentesco genealógico.';
      const disclaimerLines = pdf.splitTextToSize(safeText(disclaimer), textWidth);
      pdf.text(disclaimerLines, margin, 142);
      pdf.setDrawColor(215, 181, 109);
      pdf.line(margin, 153, pageWidth - margin, 153);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('INFORME DEVOCIONAL Y DE INVESTIGACIÓN', margin, 163);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const bodyLines = pdf.splitTextToSize(safeText(report), textWidth);
      let y = 171;
      const lineHeight = 5.1;
      for (const line of bodyLines) {
        if (y > pageHeight - 18) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(String(line), margin, y);
        y += lineHeight;
      }
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = 20;
      } else {
        y += 7;
      }
      pdf.setFontSize(8);
      pdf.setTextColor(90, 100, 112);
      const footer = 'Material educativo, devocional y de autoconocimiento. No constituye diagnóstico psicológico ni certificación genealógica o heráldica.';
      const footerLines = pdf.splitTextToSize(safeText(footer), textWidth);
      if (y + footerLines.length * 4 > pageHeight - 10) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(footerLines, margin, y);
      const fileSlug = printableName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'personal';
      pdf.save(`informe-mi-nombre-${fileSlug}.pdf`);
    } catch (downloadError) {
      console.error('Error al generar el PDF de Mi nombre ante la Palabra:', downloadError);
      setError('No se pudo generar el PDF. Comprueba que el navegador permita las descargas e inténtalo de nuevo.');
    } finally {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setPdfLoading(false);
    }
  };

  const downloadShield = () => {
    const url = URL.createObjectURL(new Blob([shieldSvg], { type: 'image/svg+xml;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `emblema-simbolico-${(fullName || 'personal').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('No se pudo copiar automáticamente. Puedes seleccionar el texto del informe y copiarlo manualmente.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 p-6 sm:p-8">
        <div className="absolute -right-8 -top-8 opacity-10"><Shield className="h-44 w-44 text-amber-300" /></div>
        <div className="relative max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-amber-200"><Sparkles className="h-3.5 w-3.5" /> Experiencia para suscriptores</div>
          <h1 className="font-cinzel text-2xl font-bold text-white sm:text-3xl">Mi nombre ante la Palabra</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">Explora el origen de tu nombre, una reflexión bíblica contextual y la historia heráldica de tu apellido. Guarda tu informe y descarga un emblema simbólico personalizado.</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-white"><Feather className="h-5 w-5 text-amber-300" /> Personaliza tu exploración</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold text-slate-300">Nombre
              <input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Ej. Ana, David, Jair" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-amber-400" />
            </label>
            <label className="space-y-1 text-xs font-semibold text-slate-300">Apellido(s)
              <input value={surname} onChange={e => setSurname(e.target.value)} maxLength={120} placeholder="Escribe tus apellidos" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-amber-400" />
            </label>
            <label className="space-y-1 text-xs font-semibold text-slate-300">País o región familiar (opcional)
              <input value={country} onChange={e => setCountry(e.target.value)} maxLength={100} placeholder="Ej. Colombia, Galicia..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-amber-400" />
            </label>
            <label className="space-y-1 text-xs font-semibold text-slate-300">Tradición familiar o datos de origen (opcional)
              <input value={lineage} onChange={e => setLineage(e.target.value)} maxLength={300} placeholder="Lugar, fechas aproximadas o rama familiar" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-amber-400" />
            </label>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-300">Enfoque del informe</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {([{ id: 'complete', label: 'Completo' }, { id: 'biblical', label: 'Bíblico' }, { id: 'heraldic', label: 'Heráldico' }] as const).map(option => (
                <button key={option.id} type="button" onClick={() => setFocus(option.id)} className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${focus === option.id ? 'border-amber-400 bg-amber-400/10 text-amber-200' : 'border-slate-700 bg-slate-950 text-slate-400 hover:text-white'}`}>{option.label}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs leading-5 text-sky-100">
            <AlertTriangle className="mr-1 inline h-4 w-4" /> Importante: no todos los apellidos tienen un escudo verificable, y un apellido compartido no demuestra pertenecer al mismo linaje. El emblema descargable que ves aquí es simbólico, salvo que una investigación documental independiente confirme unas armas concretas.
          </div>
          {error && <p role="status" className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">{error}</p>}
          <button type="button" onClick={generate} disabled={loading || (!name.trim() && !surname.trim())} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparando informe...</> : <><Sparkles className="h-4 w-4" /> Generar informe con IA</>}
          </button>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-white"><Shield className="h-5 w-5 text-amber-300" /> Emblema y relato</h2>
            <button type="button" onClick={downloadShield} disabled={!name.trim() && !surname.trim()} className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-400/10 disabled:opacity-40"><Download className="h-4 w-4" /> Descargar SVG</button>
          </div>
          <div className="mx-auto max-w-xs rounded-2xl bg-[#f8f4ea] p-3 shadow-xl">
            <div className="text-center text-[9px] font-bold tracking-[.18em] text-slate-700">MEMORIA · IDENTIDAD · HISTORIA</div>
            <svg viewBox="0 0 300 350" className="mx-auto w-full" role="img" aria-label="Emblema simbólico personalizado">
              <path d="M150 20 L250 55 L238 180 Q220 240 150 285 Q80 240 62 180 L50 55 Z" fill={palette.field} stroke={palette.accent} strokeWidth="5" />
              <path d="M150 32 L238 62 L228 178 Q211 231 150 270 Q89 231 72 178 L62 62 Z" fill="none" stroke={palette.secondary} strokeWidth="1.5" />
              <path d="M150 78 L150 235 M82 155 L218 155" stroke={palette.accent} strokeWidth="1.5" opacity=".8" />
              <circle cx="150" cy="155" r="42" fill={palette.secondary} stroke={palette.accent} strokeWidth="3" />
              <text x="150" y="166" textAnchor="middle" fontSize="28" fontWeight="bold" fill={palette.field} fontFamily="Georgia,serif">{(name.trim().charAt(0) + (surname.trim().charAt(0) || '')).toLocaleUpperCase('es') || '✦'}</text>
              <text x="150" y="118" textAnchor="middle" fontSize="16" fill={palette.accent}>{palette.symbol}</text>
              <text x="150" y="310" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">{(surname || name || 'TU NOMBRE').toLocaleUpperCase('es').slice(0, 24)}</text>
              <text x="150" y="329" textAnchor="middle" fontSize="7" fill="#64748b">EMBLEMA SIMBÓLICO · NO CERTIFICA LINAJE</text>
            </svg>
          </div>
          <p className="text-xs leading-5 text-slate-400">Este emblema original se crea con iniciales y elementos gráficos decorativos. No se presenta como escudo histórico de un apellido.</p>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <h3 className="mb-2 text-sm font-bold text-amber-200">Relato heráldico</h3>
            <p className="text-xs leading-5 text-slate-300">{report ? 'El informe generado contiene el relato simbólico y las cautelas históricas.' : 'Después de generar el informe, aquí encontrarás una narración que explica los símbolos del emblema y separa claramente la imaginación simbólica de la historia documentada.'}</p>
          </div>
        </section>
      </div>

      {report && <section className="space-y-4 rounded-2xl border border-amber-500/20 bg-slate-900/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white"><BookOpen className="h-5 w-5 text-amber-300" /> Informe personalizado: {fullName}</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyReport} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copiado' : 'Copiar'}</button>
            <button type="button" onClick={downloadText} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300"><Download className="h-4 w-4" /> Descargar informe TXT</button>
            <button type="button" onClick={downloadPdf} disabled={pdfLoading || !report.trim()} className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 px-3 py-2 text-xs font-extrabold text-amber-200 hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> {pdfLoading ? "Preparando PDF..." : "Descargar informe completo en PDF"}</button>
          </div>
        </div>
        <article className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{report}</article>
        <p className="border-t border-slate-800 pt-3 text-[11px] leading-5 text-slate-500">Material educativo, devocional y de autoconocimiento. No constituye diagnóstico psicológico ni certificación genealógica o heráldica.</p>
      </section>}
    </div>
  );
};
