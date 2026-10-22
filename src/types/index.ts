export type UserRole = 'pastor' | 'psicologo' | 'consejero' | 'director_ministerio' | 'administrador';

export type PlanType = 'free' | 'basico' | 'profesional' | 'premium' | 'enterprise';

export interface UserProfile {
  id?: string;
  name: string;
  role: UserRole;
  title: string;
  institution: string;
  email: string;
  licenseNumber?: string;
  plan: PlanType;
  credits: number;
  avatarUrl?: string;
  emailVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

export type RiskLevel = 'bajo' | 'moderado' | 'alto' | 'urgente';

export type PipelineStage = 
  | 'prospecto' 
  | 'evaluacion_inicial' 
  | 'en_consejeria' 
  | 'en_seguimiento' 
  | 'alta_restaurado';

export interface PatientAttachment {
  id: string;
  name: string;
  type: 'informe_medico' | 'consentimiento_firmado' | 'prueba_laboratorio' | 'fotografia' | 'otro';
  dateUploaded: string;
  fileSize: string;
  dataUrl?: string;
  notes?: string;
}

export interface InteractionLog {
  id: string;
  date: string;
  type: 'sesion' | 'llamada' | 'whatsapp' | 'oracion' | 'visita_hospital' | 'correo';
  summary: string;
  ministerName: string;
}

export interface SpiritualMilestone {
  id: string;
  date: string;
  title: string;
  category: 'bautismo' | 'conversion' | 'liderazgo' | 'reconciliacion' | 'sanidad_interior' | 'mision';
  notes: string;
}

export interface PrayerRequest {
  id: string;
  date: string;
  request: string;
  status: 'activa' | 'contestada' | 'en_ayuno';
  answerDate?: string;
  testimony?: string;
  isPrivate: boolean;
}

export interface Patient {
  id: string;
  code: string; // e.g. EXP-2026-042
  fullName: string;
  age: number;
  gender: 'masculino' | 'femenino' | 'otro';
  phone: string;
  email: string;
  maritalStatus: 'soltero' | 'soltera' | 'casado' | 'casada' | 'divorciado' | 'divorciada' | 'viudo' | 'viuda';
  occupation: string;
  admissionDate: string;
  status: 'activo' | 'en_seguimiento' | 'alta' | 'en_crisis';
  riskLevel: RiskLevel;
  pipelineStage?: PipelineStage;
  tags?: string[];
  primaryReason: string;
  clinicalDiagnosis?: string;
  spiritualBackground: {
    faithBelief: string;
    churchAttendance: string;
    spiritualMaturity: string;
    ministryInvolvement: string;
    spiritualStruggles: string;
    spiritualGifts?: string;
    baptismDate?: string;
    discipleshipStage?: string;
  };
  medicalHistory: {
    psychiatricHistory: string;
    currentMedication: string;
    emergencyContact: string;
    emergencyPhone: string;
    allergies?: string;
  };
  attachments?: PatientAttachment[];
  interactionHistory?: InteractionLog[];
  spiritualMilestones?: SpiritualMilestone[];
  prayerRequests?: PrayerRequest[];
  digitalSignatureUrl?: string;
  signedConsentDate?: string;
}

export interface SoapNote {
  id: string;
  patientId: string;
  date: string;
  sessionNumber: number;
  subjective: string; // S: Relato del consultante
  objective: string;   // O: Hallazgos clínicos / afecto / conducta
  assessment: string;  // A: Análisis psicoclínico
  plan: string;        // P: Plan terapéutico y tareas
  spiritualDimension: string; // S: Pasaje bíblico, intercesión, disciplinas
  riskFlag: boolean;
  therapistSignature: string;
  digitalSignatureUrl?: string;
  encrypted?: boolean;
}

export type ClinicalScaleType = 
  | 'PHQ9' 
  | 'GAD7' 
  | 'BDI2' 
  | 'BAI' 
  | 'CSSRS' 
  | 'ASSIST' 
  | 'AUDIT' 
  | 'SWBS' 
  | 'BURNOUT_MBI';

export interface AssessmentResult {
  id: string;
  patientId: string;
  type: ClinicalScaleType;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  severity: string;
  interpretation: string;
  pastoralRecommendation: string;
  answers: Record<number, number>;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dateTime: string;
  durationMinutes: number;
  type: 'presencial' | 'virtual';
  modality: 'individual' | 'pareja' | 'familiar' | 'pastoral';
  status: 'programada' | 'completada' | 'cancelada' | 'no_asistio';
  notes?: string;
  reminderSent: boolean;
}

export interface Sermon {
  id: string;
  title: string;
  series?: string;
  mainPassage: string;
  supportingPassages: string[];
  homileticalIdea: string;
  objective: string;
  introduction: string;
  points: {
    title: string;
    scriptureExplanation: string;
    contemporaryIllustration: string;
    practicalApplication: string;
  }[];
  conclusion: string;
  callToAction: string;
  tags: string[];
  dateCreated: string;
  targetAudience: string;
}

export interface SmallGroupResource {
  id: string;
  title: string;
  series: string;
  passage: string;
  icebreaker: string;
  studyQuestions: string[];
  pastoralReflection: string;
  practicalChallenge: string;
  prayerTopics: string[];
  dateCreated: string;
}

export interface Devotional {
  id: string;
  title: string;
  passage: string;
  verseText: string;
  meditation: string;
  prayer: string;
  actionStep: string;
  targetAudience: string;
  dateCreated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREAR_PACIENTE' | 'VER_EXPEDIENTE' | 'CREAR_NOTA_SOAP' | 'EDITAR_EXPEDIENTE' | 'APLICAR_ESCALA' | 'EXPORTAR_DATOS' | 'CAMBIO_PLAN';
  targetResource: string;
  ipAddress?: string;
  details: string;
}

export interface MarketingStrategy {
  acquisitionChannels: {
    channel: string;
    strategy: string;
    targetAudience: string;
    expectedCac: string;
  }[];
  salesFunnelSteps: {
    stage: string;
    action: string;
    asset: string;
    conversionGoal: string;
  }[];
  emailSequences: {
    day: string;
    subject: string;
    purpose: string;
    body: string;
  }[];
  tiktokScripts: {
    title: string;
    hook: string;
    development: string;
    cta: string;
    duration: string;
  }[];
  youtubeFramework: {
    title: string;
    duration: string;
    structure: string[];
    thumbnailConcept: string;
  }[];
  facebookAds: {
    angle: string;
    headline: string;
    copy: string;
    targeting: string;
    roasTarget: string;
  }[];
}

export interface AffiliateRecord {
  referralCode: string;
  referralUrl: string;
  totalClicks: number;
  activeSubscribers: number;
  monthlyCommission: number;
  totalPaid: number;
  pendingPayout: number;
  referrals: {
    id: string;
    name: string;
    plan: string;
    date: string;
    monthlyValue: number;
    commission30: number;
    status: 'activa' | 'cancelada';
  }[];
}

export interface StripeInvoice {
  id: string;
  date: string;
  planName: string;
  amount: number;
  status: 'pagado' | 'pendiente' | 'reembolsado';
  pdfUrl?: string;
  cardLast4: string;
}
