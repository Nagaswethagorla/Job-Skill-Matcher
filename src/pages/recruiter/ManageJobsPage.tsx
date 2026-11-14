import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting, JobApplication } from '../../types';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Briefcase,
  Users,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  PlusCircle,
  Search,
} from 'lucide-react';

interface ManageJobsPageProps {
  onNavigateToPost: () => void;
  onNavigateToCandidates: (job: JobPosting) => void;
  onNavigateToApplications: (jobId?: string) => void;
}

export const ManageJobsPage: React.FC<ManageJobsPageProps> = ({
  onNavigateToPost,
  onNavigateToCandidates,
  onNavigateToApplications,
}) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchJobsAndApps = async () => {
    try {
      setLoading(true);
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      const loadedJobs: JobPosting[] = [];
      jobsSnap.forEach((doc) => {
        loadedJobs.push({ id: doc.id, ...(doc.data() as any) });
      });
      setJobs(loadedJobs);

      const appsSnap = await getDocs(collection(db, 'applications'));
      const loadedApps: JobApplication[] = [];
      appsSnap.forEach((doc) => {
        loadedApps.push({ id: doc.id, ...(doc.data() as any) });
      });
      setApplications(loadedApps);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndApps();
  }, [user]);

  const toggleStatus = async (job: JobPosting) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await updateDoc(doc(db, 'jobs', job.id), { status: nextStatus });
      setJobs(jobs.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j)));
    } catch (err) {
      console.error('Error updating job status:', err);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
        setJobs(jobs.filter((j) => j.id !== jobId));
      } catch (err) {
        console.error('Error deleting job:', err);
      }
    }
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Listing Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manage Job Postings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor applicant volumes, toggle opening status, or edit job requirements.
          </p>
        </div>

        <button
          onClick={onNavigateToPost}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-100 flex items-center gap-2 shrink-0 transition"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter jobs by title or company..."
          className="w-full text-xs outline-hidden"
        />
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {filtered.map((job) => {
          const appCount = applications.filter((a) => a.jobId === job.id).length;

          return (
            <div
              key={job.id}
              className="p-5 sm:p-6 hover:bg-slate-50/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-slate-900 text-lg">{job.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      job.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-700">{job.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">{job.salary}</span>
                  <span>•</span>
                  <span>{job.vacancies} Vacancies</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Applicant volume & Actions */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigateToApplications(job.id)}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Users className="w-4 h-4" />
                  <span>{appCount} Applicants</span>
                </button>

                <button
                  onClick={() => onNavigateToCandidates(job)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition"
                >
                  Match Candidates
                </button>

                <button
                  onClick={() => toggleStatus(job)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    job.status === 'active'
                      ? 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}
                >
                  {job.status === 'active' ? 'Close Position' : 'Reactivate'}
                </button>

                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-500 text-sm">
            No job postings found. Click "Post New Job" to create your first vacancy.
          </div>
        )}
      </div>
    </div>
  );
};
