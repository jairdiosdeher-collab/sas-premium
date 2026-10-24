/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Patient, 
  SoapNote, 
  AssessmentResult, 
  Appointment, 
  Sermon, 
  SmallGroupResource, 
  PlanType, 
  UserRole,
  PipelineStage,
  InteractionLog,
  PatientAttachment,
  PrayerRequest,
  SpiritualMilestone
} from './types';
import { 
  initialUserProfile, 
  initialPatients, 
  initialSoapNotes, 
  initialAssessments, 
  initialAppointments, 
  initialSermons, 
  initialSmallGroupResources, 
  initialMarketingStrategy, 
  initialAffiliateRecord 
} from './data/initialData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ModuleKey } from './components/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardModule } from './components/modules/DashboardModule';
import { PatientsModule } from './components/modules/PatientsModule';
import { EvolutionNotesModule } from './components/modules/EvolutionNotesModule';
import { AssessmentsModule } from './components/modules/AssessmentsModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { SermonsModule } from './components/modules/SermonsModule';
import { SmallGroupsModule } from './components/modules/SmallGroupsModule';
import { AiStudioModule } from './components/modules/AiStudioModule';
import { NameHeraldryModule } from './components/modules/NameHeraldryModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { MarketingModule } from './components/modules/MarketingModule';
import { AffiliateModule } from './components/modules/AffiliateModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { BillingModal } from './components/modules/BillingModal';
import { PipelineCrmModule } from './components/modules/PipelineCrmModule';
import { ClinicalTimelineModule } from './components/modules/ClinicalTimelineModule';
import { PastoralModule } from './components/modules/PastoralModule';
import { AnalyticsModule } from './components/modules/AnalyticsModule';
import { PatientPortalModule } from './components/modules/PatientPortalModule';
import { DocumentCenterModule } from './components/modules/DocumentCenterModule';
import { ClinicalLibraryModule } from './components/modules/ClinicalLibraryModule';
import { TasksAndFollowupModule } from './components/modules/TasksAndFollowupModule';
import { SmartAlertsDrawer } from './components/common/SmartAlertsDrawer';
import { VoiceDictationModal } from './components/common/VoiceDictationModal';
import { AlertsService } from './services/alertsService';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { SecurityLockModal } from './components/common/SecurityLockModal';
import { FirebaseStatusModal } from './components/common/FirebaseStatusModal';
import { AuthModal } from './components/auth/AuthModals';
import { FirebaseService } from './services/firebaseService';

