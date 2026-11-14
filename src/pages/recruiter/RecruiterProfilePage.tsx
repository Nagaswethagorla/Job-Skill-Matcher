import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Briefcase,
  Building,
  Mail,
  Globe,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const RecruiterProfilePage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || 'Technical Talent Partner');
  const [company, setCompany] = useState('Nexus Cloud Technologies');
  const [website, setWebsite] = useState('https://nexuscloud.example.com');
  const [industry, setIndustry] = useState('Enterprise Cloud Software & AI');
  const [location, setLocation] = useState('San Francisco, CA');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving recruiter profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
          <Building className="w-4 h-4" />
          <span>Employer Brand & Settings</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Recruiter Profile
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your organization details, hiring entity branding, and recruiter contact information.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Recruiter organization details updated successfully!</span>
        </div>
      )}

      {/* Verified Recruiter Badge Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs text-white flex items-center justify-center font-black text-2xl">
            {company.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{company}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3" /> Verified Employer
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Managed by {displayName} ({user?.email})
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Recruiter & Organization Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recruiter Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 outline-hidden cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-100 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Recruiter Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
