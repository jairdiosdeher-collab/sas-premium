import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  BookOpen, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Scroll, 
  HeartHandshake, 
  Palette, 
  Printer, 
  RefreshCw,
  Search,
  FileText,
  Compass,
  Landmark,
  Crown,
  Users,
  Feather,
  CheckCircle2,
  Lock,
  BookmarkPlus,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CompleteNameReport, 
  NameSearchRequest, 
  ReportDepth, 
  ChristianTradition, 
  ShieldPalette, 
  ShieldChargeSymbol 
} from '../../types/nameHeraldry';
import { 
  NameHeraldryService, 
  HERALDIC_PALETTES, 
  SHIELD_CHARGES 
} from '../../services/nameHeraldryService';
import { UserProfile } from '../../types';

interface NameHeraldryModuleProps {
  currentUser: UserProfile;
  onOpenBilling?: () => void;
  onDeductCredit?: () => void;
}

export const NameHeraldryModule: React.FC<NameHeraldryModuleProps> = ({
  currentUser,
  onOpenBilling,
  onDeductCredit,
}) => {
  // Wizard steps: 1 = Nombres, 2 = Contexto Familiar, 3 = Profundidad & Opciones
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form input states
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [firstSurname, setFirstSurname] = useState('');
  const [secondSurname, setSecondSurname] = useState('');
  const [countryOrRegion, setCountryOrRegion] = useState('');
  const [familyContext, setFamilyContext] = useState('');
  const [depth, setDepth] = useState<ReportDepth>('completa');
  const [tradition, setTradition] = useState<ChristianTradition>('interdenominacional');

  // Shield customization states
  const [selectedPalette, setSelectedPalette] = useState<ShieldPalette>(HERALDIC_PALETTES[0]);
  const [selectedCharge, setSelectedCharge] = useState<ShieldChargeSymbol>('cruz_flordelisada');
  const [customMotto, setCustomMotto] = useState('');

  // Execution & presentation states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<CompleteNameReport | null>(null);
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isSavedInDevotionals, setIsSavedInDevotionals] = useState(false);
  const [generatedShieldImage, setGeneratedShieldImage] = useState<string | null>(null);
  const [isGeneratingShieldImage, setIsGeneratingShieldImage] = useState(false);
  const [shieldImageNotice, setShieldImageNotice] = useState<string | null>(null);

  // Full name preview
  const previewFullName = useMemo(() => {
    return [firstName.trim(), middleName.trim(), firstSurname.trim(), secondSurname.trim()]
      .filter(Boolean)
      .join(' ');
  }, [firstName, middleName, firstSurname, secondSurname]);

  // Live SVG render
  const currentShieldSvg = useMemo(() => {
    return NameHeraldryService.generateShieldSvg({
      firstName: firstName || 'David',
      surname: firstSurname || 'Hernández',
      palette: selectedPalette,
      charge: selectedCharge,
      customMotto: customMotto || report?.sectionD_Emblem.suggestedMotto,
    });
  }, [firstName, firstSurname, selectedPalette, selectedCharge, report, customMotto]);

  // Verification if user has access or available credits
  const hasCredits = (currentUser.credits ?? 0) > 0;
  const isFreePlan = currentUser.plan === 'free';
  const isGated = isFreePlan && !hasCredits;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!firstName.trim()) {
        setErrorMessage('Por favor ingresa al menos tu primer nombre para continuar.');
        return;
      }
      if (!firstSurname.trim()) {
        setErrorMessage('Por favor ingresa tu primer apellido para continuar.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !firstSurname.trim()) {
      setErrorMessage('Nombre y primer apellido son requeridos.');
      setCurrentStep(1);
      return;
    }

    if (isGated) {
      setErrorMessage('Has alcanzado el límite de créditos de tu plan. Explora nuestros planes para continuar investigando.');
      if (onOpenBilling) onOpenBilling();
      return;
    }

    setIsLoading(true);
    setGeneratedShieldImage(null);
    setShieldImageNotice(null);

    const request: NameSearchRequest = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      firstSurname: firstSurname.trim(),
      secondSurname: secondSurname.trim() || undefined,
      countryOrRegion: countryOrRegion.trim() || undefined,
      familyContext: familyContext.trim() || undefined,
      depth,
      tradition,
    };

    try {
      const generated = await NameHeraldryService.generateReport(request);
      setReport(generated);
      setActiveSection('A');
      setIsSavedInDevotionals(false);

      if (onDeductCredit && hasCredits) {
        onDeductCredit();
      }

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (_e) {}
    } catch (err: any) {
      setErrorMessage(err?.message || 'No fue posible generar el informe. Por favor reintenta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setReport(null);
    setCurrentStep(1);
    setIsSavedInDevotionals(false);
    setGeneratedShieldImage(null);
    setShieldImageNotice(null);
  };

  const handleSaveToDevotionals = () => {
    if (!report) return;

    try {
      const savedList = JSON.parse(localStorage.getItem('pastoralmente_devocionales_saved') || '[]');
      const newEntry = {
        id: report.id,
        savedAt: new Date().toISOString(),
        fullName: report.sectionA_Name.submittedFullName,
        motto: customMotto || report.sectionD_Emblem.suggestedMotto,
        scripture: report.sectionB_Bible.biblicalPassages[0]?.reference || 'Escrituras',
        summary: report.sectionE_Summary.item5_PersonalReflection,
      };

      const filtered = savedList.filter((item: any) => item.id !== report.id);
      filtered.unshift(newEntry);
      localStorage.setItem('pastoralmente_devocionales_saved', JSON.stringify(filtered.slice(0, 50)));

      setIsSavedInDevotionals(true);
      setTimeout(() => setIsSavedInDevotionals(false), 3000);
    } catch (err) {
      console.warn('Error al guardar en devocionales:', err);
    }
  };

  const handlePrintReport = async () => {
    try {
      // Esperar a que la ilustración generada termine de cargar antes de abrir el diálogo de impresión.
      const printImages = Array.from(document.querySelectorAll<HTMLImageElement>('.heraldry-print-report img'));
      await Promise.all(printImages.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const finish = () => resolve();
          img.addEventListener('load', finish, { once: true });
          img.addEventListener('error', finish, { once: true });
          window.setTimeout(finish, 5000);
        });
      }));
    } catch (error) {
      console.warn('No fue posible esperar todas las imágenes antes de imprimir:', error);
    }
    window.print();
  };

  const handleGenerateShieldImage = async () => {
    if (!firstName.trim() || !firstSurname.trim()) {
      setErrorMessage('Ingresa tu nombre y primer apellido antes de generar la ilustración.');
      setCurrentStep(1);
      return;
    }
    setIsGeneratingShieldImage(true);
    setShieldImageNotice(null);
    try {
      const result = await NameHeraldryService.generateHeraldryImage({
        firstName: firstName.trim(),
        surname: [firstSurname.trim(), secondSurname.trim()].filter(Boolean).join(' '),
        palette: selectedPalette.name + ' — ' + selectedPalette.symbolicMeaning,
        symbol: SHIELD_CHARGES.find((item) => item.id === selectedCharge)?.name || selectedCharge,
        motto: customMotto || report?.sectionD_Emblem.suggestedMotto || '',
      });
      setGeneratedShieldImage(result.imageDataUrl);
      setShieldImageNotice('Ilustración generada por IA (' + result.modelUsed + '). Se usará también en la portada impresa/PDF.');
    } catch (error: any) {
      setShieldImageNotice('No se pudo generar la imagen con IA. Se conserva el emblema vectorial actual; puedes volver a intentarlo.');
      console.error('Error generando ilustración heráldica:', error);
    } finally {
      setIsGeneratingShieldImage(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!report) return;
    NameHeraldryService.exportReportAsTxt(report);
  };

  const handleDownloadSvg = () => {
    const filename = firstSurname || firstName || 'Heraldica';
    NameHeraldryService.downloadShieldSvg(currentShieldSvg, filename);
  };

  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      const filename = firstSurname || firstName || 'Heraldica';
      if (generatedShieldImage) {
        const extension = generatedShieldImage.startsWith('data:image/jpeg') ? 'jpg'
          : generatedShieldImage.startsWith('data:image/webp') ? 'webp' : 'png';
        const link = document.createElement('a');
        link.href = generatedShieldImage;
        link.download = `Emblema_IA_${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.${extension}`;
        link.click();
      } else {
        await NameHeraldryService.exportShieldAsPng(currentShieldSvg, filename);
      }
    } catch (err) {
      console.error('Error al exportar imagen:', err);
      setShieldImageNotice('No fue posible descargar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopySummary = () => {
    if (!report) return;
    const txt = `${report.sectionA_Name.submittedFullName} — MI NOMBRE ANTE LA PALABRA\n\n` +
      `Origen Lingüístico: ${report.sectionA_Name.linguisticOrigin}\n` +
      `Significado Documentado: ${report.sectionA_Name.documentedMeaning}\n` +
      `Interpretación Simbólica: ${report.sectionA_Name.symbolicMeaning}\n` +
      `Cita Bíblica: ${report.sectionB_Bible.biblicalPassages[0]?.reference || ''}\n` +
      `Reflexión Pastoral: ${report.sectionB_Bible.pastoralReflection}\n` +
      `Lema: ${customMotto || report.sectionD_Emblem.suggestedMotto}\n` +
      `Aviso: ${report.sectionA_Name.scopeAndLimitsNotice}`;

    navigator.clipboard.writeText(txt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100 print:text-slate-900 print:max-w-none print:p-0 print:m-0">
      
      {/* 1. Encabezado Oficial del Módulo (Solo pantalla) */}
      <div className="no-print relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              <span>Estudio IA · Módulo Ministerial y Devocional</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-serif">
              Mi Nombre ante la Palabra
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 font-serif italic">
              Identidad, significado, reflexión bíblica y emblema personal.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pt-1">
              Explora el posible origen y significado de tu nombre y apellidos, conéctalos con reflexiones bíblicas pertinentes y crea un emblema simbólico personal, sin afirmar que el nombre determina tu personalidad, destino, espiritualidad o linaje familiar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Créditos IA Restantes</span>
              <span className="text-xl font-black text-amber-400">{currentUser.credits ?? 0}</span>
              <span className="text-[10px] text-slate-500 ml-1">disponibles</span>
            </div>

            {isGated && onOpenBilling && (
              <button
                type="button"
                onClick={onOpenBilling}
                className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Ver Planes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerta Informativa si el usuario no tiene créditos (Solo pantalla) */}
      {isGated && (
        <div className="no-print p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Has alcanzado el límite de créditos de tu plan. Explora nuestros planes pastorales para continuar investigando en profundidad.
            </span>
          </div>
          {onOpenBilling && (
            <button
              onClick={onOpenBilling}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 hover:bg-amber-400 cursor-pointer"
            >
              Ver Planes
            </button>
          )}
        </div>
      )}

      {/* Grid: Formulario en Pasos (Izq) y Emblema Simbólico en Vivo (Der) */}
      {/* Si hay un informe activo, ocultamos el formulario en impresión para centrar el documento impreso */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ${report ? 'no-print' : ''}`}>
        
        {/* Formulario en Pasos (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl backdrop-blur-sm">
          
          {/* Indicador de Pasos del Asistente */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Paso {currentStep} de 3</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-medium">
                {currentStep === 1 && 'Identificación y Nombres'}
                {currentStep === 2 && 'Contexto Familiar Opcional'}
                {currentStep === 3 && 'Profundidad de la Investigación'}
              </span>
            </div>

            {/* Pastillas de navegación de pasos */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((stepNum) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => setCurrentStep(stepNum as any)}
                  className={`w-6 h-6 rounded-full text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                    currentStep === stepNum
                      ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50'
                      : currentStep > stepNum
                      ? 'bg-slate-800 text-amber-300'
                      : 'bg-slate-950 text-slate-600 border border-slate-800'
                  }`}
                >
                  {currentStep > stepNum ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </button>
              ))}
            </div>
          </div>

          {/* PASO 1: Identificación y Nombres */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-fade-in">
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingresa los datos para la investigación filológica y bíblica. La información se procesa bajo estricta confidencialidad pastoral.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Nombre Principal <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. David, Sara, Juan, María..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Segundo Nombre <span className="text-slate-500 text-[10px]">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Ej. Esteban, Isabel..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Primer Apellido <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={firstSurname}
                    onChange={(e) => setFirstSurname(e.target.value)}
                    placeholder="Ej. Hernández, Rodríguez, Gómez..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Segundo Apellido <span className="text-slate-500 text-[10px]">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={secondSurname}
                    onChange={(e) => setSecondSurname(e.target.value)}
                    placeholder="Ej. Silva, Morales, Castro..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  País o Región Familiar de Referencia <span className="text-slate-500 text-[10px]">(opcional)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={countryOrRegion}
                  onChange={(e) => setCountryOrRegion(e.target.value)}
                  placeholder="Ej. Colombia, México, España, Chile, Argentina..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <span>Continuar a Contexto Familiar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: Contexto Familiar Opcional */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Información aportada voluntariamente por el usuario</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cualquier dato genealógico o tradición familiar que aportes será incorporado únicamente como contexto provisto por ti. De acuerdo con la ética académica y heráldica, no se deducen parentescos, ascendencia ni nobleza sin pruebas documentales.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Tradición oral, origen de antepasados o notas de linaje <span className="text-slate-500 text-[10px]">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={400}
                  value={familyContext}
                  onChange={(e) => setFamilyContext(e.target.value)}
                  placeholder="Ej. Mis abuelos maternos migraron a la capital en 1940; tradición de servicio comunitario y labor educativa..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tradición Cristiana de Preferencia</label>
                <select
                  value={tradition}
                  onChange={(e) => setTradition(e.target.value as ChristianTradition)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="interdenominacional">Interdenominacional (Enfoque ecuménico bíblico amplio)</option>
                  <option value="evangelica">Evangélica (Énfasis en la gracia y discipulado personal)</option>
                  <option value="reformada">Reformada (Enfoque teológico en soberanía de Dios y pacto)</option>
                  <option value="catolica">Católica (Tradición histórica, magisterio y patrística)</option>
                  <option value="pentecostal">Pentecostal (Énfasis en el poder del Espíritu y vocación viva)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <span>Continuar a Profundidad</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* PASO 3: Profundidad de la Investigación & Generación */}
          {currentStep === 3 && (
            <form onSubmit={handleGenerate} className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Alcance de la Investigación</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'completa',
                      title: 'Completa (5 Secciones)',
                      desc: 'Etimología, exégesis bíblica, propósito, emblema simbólico y Ficha organizada de 9 puntos.',
                    },
                    {
                      id: 'biblico',
                      title: 'Enfoque Bíblico',
                      desc: 'Énfasis en pasajes bíblicos, lenguas originales (hebreo/griego) y aplicación devocional.',
                    },
                    {
                      id: 'etimologico_heraldico',
                      title: 'Etimológico & Heráldico',
                      desc: 'Historia filológica, tradición onomástica y diseño de emblema simbólico.',
                    },
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setDepth(option.id as ReportDepth)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        depth === option.id
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-bold text-xs text-white">{option.title}</p>
                          {depth === option.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen previo de verificación */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs text-slate-300">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Resumen de la consulta:</span>
                <p><strong>Consultante:</strong> {previewFullName || firstName}</p>
                <p><strong>Región:</strong> {countryOrRegion || 'No especificada'}</p>
                <p><strong>Tradición:</strong> {tradition.toUpperCase()}</p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 active:scale-98 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analizando fuentes académicas y bíblicas con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Generar «Mi Nombre ante la Palabra»</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Panel Derecho: Personalizador y Renderizador SVG del Emblema (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-3xl border border-slate-800 p-4 sm:p-6 space-y-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Emblema Simbólico Personal</span>
            </h2>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
              Vector Proporcional
            </span>
          </div>

          {/* Renderizador Gráfico en Pergamino - 100% Adaptable y NUNCA Recortado */}
          <div className="relative rounded-2xl bg-[#f8f4ea] p-3 sm:p-5 shadow-inner border border-amber-900/20 flex flex-col items-center justify-center overflow-visible">
            <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] shield-svg-wrapper drop-shadow-md transition-all duration-300">
              {generatedShieldImage ? (
                <img src={generatedShieldImage} alt={`Ilustración heráldica personalizada de ${previewFullName || 'tu nombre'}`} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: currentShieldSvg }} />
              )}
            </div>
          </div>

          {/* Controles de Personalización del Emblema */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Esmaltes y Metales Simbólicos</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {HERALDIC_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    title={`${pal.name}: ${pal.symbolicMeaning}`}
                    onClick={() => setSelectedPalette(pal)}
                    className={`h-9 rounded-xl border flex items-center justify-center p-1 transition-all cursor-pointer ${
                      selectedPalette.id === pal.id 
                        ? 'ring-2 ring-amber-400 scale-105 border-white' 
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                    style={{ backgroundColor: pal.field }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: pal.accent }} />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                {selectedPalette.name}: {selectedPalette.symbolicMeaning}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Figura Simbólica Central</label>
              <select
                value={selectedCharge}
                onChange={(e) => setSelectedCharge(e.target.value as ShieldChargeSymbol)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {SHIELD_CHARGES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.concept}) — {c.meaning}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Lema Espiritual Personalizado <span className="text-slate-500 text-[10px]">(opcional)</span></label>
              <input
                type="text"
                maxLength={40}
                value={customMotto}
                onChange={(e) => setCustomMotto(e.target.value)}
                placeholder="Ej. SOLI DEO GLORIA, LA VERDAD NOS HARÁ LIBRES..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
              />
            </div>
          </div>

          {/* Generación opcional de ilustración original por IA */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleGenerateShieldImage}
              disabled={isGeneratingShieldImage}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-60 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGeneratingShieldImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGeneratingShieldImage ? 'Generando ilustración con IA…' : generatedShieldImage ? 'Regenerar ilustración heráldica con IA' : 'Generar ilustración heráldica con IA'}</span>
            </button>
            {shieldImageNotice && <p role="status" className="text-[11px] leading-relaxed text-amber-200">{shieldImageNotice}</p>}
          </div>

          {/* Botones de Descarga del Emblema */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Descargar SVG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExportingPng}
              className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isExportingPng ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
              <span>Descargar PNG HD</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. Panel de Resultados con las 5 Secciones Requeridas (A a E) - Pantalla Interactiva */}
      {report && (
        <div className="no-print mt-8 rounded-3xl bg-slate-900 border border-amber-500/30 p-4 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          
          {/* Barra Superior de Acciones y Metadatos */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest block font-mono">
                INFORME PERSONALIZADO CERTIFICADO
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-serif mt-0.5">
                {report.sectionA_Name.submittedFullName}
              </h2>
              <p className="text-xs text-slate-400">
                Emitido el {new Date(report.generatedAt).toLocaleDateString('es-ES', { dateStyle: 'long' })} • Fuente: {report.source === 'gemini-live' ? 'Inteligencia Artificial Gemini Live' : 'Motor Especializado PastoralMente'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Botón: Generar nueva reflexión */}
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Nueva Reflexión</span>
              </button>

              {/* Botón: Guardar en mis Devocionales */}
              <button
                type="button"
                onClick={handleSaveToDevotionals}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isSavedInDevotionals ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Guardado</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4 text-amber-400" />
                    <span>Guardar en Devocionales</span>
                  </>
                )}
              </button>

              {/* Botón: Copiar Resumen */}
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Copiado' : 'Copiar Resumen'}</span>
              </button>

              {/* Botón: Descargar TXT */}
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Descargar TXT</span>
              </button>

              {/* Botón: Imprimir / PDF */}
              <button
                type="button"
                onClick={handlePrintReport}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>

          {/* Pestañas de las 5 Secciones Oficiales (A a E) */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'A', label: 'A. Mi Nombre', icon: Feather },
              { id: 'B', label: 'B. Mi Nombre y la Biblia', icon: BookOpen },
              { id: 'C', label: 'C. Mi Identidad y Propósito', icon: HeartHandshake },
              { id: 'D', label: 'D. Emblema Simbólico', icon: Shield },
              { id: 'E', label: 'E. Ficha Organizada (9 Puntos)', icon: Landmark },
            ].map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de las 5 Secciones Requeridas */}
          <div className="space-y-5 min-h-[350px]">
            
            {/* SECCIÓN A: Mi nombre */}
            {activeSection === 'A' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">SECCIÓN A · MI NOMBRE</span>
                    <span className="text-[10px] bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-0.5 rounded-full uppercase font-semibold">
                      Certeza: {report.sectionA_Name.certaintyLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-serif">
                    Origen Lingüístico: {report.sectionA_Name.linguisticOrigin}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-300 block">Significado Documentado:</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {report.sectionA_Name.documentedMeaning}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-300 block">Interpretación Simbólica (Diferenciada):</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {report.sectionA_Name.symbolicMeaning}
                      </p>
                    </div>
                  </div>

                  {report.sectionA_Name.knownVariants && report.sectionA_Name.knownVariants.length > 0 && (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <p className="text-xs text-slate-400">
                        <strong>Variantes Ortográficas Documentadas:</strong> {report.sectionA_Name.knownVariants.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong>Fundamento Metodológico:</strong> {report.sectionA_Name.certaintyExplanation}
                  </div>

                  {report.sectionA_Name.consultableSources && report.sectionA_Name.consultableSources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Fuentes Onomásticas Consultables:</span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {report.sectionA_Name.consultableSources.map((source, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{source}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Aclaración Obligatoria sobre Límites de Interpretación */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">Aviso sobre los límites de la interpretación:</span>
                    <p>{report.sectionA_Name.scopeAndLimitsNotice}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN B: Mi nombre y la Biblia */}
            {activeSection === 'B' && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">SECCIÓN B · MI NOMBRE Y LA BIBLIA</span>
                    {report.sectionB_Bible.hasBiblicalConnection && report.sectionB_Bible.originalLanguageScript && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md font-mono border border-amber-500/30">
                        {report.sectionB_Bible.originalLanguageScript} {report.sectionB_Bible.transliteration ? `(${report.sectionB_Bible.transliteration})` : ''}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white font-serif">
                    Conexión Temática: {report.sectionB_Bible.thematicRelation}
                  </h3>

                  {/* Pasajes Bíblicos Exactos con Contexto Histórico-Literario */}
                  <div className="space-y-3">
                    {report.sectionB_Bible.biblicalPassages.map((p, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{p.reference}</span>
                          </span>
                        </div>
                        <p className="text-sm font-serif italic text-white leading-relaxed">
                          «{p.passageText}»
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                          <strong>Contexto Literario e Histórico:</strong> {p.literaryAndHistoricalContext}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Reflexión Pastoral */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/20 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Reflexión Pastoral y Aplicación Devocional:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                      {report.sectionB_Bible.pastoralReflection}
                    </p>
                  </div>

                  {/* Tres Preguntas de Meditación Personal */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Tres Preguntas para la Meditación Personal:</span>
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {report.sectionB_Bible.reflectionQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">{i + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Oración Opcional Voluntaria */}
                  {report.sectionB_Bible.optionalPrayer && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Oración Devocional (Voluntaria):</span>
                      <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                        «{report.sectionB_Bible.optionalPrayer}»
                      </p>
                    </div>
                  )}

                  {/* Aviso Teológico Obligatorio */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    <strong>Aviso teológico:</strong> {report.sectionB_Bible.theologicalBoundaryNote}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN C: Mi identidad y propósito */}
            {activeSection === 'C' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">SECCIÓN C · MI IDENTIDAD Y PROPÓSITO</span>
                  <h3 className="text-lg font-bold text-white font-serif">
                    Identidad, Valores y Vocación de Servicio
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-amber-300 block">Identidad y Valores Fundamentales:</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {report.sectionC_Identity.identityAndValues}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-amber-300 block">Fortalezas y Mayordomía Cristiana:</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {report.sectionC_Identity.strengthsAndService}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/20 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Orientación Pastoral:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {report.sectionC_Identity.pastoralOrientation}
                    </p>
                  </div>

                  {/* Preguntas Abiertas */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Preguntas Abiertas para Conclusiones Propias:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {report.sectionC_Identity.openQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Aviso Ético Obligatorio */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    <strong>Aviso ético y metodológico:</strong> {report.sectionC_Identity.ethicalScopeNotice}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN D: Emblema simbólico personal */}
            {activeSection === 'D' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">SECCIÓN D · EMBLEMA SIMBÓLICO PERSONAL</span>
                  <h3 className="text-lg font-bold text-white font-serif">
                    Propuesta de Emblema y Simbología Visual
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-7 space-y-3 text-xs text-slate-300 leading-relaxed">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-bold text-amber-300 block">Elemento Central:</span>
                        <p>{report.sectionD_Emblem.centralElement}</p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-bold text-amber-300 block">Símbolos Complementarios:</span>
                        <p>{report.sectionD_Emblem.complementarySymbols}</p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-bold text-amber-300 block">Colores y Asociaciones:</span>
                        <p>{report.sectionD_Emblem.colorsAndAssociations}</p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-bold text-amber-300 block">Lema Espiritual Propuesto:</span>
                        <p className="font-serif italic text-white text-sm">«{customMotto || report.sectionD_Emblem.suggestedMotto}»</p>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#f8f4ea] rounded-2xl border border-amber-900/20 shadow-inner overflow-visible">
                      <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] shield-svg-wrapper drop-shadow-md">
                        {generatedShieldImage ? (
                          <img src={generatedShieldImage} alt={`Ilustración heráldica personalizada de ${previewFullName || 'tu nombre'}`} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: currentShieldSvg }} />
                        )}
                      </div>
                      <span className="text-xs text-slate-800 font-serif italic mt-3 text-center font-bold">
                        «{customMotto || report.sectionD_Emblem.suggestedMotto}»
                      </span>
                    </div>
                  </div>

                  {/* Aviso Oficial No Removible */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                    <strong>Declaración oficial de autenticidad:</strong> {report.sectionD_Emblem.disclaimerNotice}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN E: Informe final (Ficha organizada con los 9 puntos requeridos) */}
            {activeSection === 'E' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">SECCIÓN E · INFORME FINAL</span>
                      <h3 className="text-lg font-bold text-white font-serif">
                        Ficha Organizada de Identidad y Reflexión
                      </h3>
                    </div>
                    <span className="text-xs bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-semibold">
                      9 Puntos Clave Integrados
                    </span>
                  </div>

                  {/* 9 Puntos Requeridos organizados en tarjetas claras y legibles */}
                  <div className="space-y-3">
                    {/* Punto 1: Nombre completo analizado */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        1
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Nombre Completo Analizado</span>
                        <p className="text-sm font-semibold text-white">{report.sectionE_Summary.item1_AnalyzedName}</p>
                      </div>
                    </div>

                    {/* Punto 2: Origen lingüístico y significado documentado */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        2
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Origen Lingüístico y Significado Documentado</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{report.sectionE_Summary.item2_DocumentedOriginAndMeaning}</p>
                      </div>
                    </div>

                    {/* Punto 3: Interpretación simbólica diferenciada */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        3
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Interpretación Simbólica (Diferenciada de la filología)</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{report.sectionE_Summary.item3_SymbolicInterpretation}</p>
                      </div>
                    </div>

                    {/* Punto 4: Pasajes bíblicos y contexto */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        4
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Pasajes Bíblicos Exactos y Contexto Histórico-Literario</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{report.sectionE_Summary.item4_BiblicalPassagesAndContext}</p>
                      </div>
                    </div>

                    {/* Punto 5: Reflexión pastoral de identidad */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        5
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Mensaje Pastoral y Devocional de Identidad</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{report.sectionE_Summary.item5_PersonalReflection}</p>
                      </div>
                    </div>

                    {/* Punto 6: Preguntas de meditación personal */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        6
                      </span>
                      <div className="space-y-1.5 w-full">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Preguntas Abiertas de Meditación</span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {report.sectionE_Summary.item6_MeditationQuestions.map((q, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Punto 7: Oración opcional */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        7
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Oración de Consagración (Opcional)</span>
                        <p className="text-xs text-slate-300 italic font-serif leading-relaxed">«{report.sectionE_Summary.item7_OptionalPrayer}»</p>
                      </div>
                    </div>

                    {/* Punto 8: Propuesta de emblema y lema (Con vista gráfica incrustada) */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                          8
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Propuesta de Emblema Simbólico y Lema</span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {report.sectionE_Summary.item8_EmblemProposal} • Lema: <span className="font-serif italic text-white font-bold">«{customMotto || report.sectionD_Emblem.suggestedMotto}»</span>
                          </p>
                        </div>
                      </div>
                      <div className="w-24 sm:w-28 shrink-0 bg-[#f8f4ea] p-1.5 rounded-lg border border-amber-900/20 shadow-sm shield-svg-wrapper">
                        {generatedShieldImage ? (
                          <img src={generatedShieldImage} alt={`Ilustración heráldica personalizada de ${previewFullName || 'tu nombre'}`} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: currentShieldSvg }} />
                        )}
                      </div>
                    </div>

                    {/* Punto 9: Fuentes consultables */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        9
                      </span>
                      <div className="space-y-1.5 w-full">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Fuentes y Referencias Consultables</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {report.sectionE_Summary.item9_ConsultableSources.map((source, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                              <p className="font-bold text-white">{source.title}</p>
                              <p className="text-slate-400">{source.authorOrInstitution} • <span className="uppercase text-[10px] text-amber-400">{source.type}</span></p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contexto Familiar voluntario (si fue aportado) */}
                  {report.familyContextSection && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Nota sobre Contexto Familiar Aportado:</span>
                      <p className="italic">"{report.familyContextSection.providedContextText}"</p>
                      <p className="text-[11px] text-amber-300/80">{report.familyContextSection.criticalNotice}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DOCUMENTO FORMAL PARA IMPRESIÓN Y GUARDADO EN PDF (SOLO IMPRESIÓN)      */}
      {/* ========================================================================= */}
      {report && (
        <div className="hidden print:block text-slate-900 bg-white p-0 space-y-6">
          
          {/* PORTADA Y CERTIFICADO DEL EMBLEMA COMPLETO */}
          <div className="shield-print-page print-break-inside-avoid min-h-[92vh] flex flex-col justify-between items-center text-center p-8 border-4 border-double border-amber-800/40 rounded-2xl bg-[#fdfbf7] shadow-none">
            <div className="space-y-2">
              <div className="text-[12px] uppercase font-bold tracking-[0.25em] text-amber-900 font-serif">
                PastoralMente AI Premium · Certificado Devocional
              </div>
              <h1 className="text-3xl font-extrabold font-serif text-slate-900 tracking-tight">
                Mi Nombre ante la Palabra
              </h1>
              <p className="text-sm italic font-serif text-amber-950/80">
                Identidad, significado, reflexión bíblica y emblema personal
              </p>
              <div className="w-24 h-0.5 bg-amber-700/40 mx-auto my-2" />
              <p className="text-xs text-slate-600">
                Documento emitido el {new Date(report.generatedAt).toLocaleDateString('es-ES', { dateStyle: 'full' })}
              </p>
            </div>

            {/* EMBLEMA CENTRAL COMPLETO, NÍTIDO Y EXACTAMENTE CENTRADO */}
            <div className="my-4 w-full max-w-[130mm] aspect-[900/1150] shield-svg-wrapper flex items-center justify-center border border-amber-900/20 rounded-2xl bg-[#f8f4ea] p-3 shadow-none">
              {generatedShieldImage ? (
                <img src={generatedShieldImage} alt={`Ilustración heráldica personalizada de ${report.sectionA_Name.submittedFullName}`} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain" dangerouslySetInnerHTML={{ __html: currentShieldSvg }} />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-serif text-slate-900">
                {report.sectionA_Name.submittedFullName}
              </h2>
              <p className="text-sm italic font-serif text-amber-900 font-bold">
                « {customMotto || report.sectionD_Emblem.suggestedMotto} »
              </p>
              <p className="text-[10px] text-slate-500 pt-3 max-w-xl mx-auto leading-tight">
                {report.sectionA_Name.scopeAndLimitsNotice}
              </p>
            </div>
          </div>

          {/* PÁGINA 2: ESTUDIO COMPLETO Y FICHA ORGANIZADA (9 PUNTOS) */}
          <div className="print-page-break space-y-5 pt-4">
            <div className="border-b-2 border-amber-900/30 pb-2 flex justify-between items-baseline">
              <div>
                <h2 className="text-lg font-bold font-serif text-slate-900 uppercase tracking-wide">
                  Estudio Exegético & Ficha de Identidad
                </h2>
                <p className="text-xs text-slate-600">
                  Consultante: <strong>{report.sectionA_Name.submittedFullName}</strong>
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Fecha: {new Date(report.generatedAt).toLocaleDateString('es-ES')}
              </span>
            </div>

            {/* SECCIÓN A */}
            <div className="print-break-inside-avoid border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 space-y-1.5 text-xs">
              <h3 className="font-bold font-serif text-slate-900 text-sm border-b border-slate-200 pb-1">
                A. Mi Nombre: Origen Filológico y Lingüístico
              </h3>
              <p><strong>Origen:</strong> {report.sectionA_Name.linguisticOrigin} <span className="text-slate-600">(Certeza: {report.sectionA_Name.certaintyLevel.replace('_', ' ')})</span></p>
              <p><strong>Significado Documentado:</strong> {report.sectionA_Name.documentedMeaning}</p>
              <p><strong>Interpretación Simbólica:</strong> {report.sectionA_Name.symbolicMeaning}</p>
              <p className="text-slate-600 italic"><strong>Fundamento Metodológico:</strong> {report.sectionA_Name.certaintyExplanation}</p>
            </div>

            {/* SECCIÓN B */}
            <div className="print-break-inside-avoid border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 space-y-2 text-xs">
              <h3 className="font-bold font-serif text-slate-900 text-sm border-b border-slate-200 pb-1">
                B. Mi Nombre y la Biblia
              </h3>
              <p><strong>Conexión Temática:</strong> {report.sectionB_Bible.thematicRelation}</p>
              {report.sectionB_Bible.originalLanguageScript && (
                <p><strong>Lengua Original:</strong> {report.sectionB_Bible.originalLanguageScript} {report.sectionB_Bible.transliteration ? `(${report.sectionB_Bible.transliteration})` : ''}</p>
              )}
              <div className="space-y-2 pt-1">
                {report.sectionB_Bible.biblicalPassages.map((p, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-bold text-amber-900 font-mono">{p.reference}:</span>
                    <p className="italic font-serif my-1">«{p.passageText}»</p>
                    <p className="text-[11px] text-slate-600"><strong>Contexto Literario:</strong> {p.literaryAndHistoricalContext}</p>
                  </div>
                ))}
              </div>
              <p><strong>Reflexión Pastoral:</strong> {report.sectionB_Bible.pastoralReflection}</p>
              <div className="pt-1">
                <strong>Preguntas de Meditación Personal:</strong>
                <ol className="list-decimal list-inside pl-1 space-y-0.5 text-slate-700">
                  {report.sectionB_Bible.reflectionQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </div>
              {report.sectionB_Bible.optionalPrayer && (
                <p className="italic bg-amber-50 p-2 rounded border border-amber-200 text-amber-950 font-serif">
                  <strong>Oración:</strong> «{report.sectionB_Bible.optionalPrayer}»
                </p>
              )}
            </div>

            {/* SECCIÓN C */}
            <div className="print-break-inside-avoid border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 space-y-1.5 text-xs">
              <h3 className="font-bold font-serif text-slate-900 text-sm border-b border-slate-200 pb-1">
                C. Identidad y Propósito
              </h3>
              <p><strong>Valores:</strong> {report.sectionC_Identity.identityAndValues}</p>
              <p><strong>Fortalezas y Mayordomía:</strong> {report.sectionC_Identity.strengthsAndService}</p>
              <p><strong>Orientación Pastoral:</strong> {report.sectionC_Identity.pastoralOrientation}</p>
            </div>

            {/* SECCIÓN E: FICHA ORGANIZADA (9 PUNTOS) */}
            <div className="print-break-inside-avoid border-2 border-slate-400 rounded-lg p-3.5 bg-white space-y-2.5 text-xs">
              <h3 className="font-bold font-serif text-slate-900 text-sm border-b border-slate-300 pb-1 uppercase tracking-wide">
                E. Ficha Organizada de los 9 Puntos Requeridos
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                <p><strong>1. Nombre analizado:</strong> {report.sectionE_Summary.item1_AnalyzedName}</p>
                <p><strong>2. Origen y significado documentado:</strong> {report.sectionE_Summary.item2_DocumentedOriginAndMeaning}</p>
                <p><strong>3. Interpretación simbólica:</strong> {report.sectionE_Summary.item3_SymbolicInterpretation}</p>
                <p><strong>4. Pasajes bíblicos y contexto:</strong> {report.sectionE_Summary.item4_BiblicalPassagesAndContext}</p>
                <p><strong>5. Mensaje pastoral y devocional:</strong> {report.sectionE_Summary.item5_PersonalReflection}</p>
                <div>
                  <strong>6. Preguntas abiertas para meditar:</strong>
                  <ul className="list-disc list-inside pl-2 space-y-0.5">
                    {report.sectionE_Summary.item6_MeditationQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <p><strong>7. Oración de consagración:</strong> «{report.sectionE_Summary.item7_OptionalPrayer}»</p>
                <p><strong>8. Propuesta de emblema simbólico y lema:</strong> {report.sectionE_Summary.item8_EmblemProposal} (Lema: «{customMotto || report.sectionD_Emblem.suggestedMotto}»)</p>
                <div>
                  <strong>9. Fuentes consultables:</strong>
                  <ul className="list-disc list-inside pl-2 space-y-0.5 text-[11px] text-slate-600">
                    {report.sectionE_Summary.item9_ConsultableSources.map((s, i) => (
                      <li key={i}>{s.title} ({s.authorOrInstitution})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {report.familyContextSection && (
              <div className="print-break-inside-avoid text-[10px] text-slate-500 italic p-2 border-t border-slate-200">
                * {report.familyContextSection.criticalNotice}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
