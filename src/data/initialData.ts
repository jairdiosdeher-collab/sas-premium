import { 
  Patient, 
  SoapNote, 
  AssessmentResult, 
  Appointment, 
  Sermon, 
  SmallGroupResource, 
  UserProfile,
  MarketingStrategy,
  AffiliateRecord
} from '../types';

export const initialUserProfile: UserProfile = {
  name: "Dr. David Benítez",
  role: "psicologo",
  title: "Psicólogo Clínico & Consejero Pastoral Certificado",
  institution: "Centro de Restauración Integral & Iglesia Comunidad Viva",
  email: "pastoralmente.pro@ministerio.org",
  licenseNumber: "PSI-2024-8891 / AACC #4092",
  plan: "profesional",
  credits: 150,
};

export const initialPatients: Patient[] = [
  {
    id: "pat-1",
    code: "EXP-2026-001",
    fullName: "Carlos Méndez Sandoval",
    age: 41,
    gender: "masculino",
    phone: "+52 55 4912 8831",
    email: "carlos.mendez@comunidad.org",
    maritalStatus: "casado",
    occupation: "Pastor Asociado & Encargado de Misiones",
    admissionDate: "2026-08-12",
    status: "activo",
    riskLevel: "moderado",
    primaryReason: "Agotamiento crónico (Burnout ministerial), insomnio de conciliación y sentimientos intensos de culpa por descuidar su matrimonio.",
    clinicalDiagnosis: "F43.8 Trastorno de adaptación con estado de ánimo depresivo / Síndrome de Desgaste Ocupacional (CIE-11 QD85).",
    spiritualBackground: {
      faithBelief: "Cristiano Evangélico (22 años en la fe)",
      churchAttendance: "Pastor activo (4 servicios semanales)",
      spiritualMaturity: "Líder ordenado",
      ministryInvolvement: "Pastorado juvenil y coordinación de plantación de iglesias",
      spiritualStruggles: "Siente que Dios guarda silencio; sequedad devocional; vergüenza de confesar cansancio por miedo a ser juzgado como 'falto de fe'."
    },
    medicalHistory: {
      psychiatricHistory: "Sin hospitalizaciones psiquiátricas previas. Episodio depresivo reactivo hace 8 años tras pérdida laboral.",
      currentMedication: "Ninguna en la actualidad. Suplementación con magnesio.",
      emergencyContact: "Claudia Morales de Méndez (Esposa)",
      emergencyPhone: "+52 55 4912 8832"
    }
  },
  {
    id: "pat-2",
    code: "EXP-2026-002",
    fullName: "Elena Sofía Morales",
    age: 29,
    gender: "femenino",
    phone: "+57 310 882 1140",
    email: "elena.morales.art@gmail.com",
    maritalStatus: "soltera",
    occupation: "Diseñadora Gráfica & Líder de Alabanza",
    admissionDate: "2026-09-04",
    status: "activo",
    riskLevel: "moderado",
    primaryReason: "Crisis de pánico recurrentes antes de ministrar en la plataforma dominical y duelo traumático no resuelto tras el fallecimiento repentino de su madre.",
    clinicalDiagnosis: "F41.0 Trastorno de pánico / F43.10 Estrés postraumático subclínico.",
    spiritualBackground: {
      faithBelief: "Cristiana Bautista (Creció en hogar pastoral)",
      churchAttendance: "Semanal, activa en ministerio musical",
      spiritualMaturity: "Creyente madura con heridas de sobreexigencia eclesial",
      ministryInvolvement: "Directora vocal de alabanza",
      spiritualStruggles: "Enojo inconsciente hacia la soberanía de Dios por la enfermedad de su madre; hipervigilancia espiritual (cree que sus ataques son 'ataques satánicos' sin base biológica)."
    },
    medicalHistory: {
      psychiatricHistory: "Atención psicológica breve en universidad por ansiedad de rendimiento.",
      currentMedication: "Sertralina 50mg/día recetada por médico de cabecera hace 3 semanas.",
      emergencyContact: "Roberto Morales (Padre)",
      emergencyPhone: "+57 310 882 1145"
    }
  },
  {
    id: "pat-3",
    code: "EXP-2026-003",
    fullName: "Fernando & Diana Gómez",
    age: 38,
    gender: "otro",
    phone: "+1 786 552 9011",
    email: "familia.gomez.miami@yahoo.com",
    maritalStatus: "casado",
    occupation: "Empresarios / Diáconos en Iglesia Local",
    admissionDate: "2026-07-20",
    status: "en_seguimiento",
    riskLevel: "bajo",
    primaryReason: "Crisis matrimonial severa posterior a descubrimiento de conversaciones inapropiadas en redes sociales y distanciamiento íntimo de 2 años.",
    clinicalDiagnosis: "Z63.0 Problemas en la relación con el cónyuge o la pareja.",
    spiritualBackground: {
      faithBelief: "Cristianos no denominacionales (14 años de casados)",
      churchAttendance: "Constante",
      spiritualMaturity: "Líderes de células familiares",
      ministryInvolvement: "Ministerio de matrimonios jóvenes",
      spiritualStruggles: "Dificultad para el perdón genuino vs. perdón legalista superficial; reconstrucción del pacto y transparencia total."
    },
    medicalHistory: {
      psychiatricHistory: "No refieren antecedentes psiquiátricos.",
      currentMedication: "Ninguna.",
      emergencyContact: "Pastor Samuel Ortiz",
      emergencyPhone: "+1 786 552 9099"
    }
  },
  {
    id: "pat-4",
    code: "EXP-2026-004",
    fullName: "Mateo Josué Ramírez",
    age: 22,
    gender: "masculino",
    phone: "+34 612 345 678",
    email: "mateo.ramirez.stud@gmail.com",
    maritalStatus: "soltero",
    occupation: "Estudiante de Filosofía y Letras",
    admissionDate: "2026-10-01",
    status: "activo",
    riskLevel: "bajo",
    primaryReason: "Crisis vocacional y desconstrucción de fe; aislamiento de su comunidad eclesial tras choques ideológicos en el entorno académico.",
    clinicalDiagnosis: "Z73.0 Estado de agotamiento vital / Dificultades de aculturación y sentido de vida.",
    spiritualBackground: {
      faithBelief: "Hijo de misioneros; actualmente en agnosticismo metodológico",
      churchAttendance: "Irregular (últimos 4 meses dejó de asistir)",
      spiritualMaturity: "Conocimiento teológico profundo pero con desconexión afectiva",
      ministryInvolvement: "Anteriormente maestro de escuela dominical",
      spiritualStruggles: "Búsqueda de coherencia intelectual entre fe histórica y método científico; miedo al rechazo de sus padres."
    },
    medicalHistory: {
      psychiatricHistory: "Sin antecedentes patológicos.",
      currentMedication: "Ninguna.",
      emergencyContact: "Marcos Ramírez (Hermano)",
      emergencyPhone: "+34 612 345 679"
    }
  }
];

