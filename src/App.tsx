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
import { ReportsModule } from './components/modules/ReportsModule';
import { MarketingModule } from './components/modules/MarketingModule';
import { AffiliateModule } from './components/modules/AffiliateModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { BillingModal } from './components/modules/BillingModal';
import { PipelineCrmModule } from './components/modules/PipelineCrmModule';
import { ClinicalTimelineModule } from './components/modules/ClinicalTimelineModule';
import { PastoralModule } from './components/modules/PastoralModule';
import { AnalyticsModule } from './components/modules/AnalyticsModule';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { SecurityLockModal } from './components/common/SecurityLockModal';
import { AuthModal } from './components/auth/AuthModals';
import { FirebaseService } from './services/firebaseService';

function AppContent() {
  const { currentUser, updateUser } = useAuth();

  // Navigation View: 'landing' or 'app'
  const [activeView, setActiveView] = useState<'landing' | 'app'>('landing');
  const [currentModule, setCurrentModule] = useState<ModuleKey>('dashboard');

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

  // Cross-module states
  const [targetPatientForSoap, setTargetPatientForSoap] = useState<string | undefined>(undefined);
  const [targetPatientForReport, setTargetPatientForReport] = useState<string | undefined>(undefined);

  // Billing & Auth Modals
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [billingInitialPlan, setBillingInitialPlan] = useState<PlanType>('profesional');

  // Sync to local storage & Firestore offline sync
  useEffect(() => {
    localStorage.setItem('pm_patients', JSON.stringify(patients));
    FirebaseService.syncCollection('patients', patients);
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('pm_soap_notes', JSON.stringify(notes));
    FirebaseService.syncCollection('soapNotes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('pm_assessments', JSON.stringify(assessments));
    FirebaseService.syncCollection('clinicalScales', assessments);
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('pm_appointments', JSON.stringify(appointments));
    FirebaseService.syncCollection('appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('pm_sermons', JSON.stringify(sermons));
    FirebaseService.syncCollection('sermons', sermons);
  }, [sermons]);

  useEffect(() => {
    localStorage.setItem('pm_small_groups', JSON.stringify(smallGroups));
    FirebaseService.syncCollection('devotionals', smallGroups);
  }, [smallGroups]);

  // Actions
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleUpdatePatientStage = (patientId: string, newStage: PipelineStage) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, pipelineStage: newStage } : p))
    );
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
  };

  const handleSaveNote = (newNote: SoapNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleSaveAssessment = (newAssessment: AssessmentResult) => {
    setAssessments((prev) => [newAssessment, ...prev]);
  };

  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
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
  };

  const handleAddSermon = (newSermon: Sermon) => {
    setSermons((prev) => [newSermon, ...prev]);
  };

  const handleAddResource = (newRes: SmallGroupResource) => {
    setSmallGroups((prev) => [newRes, ...prev]);
  };

  const handleUpdatePlan = (plan: PlanType, newCredits: number) => {
    updateUser({
      plan,
      credits: (currentUser.credits || 0) + newCredits,
    });
  };

  const handleChangeRole = (role: UserRole) => {
    updateUser({
      role,
      title:
        role === 'psicologo'
          ? 'Psicólogo Clínico Cristiano'
          : role === 'pastor'
          ? 'Pastor Principal'
          : 'Consejero Familiar & Matrimonial',
    });
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

  // Crisis Count
  const crisisCount = patients.filter(
    (p) => p.riskLevel === 'alto' || p.riskLevel === 'urgente' || p.status === 'en_crisis'
  ).length;

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
      />

      {/* Main View Router */}
      {activeView === 'landing' ? (
        <LandingPage
          onEnterApp={() => setActiveView('app')}
          onSelectPlan={(plan) => handleSelectPlanFromLanding(plan)}
        />
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Left Sidebar */}
          <Sidebar
            currentModule={currentModule}
            setCurrentModule={setCurrentModule}
            crisisCount={crisisCount}
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
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
