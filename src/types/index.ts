export type UserRole = 
  | 'administrador' 
  | 'psicologo' 
  | 'pastor' 
  | 'supervisor' 
  | 'invitado' 
  | 'consejero' 
  | 'director_ministerio';

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

export interface ClinicalSessionRecord {
  id: string;
  patientId: string;
  therapistId: string;
  therapistName: string;
  dateTime: string;
  durationMinutes: number;
  type: 'presencial' | 'virtual';
  modality: 'individual' | 'pareja' | 'familiar' | 'pastoral';
  summary: string;
  audioRecordingUrl?: string;
  notesId?: string;
  status: 'completada' | 'programada' | 'cancelada';
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  completed: boolean;
  assignedTo?: string;
  patientId?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'consentimiento' | 'informe' | 'escala' | 'estudio' | 'audio' | 'otro';
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  patientId?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  tags?: string[];
  spiritualThemes?: string[];
  isPrivate: boolean;
  createdAt: string;
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  action: 'auto_backup' | 'manual_backup' | 'patient_snapshot' | 'notes_snapshot' | 'restore_point';
  userId: string;
  userName: string;
  collectionName: string;
  recordCount: number;
  checksum?: string;
  snapshotData?: any;
  status: 'success' | 'warning' | 'error';
}

export interface FirebaseSyncMetrics {
  connectionStatus: 'connected' | 'syncing' | 'offline' | 'error';
  authStatus: 'authenticated' | 'unauthenticated' | 'local_fallback';
  firestoreStatus: 'healthy' | 'read_only' | 'degraded' | 'offline';
  storageStatus: 'healthy' | 'offline';
  lastSyncTime: string | null;
  pendingSyncCount: number;
  activeUserEmail: string | null;
  activeUserUid: string | null;
  activeRole: UserRole;
  isOnline: boolean;
}

// 1. IA SUPERVISORA CLÍNICA
export interface ClinicalSupervisorReview {
  id: string;
  noteId?: string;
  patientId: string;
  reviewedAt: string;
  clinicalConfidenceScore: number; // 0 - 100
  overallRiskLevel: RiskLevel;
  diagnosticContradictions: string[];
  clinicalRisksDetected: {
    type: 'suicidio' | 'autolesion' | 'depresion_severa' | 'ansiedad_panico' | 'burnout' | 'psicosis' | 'duelo_complicado' | 'violencia';
    severity: 'leve' | 'moderada' | 'severa' | 'urgente';
    evidence: string;
    protocolRecommendation: string;
  }[];
  omittedSymptomsDsm5: string[];
  suggestedClinicalInterventions: {
    approach: 'TCC' | 'Terapia Breve' | 'Aceptacion y Compromiso' | 'Psicoeducacion' | 'Logoterapia';
    technique: string;
    rationale: string;
  }[];
  therapeuticObjectives: string[];
  pastoralRecommendations: {
    biblicalPassage: string;
    pastoralAction: string;
    spiritualIntegrationTip: string;
    cautionNote?: string;
  }[];
  supervisorNotes: string;
}

// 2. PORTAL DEL PACIENTE
export interface PatientPortalSession {
  token: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  signedConsent?: {
    signatureDataUrl: string;
    timestamp: string;
    termsVersion: string;
    ipAddress?: string;
  };
  unreadMessagesCount: number;
}

export interface PatientPortalMessage {
  id: string;
  patientId: string;
  sender: 'paciente' | 'terapeuta';
  senderName: string;
  timestamp: string;
  content: string;
  read: boolean;
}

// 3. TIMELINE CLÍNICO INTEGRAL
export type TimelineEventType = 
  | 'sesion' 
  | 'soap' 
  | 'escala' 
  | 'documento' 
  | 'tarea' 
  | 'observacion' 
  | 'hito_pastoral' 
  | 'sermon_relacionado';

export interface UnifiedTimelineItem {
  id: string;
  patientId: string;
  date: string;
  type: TimelineEventType;
  title: string;
  categoryLabel: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  actor: string;
  metadata?: Record<string, any>;
  linkToModule?: string;
}

// 5. DICTADO CLÍNICO POR VOZ
export interface VoiceClinicalDictation {
  id: string;
  patientId?: string;
  timestamp: string;
  audioDurationSeconds: number;
  rawTranscript: string;
  parsedSoap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    spiritualDimension: string;
  };
  identifiedSymptoms: string[];
  spiritualFactors: string[];
  clinicalSummary: string;
  interventionPlan: string;
}

// 7. SISTEMA DE ALERTAS INTELIGENTES
export interface SmartAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  type: 'riesgo_suicida' | 'phq9_severo' | 'gad7_severo' | 'burnout_pastoral' | 'sin_seguimiento' | 'inasistencias' | 'crisis_activa';
  severity: 'media' | 'alta' | 'critica';
  detectedAt: string;
  summary: string;
  triggerDetail: string;
  suggestedAction: string;
  status: 'activa' | 'en_atencion' | 'resuelta';
  resolvedAt?: string;
  resolvedBy?: string;
}

// 9. BIBLIOTECA CLÍNICA Y PASTORAL
export type LibraryDomain = 
  | 'psicologia' 
  | 'teologia' 
  | 'consejeria' 
  | 'discipulado' 
  | 'homiletica' 
  | 'liderazgo' 
  | 'devocional';

export interface LibraryResourceItem {
  id: string;
  title: string;
  domain: LibraryDomain;
  author: string;
  publicationYear?: string;
  summary: string;
  keyThemes: string[];
  clinicalPastoralApplication: string;
  suggestedScriptures: string[];
  contentExcerpt: string;
  readingTimeMinutes: number;
  tags: string[];
}

// 10. PRESENTACIONES DE SERMONES
export interface HomileticSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  scriptureReference?: string;
  contentBulletPoints: string[];
  visualPrompt?: string;
  speakerNotes?: string;
}