export const initialSoapNotes: SoapNote[] = [
  {
    id: "soap-1",
    patientId: "pat-1",
    date: "2026-10-14",
    sessionNumber: 5,
    subjective: "Carlos refiere haber dormido mejor (6 horas consecutivas) tras aplicar el protocolo de desconexión pastoral después de las 8:00 PM. Sin embargo, verbaliza un intenso remordimiento por haber dicho 'no' a predicar en una vigilia interdenominacional el viernes pasado: 'Siento que le fallé a la grey y que no soy el siervo abnegado que se espera'.",
    objective: "Paciente con contacto visual sostenido, postura menos contracturada que en la sesión 4. Afecto eutímico con labilidad cuando aborda las expectativas de la junta de ancianos. Lenguaje fluido, coherente, sin alteraciones perceptuales. Puntuación PHQ-9 reducida de 17 a 12.",
    assessment: "Evolución clínica favorable respecto al ritmo circadiano y fatiga psicofísica. No obstante, persisten esquemas cognitivos desadaptativos de sobreexigencia y sacrificio mesiánico ('Complejo de Salvador'). Confusión teológica entre gracia y rendimiento ante los hombres.",
    plan: "1. Mantener higiene de sueño y límites horarios con el teléfono celular. 2. Técnica de reestructuración cognitiva sobre el límite humano de Jesús en Marcos 1:35-38 (Jesús se retiró a orar y decidió no ir a todas las aldeas que lo buscaban). 3. Tarea: Escribir una carta a Dios expresando sus límites sin pedir disculpas por ser humano.",
    spiritualDimension: "Pasaje meditado: 1 Reyes 19:4-8 (Dios le da pan y sueño a Elías antes de darle una nueva revelación teológica). Intercesión enfocada en desarmar el espíritu de temor al juicio del liderazgo.",
    riskFlag: false,
    therapistSignature: "Dr. David Benítez, Reg. PSI-2024-8891"
  },
  {
    id: "soap-2",
    patientId: "pat-2",
    date: "2026-10-18",
    sessionNumber: 3,
    subjective: "Elena comparte que el domingo pasado logró subir al estrado para dirigir el primer bloque de alabanza sin salir corriendo. Experimentó taquicardia y sudoración palmar, pero utilizó la técnica de anclaje de respiración diafragmática 4-7-8.",
    objective: "Expresión facial relajada al inicio, leve inquietud psicomotriz al evocar el aniversario luctuoso que se aproxima. Cooperadora, lúcida, orientada. GAD-7 puntúa 11 (ansiedad moderada, previa 16).",
    assessment: "Respuesta positiva a la psicoeducación sobre la respuesta de lucha o huida. La distinción entre un ataque de pánico neurofisiológico y una 'oposición demoníaca' ha aliviado un 60% de su culpa espiritual secundaria.",
    plan: "1. Continuar exposición graduada en el ministerio musical. 2. Ejercicios interoceptivos de respiración diafragmática. 3. Sesión con el padre programada para abordar el luto compartido.",
    spiritualDimension: "Pasaje terapéutico: Salmo 139:23-24 y 2 Corintios 12:9 ('Bástate mi gracia, porque mi poder se perfecciona en la debilidad'). Enfoque devocional: Aprender a adorar desde la fragilidad sin usar la alabanza como una máscara de euforia falsa.",
    riskFlag: false,
    therapistSignature: "Dr. David Benítez, Reg. PSI-2024-8891"
  }
];

