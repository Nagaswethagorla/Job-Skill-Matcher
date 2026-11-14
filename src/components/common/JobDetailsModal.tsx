import React, { useState } from 'react';
import { JobPosting, MatchScoreResult } from '../../types';
import { MatchBadge } from './MatchBadge';
import {
  X,
  Briefcase,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Bookmark,
  Send,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface JobDetailsModalProps {
  job: JobPosting;
  matchResult: MatchScoreResult;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: JobPosting) => Promise<void>;
  onSaveJob?: (job: JobPosting) => Promise<void>;
  isSaved?: boolean;
  hasApplied?: boolean;
  onNavigateToSkillGap?: (job: JobPosting) => void;
  remainingToday: number;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  matchResult,
  isOpen,
  onClose,
  onApply,
  onSaveJob,
  isSaved = false,
  hasApplied = false,
  onNavigateToSkillGap,
  remainingToday,
}) => {
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(job);
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!onSaveJob) return;
    setSaving(true);
    try {
      await onSaveJob(job);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/40 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 shrink-0">
              {job.company.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {job.title}
                </h2>
                {job.source === 'Unstop' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                    {job.platformBadge || 'Unstop Challenge'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mt-1 font-medium">
                <span className="text-indigo-600 font-bold">{job.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  {job.salary}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Match Score & Compatibility Breakdown Hero */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  AI Compatibility Engine Breakdown
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  {matchResult.category} ({matchResult.overallScore}%)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {matchResult.explanation}
                </p>
              </div>

              <div className="shrink-0 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <MatchBadge score={matchResult.overallScore} size="lg" />
              </div>
            </div>

            {/* 4 Pillars Formula Breakdown Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 font-medium">Required Skills (60%)</div>
                <div className="text-base font-bold text-indigo-400 mt-0.5">
                  {matchResult.requiredCompatibility}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {matchResult.matchedRequiredSkills.length} of {job.requiredSkills.length} matched
                </div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 font-medium">Preferred Skills (20%)</div>
                <div className="text-base font-bold text-blue-400 mt-0.5">
                  {matchResult.preferredCompatibility}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {matchResult.matchedPreferredSkills.length} of {job.preferredSkills.length} matched
                </div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 font-medium">Experience (10%)</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {matchResult.experienceCompatibility}%
                </div>
                <div className="text-[10px] text-slate-400">{job.experience} req.</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 font-medium">Education (10%)</div>
                <div className="text-base font-bold text-purple-400 mt-0.5">
                  {matchResult.educationCompatibility}%
                </div>
                <div className="text-[10px] text-slate-400">Degree aligned</div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills Detailed Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Skill Alignment Matrix
            </h4>

            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Matched Skills ({matchResult.allMatchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.allMatchedSkills.length > 0 ? (
                  matchResult.allMatchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300"
                    >
                      {skill} ✓
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills matched yet.</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Missing Skills ({matchResult.allMissingSkills.length})</span>
                </div>
                {matchResult.allMissingSkills.length > 0 && onNavigateToSkillGap && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToSkillGap(job);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                  >
                    View Course Recommendations <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.allMissingSkills.length > 0 ? (
                  matchResult.allMissingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold text-xs border border-rose-300"
                    >
                      {skill} ✗
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold">
                    Congratulations! You meet all specified skills for this role!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Job Overview Metadata Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Employment Type</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{job.employmentType}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Experience Required</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{job.experience}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Vacancies</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{job.vacancies} Openings</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Education</span>
              <p className="font-bold text-slate-800 text-xs mt-0.5 truncate" title={job.education}>
                {job.education}
              </p>
            </div>
          </div>

          {/* Job Description Text */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Role Description
            </h4>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              {job.description}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span
              className={`font-bold ${
                remainingToday > 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {remainingToday} of 10
            </span>
            <span>daily applications remaining today.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onSaveJob && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  isSaved
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save Job'}</span>
              </button>
            )}

            <button
              onClick={handleApply}
              disabled={applying || hasApplied || remainingToday <= 0}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition ${
                hasApplied
                  ? 'bg-emerald-600 text-white cursor-default'
                  : remainingToday <= 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {hasApplied
                  ? 'Applied'
                  : applying
                  ? 'Submitting Application...'
                  : remainingToday <= 0
                  ? 'Daily Limit Reached (10/10)'
                  : 'Apply Now'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