function AppContent() {
  const { currentUser, updateUser } = useAuth();
  const { showSuccess, showInfo, showError } = useToast();

  // Navigation View: 'landing' or 'app'
  const [activeView, setActiveView] = useState<'landing' | 'app'>('landing');
  const [currentModule, setCurrentModule] = useState<ModuleKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFirebaseStatusOpen, setIsFirebaseStatusOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isVoiceDictationOpen, setIsVoiceDictationOpen] = useState(false);

  // Application Data with LocalStorage Persistence
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('pm_patients');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [notes, setNotes] = useState<SoapNote[]>(() => {
    const saved = localStorage.getItem('pm_soap_notes');
    return saved ? JSON.parse(saved) : initialSoapNotes;
  });

  const [assessments, setAssessments] = useState<AssessmentResult[]>(() => {
    const saved = localStorage.getItem('pm_assessments');
    return saved ? JSON.parse(saved) : initialAssessments;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('pm_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [sermons, setSermons] = useState<Sermon[]>(() => {
    const saved = localStorage.getItem('pm_sermons');
    return saved ? JSON.parse(saved) : initialSermons;
  });

  const [smallGroups, setSmallGroups] = useState<SmallGroupResource[]>(() => {
    const saved = localStorage.getItem('pm_small_groups');
    return saved ? JSON.parse(saved) : initialSmallGroupResources;
  });

  const [reports, setReports] = useState<any[]>(() => {
    const saved = localStorage.getItem('pm_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Cross-module states
  const [targetPatientForSoap, setTargetPatientForSoap] = useState<string | undefined>(undefined);
  const [targetPatientForReport, setTargetPatientForReport] = useState<string | undefined>(undefined);

  // Billing & Auth Modals
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [billingInitialPlan, setBillingInitialPlan] = useState<PlanType>('profesional');

  // Carga inicial y reconciliación con Firestore si está disponible en la nube
  useEffect(() => {
    if (currentUser?.id && FirebaseService.isCloudConnected()) {
      FirebaseService.loadCollection<Patient>('patients', patients, currentUser.id).then((cloudPatients) => {
        if (cloudPatients && cloudPatients.length > 0) setPatients(cloudPatients);
      });
      FirebaseService.loadCollection<SoapNote>('soapNotes', notes, currentUser.id).then((cloudNotes) => {
        if (cloudNotes && cloudNotes.length > 0) setNotes(cloudNotes);
      });
      FirebaseService.loadCollection<Appointment>('appointments', appointments, currentUser.id).then((cloudApts) => {
        if (cloudApts && cloudApts.length > 0) setAppointments(cloudApts);
      });
      FirebaseService.loadCollection<Sermon>('sermons', sermons, currentUser.id).then((cloudSermons) => {
        if (cloudSermons && cloudSermons.length > 0) setSermons(cloudSermons);
      });
      FirebaseService.loadCollection<any>('reports', reports, currentUser.id).then((cloudReports) => {
        if (cloudReports && cloudReports.length > 0) setReports(cloudReports);
      });
    }
  }, [currentUser?.id]);

  // Sync to local storage & Firestore offline-first sync (pacientes, SOAP, agenda, reportes, etc.)
  useEffect(() => {
    localStorage.setItem('pm_patients', JSON.stringify(patients));
    FirebaseService.syncCollection('patients', patients, currentUser.id);
  }, [patients, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('pm_soap_notes', JSON.stringify(notes));
    FirebaseService.syncCollection('soapNotes', notes, currentUser.id);
  }, [notes, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('pm_assessments', JSON.stringify(assessments));
    FirebaseService.syncCollection('clinicalScales', assessments, currentUser.id);
  }, [assessments, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('pm_appointments', JSON.stringify(appointments));
    FirebaseService.syncCollection('appointments', appointments, currentUser.id);
  }, [appointments, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('pm_sermons', JSON.stringify(sermons));
    FirebaseService.syncCollection('sermons', sermons, currentUser.id);
  }, [sermons, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('pm_small_groups', JSON.stringify(smallGroups));
    FirebaseService.syncCollection('devotionals', smallGroups, currentUser.id);
  }, [smallGroups, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('pm_reports', JSON.stringify(reports));
    FirebaseService.syncCollection('reports', reports, currentUser.id);
  }, [reports, currentUser.id]);

  // Actions con Respaldo Automático y Notificaciones Toast
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    FirebaseService.recordBackup('patient_snapshot', 'patients', 1, { patientId: newPatient.id, name: newPatient.fullName }, currentUser.id, currentUser.name);
    showSuccess('Paciente Creado', `Expediente ${newPatient.code} guardado y respaldado en la nube.`);
  };

  const handleUpdatePatientStage = (patientId: string, newStage: PipelineStage) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, pipelineStage: newStage } : p))
    );
    showInfo('Pipeline Actualizado', `Paciente trasladado a etapa: ${newStage.replace('_', ' ')}`);
  };

  const handleAddInteraction = (patientId: string, interaction: InteractionLog) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const history = p.interactionHistory || [];
          return { ...p, interactionHistory: [interaction, ...history] };
        }
        return p;
      })
    );
    showSuccess('Interacción Registrada', `Registro de ${interaction.type} guardado.`);
  };

  const handleAddAttachment = (patientId: string, attachment: PatientAttachment) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const attachments = p.attachments || [];
          return { ...p, attachments: [attachment, ...attachments] };
        }
        return p;
      })
    );
    showSuccess('Documento Adjunto', `Archivo ${attachment.name} sincronizado con Firebase Storage.`);
  };

  const handleSaveConsentSignature = (patientId: string, signatureUrl: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              digitalSignatureUrl: signatureUrl,
              signedConsentDate: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
    showSuccess('Consentimiento Firmado', 'Firma digital encriptada y archivada en el expediente.');
  };

  const handleAddPrayerRequest = (patientId: string, prayer: PrayerRequest) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const prayers = p.prayerRequests || [];
          return { ...p, prayerRequests: [prayer, ...prayers] };
        }
        return p;
      })
    );
    showSuccess('Petición de Oración', 'Petición añadida al muro ministerial.');
  };

  const handleAddMilestone = (patientId: string, milestone: SpiritualMilestone) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const milestones = p.spiritualMilestones || [];
          return { ...p, spiritualMilestones: [milestone, ...milestones] };
        }
        return p;
      })
    );
    showSuccess('Hito Espiritual', `Hito "${milestone.title}" registrado.`);
  };

  const handleSaveNote = (newNote: SoapNote) => {
    setNotes((prev) => [newNote, ...prev]);
    FirebaseService.recordBackup('notes_snapshot', 'notes', 1, { noteId: newNote.id, patientId: newNote.patientId }, currentUser.id, currentUser.name);
    showSuccess('Nota SOAP Registrada', 'Evolución clínica sincronizada en la nube con respaldo automático.');
  };

  const handleSaveAssessment = (newAssessment: AssessmentResult) => {
    setAssessments((prev) => [newAssessment, ...prev]);
    FirebaseService.recordBackup('auto_backup', 'assessments', 1, { scale: newAssessment.type, score: newAssessment.score }, currentUser.id, currentUser.name);
    showSuccess('Evaluación Completada', `Escala ${newAssessment.type} guardada (${newAssessment.score}/${newAssessment.maxScore}).`);
  };

  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    showSuccess('Cita Agendada', `Cita para ${newApt.patientName} registrada.`);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  const handleMarkReminderSent = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, reminderSent: true } : apt))
    );
    showInfo('Recordatorio Enviado', 'Mensaje de WhatsApp preparado para el consultante.');
  };

  const handleAddSermon = (newSermon: Sermon) => {
    setSermons((prev) => [newSermon, ...prev]);
    showSuccess('Sermón Guardado', `Bosquejo "${newSermon.title}" guardado en la nube.`);
  };

  const handleAddResource = (newRes: SmallGroupResource) => {
    setSmallGroups((prev) => [newRes, ...prev]);
    showSuccess('Recurso Creado', `Guía para células "${newRes.title}" guardada.`);
  };

  const handleUpdatePlan = (plan: PlanType, newCredits: number) => {
    updateUser({
      plan,
      credits: (currentUser.credits || 0) + newCredits,
    });
    showSuccess('Plan Actualizado', `Tu cuenta ahora cuenta con el Plan ${plan.toUpperCase()}.`);
  };

  const handleChangeRole = (role: UserRole) => {
    const titles: Record<string, string> = {
      administrador: 'Administrador General del Sistema',
      psicologo: 'Psicólogo Clínico Cristiano',
      pastor: 'Pastor Principal',
      supervisor: 'Supervisor Clínico & Ministerial',
      invitado: 'Usuario Invitado / Acceso Demo',
      consejero: 'Consejero Pastoral Familiar',
      director_ministerio: 'Director Ministerial',
    };
    updateUser({
      role,
      title: titles[role] || 'Consejero Pastoral',
    });
    showInfo('Rol de Acceso Actualizado', `Visualización ajustada a: ${titles[role] || role}`);
  };

  const handleImportAllData = (data: any) => {
    if (data.user) updateUser(data.user);
    if (data.patients) setPatients(data.patients);
    if (data.notes) setNotes(data.notes);
    if (data.assessments) setAssessments(data.assessments);
    if (data.appointments) setAppointments(data.appointments);
    if (data.sermons) setSermons(data.sermons);
    if (data.smallGroups) setSmallGroups(data.smallGroups);
  };

  const handleResetFactoryData = () => {
    localStorage.clear();
    setPatients(initialPatients);
    setNotes(initialSoapNotes);
    setAssessments(initialAssessments);
    setAppointments(initialAppointments);
    setSermons(initialSermons);
    setSmallGroups(initialSmallGroupResources);
    updateUser(initialUserProfile);
  };

  // Quick navigation handlers
  const handleSelectPatientForSoap = (patientId: string) => {
    setTargetPatientForSoap(patientId);
    setCurrentModule('evolution');
    setActiveView('app');
  };

  const handleSelectPatientForReport = (patientId: string) => {
    setTargetPatientForReport(patientId);
    setCurrentModule('reports');
    setActiveView('app');
  };

  const handleQuickAction = () => {
    setCurrentModule('evolution');
    setActiveView('app');
  };

  const handleSelectPlanFromLanding = (plan: PlanType) => {
    setBillingInitialPlan(plan);
    setIsBillingOpen(true);
  };

  // Crisis Count & Smart Alerts
  const crisisCount = patients.filter(
    (p) => p.riskLevel === 'alto' || p.riskLevel === 'urgente' || p.status === 'en_crisis'
  ).length;

  const smartAlerts = AlertsService.computeSmartAlerts(patients, notes, assessments, appointments);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenBilling={() => {
          setBillingInitialPlan(currentUser.plan || 'profesional');
          setIsBillingOpen(true);
        }}
        onQuickAction={handleQuickAction}
        onChangeRole={handleChangeRole}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenFirebaseStatus={() => setIsFirebaseStatusOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        activeAlertsCount={smartAlerts.length}
        onOpenVoiceDictation={() => setIsVoiceDictationOpen(true)}
      />

      {/* Main View Router */}
      {activeView === 'landing' ? (
        <LandingPage
          onEnterApp={() => setActiveView('app')}
          onSelectPlan={(plan) => handleSelectPlanFromLanding(plan)}
        />
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
          {/* Left Sidebar con RBAC y Mobile Drawer */}
          <Sidebar
            currentModule={currentModule}
            setCurrentModule={setCurrentModule}
            crisisCount={crisisCount}
            userRole={currentUser.role}
            userPlan={currentUser.plan}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            onOpenFirebaseStatus={() => setIsFirebaseStatusOpen(true)}
          />

          {/* Module Content Canvas */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-[calc(100vh-65px)]">
            {currentModule === 'dashboard' && (
              <DashboardModule
                user={currentUser}
                patients={patients}
                notes={notes}
                assessments={assessments}
                appointments={appointments}
                sermons={sermons}
                onNavigate={(mod) => setCurrentModule(mod)}
                onQuickAction={handleQuickAction}
              />
            )}

            {currentModule === 'crm_pipeline' && (
              <PipelineCrmModule
                patients={patients}
                onUpdatePatientStage={handleUpdatePatientStage}
                onAddInteraction={handleAddInteraction}
                onOpenPatientDetail={(patientId) => {
                  setTargetPatientForSoap(patientId);
                  setCurrentModule('patients');
                }}
              />
            )}

            {currentModule === 'patients' && (
              <PatientsModule
                patients={patients}
                onAddPatient={handleAddPatient}
                onSelectPatientForSoap={handleSelectPatientForSoap}
                onSelectPatientForReport={handleSelectPatientForReport}
              />
            )}

            {currentModule === 'timeline' && (
              <ClinicalTimelineModule
                patients={patients}
                notes={notes}
                assessments={assessments}
                appointments={appointments}
                sermons={sermons}
                onAddAttachment={handleAddAttachment}
                onSaveConsentSignature={handleSaveConsentSignature}
              />
            )}

            {currentModule === 'evolution' && (
              <EvolutionNotesModule
                user={currentUser}
                patients={patients}
                notes={notes}
                selectedPatientId={targetPatientForSoap}
                onSaveNote={handleSaveNote}
              />
            )}

            {currentModule === 'assessments' && (
              <AssessmentsModule
                patients={patients}
                assessments={assessments}
                onSaveAssessment={handleSaveAssessment}
              />
            )}

            {currentModule === 'calendar' && (
              <CalendarModule
                user={currentUser}
                patients={patients}
                appointments={appointments}
                onAddAppointment={handleAddAppointment}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onMarkReminderSent={handleMarkReminderSent}
              />
            )}

            {currentModule === 'tasks' && (
              <TasksAndFollowupModule patients={patients} />
            )}

            {currentModule === 'portal' && (
              <PatientPortalModule
                patients={patients}
                appointments={appointments}
                assessments={assessments}
              />
            )}

            {currentModule === 'documents' && (
              <DocumentCenterModule patients={patients} />
            )}

            {currentModule === 'library' && (
              <ClinicalLibraryModule />
            )}

            {currentModule === 'sermons' && (
              <SermonsModule
                user={currentUser}
                sermons={sermons}
                onAddSermon={handleAddSermon}
              />
            )}

            {currentModule === 'smallgroups' && (
              <SmallGroupsModule
                resources={smallGroups}
                onAddResource={handleAddResource}
              />
            )}

            {currentModule === 'pastoral' && (
              <PastoralModule
                user={currentUser}
                patients={patients}
                onAddPrayerRequest={handleAddPrayerRequest}
                onAddMilestone={handleAddMilestone}
              />
            )}

            {currentModule === 'aistudio' && (
              <AiStudioModule user={currentUser} patients={patients} />
            )}

            {currentModule === 'nameheraldry' && (
              currentUser.plan !== 'free' ? (
                <NameHeraldryModule />
              ) : (
                <section className="mx-auto max-w-2xl rounded-2xl border border-amber-500/30 bg-slate-900 p-6 text-center">
                  <h1 className="text-xl font-bold text-white">Mi nombre ante la Palabra</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-300">Esta experiencia está disponible para cuentas con un plan de pago. Actualiza tu plan para acceder al informe devocional y al emblema simbólico.</p>
                  <button type="button" onClick={() => { setBillingInitialPlan('profesional'); setIsBillingOpen(true); }} className="mt-5 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">Ver planes</button>
                </section>
              )
            )}

            {currentModule === 'reports' && (
              <ReportsModule
                user={currentUser}
                patients={patients}
                notes={notes}
                assessments={assessments}
                preselectedPatientId={targetPatientForReport}
              />
            )}

            {currentModule === 'analytics' && (
              <AnalyticsModule />
            )}

            {currentModule === 'marketing' && (
              <MarketingModule strategy={initialMarketingStrategy} />
            )}

            {currentModule === 'affiliates' && (
              <AffiliateModule affiliateData={initialAffiliateRecord} />
            )}

            {currentModule === 'settings' && (
              <SettingsModule
                user={currentUser}
                patients={patients}
                notes={notes}
                assessments={assessments}
                appointments={appointments}
                sermons={sermons}
                smallGroups={smallGroups}
                onUpdateUserProfile={(updated) => updateUser(updated)}
                onImportAllData={handleImportAllData}
                onResetFactoryData={handleResetFactoryData}
              />
            )}
          </main>
        </div>
      )}

      {/* Floating WhatsApp Business Button (+57 3124710702) */}
      <FloatingWhatsApp />

      {/* Inactivity Security Screen Lock (HIPAA / Clinical Ethics) */}
      <SecurityLockModal />

      {/* Billing Modal */}
      <BillingModal
        user={currentUser}
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        onUpdatePlan={handleUpdatePlan}
        initialPlan={billingInitialPlan}
      />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Panel Visual de Estado Firebase (Traffic Lights: Verde / Amarillo / Rojo) */}
      <FirebaseStatusModal
        isOpen={isFirebaseStatusOpen}
        onClose={() => setIsFirebaseStatusOpen(false)}
        currentUser={currentUser}
      />

      {/* Smart Alerts Drawer */}
      <SmartAlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={smartAlerts}
        onSelectPatient={(patientId) => {
          setTargetPatientForSoap(patientId);
          setCurrentModule('patients');
        }}
      />

      {/* Voice Dictation Modal */}
      <VoiceDictationModal
        isOpen={isVoiceDictationOpen}
        onClose={() => setIsVoiceDictationOpen(false)}
        patientName={patients[0]?.fullName || 'Consultante'}
        onApplyParsedSoap={(parsed) => {
          showSuccess('Dictado Convertido a SOAP', 'Estructura SOAP-S lista para archivar en evolución.');
          setCurrentModule('evolution');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
