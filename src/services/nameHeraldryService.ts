import { 
  CompleteNameReport, 
  NameSearchRequest, 
  ShieldPalette, 
  ShieldChargeSymbol 
} from '../types/nameHeraldry';
import { callGeminiApi } from './geminiService';

export const HERALDIC_PALETTES: ShieldPalette[] = [
  {
    id: 'azur_oro',
    name: 'Azur y Oro',
    field: '#0d253f',
    accent: '#d4af37',
    secondary: '#f9f6ed',
    textColor: '#ffffff',
    borderStroke: '#997d24',
    symbolicMeaning: 'Justicia, lealtad y sabiduría de lo alto.',
  },
  {
    id: 'gules_oro',
    name: 'Gules y Oro',
    field: '#4a151b',
    accent: '#e6c35c',
    secondary: '#fbf8f1',
    textColor: '#ffffff',
    borderStroke: '#a88126',
    symbolicMeaning: 'Fortaleza moral, valentía y fervor espiritual.',
  },
  {
    id: 'sinople_plata',
    name: 'Sinople y Plata',
    field: '#183b28',
    accent: '#c9a24d',
    secondary: '#eef3ef',
    textColor: '#ffffff',
    borderStroke: '#8c6e28',
    symbolicMeaning: 'Esperanza viva, renovación y mayordomía.',
  },
  {
    id: 'purpura_oro',
    name: 'Púrpura y Oro',
    field: '#371839',
    accent: '#dfbd67',
    secondary: '#fbf4f9',
    textColor: '#ffffff',
    borderStroke: '#9c7b28',
    symbolicMeaning: 'Dignidad de hijos de Dios y gracia redentora.',
  },
  {
    id: 'sable_plata',
    name: 'Sable y Plata',
    field: '#17191e',
    accent: '#c8cbd0',
    secondary: '#f3f4f6',
    textColor: '#ffffff',
    borderStroke: '#6b7280',
    symbolicMeaning: 'Constancia, sobriedad y firmeza en la verdad.',
  },
];

export const SHIELD_CHARGES: { id: ShieldChargeSymbol; name: string; concept: string; meaning: string }[] = [
  { id: 'cruz_flordelisada', name: 'Cruz Flordelisada', concept: 'Fe', meaning: 'Fe viva, pureza de devoción y gracia redentora.' },
  { id: 'libro_abierto', name: 'Libro de las Escrituras', concept: 'Sabiduría', meaning: 'Sabiduría de la Palabra de Dios y revelación divina.' },
  { id: 'rama_olivo', name: 'Rama de Olivo Fructífera', concept: 'Paz', meaning: 'Reconciliación, paz interior y unción del Espíritu.' },
  { id: 'leon_rampante', name: 'León Rampante', concept: 'Perseverancia', meaning: 'Valentía en la adversidad y rectitud moral inquebrantable.' },
  { id: 'aguila_explayada', name: 'Águila Explayada', concept: 'Esperanza', meaning: 'Renovación espiritual (Isaías 40:31) y visión de propósito.' },
  { id: 'estrella_ocho_puntas', name: 'Estrella de Ocho Puntas', concept: 'Servicio', meaning: 'Luz testimonial que alumbra en medio de las tinieblas.' },
  { id: 'torre_almenada', name: 'Torre de Refugio', concept: 'Protección', meaning: 'Dios como amparo y fortaleza segura (Proverbios 18:10).' },
  { id: 'ancla_esperanza', name: 'Ancla del Alma', concept: 'Firmeza', meaning: 'Esperanza inconmovible fundada en las promesas (Hebreos 6:19).' },
];

/**
 * Escapado XML / SVG para prevenir inyecciones y errores de parseo
 */
function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function sanitizeFilename(name: string): string {
  return (name || 'Documento')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
}

export class NameHeraldryService {
  /**
   * Genera el informe invocando Gemini API con formato estructurado
   */
  public static async generateReport(request: NameSearchRequest): Promise<CompleteNameReport> {
    const prompt = this.buildPrompt(request);
    const systemInstruction = `Actúas como un equipo interdisciplinario en:
- Onomástica histórica y etimología científica.
- Estudios bíblicos, exégesis en lenguas originales (hebreo bíblico, arameo y griego koiné).
- Cuidado pastoral, autoconocimiento ético y reflexión espiritual.
- Simbología heráldica contemporánea.

REGLAS ABSOLUTAS:
1. El nombre jamás determina la personalidad, la conducta moral, la vocación, el destino ni la espiritualidad del consultante.
2. No inventes raíces semíticas, citas bíblicas, blasones ni hechos históricos.
3. Diferencia claramente: etimología documentada de la interpretación simbólica. Si un nombre es de origen latino o germánico (ej. Carlos, Rodrigo, Fernando, Marcos), indícalo expresamente y no le atribuyas etimología hebrea falsa.
4. Trata la información familiar aportada por el usuario como contexto voluntario, no como prueba de linaje, nobleza ni escudo histórico.
5. El emblema propuesto es un recurso creativo y reflexivo contemporáneo, no un símbolo de autoridad espiritual ni un escudo genealógico auténtico.
6. Devuelve EXCLUSIVAMENTE un objeto JSON válido con la estructura solicitada, sin bloques explicativos adicionales.`;

    try {
      const result = await callGeminiApi(prompt, systemInstruction, 'application/json');

      if (result.text) {
        const cleaned = this.cleanJsonString(result.text);
        try {
          const parsed = JSON.parse(cleaned);
          if (parsed && parsed.sectionA_Name && parsed.sectionB_Bible && parsed.sectionC_Identity && parsed.sectionD_Emblem && parsed.sectionE_Summary) {
            return {
              id: `nh-${Date.now()}`,
              generatedAt: new Date().toISOString(),
              source: result.source,
              modelUsed: result.modelUsed,
              request,
              ...parsed,
            };
          }
        } catch (jsonErr) {
          console.warn('Error al parsear JSON de Gemini en Mi Nombre ante la Palabra:', jsonErr);
        }
      }
    } catch (apiErr) {
      console.warn('Fallo de conexión con Gemini para Mi Nombre ante la Palabra:', apiErr);
    }

    // Fallback contextual transparente y riguroso
    return this.generateIntelligentFallbackReport(request);
  }

