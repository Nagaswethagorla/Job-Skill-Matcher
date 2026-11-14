import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting, JobApplication, MatchScoreResult } from '../../types';
import { calculateJobMatch } from '../../services/matchingEngine';
import { MatchBadge } from '../../components/common/MatchBadge';
import { analyzeResumeHealth } from '../../services/resumeHealth';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Briefcase,
  FileCheck,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Award,
  Layers,
  HeartPulse,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ApplicantDashboardProps {
  onNavigate: (tab: string, metadata?: any) => void;
  onSelectJob: (job: JobPosting, match: MatchScoreResult) => void;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({
  onNavigate,
  onSelectJob,
}) => {
  const { user, userProfile, applicantProfile, profileCompletion } = useAuth();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [dailyStats, setDailyStats] = useState({ appliedToday: 0, remainingToday: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch jobs from Firestore
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        const loadedJobs: JobPosting[] = [];
        jobsSnap.forEach((doc) => {
          loadedJobs.push({ id: doc.id, ...(doc.data() as any) });
        });
        setJobs(loadedJobs);

        // Fetch applicant's applications
        if (user) {
          const appQuery = query(
            collection(db, 'applications'),
            where('applicantId', '==', user.uid)
          );
          const appSnap = await getDocs(appQuery);
          const loadedApps: JobApplication[] = [];
          appSnap.forEach((doc) => {
            loadedApps.push({ id: doc.id, ...(doc.data() as any) });
          });
          // Sort client-side by appliedDate desc
          loadedApps.sort(
            (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
          );
          setApplications(loadedApps);

          // Fetch daily limits from backend
          const statsRes = await fetch(`/api/applications/stats?userId=${user.uid}`);
          if (statsRes.ok) {
            const data = await statsRes.json();
            setDailyStats({
              appliedToday: data.appliedToday ?? 0,
              remainingToday: data.remainingToday ?? 10,
            });
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch note:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, applicantProfile]);

  // Compute matches for all jobs
  const jobMatches = jobs.map((job) => ({
    job,
    match: calculateJobMatch(applicantProfile, job),
  }));

  // Sort by highest match percentage
  jobMatches.sort((a, b) => b.match.overallScore - a.match.overallScore);

  const recommendedJobs = jobMatches.filter((item) => item.match.overallScore >= 60);

  const averageMatchScore =
    jobMatches.length > 0
      ? Math.round(
          jobMatches.reduce((acc, curr) => acc + curr.match.overallScore, 0) / jobMatches.length
        )
      : 0;

  // Compute Resume Health report based on industry standards
  const resumeHealth = analyzeResumeHealth(applicantProfile);

  // Chart data: Match Score distribution breakdown
  const matchDistributionData = [
    { name: '80-100% Excellent', count: jobMatches.filter((j) => j.match.overallScore >= 80).length, color: '#10b981' },
    { name: '60-79% Good', count: jobMatches.filter((j) => j.match.overallScore >= 60 && j.match.overallScore < 80).length, color: '#3b82f6' },
    { name: '40-59% Moderate', count: jobMatches.filter((j) => j.match.overallScore >= 40 && j.match.overallScore < 60).length, color: '#f59e0b' },
    { name: '0-39% Low', count: jobMatches.filter((j) => j.match.overallScore < 40).length, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Career Intelligence Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {applicantProfile?.fullName || user?.displayName || 'Applicant'}!
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Your technical skills are being continuously matched against{' '}
            <strong className="text-indigo-300">{jobs.length} active positions</strong>. Upload or
            refine your resume anytime to unlock higher match scores and targeted course paths.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('find-jobs')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/40 flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" /> Browse Matched Jobs
            </button>
            <button
              onClick={() => onNavigate('upload-resume')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4" /> Update Resume
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Resume Health Metric */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resume Health
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                resumeHealth.color === 'emerald'
                  ? 'bg-emerald-50 text-emerald-600'
                  : resumeHealth.color === 'blue'
                  ? 'bg-blue-50 text-blue-600'
                  : resumeHealth.color === 'amber'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {resumeHealth.score}%
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  resumeHealth.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700'
                    : resumeHealth.color === 'blue'
                    ? 'bg-blue-50 text-blue-700'
                    : resumeHealth.color === 'amber'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {resumeHealth.grade}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  resumeHealth.color === 'emerald'
                    ? 'bg-emerald-500'
                    : resumeHealth.color === 'blue'
                    ? 'bg-blue-500'
                    : resumeHealth.color === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${resumeHealth.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Profile Readiness
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {profileCompletion}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                {applicantProfile?.resumeFileName ? 'Resume active' : 'No resume'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommended Jobs & Avg Match */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recommended Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {recommendedJobs.length}
              </span>
              <span className="text-xs font-medium text-emerald-600 font-semibold">
                &ge;60% Match
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Avg score: <strong className="text-slate-800">{averageMatchScore}%</strong> across all jobs
            </p>
          </div>
        </div>

        {/* Total Applications */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {applications.length}
              </span>
              <span className="text-xs text-slate-500">Submitted</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Track status updates in real-time
            </p>
          </div>
        </div>

        {/* Applications Remaining Today (Strict Limit: 10/day) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daily Limit
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                dailyStats.remainingToday > 0
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {dailyStats.remainingToday}
              </span>
              <span className="text-xs font-medium text-slate-500">of 10 left</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Applied today: <strong className="text-slate-800">{dailyStats.appliedToday}/10</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Resume Health Audit & Improvement Recommendations Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                resumeHealth.color === 'emerald'
                  ? 'bg-emerald-50 text-emerald-600'
                  : resumeHealth.color === 'blue'
                  ? 'bg-blue-50 text-blue-600'
                  : resumeHealth.color === 'amber'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Resume Health & Industry Benchmark Audit
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {resumeHealth.passedCount}/{resumeHealth.totalChecks} Standards Met
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates ATS readability, technical keyword density, project evidence, and contact completeness.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('upload-resume')}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Optimize Resume</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Industry Standard Checklist */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completeness Breakdown
            </h3>
            <div className="space-y-2">
              {resumeHealth.checks.map((check) => (
                <div
                  key={check.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                    check.passed
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">{check.label}</div>
                      <div className="text-[11px] text-slate-500">{check.detail}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      check.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {check.score}/{check.maxScore} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actionable Areas for Improvement */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggested Improvements ({resumeHealth.suggestions.length})</span>
            </h3>

            {resumeHealth.suggestions.length > 0 ? (
              <div className="space-y-2.5">
                {resumeHealth.suggestions.slice(0, 4).map((sug) => (
                  <div
                    key={sug.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            sug.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : sug.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {sug.priority} Impact
                        </span>
                        <span className="text-xs font-bold text-slate-900">{sug.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {sug.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate(sug.actionTab)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 text-[11px] font-bold whitespace-nowrap shrink-0 transition"
                    >
                      {sug.actionLabel} &rarr;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-emerald-900">
                  Your Resume Meets All Industry Benchmarks!
                </div>
                <p className="text-xs text-emerald-700">
                  Your profile is fully optimized for ATS screening and high-compatibility job matches.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytics & Match Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart: Match Score Breakdown across Available Jobs */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Job Compatibility Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Based on your current extracted technical profile and experience
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
              {jobs.length} Total Jobs
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} jobs`, 'Count']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {matchDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Skill Readiness Widget */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Extracted Skills Overview
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Key competencies parsed from your uploaded resume
            </p>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Languages</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {applicantProfile?.programmingLanguages?.slice(0, 5).map((l) => (
                    <span key={l} className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {l}
                    </span>
                  ))}
                  {(!applicantProfile?.programmingLanguages || applicantProfile.programmingLanguages.length === 0) && (
                    <span className="text-xs text-slate-400 italic">None extracted yet</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Frameworks</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {applicantProfile?.frameworks?.slice(0, 5).map((f) => (
                    <span key={f} className="text-xs font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      {f}
                    </span>
                  ))}
                  {(!applicantProfile?.frameworks || applicantProfile.frameworks.length === 0) && (
                    <span className="text-xs text-slate-400 italic">None extracted yet</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Tools & Cloud</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {applicantProfile?.tools?.slice(0, 5).map((t) => (
                    <span key={t} className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {t}
                    </span>
                  ))}
                  {(!applicantProfile?.tools || applicantProfile.tools.length === 0) && (
                    <span className="text-xs text-slate-400 italic">None extracted yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('skill-gap')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-indigo-600 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition"
          >
            <span>Analyze Skill Gaps & Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Recommended Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Top Matched Jobs For You
            </h2>
            <p className="text-xs text-slate-500">
              Ranked dynamically by the 60/20/10/10 AI compatibility algorithm
            </p>
          </div>

          <button
            onClick={() => onNavigate('find-jobs')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            View All {jobs.length} Jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobMatches.slice(0, 6).map(({ job, match }) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job, match)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition truncate max-w-[200px]">
                      {job.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">{job.company}</p>
                  </div>
                  <MatchBadge score={match.overallScore} size="sm" showLabel={false} />
                </div>

                <div className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {job.description}
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Required Skills:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 4).map((skill) => {
                      const isMatched = match.allMatchedSkills.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {skill} {isMatched ? '✓' : '✗'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{job.salary}</span>
                <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  View Match Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Preview */}
      {applications.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
              <p className="text-xs text-slate-500">Your latest candidate submissions</p>
            </div>
            <button
              onClick={() => onNavigate('my-applications')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              View All Applications &rarr;
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">{app.jobTitle}</div>
                  <div className="text-xs text-slate-500">{app.company} • Applied on {new Date(app.appliedDate).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Match: {app.matchScore}%
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