export const initialAssessments: AssessmentResult[] = [
  {
    id: "ass-1",
    patientId: "pat-1",
    type: "BURNOUT_MBI",
    title: "Inventario Maslach de Agotamiento Ministerial (MBI-M)",
    date: "2026-09-15",
    score: 42,
    maxScore: 60,
    severity: "Alto Riesgo de Burnout Clínico",
    interpretation: "Puntuación muy elevada en Agotamiento Emocional (34/40) y moderada en Despersonalización (18/25). El consultante experimenta fatiga por compasión extrema.",
    pastoralRecommendation: "Prescribir período sabático estructurado de 21 días con exención de responsabilidades de púlpito. Delegar consejerías no urgentes y acompañar con mentoreo pastoral no evaluativo.",
    answers: { 1: 5, 2: 4, 3: 5, 4: 4, 5: 3, 6: 5, 7: 4, 8: 4, 9: 4, 10: 4 }
  },
  {
    id: "ass-2",
    patientId: "pat-1",
    type: "PHQ9",
    title: "Cuestionario de Salud del Paciente (PHQ-9 - Depresión)",
    date: "2026-10-10",
    score: 12,
    maxScore: 27,
    severity: "Depresión Moderada",
    interpretation: "Predominio de anhedonia pastoral, fatiga diurna y sentimientos de inutilidad. Sin ideación suicida activa (Ítem 9 = 0).",
    pastoralRecommendation: "Revisar carga de trabajo, activar red de apoyo intereclesial y mantener seguimiento psicológico quincenal.",
    answers: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 1, 7: 1, 8: 1, 9: 0 }
  },
  {
    id: "ass-3",
    patientId: "pat-2",
    type: "GAD7",
    title: "Escala de Trastorno de Ansiedad Generalizada (GAD-7)",
    date: "2026-10-05",
    score: 13,
    maxScore: 21,
    severity: "Ansiedad Moderada a Severa",
    interpretation: "Preocupación incontrolable, tensión muscular constante e hiperreactividad ante estímulos repentinos.",
    pastoralRecommendation: "Enfocar la consejería en soltar la necesidad de control soberano. Acompañar con salmos de lamento y confianza filial.",
    answers: { 1: 3, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 1 }
  },
  {
    id: "ass-4",
    patientId: "pat-4",
    type: "SWBS",
    title: "Escala de Bienestar Espiritual (SWBS - Paloutzian & Ellison)",
    date: "2026-10-12",
    score: 54,
    maxScore: 120,
    severity: "Bienestar Espiritual Bajo / Crisis Existencial",
    interpretation: "Subescala Religiosa (relación con Dios) marcadamente descendida (22/60), Subescala Existencial con moderada búsqueda de significado (32/60).",
    pastoralRecommendation: "Evitar respuestas cliché o apologética dogmática impositiva. Crear un espacio seguro de escucha empática al estilo de Jesús en el camino a Emaús.",
    answers: { 1: 2, 2: 3, 3: 1, 4: 4, 5: 2, 6: 3, 7: 2, 8: 2, 9: 3, 10: 2 }
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: "apt-1",
    patientId: "pat-1",
    patientName: "Carlos Méndez Sandoval",
    dateTime: "2026-10-23T10:00",
    durationMinutes: 50,
    type: "presencial",
    modality: "individual",
    status: "programada",
    notes: "Revisión de plan sabático y ejercicios de auto-compasión bíblica.",
    reminderSent: true
  },
  {
    id: "apt-2",
    patientId: "pat-2",
    patientName: "Elena Sofía Morales",
    dateTime: "2026-10-23T11:30",
    durationMinutes: 50,
    type: "virtual",
    modality: "individual",
    status: "programada",
    notes: "Técnica de anclaje interoceptivo y análisis de pensamientos automáticos ante la música.",
    reminderSent: false
  },
  {
    id: "apt-3",
    patientId: "pat-3",
    patientName: "Fernando & Diana Gómez",
    dateTime: "2026-10-24T16:00",
    durationMinutes: 75,
    type: "presencial",
    modality: "pareja",
    status: "programada",
    notes: "Sesión 6: Protocolo de transparencia tecnológica y pacto de fidelidad renovado.",
    reminderSent: true
  },
  {
    id: "apt-4",
    patientId: "pat-4",
    patientName: "Mateo Josué Ramírez",
    dateTime: "2026-10-25T17:00",
    durationMinutes: 60,
    type: "virtual",
    modality: "pastoral",
    status: "programada",
    notes: "Diálogo abierto sobre el problema del mal y el libro de Habacuc.",
    reminderSent: false
  }
];

