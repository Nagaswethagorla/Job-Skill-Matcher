import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthPage } from './pages/auth/AuthPage';

// Applicant Pages
import { ApplicantDashboard } from './pages/applicant/ApplicantDashboard';
import { ResumeUploadPage } from './pages/applicant/ResumeUploadPage';
import { FindJobsPage } from './pages/applicant/FindJobsPage';
import { MyApplicationsPage } from './pages/applicant/MyApplicationsPage';
import { SkillGapPage } from './pages/applicant/SkillGapPage';
import { CoursesPage } from './pages/applicant/CoursesPage';
import { MyProfilePage } from './pages/applicant/MyProfilePage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { PostJobPage } from './pages/recruiter/PostJobPage';
import { ManageJobsPage } from './pages/recruiter/ManageJobsPage';
import { CandidateSearchPage } from './pages/recruiter/CandidateSearchPage';
import { RecruiterApplicationsPage } from './pages/recruiter/RecruiterApplicationsPage';
import { RecruiterProfilePage } from './pages/recruiter/RecruiterProfilePage';

// Common Components
import { JobDetailsModal } from './components/common/JobDetailsModal';
import { JobPosting, MatchScoreResult } from './types';
import { calculateJobMatch } from './services/matchingEngine';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { user, role, loading, applicantProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Modal & Selection state
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedJobMatch, setSelectedJobMatch] = useState<MatchScoreResult | null>(null);

  // Application limits & state
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [dailyStats, setDailyStats] = useState({ appliedToday: 0, remainingToday: 10 });
  const [selectedCourseSkill, setSelectedCourseSkill] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync activeTab when switching roles
  useEffect(() => {
    if (role === 'recruiter' && !activeTab.startsWith('recruiter') && activeTab !== 'post-job' && activeTab !== 'manage-jobs' && activeTab !== 'find-candidates') {
      setActiveTab('recruiter-dashboard');
    } else if (role === 'applicant' && (activeTab.startsWith('recruiter') || activeTab === 'post-job' || activeTab === 'manage-jobs' || activeTab === 'find-candidates')) {
      setActiveTab('dashboard');
    }
  }, [role]);

  // Load applicant's applied jobs and saved jobs from Firestore
  useEffect(() => {
    if (!user) return;

    const loadUserInteractions = async () => {
      try {
        // Load saved jobs
        const savedSnap = await getDocs(
          query(collection(db, 'savedJobs'), where('applicantId', '==', user.uid))
        );
        const saved = new Set<string>();
        savedSnap.forEach((doc) => saved.add(doc.data().jobId));
        setSavedJobIds(saved);

        // Load applied jobs
        const appsSnap = await getDocs(
          query(collection(db, 'applications'), where('applicantId', '==', user.uid))
        );
        const applied = new Set<string>();
        appsSnap.forEach((doc) => applied.add(doc.data().jobId));
        setAppliedJobIds(applied);

        // Load server daily limits
        const res = await fetch(`/api/applications/stats?userId=${user.uid}`);
        if (res.ok) {
          const stats = await res.json();
          setDailyStats({
            appliedToday: stats.appliedToday ?? 0,
            remainingToday: stats.remainingToday ?? 10,
          });
        }
      } catch (err) {
        console.warn('Initial load interactions note:', err);
      }
    };

    loadUserInteractions();
  }, [user]);

  // Handle Apply for Job with strict server-side rate limit enforcement (Section 10)
  const handleApplyJob = async (job: JobPosting) => {
    if (!user) return;
    const match = calculateJobMatch(applicantProfile, job);

    try {
      const response = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          applicantName: applicantProfile?.fullName || user.displayName || 'Applicant',
          applicantEmail: user.email || '',
          matchScore: match.overallScore,
          matchedSkills: match.allMatchedSkills,
          missingSkills: match.allMissingSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Enforced rate limit or duplicate error
        setNotification({
          type: 'error',
          message: data.error || 'Failed to submit application.',
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // Record application document into Firestore
      const appRef = doc(collection(db, 'applications'));
      await setDoc(appRef, {
        id: appRef.id,
        jobId: job.id,
        applicantId: user.uid,
        recruiterId: job.recruiterId || 'recruiter',
        jobTitle: job.title,
        company: job.company,
        applicantName: applicantProfile?.fullName || user.displayName || 'Applicant',
        applicantEmail: user.email || '',
        matchScore: match.overallScore,
        matchedSkills: match.allMatchedSkills,
        missingSkills: match.allMissingSkills,
        status: 'Applied',
        appliedDate: new Date().toISOString(),
        appliedDateStr: new Date().toISOString().split('T')[0],
      });

      setAppliedJobIds((prev) => new Set([...prev, job.id]));
      setDailyStats({
        appliedToday: data.appliedToday,
        remainingToday: data.remainingToday,
      });

      setNotification({
        type: 'success',
        message: `Application submitted for ${job.title}! ${data.remainingToday} applications remaining today.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Apply error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Error communicating with application server.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Toggle Save Job
  const handleToggleSaveJob = async (job: JobPosting) => {
    if (!user) return;
    const isCurrentlySaved = savedJobIds.has(job.id);
    const saveDocId = `${user.uid}_${job.id}`;

    try {
      if (isCurrentlySaved) {
        await deleteDoc(doc(db, 'savedJobs', saveDocId));
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        setNotification({ type: 'success', message: `Removed ${job.title} from saved jobs.` });
      } else {
        await setDoc(doc(db, 'savedJobs', saveDocId), {
          id: saveDocId,
          applicantId: user.uid,
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          savedAt: new Date().toISOString(),
        });
        setSavedJobIds((prev) => new Set([...prev, job.id]));
        setNotification({ type: 'success', message: `Saved ${job.title} to your bookmarks.` });
      }
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const openJobModal = (job: JobPosting, match: MatchScoreResult) => {
    setSelectedJob(job);
    setSelectedJobMatch(match);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center font-black text-xl">
          JS
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Loading Job Skill Matcher Platform...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex">
        {/* Dark Navy Blue Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Notification Toast Alert */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-2xl shadow-lg border text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="flex-1">{notification.message}</div>
            </div>
          )}

          {/* Applicant Role Views */}
          {role === 'applicant' && (
            <>
              {activeTab === 'dashboard' && (
                <ApplicantDashboard
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSelectJob={openJobModal}
                />
              )}
              {activeTab === 'upload-resume' && <ResumeUploadPage />}
              {activeTab === 'find-jobs' && (
                <FindJobsPage
                  onSelectJob={openJobModal}
                  onApply={handleApplyJob}
                  savedJobIds={savedJobIds}
                  onToggleSaveJob={handleToggleSaveJob}
                  appliedJobIds={appliedJobIds}
                  remainingToday={dailyStats.remainingToday}
                />
              )}
              {activeTab === 'my-applications' && <MyApplicationsPage />}
              {activeTab === 'skill-gap' && (
                <SkillGapPage
                  onNavigateToCourses={(skill) => {
                    setSelectedCourseSkill(skill);
                    setActiveTab('recommended-courses');
                  }}
                  targetJob={selectedJob}
                />
              )}
              {activeTab === 'recommended-courses' && (
                <CoursesPage initialSkill={selectedCourseSkill} />
              )}
              {activeTab === 'my-profile' && (
                <MyProfilePage onNavigateToUpload={() => setActiveTab('upload-resume')} />
              )}
            </>
          )}

          {/* Recruiter Role Views */}
          {role === 'recruiter' && (
            <>
              {activeTab === 'recruiter-dashboard' && (
                <RecruiterDashboard onNavigate={(tab) => setActiveTab(tab)} />
              )}
              {activeTab === 'post-job' && (
                <PostJobPage onJobPublished={() => setActiveTab('manage-jobs')} />
              )}
              {activeTab === 'manage-jobs' && (
                <ManageJobsPage
                  onNavigateToPost={() => setActiveTab('post-job')}
                  onNavigateToCandidates={(job) => {
                    setSelectedJob(job);
                    setActiveTab('find-candidates');
                  }}
                  onNavigateToApplications={() => setActiveTab('recruiter-applications')}
                />
              )}
              {activeTab === 'find-candidates' && (
                <CandidateSearchPage initialJob={selectedJob} />
              )}
              {activeTab === 'recruiter-applications' && <RecruiterApplicationsPage />}
              {activeTab === 'recruiter-profile' && <RecruiterProfilePage />}
            </>
          )}
        </main>
      </div>

      {/* Detailed Job & Compatibility Breakdown Modal */}
      {selectedJob && selectedJobMatch && (
        <JobDetailsModal
          job={selectedJob}
          matchResult={selectedJobMatch}
          isOpen={Boolean(selectedJob)}
          onClose={() => {
            setSelectedJob(null);
            setSelectedJobMatch(null);
          }}
          onApply={handleApplyJob}
          onSaveJob={handleToggleSaveJob}
          isSaved={savedJobIds.has(selectedJob.id)}
          hasApplied={appliedJobIds.has(selectedJob.id)}
          onNavigateToSkillGap={(job) => {
            setSelectedJob(job);
            setActiveTab('skill-gap');
          }}
          remainingToday={dailyStats.remainingToday}
        />
      )}
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
