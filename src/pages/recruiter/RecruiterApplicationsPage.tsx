import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobApplication, ApplicationStatus } from '../../types';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Mail,
  User,
  ChevronDown,
} from 'lucide-react';

interface RecruiterApplicationsPageProps {
  initialJobId?: string;
}

export const RecruiterApplicationsPage: React.FC<RecruiterApplicationsPageProps> = ({
  initialJobId,
}) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'applications'));
      const list: JobApplication[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...(doc.data() as any) });
      });
      list.sort(
        (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      );
      setApplications(list);
    } catch (err) {
      console.error('Error fetching applications for recruiter:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      await updateDoc(doc(db, 'applications', appId), { status: newStatus });
      setApplications(
        applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error('Error updating application status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const [selectedSource, setSelectedSource] = useState<'All' | 'Unstop' | 'Direct'>('All');

  const filtered = applications.filter((app) => {
    const matchesSearch =
      !search.trim() ||
      app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(search.toLowerCase()) ||
      (app.roundName && app.roundName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    const matchesJob = !initialJobId || app.jobId === initialJobId;

    const isUnstop = app.source === 'Unstop' || app.company.toLowerCase().includes('unstop');
    const matchesSource =
      selectedSource === 'All' ||
      (selectedSource === 'Unstop' && isUnstop) ||
      (selectedSource === 'Direct' && !isUnstop);

    return matchesSearch && matchesStatus && matchesJob && matchesSource;
  });

  const statuses: ApplicationStatus[] = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Rejected',
    'Selected',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>Application Processing</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Applicant Submissions
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review candidate match percentages, update review stages, and schedule interviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, email, or role..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setSelectedSource('All')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedSource === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Submissions
            </button>
            <button
              onClick={() => setSelectedSource('Unstop')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedSource === 'Unstop'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              Unstop Drives
            </button>
            <button
              onClick={() => setSelectedSource('Direct')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedSource === 'Direct'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pt-2 border-t border-slate-100 pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Stage:</span>
          {['All', ...statuses].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {filtered.map((app) => {
          const isUnstop = app.source === 'Unstop' || app.company.toLowerCase().includes('unstop');

          return (
            <div
              key={app.id}
              className="p-5 sm:p-6 hover:bg-slate-50/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {app.applicantName}
                  </h3>
                  {isUnstop && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold">
                      Unstop Drive
                    </span>
                  )}
                  <span className="text-xs text-slate-500">applied for</span>
                  <span className="font-bold text-purple-700 text-sm">{app.jobTitle}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {app.applicantEmail}
                  </span>
                  <span>•</span>
                  <span>{app.company}</span>
                  <span>•</span>
                  <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                </div>

                {app.roundName && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
                    Active Stage: <strong>{app.roundName}</strong>
                  </div>
                )}

              {app.matchedSkills && app.matchedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Skills:</span>
                  {app.matchedSkills.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800"
                    >
                      {s} ✓
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Score & Status Dropdown Selector */}
            <div className="flex items-center gap-6 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Match Score</div>
                <div className="text-2xl font-black text-purple-600">{app.matchScore}%</div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Candidate Stage:
                </label>
                <select
                  value={app.status}
                  disabled={updatingId === app.id}
                  onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-500 text-sm">
            No applicant submissions match your query.
          </div>
        )}
      </div>
    </div>
  );
};
