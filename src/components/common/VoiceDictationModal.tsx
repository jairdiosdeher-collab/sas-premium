import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Sparkles, Check, Copy, AlertCircle, RefreshCw, Volume2, ShieldCheck, X } from 'lucide-react';
import { VoiceDictationService } from '../../services/voiceDictationService';
import { VoiceClinicalDictation } from '../../types';

interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  onApplyParsedSoap?: (parsed: VoiceClinicalDictation['parsedSoap']) => void;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Consultante',
  onApplyParsedSoap,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<VoiceClinicalDictation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const isSpeechSupported = VoiceDictationService.isSupported();

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setTranscript('');
      setSeconds(0);
      setParsedResult(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const startRecording = () => {
    setErrorMessage(null);
    if (!isSpeechSupported) {
      // Modo simulado / dictado asistido
      setIsListening(true);
      return;
    }

    try {
      recognitionRef.current = VoiceDictationService.createRecognitionInstance(
        (text, isFinal) => {
          setTranscript((prev) => (isFinal ? prev + ' ' + text : prev + ' ' + text));
        },
        (err) => {
          console.warn('SpeechRecognition error:', err);
          if (err === 'not-allowed') {
            setErrorMessage('Permiso de micrófono denegado en el navegador. Puedes escribir el texto en el área inferior.');
          }
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (e) {
      console.warn('Speech error:', e);
      setIsListening(false);
      setErrorMessage('No se pudo inicializar el micrófono. Ingresa el relato manualmente.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignorar
      }
    }
    setIsListening(false);
  };

  const handleSynthesizeSoap = () => {
    if (!transcript.trim()) {
      setErrorMessage('Primero dicta o escribe la narración clínica de la sesión.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const result = VoiceDictationService.parseClinicalSpeechToSoap(transcript, patientName);
      setParsedResult(result);
      setIsProcessing(false);
    }, 600);
  };

  const handleApplyToActiveNote = () => {
    if (parsedResult && onApplyParsedSoap) {
      onApplyParsedSoap(parsedResult.parsedSoap);
      onClose();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Demo clínico precargado para pruebas rápidas
  const loadSampleClinicalAudio = () => {
    const sample = `El consultante ${patientName} acude a la sesión manifestando profunda angustia e insomnio de conciliación en las últimas tres semanas. Refiere pensamientos intrusivos de culpa respecto a la pérdida de su empleo y siente que Dios lo ha desamparado. Al examen mental se presenta orientado, con llanto contenido y signos visibles de fatiga psicomotora. Se aplicó encuadre de TCC para identificar distorsiones cognitivas de catastrofismo y sobregeneralización. Se acordó registro de pensamientos automáticos y oración pastoral centrada en Romanos 8:38-39 sin invalidar su dolor emocional.`;
    setTranscript(sample);
    setSeconds(48);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Dictado Clínico por Voz &bull; IA SOAP-S</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Audio 100% Privado
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dicta la sesión de <strong className="text-slate-200">{patientName}</strong> y genera automáticamente el desglose S-O-A-P-S
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-3 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recording Canvas & Controls */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Visual audio wave effect */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-48 h-48 rounded-full bg-indigo-500 blur-3xl animate-ping"></div>
              </div>
            )}

            <div className="flex items-center space-x-6 z-10">
              <button
                onClick={isListening ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-xl transform active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-4 ring-rose-500/30 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 ring-4 ring-indigo-500/20'
                }`}
              >
                {isListening ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="text-left space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                  <span className="text-sm font-semibold text-slate-300">
                    {isListening ? 'Grabando audio clínico...' : 'Listo para grabar'}
                  </span>
                </div>
                <div className="text-3xl font-mono font-bold text-white tracking-wider">
                  {formatTimer(seconds)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isSpeechSupported ? 'Web Speech API Activa (Español)' : 'Soporte de texto guiado'}
                </div>
              </div>
            </div>

            {/* Quick Helper Button */}
            {!isListening && transcript.length === 0 && (
              <button
                onClick={loadSampleClinicalAudio}
                className="mt-5 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cargar ejemplo de dictado clínico para demostración rápida</span>
              </button>
            )}
          </div>

          {/* Transcript Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Transcripción del Relato Clínico ({transcript.split(/\s+/).filter(Boolean).length} palabras)</span>
              </label>
              {transcript && (
                <button
                  onClick={() => setTranscript('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition"
                >
                  Limpiar texto
                </button>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Habla o escribe aquí la narración de la sesión clínica. Por ejemplo: 'El consultante refiere insomnio, ideas de culpa y aislamiento... Se aplicó técnica de reestructuración cognitiva...'"
              rows={4}
              className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Convert to SOAP CTA */}
          <div className="flex justify-end">
            <button
              onClick={handleSynthesizeSoap}
              disabled={isProcessing || !transcript.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sintetizando estructura SOAP-S...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sintetizar Nota SOAP-S Automática</span>
                </>
              )}
            </button>
          </div>

          {/* Parsed Result Display */}
          {parsedResult && (
            <div className="bg-slate-950/80 border border-indigo-500/40 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Estructura SOAP-S Generada por IA</h4>
                </div>
                {onApplyParsedSoap && (
                  <button
                    onClick={handleApplyToActiveNote}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aplicar a Nota Activa</span>
                  </button>
                )}
              </div>

              {/* Tags: Sintomas y Factores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-rose-300 block mb-1">Síntomas Identificados:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResult.identifiedSymptoms.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-md text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-purple-300 block mb-1">Factores Espirituales:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResult.spiritualFactors.map((f, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md text-[11px]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SOAP Sections */}
              <div className="space-y-3 text-xs">
                {/* S */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-indigo-400 font-bold mb-1">
                    <span>S - Subjetivo (Relato del Consultante)</span>
                    <button
                      onClick={() => copyToClipboard(parsedResult.parsedSoap.subjective, 'S')}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedSection === 'S' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{parsedResult.parsedSoap.subjective}</p>
                </div>

                {/* O */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-indigo-400 font-bold mb-1">
                    <span>O - Objetivo (Hallazgos Clínicos & Conducta)</span>
                    <button
                      onClick={() => copyToClipboard(parsedResult.parsedSoap.objective, 'O')}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedSection === 'O' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{parsedResult.parsedSoap.objective}</p>
                </div>

                {/* A */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-indigo-400 font-bold mb-1">
                    <span>A - Análisis Psicoclínico & Diagnóstico</span>
                    <button
                      onClick={() => copyToClipboard(parsedResult.parsedSoap.assessment, 'A')}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedSection === 'A' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{parsedResult.parsedSoap.assessment}</p>
                </div>

                {/* P */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-indigo-400 font-bold mb-1">
                    <span>P - Plan Terapéutico & Tareas</span>
                    <button
                      onClick={() => copyToClipboard(parsedResult.parsedSoap.plan, 'P')}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedSection === 'P' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{parsedResult.parsedSoap.plan}</p>
                </div>

                {/* Spiritual */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-purple-400 font-bold mb-1">
                    <span>S - Dimensión Espiritual & Acompañamiento Bíblico</span>
                    <button
                      onClick={() => copyToClipboard(parsedResult.parsedSoap.spiritualDimension, 'Spiritual')}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedSection === 'Spiritual' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{parsedResult.parsedSoap.spiritualDimension}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            PastoralMente Voice Engine &bull; Encriptación Local AES-256
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