export const initialSermons: Sermon[] = [
  {
    id: "ser-1",
    title: "Sanando el Corazón Agotado: La Teología del Descanso",
    series: "Salud Mental en el Reino de Dios",
    mainPassage: "1 Reyes 19:1-8 & Mateo 11:28-30",
    supportingPassages: ["Éxodo 20:8-11", "Salmo 23:1-3", "Marcos 6:30-32"],
    homileticalIdea: "El descanso no es una recompensa por terminar la obra, sino un acto de confianza en que Dios sigue reinando mientras dormimos.",
    objective: "Desmantelar la idolatría del activismo ministerial y enseñar a la congregación a practicar un sábado bíblico restaurador.",
    introduction: "Vivimos en una cultura de la hiper-productividad donde la fatiga se presume como medalla de honor espiritual. Elías acababa de ver descender fuego del cielo en el Monte Carmelo, pero al día siguiente deseó morirse bajo un enebro. ¿Por qué los más comprometidos con Dios caen en depresión por agotamiento?",
    points: [
      {
        title: "1. La anatomía del colapso: Cuando el cuerpo y la mente dicen 'basta'",
        scriptureExplanation: "1 Reyes 19:4. Elías no perdió la salvación ni se volvió un apóstata; su sistema nervioso estaba colapsado. La Biblia nunca oculta la humanidad vulnerable de sus profetas.",
        contemporaryIllustration: "Un automóvil de lujo que se queda sin aceite: no importa cuán potente sea el motor, si se ignora el indicador del tablero, el motor se fundirá irreversiblemente.",
        practicalApplication: "Identifica tus 'indicadores del tablero': irritabilidad inusual con tu familia, cinismo en la oración y desconexión afectiva."
      },
      {
        title: "2. El tratamiento divino: Primero pan y sueño, luego teología",
        scriptureExplanation: "1 Reyes 19:5-7. Dios no envía a un ángel con un sermón acusador ni con una lista de reproches. Envía un ángel con pan caliente y agua, y lo manda a dormir dos veces seguidas.",
        contemporaryIllustration: "En la medicina de urgencias, antes de prescribir terapia cognitiva compleja se estabilizan los signos vitales y la glucosa del paciente.",
        practicalApplication: "Antes de autodiagnosticarte una 'tibieza espiritual', pregúntate cuántas horas has dormido, qué has comido y si has tomado agua hoy."
      },
      {
        title: "3. El susurro apacible: Escuchar la voz de Dios lejos del ruido",
        scriptureExplanation: "1 Reyes 19:11-13. Dios no estaba en el viento destructor, ni en el terremoto, ni en el fuego. Se manifestó en un silbo apacible y delicado.",
        contemporaryIllustration: "Una campana en medio de una fábrica ruidosa es inaudible; solo cuando se apagan las máquinas pesadas podemos escuchar su melodía.",
        practicalApplication: "Crea una 'zona de silencio sagrado' de 20 minutos diarios sin pantallas ni notificaciones para aquietar tu espíritu delante del Padre."
      }
    ],
    conclusion: "Jesús dijo: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar'. No te invita a un curso de gestión de tiempo; te invita a Su presencia.",
    callToAction: "Hoy pasen al frente quienes se sienten espiritualmente vacíos, quemados por el ministerio o agobiados por exigencias humanas. No oraremos por 'más fuerza para seguir corriendo', sino por la gracia de detenernos en Sus brazos.",
    tags: ["Salud Mental", "Burnout", "Descanso", "Elías", "Gracia", "Pastorado"],
    dateCreated: "2026-10-10",
    targetAudience: "Líderes, pastores, familias trabajadoras, estudiantes en exámenes"
  },
  {
    id: "ser-2",
    title: "Paz que Sobrepasa todo Entendimiento: Desarmando la Ansiedad",
    series: "Emociones Bajo la Cruz",
    mainPassage: "Filipenses 4:6-9",
    supportingPassages: ["1 Pedro 5:7", "Salmo 56:3", "Proverbios 12:25"],
    homileticalIdea: "La ansiedad no se cura fingiendo que todo está bien, sino canjeando la rumiación de nuestras preocupaciones por la intercesión agradecida.",
    objective: "Proveer una herramienta clínica-espiritual para gestionar pensamientos intrusivos desde una fe informada y compasiva.",
    introduction: "Pablo escribe la carta del gozo desde una celda romana sucia y encadenado a un soldado pretoriano. ¿Cómo puede alguien en semejante situación escribir: 'Por nada estéis afanosos'?",
    points: [
      {
        title: "1. La orden imposible y la vía de escape",
        scriptureExplanation: "Filipenses 4:6a: 'Por nada estéis afanosos'. La palabra griega 'merimnao' implica una mente dividida o arrastrada en direcciones contrarias por la incertidumbre.",
        contemporaryIllustration: "Tener 50 pestañas abiertas en el navegador del cerebro simultáneamente consumiendo toda la memoria RAM de tu vida.",
        practicalApplication: "Escribe en un papel las 3 cosas que te están robando la paz hoy y di en voz alta: 'Dios no me pide resolver el mañana hoy'."
      },
      {
        title: "2. La fórmula de la entrega: Oración, ruego y acción de gracias",
        scriptureExplanation: "Filipenses 4:6b. La acción de gracias no es un optimismo ingenuo, es el ancla que le recuerda al hipocampo cerebral todas las veces que Dios fue fiel en el pasado.",
        contemporaryIllustration: "Un álbum familiar de victorias: cuando miras fotos antiguas de dificultades superadas, el desafío presente parece manejable.",
        practicalApplication: "Aplica la regla 3x3: Por cada preocupación que presentes en oración, nombra tres bendiciones tangibles concretas de las últimas 24 horas."
      },
      {
        title: "3. La guarnición pretoriana de Dios: La paz como centinela",
        scriptureExplanation: "Filipenses 4:7. 'Guardará vuestros corazones': el término militar 'phroureo' se usaba para las tropas que protegían una fortaleza contra invasores.",
        contemporaryIllustration: "Un sistema de seguridad inteligente de última generación que no permite la entrada a pensamientos tóxicos ni acusaciones del enemigo.",
        practicalApplication: "Filtra tus pensamientos con Filipenses 4:8: ¿Es verdadero? ¿Es honesto? ¿Es justo? Si es solo una catástrofe imaginada, recházalo en el nombre de Jesús."
      }
    ],
    conclusion: "La paz de Dios no es la ausencia de tormenta en tu entorno; es la presencia inquebrantable de Cristo en tu barca.",
    callToAction: "Si has estado lidiando con ataques de pánico, insomnio por preocupación financiera o angustia por tus hijos, ven a entregar la carga al altar.",
    tags: ["Ansiedad", "Paz", "Filipenses", "Salud Emocional", "Oración"],
    dateCreated: "2026-10-16",
    targetAudience: "Congregación general, personas bajo estrés crónico"
  }
];

