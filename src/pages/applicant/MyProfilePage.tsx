import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

export const MyProfilePage: React.FC<{ onNavigateToUpload: () => void }> = ({
  onNavigateToUpload,
}) => {
  const { user, applicantProfile, saveApplicantProfile, profileCompletion } = useAuth();

  const [fullName, setFullName] = useState(applicantProfile?.fullName || user?.displayName || '');
  const [email, setEmail] = useState(applicantProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(applicantProfile?.phone || '');
  const [degree, setDegree] = useState(applicantProfile?.degree || '');
  const [college, setCollege] = useState(applicantProfile?.college || '');
  const [experienceYears, setExperienceYears] = useState(applicantProfile?.experienceYears || 0);
  const [summary, setSummary] = useState(applicantProfile?.summary || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await saveApplicantProfile({
        fullName,
        email,
        phone,
        degree,
        college,
        experienceYears,
        summary,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          <User className="w-4 h-4" />
          <span>Applicant Profile Management</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          My Career Profile
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Keep your contact information, education, and career experience up to date for precise AI job matching.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Completion & Resume Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 w-full sm:w-auto flex-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Profile Readiness:</span>
            <span className="text-indigo-600">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {applicantProfile?.resumeFileName ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resume attached: {applicantProfile.resumeFileName}
              </span>
            ) : (
              <span className="text-rose-600 font-semibold">
                No resume uploaded yet. Upload a resume to automatically extract your skills!
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onNavigateToUpload}
          className="px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-2 border border-indigo-200 shrink-0 transition"
        >
          <FileText className="w-4 h-4" />
          <span>Upload / Replace Resume</span>
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="40"
              value={experienceYears}
              onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">
          Education Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Degree & Major</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College or University</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Executive Summary</label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
          />
        </div>

        {/* Extracted Skills Readout */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">Extracted Technical Skills</span>
            <button
              type="button"
              onClick={onNavigateToUpload}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Edit skills in Resume Parser &rarr;
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              ...(applicantProfile?.programmingLanguages || []),
              ...(applicantProfile?.frameworks || []),
              ...(applicantProfile?.tools || []),
            ].map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
