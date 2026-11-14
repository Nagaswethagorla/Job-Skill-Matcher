import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobApplication, ApplicationStatus } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  FileCheck2,
  Search,
  Filter,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Trophy,
  Layers,
} from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const { user, syncUnstopApplications } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<'All' | 'Unstop' | 'Direct'>('All');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'applications'),
        where('applicantId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const list: JobApplication[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...(doc.data() as any) });
      });
      // Sort newest first
      list.sort(
        (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      );
      setApplications(list);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleSyncUnstop = async () => {
    setSyncing(true);
    setSyncSuccessMsg(null);
    try {
      await syncUnstopApplications();
      await fetchApplications();
      setSyncSuccessMsg('Successfully synced Unstop hiring challenges and application statuses!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error syncing Unstop:', err);
    } finally {
      setSyncing(false);
    }
  };

  const statuses = [
    'All',
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Rejected',
    'Selected',
  ];

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchQuery.trim() ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.roundName && app.roundName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;

    const isUnstop = app.source === 'Unstop' || app.company.toLowerCase().includes('unstop');
    const matchesSource =
      selectedSource === 'All' ||
      (selectedSource === 'Unstop' && isUnstop) ||
      (selectedSource === 'Direct' && !isUnstop);

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Interview Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const unstopCount = applications.filter(
    (a) => a.source === 'Unstop' || a.company.toLowerCase().includes('unstop')
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>Application & Challenge Tracker</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review all submitted job applications, Unstop hiring challenges, tracked interview rounds, and match scores.
          </p>
        </div>

        {/* Sync from Unstop Button */}
        <button
          onClick={handleSyncUnstop}
          disabled={syncing}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing with Unstop...' : 'Sync Unstop Applications'}</span>
        </button>
      </div>

      {syncSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Source Selector Row */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or challenge round..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Source Tabs: All vs Unstop vs Direct */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setSelectedSource('All')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedSource === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setSelectedSource('Unstop')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                selectedSource === 'Unstop'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:text-blue-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Unstop Drives ({unstopCount})</span>
            </button>
            <button
              onClick={() => setSelectedSource('Direct')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedSource === 'Direct'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct Postings
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredApplications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredApplications.map((app) => {
              const isUnstop = app.source === 'Unstop' || app.company.toLowerCase().includes('unstop');

              return (
                <div
                  key={app.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {app.jobTitle}
                      </h3>

                      {isUnstop && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-blue-500" /> Unstop Challenge
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {app.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Applied: {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Unstop Round Milestone Badge */}
                    {app.roundName && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/80 text-indigo-900 border border-indigo-200 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Active Stage: <strong>{app.roundName}</strong></span>
                      </div>
                    )}

                    {/* Evaluator Notes */}
                    {app.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 max-w-2xl">
                        "{app.notes}"
                      </p>
                    )}

                    {/* Skills tags preview */}
                    {app.matchedSkills && app.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">
                          Evaluated Skills:
                        </span>
                        {app.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {s} ✓
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right side: Match score & Challenge link */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Match Score</div>
                      <div className="text-2xl font-black text-indigo-600">
                        {app.matchScore}%
                      </div>
                    </div>

                    {app.challengeUrl && (
                      <a
                        href={app.challengeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition border border-blue-200"
                      >
                        <span>View on Unstop</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No applications found in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click "Sync Unstop Applications" above to pull in your Flipkart GRiD, Walmart CodeHers, and Amazon ML Summer School drives!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
