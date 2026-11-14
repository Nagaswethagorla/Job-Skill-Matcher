import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting } from '../../types';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  PlusCircle,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface PostJobPageProps {
  onJobPublished: () => void;
}

export const PostJobPage: React.FC<PostJobPageProps> = ({ onJobPublished }) => {
  const { user, userProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(userProfile?.displayName || 'Tech Horizon Solutions');
  const [location, setLocation] = useState('Remote (US)');
  const [salary, setSalary] = useState('$115,000 - $140,000');
  const [experience, setExperience] = useState('3+ years');
  const [education, setEducation] = useState("Bachelor's Degree in Computer Science or related field");
  const [employmentType, setEmploymentType] = useState<JobPosting['employmentType']>('Full-time');
  const [vacancies, setVacancies] = useState<number>(2);
  const [description, setDescription] = useState('');

  // Skill tags
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Docker', 'AWS']);
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addReqSkill = () => {
    if (newReqSkill.trim() && !requiredSkills.includes(newReqSkill.trim())) {
      setRequiredSkills([...requiredSkills, newReqSkill.trim()]);
      setNewReqSkill('');
    }
  };

  const removeReqSkill = (index: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const addPrefSkill = () => {
    if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
      setNewPrefSkill('');
    }
  };

  const removePrefSkill = (index: number) => {
    setPreferredSkills(preferredSkills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      setError('Please fill in all mandatory job details.');
      return;
    }

    if (requiredSkills.length === 0) {
      setError('Please specify at least one required skill for AI matching.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newJobData: Omit<JobPosting, 'id'> = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim(),
        experience: experience.trim(),
        education: education.trim(),
        description: description.trim(),
        requiredSkills,
        preferredSkills,
        employmentType,
        vacancies,
        status: 'active',
        recruiterId: user?.uid || 'recruiter-admin',
        recruiterName: userProfile?.displayName || company,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'jobs'), newJobData);
      // Ensure the generated ID is in document
      await setDoc(docRef, { id: docRef.id }, { merge: true });

      setSuccess(true);
      setTimeout(() => {
        onJobPublished();
      }, 1500);
    } catch (err: any) {
      console.error('Error posting job:', err);
      setError(err.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
          <PlusCircle className="w-4 h-4" />
          <span>New Position Creation</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Post a New Job
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Define required skills, experience thresholds, and role specifications for automated candidate matching.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Job vacancy published to Firestore successfully! Redirecting to Manage Jobs...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Core Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Apex Software Corp"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA (Hybrid) or Remote"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range *</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $120,000 - $145,000"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
              required
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required *</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 3+ years"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden bg-white"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vacancies</label>
            <input
              type="number"
              min="1"
              max="100"
              value={vacancies}
              onChange={(e) => setVacancies(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Education Requirements</label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g. Bachelor's in Computer Science or equivalent practical experience"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
          />
        </div>

        {/* Required Skills (Weight 60% in AI formula) */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              Required Skills (60% Match Weight) *
            </label>
            <span className="text-[10px] text-purple-600 font-semibold">
              Crucial for applicant qualification scoring
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {requiredSkills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeReqSkill(idx)}
                  className="hover:text-emerald-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newReqSkill}
              onChange={(e) => setNewReqSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addReqSkill();
                }
              }}
              placeholder="e.g. React, Node.js, SQL..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-hidden"
            />
            <button
              type="button"
              onClick={addReqSkill}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Preferred Skills (Weight 20% in AI formula) */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              Preferred Skills (20% Match Weight)
            </label>
            <span className="text-[10px] text-slate-500">Nice-to-have bonus qualifications</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {preferredSkills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-300"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removePrefSkill(idx)}
                  className="hover:text-blue-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newPrefSkill}
              onChange={(e) => setNewPrefSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPrefSkill();
                }
              }}
              placeholder="e.g. Docker, GraphQL, Redis..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-hidden"
            />
            <button
              type="button"
              onClick={addPrefSkill}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Job Description & Responsibilities *
          </label>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe company culture, daily responsibilities, architecture stack, and benefits..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-100 flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Publishing Vacancy...' : 'Publish Job Posting'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