export const initialSmallGroupResources: SmallGroupResource[] = [
  {
    id: "sg-1",
    title: "Vulnerabilidad y Sanidad en Comunidad",
    series: "Viviendo en Autenticidad",
    passage: "Santiago 5:16 & Gálatas 6:1-2",
    icebreaker: "¿Cuál es la máscara social o eclesial más común que solemos ponernos los domingos cuando nos preguntan: '¿Cómo estás?'?",
    studyQuestions: [
      "1. ¿Por qué Santiago vincula la confesión mutua de faltas con la sanidad emocional y espiritual?",
      "2. ¿Cuál es la diferencia entre un grupo de chisme y un santuario de confidencialidad y restauración?",
      "3. Lee Gálatas 6:2. ¿Qué peso emocional estás cargando solo que necesitas compartir con tu comunidad?"
    ],
    pastoralReflection: "El aislamiento es el caldo de cultivo del dolor no sanado. Dios no diseñó a la Iglesia como un museo de santos perfectos, sino como un hospital de campaña donde los heridos encuentran vendaje en el amor de Cristo.",
    practicalChallenge: "Elige a una persona de confianza en tu grupo pequeño y envíale un mensaje esta semana pidiendo oración por una debilidad real sin adornos religiosos.",
    prayerTopics: [
      "Protección del corazón contra la religiosidad hipócrita.",
      "Espíritu de gracia y confidencialidad en cada hogar de célula.",
      "Sanidad interior para quienes han sufrido heridas en la iglesia."
    ],
    dateCreated: "2026-10-18"
  }
];

