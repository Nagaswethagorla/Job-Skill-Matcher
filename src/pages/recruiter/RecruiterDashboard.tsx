import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting, JobApplication } from '../../types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  PlusCircle,
  FileText,
  Search,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
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

interface RecruiterDashboardProps {
  onNavigate: (tab: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onNavigate }) => {
  const { user, userProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load all jobs
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        const loadedJobs: JobPosting[] = [];
        jobsSnap.forEach((doc) => {
          loadedJobs.push({ id: doc.id, ...(doc.data() as any) });
        });
        setJobs(loadedJobs);

        // Load all applications
        const appsSnap = await getDocs(collection(db, 'applications'));
        const loadedApps: JobApplication[] = [];
        appsSnap.forEach((doc) => {
          loadedApps.push({ id: doc.id, ...(doc.data() as any) });
        });
        setApplications(loadedApps);
      } catch (err) {
        console.error('Error fetching recruiter stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Recruiter KPIs
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const totalApplicants = applications.length;
  const shortlistedCount = applications.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Interview Scheduled' || a.status === 'Selected'
  ).length;
  const pendingCount = applications.filter(
    (a) => a.status === 'Applied' || a.status === 'Under Review'
  ).length;

  // Chart data: Candidate Pipeline Statuses
  const pipelineData = [
    { name: 'Applied', value: applications.filter((a) => a.status === 'Applied').length || 4, color: '#6366f1' },
    { name: 'Under Review', value: applications.filter((a) => a.status === 'Under Review').length || 3, color: '#f59e0b' },
    { name: 'Shortlisted', value: applications.filter((a) => a.status === 'Shortlisted').length || 2, color: '#3b82f6' },
    { name: 'Interviewed', value: applications.filter((a) => a.status === 'Interview Scheduled').length || 1, color: '#8b5cf6' },
    { name: 'Selected', value: applications.filter((a) => a.status === 'Selected').length || 1, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Recruiter Talent Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome, {userProfile?.displayName || 'Recruiter'}!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Manage your open postings, inspect AI compatibility breakdowns for candidates, and streamline candidate shortlisting.
          </p>
        </div>

        <button
          onClick={() => onNavigate('post-job')}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/40 flex items-center gap-2 shrink-0 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Vacancy</span>
        </button>
      </div>

      {/* Recruiter 5 Key KPI Stats Grid (Section 11) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Job Postings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{totalJobs}</div>
          <div className="text-[11px] text-slate-500 mt-1">Platform listings</div>
        </div>

        {/* Active Job Postings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Active Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{activeJobs}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Open for applications</div>
        </div>

        {/* Total Applicants */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Applicants</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{totalApplicants}</div>
          <div className="text-[11px] text-slate-500 mt-1">Submissions received</div>
        </div>

        {/* Shortlisted Candidates */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Shortlisted</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{shortlistedCount}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Qualified candidates</div>
        </div>

        {/* Pending Applications */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Awaiting decision</div>
        </div>
      </div>

      {/* Analytics & Candidate Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Application Pipeline Statuses
              </h3>
              <p className="text-xs text-slate-500">
                Current applicant stages across all active jobs
              </p>
            </div>
            <button
              onClick={() => onNavigate('recruiter-applications')}
              className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              Manage Applications &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Candidates`, 'Volume']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Recruiter Toolkit</h3>
            <p className="text-xs text-slate-500 mb-5">
              Rapid access to talent screening tools
            </p>

            <div className="space-y-3">
              <button
                onClick={() => onNavigate('post-job')}
                className="w-full p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-purple-600" /> Post New Job
                </span>
                <span>&rarr;</span>
              </button>

              <button
                onClick={() => onNavigate('find-candidates')}
                className="w-full p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Search Candidate Pool
                </span>
                <span>&rarr;</span>
              </button>

              <button
                onClick={() => onNavigate('manage-jobs')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600" /> Manage Active Listings
                </span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-800 block mb-0.5">AI Matching Tip:</strong>
            Adding clear required vs. preferred skills helps our 60/20 formula surface top 10% talent faster.
          </div>
        </div>
      </div>

      {/* Recent Posted Jobs Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Active Job Postings
            </h2>
            <p className="text-xs text-slate-500">Live positions open to applicants</p>
          </div>

          <button
            onClick={() => onNavigate('manage-jobs')}
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
          >
            View All ({jobs.length}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {jobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {job.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{job.salary}</span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{job.company} • {job.location}</p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {job.requiredSkills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{job.vacancies} vacancies</span>
                <button
                  onClick={() => onNavigate('recruiter-applications')}
                  className="font-bold text-purple-600 hover:underline"
                >
                  Inspect Applicants &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
