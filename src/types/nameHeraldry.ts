/**
 * Tipos de datos para el módulo «Mi Nombre ante la Palabra»
 * Identidad, significado, reflexión bíblica y emblema personal.
 * PastoralMente SAS PREMIUM
 */

export type ReportDepth = 
  | 'completa'              // Exploración completa: Etimología, Bíblico, Identidad, Emblema y Ficha
  | 'biblico'               // Enfoque bíblico: Etimología, Exégesis, Reflexión bíblica y Devocional
  | 'etimologico_heraldico'; // Enfoque etimológico y heráldico: Origen filológico, Identidad y Emblema

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

// Apartado A: Mi nombre
export interface SectionAPresentation {
  submittedFullName: string;
  linguisticOrigin: string;
  documentedMeaning: string;
  symbolicMeaning: string; // Interpretación simbólica, claramente diferenciada
  knownVariants: string[];
  certaintyLevel: EtymologyCertainty;
  certaintyExplanation: string;
  hasReliableInfo: boolean; // Indica cuando no exista información fiable suficiente
  scopeAndLimitsNotice: string; // Aclaración obligatoria sobre los límites de la interpretación
  consultableSources: string[];
}

// Apartado B: Mi nombre y la Biblia
export interface SectionBBiblicalReflection {
  thematicRelation: string; // Relaciones temáticas entre el nombre y conceptos bíblicos
  hasBiblicalConnection: boolean;
  originalLanguageScript?: string; // Hebreo bíblico, arameo o griego koiné
  transliteration?: string;
  biblicalPassages: {
    reference: string; // Libro, capítulo y versículo exacto
    passageText: string;
    literaryAndHistoricalContext: string;
  }[];
  pastoralReflection: string; // Reflexión pastoral respetuosa y personalizada
  reflectionQuestions: [string, string, string];
  optionalPrayer: string;
  theologicalBoundaryNote: string; // Aclara que coincidencia temática no demuestra origen bíblico
}

// Apartado C: Mi identidad y propósito
export interface SectionCIdentity {
  identityAndValues: string; // Identidad y valores fundamentales
  strengthsAndService: string; // Fortalezas, vocación de servicio y mayordomía
  openQuestions: [string, string, string]; // Preguntas abiertas para elaborar conclusiones propias
  pastoralOrientation: string; // Orientación basada en esperanza, responsabilidad y respeto
  ethicalScopeNotice: string; // No es profecía, revelación ni diagnóstico psicológico
}

// Contexto familiar aportado voluntariamente
export interface SectionDFamilyContext {
  providedContextText: string;
  criticalNotice: string; // "Información aportada por el usuario. No se deducen parentescos, ascendencia ni nobleza sin pruebas."
  researchAdvice: string[];
}

// Apartado D: Emblema simbólico personal
export interface SectionDEmblem {
  centralElement: string; // Elemento central
  complementarySymbols: string; // Símbolos complementarios
  colorsAndAssociations: string; // Colores y sus posibles asociaciones
  suggestedMotto: string; // Lema opcional
  elementsExplanation: string; // Explicación de cada elemento
  disclaimerNotice: string; // "Recurso creativo y reflexivo, no es escudo genealógico ni símbolo de autoridad."
}

// Apartado E: Informe final (Ficha organizada 1-9)
export interface SectionESummary {
  item1_AnalyzedName: string;
  item2_DocumentedOriginAndMeaning: string;
  item3_SymbolicInterpretation: string;
  item4_BiblicalPassagesAndContext: string;
  item5_PersonalReflection: string;
  item6_MeditationQuestions: string[];
  item7_OptionalPrayer: string;
  item8_EmblemProposal: string;
  item9_ConsultableSources: {
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

  // Apartados oficiales solicitados:
  sectionA_Name: SectionAPresentation;
  sectionB_Bible: SectionBBiblicalReflection;
  sectionC_Identity: SectionCIdentity;
  sectionD_Emblem: SectionDEmblem;
  sectionE_Summary: SectionESummary;
  familyContextSection?: SectionDFamilyContext;
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