export const initialMarketingStrategy: MarketingStrategy = {
  acquisitionChannels: [
    {
      channel: "Alianzas Denominacionales & Seminarios Teológicos",
      strategy: "Ofrecer licencias institucionales a directores de educación ministerial y decanos de seminarios para formar a futuros pastores con herramientas clínicas y éticas.",
      targetAudience: "Rectores de seminarios, superintendentes de distrito, obispos y directores de salud pastoral.",
      expectedCac: "$45 USD por cuenta institucional (LTV $1,200+ USD)"
    },
    {
      channel: "Meta Ads (Facebook & Instagram B2B)",
      strategy: "Anuncios dirigidos a intereses: Logos Bible Software, Rick Warren, AACC (American Association of Christian Counselors), Psicología Cristiana con VSL de dolor ministerial.",
      targetAudience: "Pastores de 32 a 60 años y psicólogas cristianas en LATAM, USA hispano y España.",
      expectedCac: "$18 - $24 USD por prueba activa"
    },
    {
      channel: "YouTube & Contenido de Autoridad Orgánica",
      strategy: "Canal 'PastoralMente': Casos de estudio clínicos comentados pastoralmente, cómo evitar el burnout en pastores, cómo predicar con rigor homilético usando IA ética.",
      targetAudience: "Pastores autodidactas y consejeros buscando plantillas y formación.",
      expectedCac: "$0 USD (Tráfico orgánico a lead magnet)"
    }
  ],
  salesFunnelSteps: [
    {
      stage: "TOFU (Top of Funnel) - Atracción",
      action: "Lead Magnet gratuito: 'Kit de Primeros Auxilios Psico-Pastorales: Guía de 10 Protocolos para Crisis Congregacionales + Plantilla SOAP-S'.",
      asset: "Landing page de captura con opt-in de 1 clic y confirmación inmediata.",
      conversionGoal: "38% de conversión de visitantes a leads"
    },
    {
      stage: "MOFU (Middle of Funnel) - Valor & Prueba",
      action: "Webinar grabado de 22 minutos: 'El Secreto de los Pastores de Alto Impacto para Ahorrar 15 Horas Semanales en Sermones y Consejería sin Perder el Alma'.",
      asset: "Video Sales Letter interactivo con llamada directa a Prueba Gratuita de 14 días sin tarjeta.",
      conversionGoal: "24% de asistentes inician prueba gratuita"
    },
    {
      stage: "BOFU (Bottom of Funnel) - Conversión a Pago",
      action: "Secuencia de onboarding de 7 días guiada por email y WhatsApp bot con soporte personalizado.",
      asset: "Oferta irresistible: Descuento 30% en plan anual + Biblioteca de 100 Bosquejos Homiléticos Exegéticos.",
      conversionGoal: "18% de pruebas gratuitas se convierten a clientes de pago recurrente"
    }
  ],
  emailSequences: [
    {
      day: "Día 0 (Inmediato)",
      subject: "Bienvenido a PastoralMente AI: Tu santuario de organización y sabiduría clínica",
      purpose: "Entregar acceso, validar la vocación del usuario y generar la primera victoria en 5 minutos.",
      body: "Hola Pastor / Colega,\n\nBienvenido a la herramienta que nació para cuidar a quienes cuidan de otros.\n\nTu primera misión hoy es simple: ingresa al módulo de Homilética o de Consejería y genera tu primera nota SOAP-S o bosquejo bíblico en menos de 90 segundos.\n\nAquí la tecnología no reemplaza al Espíritu Santo; le quita a tus manos el peso administrativo para que tu corazón esté libre para ministrar con excelencia.\n\nUn abrazo en Cristo,\nEquipo PastoralMente AI."
    },
    {
      day: "Día 2",
      subject: "El peligro invisible que destruye a 7 de cada 10 pastores...",
      purpose: "Concientización sobre el agotamiento ministerial y demostración de las escalas Maslach y PHQ-9.",
      body: "Estimado consiervo,\n\nEstudios recientes revelan que el 70% de los líderes espirituales batallan con agotamiento silencioso porque no tienen un sistema confidencial para registrar sus casos y medir su propia fatiga.\n\nHoy habilitamos en tu cuenta la 'Escala Maslach de Desgaste Ministerial'. Tómate 4 minutos para evaluarte a ti mismo o a uno de tus líderes.\n\nLa salud de tu iglesia nunca superará la salud de tu propio corazón.\n\nAccede ahora a tus evaluaciones clínicas."
    },
    {
      day: "Día 5",
      subject: "¿Tienes tu sermón del domingo listo? (Prepara tu mensaje en 20 minutos)",
      purpose: "Activación del módulo homilético con IA para anclar valor recurrente antes del fin de semana.",
      body: "Pastor,\n\nEl viernes por la tarde suele ser un momento de angustia si el sermón del domingo aún no tiene forma clara.\n\nEntra ahora al Planificador Homilético de PastoralMente AI. Ingresa tu pasaje bíblico y observa cómo la IA te entrega:\n1. Contexto histórico y exégesis clave.\n2. Bosquejo de 3 puntos cristocéntricos.\n3. Ilustraciones contemporáneas que conectan con los jóvenes.\n4. Aplicaciones prácticas para el lunes por la mañana.\n\nRecupera tus sábados en familia."
    },
    {
      day: "Día 12",
      subject: "Tu prueba termina pronto: Asegura tu tarifa fundadora de por vida",
      purpose: "Urgencia y llamada a la conversión con descuento exclusivo para suscripción mensual o anual.",
      body: "Hola,\n\nEn 48 horas concluye tu período de cortesía en PastoralMente AI.\n\nSi decides continuar hoy, bloquearemos para ti el 30% de descuento vitalicio con el cupón REINO30.\n\nNo dejes que tus notas de consejería se dispersen en cuadernos inseguros ni vuelvas al estrés de la página en blanco los sábados por la noche.\n\nActiva tu suscripción profesional ahora."
    }
  ],
  tiktokScripts: [
    {
      title: "Lo que nadie te dice sobre la depresión en pastores",
      duration: "45 segundos",
      hook: "¿Por qué los pastores son los que más sufren en silencio cuando se apagan las luces del templo?",
      development: "Muestra pantalla de PastoralMente AI. 'Elías deseó morir bajo un enebro después de hacer descender fuego del cielo. La Biblia nunca ocultó que los líderes también colapsan. Hoy los consejeros pastorales modernos no anotan sus casos en libretas donde se pierde la confidencialidad. Usan historias clínicas digitales con notas SOAP-S y escalas PHQ-9 que respetan tanto la gracia divina como la neurobiología humana'.",
      cta: "Comenta 'PASTORAL' y te enviamos el kit de primeros auxilios emocionales para iglesias gratis."
    },
    {
      title: "Cómo preparar un sermón exegético de 40 minutos en 15 minutos",
      duration: "55 segundos",
      hook: "Si eres pastor y pasas 18 horas a la semana sufriendo frente a una hoja en blanco, estás usando la tecnología al revés.",
      development: "Pantalla dividida con cronómetro. El pastor selecciona Filipenses 4:6-7. PastoralMente AI genera el análisis del término griego 'merimnao', 3 ilustraciones cotidianas y las preguntas para grupos pequeños. 'Esto no sustituye tu tiempo de oración; organiza la estructura para que tú pongas la unción'.",
      cta: "Enlace en mi biografía para probarlo 14 días gratis sin tarjeta."
    }
  ],
  youtubeFramework: [
    {
      title: "Masterclass: Cómo Integrar la Psicología Clínica y la Consejería Bíblica sin Herejías ni Legalismos",
      duration: "24 minutos",
      structure: [
        "00:00 - El falso dilema: ¿Es el sufrimiento psicológico falta de fe?",
        "04:15 - El modelo biopsicosocial-espiritual de la salvación integral.",
        "09:30 - Demostración en vivo de una nota SOAP-S con el caso de Elías y David.",
        "16:20 - Ética, confidencialidad y prevención del suicidio en la iglesia local.",
        "21:10 - Cómo digitalizar el departamento de consejería de tu ministerio."
      ],
      thumbnailConcept: "Texto grande en fondo oscuro: '¿PSICOLOGÍA O FE?' con Dr. David Benítez sosteniendo una Biblia y un reporte clínico con sellos dorados."
    }
  ],
  facebookAds: [
    {
      angle: "Ahorro de Tiempo & Reducción de Estrés",
      headline: "Pastores y Consejeros: Dediquen menos tiempo al papeleo y más a las almas",
      copy: "La consejería pastoral improvisada en libretas de papel pone en riesgo la confidencialidad de tus ovejas y te agota mentalmente.\n\nCon PastoralMente AI tienes:\n✓ Expedientes clínicos y notas SOAP-S protegidas.\n✓ Escalas de depresión y burnout automáticas.\n✓ Planificador de sermones e ilustraciones exegéticas.\n✓ Recordatorios automáticos de citas por WhatsApp.\n\nÚnete a más de 850 ministerios en 18 países.",
      targeting: "Hombres y mujeres 30-65 años, interés en 'Christian counseling', 'Logos Bible Software', 'Gospel Coalition', 'Pastoral care'.",
      roasTarget: "3.8x ROAS en Plan Profesional"
    },
    {
      angle: "Rigor Ético y Profesional para Psicólogos Cristianos",
      headline: "La plataforma de gestión clínica diseñada respetando tu fe y tu rigor científico",
      copy: "¿Eres terapeuta o psicólogo clínico cristiano y te cuesta encontrar un software que integre la dimensión espiritual sin perder la validez psicométrica?\n\nPastoralMente AI combina CIE-11/DSM-5 con herramientas de discernimiento teológico y notas evolutivas completas.\n\nComienza hoy tu prueba sin costo de 14 días.",
      targeting: "Intereses en 'Psychology', 'Christian counseling', títulos en Psicología, Salud mental.",
      roasTarget: "4.2x ROAS en Plan Profesional"
    }
  ]
};

