/**
 * Tipos de datos para el módulo «Mi Nombre ante la Palabra»
 * Identidad, significado, reflexión bíblica y emblema personal.
 * PastoralMente SAS PREMIUM
 */

export type ReportDepth = 
  | 'completa'              // Exploración completa: Etimología, Bíblico, Familiar, Emblema y Síntesis
  | 'biblico'               // Enfoque bíblico: Etimología, Exégesis, Reflexión bíblica y Devocional
  | 'etimologico_heraldico'; // Enfoque etimológico y heráldico: Origen filológico, Contexto familiar y Emblema

export type ChristianTradition =
  | 'interdenominacional'
  | 'evangelica'
  | 'reformada'
  | 'catolica'
  | 'pentecostal';

export type EtymologyCertainty = 
  | 'documentada'          // Respaldada por fuentes académicas/históricas directas
  | 'hipotesis_filologica' // Reconstrucción lingüística probable
  | 'tradicion_popular'    // Asociación cultural sin sustento etimológico estricto
  | 'no_verificable';      // Sin datos concluyentes

export interface NameSearchRequest {
  firstName: string;
  middleName?: string;
  firstSurname: string;
  secondSurname?: string;
  countryOrRegion?: string;
  familyContext?: string; // Información aportada voluntariamente por el usuario
  depth: ReportDepth;
  tradition?: ChristianTradition;
}

export interface SectionAPresentation {
  submittedFullName: string;
  spellingVariants: string[];
  scopeAndLimitsNotice: string; // Aclaración obligatoria sobre los límites de la interpretación
}

export interface SectionBEtymology {
  nameAnalyzed: string;
  linguisticOrigin: string;
  traditionalMeaning: string;
  historicalVariants: string[];
  certaintyLevel: EtymologyCertainty;
  certaintyExplanation: string;
  consultableSources: string[];
}

export interface SectionCBiblicalReflection {
  hasBiblicalConnection: boolean;
  originalLanguageScript?: string; // Hebreo bíblico, arameo o griego koiné
  transliteration?: string;
  biblicalPassages: {
    reference: string;
    passageText: string;
    literaryAndHistoricalContext: string;
  }[];
  devotionalReflection: {
    coreTheme: string;
    narrative: string;
    identityAndPurposeMessage: string;
  };
  reflectionQuestions: [string, string, string];
  optionalPrayer: string;
  theologicalBoundaryNote: string;
}

export interface SectionDFamilyContext {
  providedContextText: string;
  criticalNotice: string; // "Esta información ha sido aportada por el usuario. No se deducen parentescos, ascendencia ni nobleza sin documentación probada."
  researchAdvice: string[];
}

export interface SectionEEmblem {
  conceptTheme: string; // Esperanza, Sabiduría, Servicio, Fe o Perseverancia
  symbolsDescription: string;
  colorPaletteExplanation: string;
  suggestedMotto: string;
  disclaimerNotice: string; // "Creación simbólica contemporánea. No es escudo heráldico histórico certificado ni prueba de linaje."
}

export interface SectionFSynthesis {
  summaryFindings: string;
  spiritualReflection: string;
  studyQuestionsForFamily: string[];
  verifiableSources: {
    title: string;
    authorOrInstitution: string;
    type: 'biblica' | 'academica' | 'onomastica' | 'archivo_historico';
    referenceUrlOrCite?: string;
  }[];
}

export interface CompleteNameReport {
  id: string;
  generatedAt: string;
  source: 'gemini-live' | 'local-engine';
  modelUsed?: string;
  request: NameSearchRequest;

  // Las 6 secciones requeridas:
  presentation: SectionAPresentation;        // A. Presentación del nombre
  etymology: SectionBEtymology;              // B. Exploración etimológica
  biblical: SectionCBiblicalReflection;      // C. Reflexión bíblica
  family: SectionDFamilyContext;             // D. Reflexión familiar opcional
  emblem: SectionEEmblem;                    // E. Emblema simbólico
  synthesis: SectionFSynthesis;              // F. Síntesis final
}

export interface ShieldPalette {
  id: string;
  name: string;
  field: string;      // Esmalte del campo principal
  accent: string;     // Metal / Oro o Plata
  secondary: string;  // Color secundario / forro
  textColor: string;
  borderStroke: string;
  symbolicMeaning: string;
}

export type ShieldChargeSymbol = 
  | 'cruz_flordelisada' 
  | 'leon_rampante' 
  | 'aguila_explayada' 
  | 'libro_abierto' 
  | 'rama_olivo' 
  | 'estrella_ocho_puntas' 
  | 'torre_almenada' 
  | 'ancla_esperanza';