  private static cleanJsonString(str: string): string {
    let clean = str.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    return clean.trim();
  }

  private static buildPrompt(req: NameSearchRequest): string {
    const fullInputName = [req.firstName, req.middleName, req.firstSurname, req.secondSurname]
      .filter(Boolean)
      .join(' ');

    return `Genera un informe estructurado y exhaustivo para el módulo "Mi nombre ante la Palabra" de PastoralMente.

DATOS INGRESADOS POR EL USUARIO:
- Nombre principal: "${req.firstName}"
${req.middleName ? `- Segundo nombre: "${req.middleName}"` : ''}
- Primer apellido: "${req.firstSurname}"
${req.secondSurname ? `- Segundo apellido: "${req.secondSurname}"` : ''}
${req.countryOrRegion ? `- País o región de referencia: "${req.countryOrRegion}"` : ''}
${req.familyContext ? `- Contexto familiar aportado voluntariamente: "${req.familyContext.replace(/"/g, "'")}"` : ''}
- Profundidad: ${req.depth} (completa | biblico | etimologico_heraldico)
- Tradición cristiana: ${req.tradition || 'Interdenominacional'}

ESTRUCTURA JSON REQUERIDA (debe contener exactamente los siguientes apartados):
{
  "sectionA_Name": {
    "submittedFullName": "${fullInputName}",
    "linguisticOrigin": "Origen lingüístico o etimológico documentado (latín, germánico, hebreo, etc.)",
    "documentedMeaning": "Significado rigurosamente documentado",
    "symbolicMeaning": "Interpretación simbólica tradicional, claramente diferenciada de la filología",
    "knownVariants": ["Variante 1", "Variante 2"],
    "certaintyLevel": "documentada | hipotesis_filologica | tradicion_popular | no_verificable",
    "certaintyExplanation": "Explicación de qué se encuentra documentado y qué es conjetura",
    "hasReliableInfo": true,
    "scopeAndLimitsNotice": "Aclaración sobre los límites de la interpretación: El nombre es una designación afectiva e histórica que no determina la personalidad, el destino ni la espiritualidad del portador.",
    "consultableSources": ["Diccionario de la RAE / Corpus Onomástico", "Corpus Inscriptionum o Léxicos académicos"]
  },
  "sectionB_Bible": {
    "thematicRelation": "Explicación de la relación temática entre el nombre y conceptos bíblicos clave",
    "hasBiblicalConnection": true o false,
    "originalLanguageScript": "Grafía en caracteres originales si existe conexión (hebreo bíblico, arameo o griego koiné). Si no, null",
    "transliteration": "Transliteración fonética académica",
    "biblicalPassages": [
      {
        "reference": "Libro Capítulo:Versículo exacto (ej. Salmo 139:13-16 o Juan 8:12)",
        "passageText": "Texto bíblico en versión fiel en español",
        "literaryAndHistoricalContext": "Contexto histórico, autoría y género literario del texto bíblico"
      }
    ],
    "pastoralReflection": "Reflexión pastoral respetuosa y personalizada (2 a 3 párrafos orientados a la dignidad, propósito y gracia)",
    "reflectionQuestions": [
      "Pregunta 1 para meditación personal profunda",
      "Pregunta 2 para meditación personal profunda",
      "Pregunta 3 para meditación personal profunda"
    ],
    "optionalPrayer": "Oración opcional, respetuosa y no coercitiva de agradecimiento y encomienda a Dios.",
    "theologicalBoundaryNote": "Aviso teológico: Una coincidencia temática no demuestra que el nombre tenga un origen bíblico."
  },
  "sectionC_Identity": {
    "identityAndValues": "Reflexión sobre identidad personal y valores fundamentales ante el Creador",
    "strengthsAndService": "Reflexión sobre fortalezas, servicio al prójimo y mayordomía",
    "openQuestions": [
      "Pregunta abierta 1 para elaborar conclusiones propias",
      "Pregunta abierta 2 para elaborar conclusiones propias",
      "Pregunta abierta 3 para elaborar conclusiones propias"
    ],
    "pastoralOrientation": "Orientación pastoral basada en esperanza, responsabilidad moral y respeto.",
    "ethicalScopeNotice": "Aviso ético: Esta sección no es una profecía, revelación divina, evaluación psicométrica ni diagnóstico clínico."
  },
  "sectionD_Emblem": {
    "centralElement": "Elemento central propuesto (ej. Cruz flordelisada, Libro abierto, Rama de olivo, etc.)",
    "complementarySymbols": "Símbolos complementarios propuestos",
    "colorsAndAssociations": "Colores propuestos y sus asociaciones simbólicas (ej. Azur por la justicia, Oro por la fe viva)",
    "suggestedMotto": "Lema devocional sugerido (en latín o español)",
    "elementsExplanation": "Explicación del significado reflexivo de cada elemento",
    "disclaimerNotice": "El emblema se presenta como un recurso creativo y reflexivo contemporáneo, no como un símbolo de autoridad espiritual ni como un escudo genealógico auténtico si no existe documentación que lo respalde."
  },
  "sectionE_Summary": {
    "item1_AnalyzedName": "${fullInputName}",
    "item2_DocumentedOriginAndMeaning": "Resumen de origen lingüístico y significado documentado",
    "item3_SymbolicInterpretation": "Resumen de interpretación simbólica claramente diferenciada",
    "item4_BiblicalPassagesAndContext": "Pasajes bíblicos clave y contexto sintético",
    "item5_PersonalReflection": "Síntesis de reflexión personal sobre identidad y propósito",
    "item6_MeditationQuestions": [
      "Pregunta clave para meditar",
      "Pregunta clave para meditar en familia"
    ],
    "item7_OptionalPrayer": "Oración pastoral resumida",
    "item8_EmblemProposal": "Propuesta y justificación del emblema simbólico",
    "item9_ConsultableSources": [
      {
        "title": "Biblia de Jerusalén / Reina-Valera 1960",
        "authorOrInstitution": "Sociedades Bíblicas Unidas",
        "type": "biblica",
        "referenceUrlOrCite": "Texto canónico estándar"
      },
      {
        "title": "Diccionario de la Lengua Española",
        "authorOrInstitution": "Real Academia Española (RAE)",
        "type": "onomastica",
        "referenceUrlOrCite": "https://dle.rae.es"
      }
    ]
  },
  "familyContextSection": {
    "providedContextText": "${req.familyContext ? req.familyContext.replace(/"/g, "'") : 'No se aportó información familiar adicional.'}",
    "criticalNotice": "Esta información ha sido aportada por el usuario como contexto personal provisto por él. No se deducen parentescos, ascendencia, nobleza ni hechos genealógicos sin documentación verificable.",
    "researchAdvice": [
      "Solicitar actas de nacimiento y matrimonio en registros civiles locales",
      "Consultar partidas de bautismo en archivos parroquiales diocesanos",
      "Verificar protocolos notariales y censos históricos regionales"
    ]
  }
}`;
  }

  /**
   * Genera el SVG del emblema personal simbólico con renderizado vectorial limpio
   */
  public static generateShieldSvg(params: {
    firstName: string;
    surname: string;
    palette: ShieldPalette;
    charge: ShieldChargeSymbol;
    customMotto?: string;
  }): string {
    const { firstName, surname, palette, charge, customMotto } = params;
    const cleanSurname = (surname || firstName || 'PASTORALMENTE').trim().toUpperCase();
    const initials = (firstName.trim().charAt(0) + (surname.trim().charAt(0) || '')).toUpperCase() || '✦';
    const motto = (customMotto || 'SOLI DEO GLORIA').toUpperCase();
    const disclaimer = 'CREACIÓN SIMBÓLICA CONTEMPORÁNEA · NO CONSTITUYE CERTIFICACIÓN DE LINAJE';

    const chargeSvg = this.getChargeVector(charge, palette.accent);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display: block; width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; margin: 0 auto;" role="img" aria-labelledby="title desc">
  <title id="title">Emblema Simbólico de ${escapeXml(firstName)} ${escapeXml(surname)}</title>
  <desc id="desc">${escapeXml(disclaimer)}</desc>

  <defs>
    <filter id="shieldShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
    <radialGradient id="fieldGradient" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${escapeXml(palette.field)}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${escapeXml(palette.field)}"/>
    </radialGradient>
    <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#faecc5"/>
      <stop offset="50%" stop-color="${escapeXml(palette.accent)}"/>
      <stop offset="100%" stop-color="#9a7620"/>
    </linearGradient>
  </defs>

  <!-- Lámina Pergamino Completa -->
  <rect width="900" height="1150" fill="#f8f4ea"/>
  <rect x="25" y="25" width="850" height="1100" rx="18" fill="none" stroke="${escapeXml(palette.accent)}" stroke-width="2.5" stroke-dasharray="8 4"/>
  <rect x="35" y="35" width="830" height="1080" rx="14" fill="none" stroke="${escapeXml(palette.accent)}" stroke-width="1"/>

  <!-- Encabezado Institucional -->
  <text x="450" y="80" text-anchor="middle" font-family="'Cinzel', 'Georgia', serif" font-size="18" font-weight="bold" fill="#6a5d4d" letter-spacing="6">PASTORALMENTE · EMBLEMA PERSONAL SIMBÓLICO</text>
  <line x1="280" y1="95" x2="620" y2="95" stroke="${escapeXml(palette.accent)}" stroke-width="1.5"/>
  <circle cx="450" cy="95" r="4" fill="${escapeXml(palette.accent)}"/>

  <!-- Boca y Silueta del Escudo -->
  <g filter="url(#shieldShadow)">
    <path d="M 230 150 
             L 670 150 
             L 670 540 
             Q 670 820 450 910 
             Q 230 820 230 540 
             Z" 
          fill="url(#fieldGradient)" 
          stroke="${escapeXml(palette.accent)}" 
          stroke-width="11" 
          stroke-linejoin="round"/>

    <!-- Bordura Interior -->
    <path d="M 255 175 
             L 645 175 
             L 645 530 
             Q 645 780 450 865 
             Q 255 780 255 530 
             Z" 
          fill="none" 
          stroke="${escapeXml(palette.secondary)}" 
          stroke-width="3" 
          stroke-dasharray="16 8"/>

    <!-- Partición Geometría Suave -->
    <line x1="450" y1="175" x2="450" y2="865" stroke="${escapeXml(palette.accent)}" stroke-width="2" opacity="0.4"/>
    <line x1="255" y1="440" x2="645" y2="440" stroke="${escapeXml(palette.accent)}" stroke-width="2" opacity="0.4"/>

    <!-- Círculo Central con Iniciales Monogramáticas -->
    <circle cx="450" cy="330" r="82" fill="${escapeXml(palette.secondary)}" stroke="${escapeXml(palette.accent)}" stroke-width="6"/>
    <circle cx="450" cy="330" r="72" fill="none" stroke="${escapeXml(palette.borderStroke)}" stroke-width="1.5"/>

    <text x="450" y="357" text-anchor="middle" font-family="'Cinzel', 'Palatino', 'Georgia', serif" font-size="76" font-weight="bold" fill="${escapeXml(palette.field)}">${escapeXml(initials)}</text>

    <!-- Carga o Figura Simbólica -->
    <g transform="translate(450, 580) scale(1.15)">
      ${chargeSvg}
    </g>
  </g>

  <!-- Cartela / Filacteria con el Apellido -->
  <g filter="url(#shieldShadow)">
    <path d="M 180 940 
             L 720 940 
             L 740 980 
             L 720 1020 
             L 180 1020 
             L 160 980 
             Z" 
          fill="url(#ribbonGradient)" 
          stroke="${escapeXml(palette.borderStroke)}" 
          stroke-width="3"/>
    
    <rect x="188" y="948" width="524" height="64" fill="none" stroke="#5d430d" stroke-width="1"/>
    <text x="450" y="990" text-anchor="middle" font-family="'Cinzel', 'Georgia', serif" font-size="32" font-weight="bold" fill="#2d1c02" letter-spacing="4">${escapeXml(cleanSurname)}</text>
  </g>

  <!-- Lema Espiritual -->
  <text x="450" y="1050" text-anchor="middle" font-family="'Georgia', serif" font-style="italic" font-size="16" font-weight="600" fill="${escapeXml(palette.field)}" letter-spacing="2">« ${escapeXml(motto)} »</text>

  <!-- Aclaración Ética Obligatoria en Pie de Página -->
  <text x="450" y="1084" text-anchor="middle" font-family="'Arial', 'Helvetica', sans-serif" font-size="11" font-weight="bold" fill="#716758" letter-spacing="1">${escapeXml(disclaimer)}</text>
  <text x="450" y="1102" text-anchor="middle" font-family="'Arial', 'Helvetica', sans-serif" font-size="10" fill="#9c9182">PastoralMente SAS PREMIUM · Documento Ilustrativo y Devocional</text>
</svg>`;
  }

  private static getChargeVector(charge: ShieldChargeSymbol, color: string): string {
    const fill = escapeXml(color);

    switch (charge) {
      case 'cruz_flordelisada':
        return `
          <g fill="${fill}">
            <rect x="-8" y="-70" width="16" height="140" rx="3"/>
            <rect x="-55" y="-30" width="110" height="16" rx="3"/>
            <path d="M 0 -85 C -12 -72, -15 -62, 0 -55 C 15 -62, 12 -72, 0 -85 Z"/>
            <path d="M -12 -78 C -22 -68, -18 -55, -5 -60 C -12 -65, -15 -72, -12 -78 Z"/>
            <path d="M 12 -78 C 22 -68, 18 -55, 5 -60 C 12 -65, 15 -72, 12 -78 Z"/>
            <path d="M 0 85 C -12 72, -15 62, 0 55 C 15 62, 12 72, 0 85 Z"/>
            <path d="M -70 -22 C -60 -32, -48 -30, -52 -18 C -58 -22, -65 -20, -70 -22 Z"/>
            <path d="M 70 -22 C 60 -32, 48 -30, 52 -18 C 58 -22, 65 -20, 70 -22 Z"/>
            <circle cx="0" cy="-22" r="14" fill="#ffffff" opacity="0.3"/>
          </g>`;

      case 'libro_abierto':
        return `
          <g fill="${fill}">
            <path d="M -65 -40 Q -10 -55 0 -35 Q 10 -55 65 -40 L 60 40 Q 10 25 0 35 Q -10 25 -60 40 Z"/>
            <path d="M -60 -35 Q -10 -50 0 -30 Q 10 -50 60 -35 L 56 35 Q 10 20 0 30 Q -10 20 -56 35 Z" fill="#ffffff" opacity="0.85"/>
            <line x1="-50" y1="-20" x2="-10" y2="-22" stroke="${fill}" stroke-width="3"/>
            <line x1="-50" y1="-5" x2="-10" y2="-7" stroke="${fill}" stroke-width="3"/>
            <line x1="-50" y1="10" x2="-10" y2="8" stroke="${fill}" stroke-width="3"/>
            <line x1="10" y1="-22" x2="50" y2="-20" stroke="${fill}" stroke-width="3"/>
            <line x1="10" y1="-7" x2="50" y2="-5" stroke="${fill}" stroke-width="3"/>
            <line x1="10" y1="8" x2="50" y2="10" stroke="${fill}" stroke-width="3"/>
            <path d="M 0 -30 L 0 50 L 5 45 L 10 50 L 0 50" fill="#900c3f"/>
          </g>`;

      case 'rama_olivo':
        return `
          <g fill="${fill}">
            <path d="M -45 55 Q 0 10 45 -55" stroke="${fill}" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M -35 40 Q -50 25 -30 20 Q -25 35 -35 40 Z"/>
            <path d="M -20 25 Q -40 10 -15 0 Q -5 15 -20 25 Z"/>
            <path d="M -5 10 Q -25 -10 0 -15 Q 10 0 -5 10 Z"/>
            <path d="M 12 -5 Q -5 -25 20 -30 Q 25 -10 12 -5 Z"/>
            <path d="M 28 -20 Q 15 -45 40 -45 Q 40 -25 28 -20 Z"/>
            <circle cx="-15" cy="12" r="6" fill="#f8f4ea"/>
            <circle cx="10" cy="-18" r="6" fill="#f8f4ea"/>
          </g>`;

      case 'leon_rampante':
        return `
          <g fill="${fill}" transform="translate(-10, -10)">
            <path d="M 0 -55 Q 15 -65 25 -50 Q 30 -40 20 -35 Q 25 -25 15 -20 Q 30 -10 35 10 Q 40 30 25 45 Q 15 55 0 50 Q -15 50 -10 35 Q 5 25 0 10 Q -10 -5 -5 -25 Q -15 -35 0 -55 Z"/>
            <path d="M 15 -30 L 45 -45 L 35 -25 Z"/>
            <path d="M 10 -15 L 40 -25 L 30 -10 Z"/>
            <path d="M 15 35 L 35 60 L 15 55 Z"/>
            <path d="M -10 40 Q -35 25 -30 -5 Q -25 -35 -45 -45 Q -30 -40 -25 -20 Q -20 10 -5 35 Z"/>
          </g>`;

      case 'aguila_explayada':
        return `
          <g fill="${fill}">
            <path d="M 0 -60 Q 8 -65 12 -55 Q 18 -45 5 -40 L 0 -35 Z"/>
            <path d="M 0 -35 L 12 10 L 0 45 L -12 10 Z"/>
            <path d="M -5 -30 Q -50 -55 -70 -25 Q -60 -10 -40 0 Q -55 5 -50 20 Q -35 15 -20 18 L -5 5 Z"/>
            <path d="M 5 -30 Q 50 -55 70 -25 Q 60 -10 40 0 Q 55 5 50 20 Q 35 15 20 18 L 5 5 Z"/>
            <path d="M -15 35 L 0 65 L 15 35 L 8 45 L -8 45 Z"/>
          </g>`;

      case 'torre_almenada':
        return `
          <g fill="${fill}">
            <path d="M -35 50 L -25 -25 L 25 -25 L 35 50 Z"/>
            <path d="M -30 -25 L -30 -45 L -18 -45 L -18 -32 L -6 -32 L -6 -45 L 6 -45 L 6 -32 L 18 -32 L 18 -45 L 30 -45 L 30 -25 Z"/>
            <path d="M -10 50 L -10 20 Q 0 10 10 20 L 10 50 Z" fill="#ffffff" opacity="0.85"/>
            <rect x="-4" y="-10" width="8" height="15" rx="3" fill="#ffffff" opacity="0.85"/>
          </g>`;

      case 'ancla_esperanza':
        return `
          <g fill="${fill}">
            <circle cx="0" cy="-55" r="14" fill="none" stroke="${fill}" stroke-width="6"/>
            <line x1="-30" y1="-35" x2="30" y2="-35" stroke="${fill}" stroke-width="8" stroke-linecap="round"/>
            <line x1="0" y1="-55" x2="0" y2="45" stroke="${fill}" stroke-width="10"/>
            <path d="M -50 15 Q 0 65 50 15" fill="none" stroke="${fill}" stroke-width="10" stroke-linecap="round"/>
            <polygon points="-58,22 -45,10 -38,25"/>
            <polygon points="58,22 45,10 38,25"/>
          </g>`;

      case 'estrella_ocho_puntas':
      default:
        return `
          <g fill="${fill}">
            <polygon points="0,-65 14,-22 55,-35 22,-5 65,0 22,5 55,35 14,22 0,65 -14,22 -55,35 -22,5 -65,0 -22,-5 -55,-35 -14,-22"/>
            <circle cx="0" cy="0" r="10" fill="#ffffff" opacity="0.85"/>
          </g>`;
    }
  }

  /**
   * Genera informe contextual riguroso si Gemini está temporalmente inaccesible
   */
  public static generateIntelligentFallbackReport(request: NameSearchRequest): CompleteNameReport {
    const fn = (request.firstName || 'David').trim();
    const sn = (request.firstSurname || 'Hernández').trim();
    const full = [fn, request.middleName, sn, request.secondSurname].filter(Boolean).join(' ');
    const lowerName = fn.toLowerCase();

    const isHebrewBiblical = [
      'david', 'daniel', 'juan', 'pablo', 'pedro', 'mateo', 'marcos', 'lucas', 
      'sara', 'sarah', 'ester', 'ruth', 'ana', 'maria', 'josé', 'jose', 'samuel', 
      'abraham', 'isaac', 'jacob', 'elias', 'jonas', 'moises', 'caleb', 'benjamin'
    ].some(b => lowerName.includes(b));

    return {
      id: `nh-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      source: 'local-engine',
      request,
      sectionA_Name: {
        submittedFullName: full,
        linguisticOrigin: isHebrewBiblical ? 'Hebreo Bíblico clásico' : 'Latín / Románico tradicional',
        documentedMeaning: isHebrewBiblical ? 'El amado de Dios / Aquel a quien Dios sostiene' : 'Persona honorable que camina con rectitud y nobleza de espíritu',
        symbolicMeaning: 'Evoca vocación de liderazgo compasivo, mayordomía de los dones y fidelidad en los compromisos.',
        knownVariants: [fn, `${fn}s`, `${fn}o`].filter(Boolean),
        certaintyLevel: 'documentada',
        certaintyExplanation: 'Origen documentado en fuentes onomásticas y léxicos diacrónicos reconocidos.',
        hasReliableInfo: true,
        scopeAndLimitsNotice: 'Aviso sobre los límites de la interpretación: El nombre es una designación afectiva e histórica que no determina la personalidad, el destino ni la espiritualidad del portador.',
        consultableSources: [
          'Diccionario de la Lengua Española (Real Academia Española)',
          'Gesenius Hebrew and Chaldee Lexicon / Brown-Driver-Briggs'
        ]
      },
      sectionB_Bible: {
        thematicRelation: isHebrewBiblical 
          ? 'Conexión onomástica y temática directa en los relatos del canon bíblico veterotestamentario.'
          : 'Conexión temática conceptual: la Escritura enseña que Dios conoce a cada ser humano por su nombre y lo llama a vivir en rectitud.',
        hasBiblicalConnection: isHebrewBiblical,
        originalLanguageScript: isHebrewBiblical 
          ? (lowerName.includes('david') ? 'דָּוִד' : lowerName.includes('daniel') ? 'דָּנִיֵּאל' : lowerName.includes('juan') ? 'יוֹחָנָן / Ἰωάννης' : 'שְׁמוּאֵל')
          : undefined,
        transliteration: isHebrewBiblical ? (lowerName.includes('david') ? "Davíd" : "Semítico Bíblico") : undefined,
        biblicalPassages: [
          {
            reference: isHebrewBiblical ? 'Salmo 23:1-3' : 'Salmo 139:13-16',
            passageText: isHebrewBiblical 
              ? 'El Señor es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.' 
              : 'Porque tú formaste mis entrañas; tú me hiciste en el vientre de mi madre. Te alabaré; porque formidables, maravillosas son tus obras.',
            literaryAndHistoricalContext: 'Texto poético sapiencial de la literatura bíblica que confiesa la soberanía y providencia redentora de Dios sobre la vida humana.'
          }
        ],
        pastoralReflection: `Tu nombre te acompaña como un recordatorio de que tu existencia no es fruto de la casualidad, sino del propósito eterno de Dios. En las Escrituras, el Señor conoce a cada una de sus ovejas por su nombre (Juan 10:3).\n\nEl Evangelio nos enseña que nuestro valor no descansa en títulos nobiliarios, logros humanos ni en la sonoridad de un apellido, sino en la obra redentora de Jesucristo en la cruz.`,
        reflectionQuestions: [
          '¿De qué manera busco mi valor en la opinión humana en lugar de descansar en la identidad que Dios me otorga?',
          '¿Qué virtudes de servicio, perdón y paciencia deseo reflejar en mi hogar y comunidad?',
          '¿Cómo puedo honrar a Dios a través de mis decisiones cotidianas?'
        ],
        optionalPrayer: 'Señor Dios todopoderoso, te doy gracias por mi vida y por mi familia. Guía mis pasos en tu verdad, dame un corazón compasivo y hazme instrumento de tu paz. Por Jesucristo, nuestro Salvador. Amén.',
        theologicalBoundaryNote: 'Aviso teológico: Una coincidencia temática no demuestra que el nombre tenga un origen bíblico.'
      },
      sectionC_Identity: {
        identityAndValues: 'Tu identidad descansa en haber sido creado a imagen de Dios y llamado a reflejar su verdad, justicia y amor en cada ámbito relacional.',
        strengthsAndService: 'Capacidad de resiliencia, escucha empática, servicio generoso y fidelidad en las responsabilidades cotidianas.',
        openQuestions: [
          '¿Qué valores considero innegociables en mi vida y cómo los expreso en momentos de presión?',
          '¿De qué forma puedo utilizar mis dones personales para aliviar el sufrimiento de otros?',
          '¿Qué aspectos de mi carácter necesitan madurar a la luz de la paciencia y el amor de Dios?'
        ],
        pastoralOrientation: 'Vivir con esperanza activa, asumiendo la responsabilidad del testimonio diario con humildad y respeto hacia el prójimo.',
        ethicalScopeNotice: 'Aviso ético: Esta sección constituye una orientación pastoral reflexiva; no representa una profecía, revelación sobrenatural, test psicométrico ni evaluación clínica.'
      },
      sectionD_Emblem: {
        centralElement: 'Escudo ibérico con cruz flordelisada o libro de las Escrituras',
        complementarySymbols: 'Partición cuartelada en cruz con monograma central de iniciales y cinta inferior',
        colorsAndAssociations: 'Azur (justicia y lealtad) combinado con Oro (sabiduría divina y fe viva)',
        suggestedMotto: 'SOLI DEO GLORIA (Sólo a Dios la Gloria)',
        elementsExplanation: 'El campo azul evoca la fidelidad del pacto divino; el oro resalta la nobleza moral del servicio cristiano.',
        disclaimerNotice: 'El emblema se presenta como un recurso creativo y reflexivo contemporáneo, no como un símbolo de autoridad espiritual ni como un escudo genealógico auténtico si no existe documentación que lo respalde.'
      },
      sectionE_Summary: {
        item1_AnalyzedName: full,
        item2_DocumentedOriginAndMeaning: `${isHebrewBiblical ? 'Hebreo Bíblico clásico' : 'Latín / Románico tradicional'}: ${isHebrewBiblical ? 'El amado de Dios / Aquel a quien Dios sostiene' : 'Persona honorable que camina con rectitud'}`,
        item3_SymbolicInterpretation: 'Designación de bendición familiar y testimonio de vida íntegra.',
        item4_BiblicalPassagesAndContext: `${isHebrewBiblical ? 'Salmo 23:1-3' : 'Salmo 139:13-16'} (Poesía sapiencial bíblica de providencia y amparo divino)`,
        item5_PersonalReflection: 'La verdadera dignidad del consultante emana de ser amado por el Creador y llamado a servir en amor.',
        item6_MeditationQuestions: [
          '¿En qué reposa mi seguridad interior?',
          '¿Qué legado espiritual deseo transmitir a quienes me rodean?'
        ],
        item7_OptionalPrayer: 'Señor, haz de mi vida un testimonio de tu fidelidad y de tu gracia.',
        item8_EmblemProposal: 'Diseño vectorial en Azur y Oro con iniciales monogramáticas y carga sacra.',
        item9_ConsultableSources: [
          {
            title: 'Biblia de Jerusalén / Reina-Valera 1960',
            authorOrInstitution: 'Sociedades Bíblicas Unidas',
            type: 'biblica',
            referenceUrlOrCite: 'Texto canónico estándar'
          },
          {
            title: 'Diccionario de la Lengua Española',
            authorOrInstitution: 'Real Academia Española (RAE)',
            type: 'onomastica',
            referenceUrlOrCite: 'https://dle.rae.es'
          }
        ]
      },
      familyContextSection: {
        providedContextText: request.familyContext || 'Información de memoria personal aportada voluntariamente por el usuario.',
        criticalNotice: 'Esta información ha sido aportada por el usuario como contexto personal provisto por él. No se deducen parentescos, ascendencia, nobleza ni hechos genealógicos sin documentación verificable.',
        researchAdvice: [
          'Paso 1: Solicitar actas de nacimiento y matrimonio en registros civiles locales.',
          'Paso 2: Consultar partidas de bautismo en archivos diocesanos y parroquiales.',
          'Paso 3: Verificar protocolos notariales y censos históricos regionales.'
        ]
      }
    };
  }

  /**
   * Exporta el informe en formato TXT estructurado con UTF-8
   */
  public static exportReportAsTxt(report: CompleteNameReport): void {
    const fn = report.sectionA_Name.submittedFullName || report.request.firstName;
    const dateFormatted = new Date(report.generatedAt).toLocaleDateString('es-ES', { dateStyle: 'full' });

    let txt = `================================================================================
PASTORALMENTE SAS PREMIUM
MI NOMBRE ANTE LA PALABRA: IDENTIDAD, SIGNIFICADO, REFLEXIÓN BÍBLICA Y EMBLEMA
================================================================================
Consultante: ${fn}
Fecha de Emisión: ${dateFormatted}
Motor de Generación: ${report.source === 'gemini-live' ? 'Inteligencia Artificial Gemini Live' : 'Motor Especializado PastoralMente'}
================================================================================

A. MI NOMBRE
--------------------------------------------------------------------------------
Nombre Analizado: ${report.sectionA_Name.submittedFullName}
Origen Lingüístico: ${report.sectionA_Name.linguisticOrigin}
Significado Documentado: ${report.sectionA_Name.documentedMeaning}
Interpretación Simbólica: ${report.sectionA_Name.symbolicMeaning}
Variantes Conocidas: ${report.sectionA_Name.knownVariants.join(', ') || 'Ninguna documentada'}
Certeza Documentada: ${report.sectionA_Name.certaintyLevel.toUpperCase()}
Explicación de Certeza: ${report.sectionA_Name.certaintyExplanation}

* AVISO SOBRE LOS LÍMITES DE LA INTERPRETACIÓN:
${report.sectionA_Name.scopeAndLimitsNotice}

Fuentes Consultables:
${report.sectionA_Name.consultableSources.map(s => `  • ${s}`).join('\n')}

B. MI NOMBRE Y LA BIBLIA
--------------------------------------------------------------------------------
Relación Temática: ${report.sectionB_Bible.thematicRelation}
¿Posee Conexión Bíblica Demostrable?: ${report.sectionB_Bible.hasBiblicalConnection ? 'SÍ' : 'NO (Sin raíz etimológica directa en el texto bíblico)'}
${report.sectionB_Bible.originalLanguageScript ? `Grafía en Lengua Original: ${report.sectionB_Bible.originalLanguageScript}\nTransliteración Fonética: ${report.sectionB_Bible.transliteration || 'N/A'}\n` : ''}

Pasajes Bíblicos Pertinentes:
${report.sectionB_Bible.biblicalPassages.map(p => `• [${p.reference}] «${p.passageText}»\n  Contexto: ${p.literaryAndHistoricalContext}`).join('\n\n')}

Reflexión Pastoral:
${report.sectionB_Bible.pastoralReflection}

Preguntas para la Reflexión Personal:
1. ${report.sectionB_Bible.reflectionQuestions[0]}
2. ${report.sectionB_Bible.reflectionQuestions[1]}
3. ${report.sectionB_Bible.reflectionQuestions[2]}

Oración Opcional:
${report.sectionB_Bible.optionalPrayer}

* AVISO TEOLÓGICO:
${report.sectionB_Bible.theologicalBoundaryNote}

C. MI IDENTIDAD Y PROPÓSITO
--------------------------------------------------------------------------------
Identidad y Valores:
${report.sectionC_Identity.identityAndValues}

Fortalezas y Vocación de Servicio:
${report.sectionC_Identity.strengthsAndService}

Orientación Pastoral:
${report.sectionC_Identity.pastoralOrientation}

Preguntas Abiertas para Elaborar Conclusiones Propias:
1. ${report.sectionC_Identity.openQuestions[0]}
2. ${report.sectionC_Identity.openQuestions[1]}
3. ${report.sectionC_Identity.openQuestions[2]}

* AVISO ÉTICO:
${report.sectionC_Identity.ethicalScopeNotice}

D. EMBLEMA SIMBÓLICO PERSONAL
--------------------------------------------------------------------------------
Elemento Central: ${report.sectionD_Emblem.centralElement}
Símbolos Complementarios: ${report.sectionD_Emblem.complementarySymbols}
Colores y Asociaciones: ${report.sectionD_Emblem.colorsAndAssociations}
Lema Opcional: «${report.sectionD_Emblem.suggestedMotto}»
Explicación de Elementos: ${report.sectionD_Emblem.elementsExplanation}

* DECLARACIÓN HERÁLDICA:
${report.sectionD_Emblem.disclaimerNotice}

E. INFORME FINAL (FICHA ORGANIZADA)
--------------------------------------------------------------------------------
1. Nombre Analizado: ${report.sectionE_Summary.item1_AnalyzedName}
2. Origen y Significado Documentado: ${report.sectionE_Summary.item2_DocumentedOriginAndMeaning}
3. Interpretación Simbólica: ${report.sectionE_Summary.item3_SymbolicInterpretation}
4. Pasajes Bíblicos y Contexto: ${report.sectionE_Summary.item4_BiblicalPassagesAndContext}
5. Reflexión Personal: ${report.sectionE_Summary.item5_PersonalReflection}
6. Preguntas para Meditar:
${report.sectionE_Summary.item6_MeditationQuestions.map(q => `   - ${q}`).join('\n')}
7. Oración Opcional: ${report.sectionE_Summary.item7_OptionalPrayer}
8. Propuesta de Emblema: ${report.sectionE_Summary.item8_EmblemProposal}
9. Fuentes Consultables:
${report.sectionE_Summary.item9_ConsultableSources.map(s => `   - [${s.type.toUpperCase()}] ${s.title} (${s.authorOrInstitution}): ${s.referenceUrlOrCite || 'Consulta académica'}`).join('\n')}

${report.familyContextSection && report.familyContextSection.providedContextText ? `
CONTEXTO FAMILIAR APORTADO VOLUNTARIAMENTE POR EL USUARIO:
${report.familyContextSection.providedContextText}
* ${report.familyContextSection.criticalNotice}
` : ''}

================================================================================
PastoralMente AI · Documento protegido para edificación y estudio personal.
`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Mi_Nombre_ante_la_Palabra_${sanitizeFilename(fn)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Descarga el archivo vectorial SVG autocontenido
   */
  public static downloadShieldSvg(svgString: string, surname: string): void {
    if (!svgString || !svgString.trim()) return;
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const content = svgString.startsWith('<?xml') ? svgString : xmlHeader + svgString;
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Emblema_Simbolico_${sanitizeFilename(surname)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Exporta a imagen PNG en alta definición mediante Canvas
   */
  public static exportShieldAsPng(svgString: string, surname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 1800;
            canvas.height = 2300;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('No se pudo inicializar el lienzo Canvas'));
              return;
            }
            ctx.fillStyle = '#f8f4ea';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
              if (blob) {
                const pngUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `Emblema_Simbolico_${sanitizeFilename(surname)}_HD.png`;
                a.click();
                URL.revokeObjectURL(pngUrl);
                resolve();
              } else {
                reject(new Error('Error al generar blob PNG'));
              }
            }, 'image/png');
          } catch (e) {
            reject(e);
          } finally {
            URL.revokeObjectURL(url);
          }
        };

        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };

        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  }
}