export const initialAffiliateRecord: AffiliateRecord = {
  referralCode: "PASTOR30",
  referralUrl: "https://pastoralmente.ai/?ref=PASTOR30",
  totalClicks: 348,
  activeSubscribers: 14,
  monthlyCommission: 205.80, // 30% of their active subscriptions
  totalPaid: 617.40,
  pendingPayout: 205.80,
  referrals: [
    {
      id: "ref-1",
      name: "Pastor Andrés Villa (Iglesia Grace)",
      plan: "Profesional ($49/mes)",
      date: "2026-08-11",
      monthlyValue: 49,
      commission30: 14.70,
      status: "activa"
    },
    {
      id: "ref-2",
      name: "Dra. Rebeca Luján (Clínica Shalom)",
      plan: "Premium ($99/mes)",
      date: "2026-08-25",
      monthlyValue: 99,
      commission30: 29.70,
      status: "activa"
    },
    {
      id: "ref-3",
      name: "Ministerio Vidas Transformadas",
      plan: "Premium ($99/mes)",
      date: "2026-09-02",
      monthlyValue: 99,
      commission30: 29.70,
      status: "activa"
    },
    {
      id: "ref-4",
      name: "Lic. Gabriel Cárdenas",
      plan: "Básico ($19/mes)",
      date: "2026-09-19",
      monthlyValue: 19,
      commission30: 5.70,
      status: "activa"
    }
  ]
};
