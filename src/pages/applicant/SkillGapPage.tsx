import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting, MatchScoreResult } from '../../types';
import { calculateJobMatch } from '../../services/matchingEngine';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  CheckCircle2,
  XCircle,
  PlusCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  GraduationCap,
  TrendingUp,
  Award,
  ExternalLink,
  Target,
  Check,
} from 'lucide-react';

interface SkillGapPageProps {
  onNavigateToCourses: (skill: string) => void;
  targetJob?: JobPosting | null;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({
  onNavigateToCourses,
  targetJob: initialTargetJob,
}) => {
  const { applicantProfile, saveApplicantProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [learnedSkills, setLearnedSkills] = useState<Set<string>>(new Set());
  const [learningActionLoading, setLearningActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const snap = await getDocs(collection(db, 'jobs'));
        const list: JobPosting[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as any) });
        });
        setJobs(list);
        if (initialTargetJob) {
          setSelectedJobId(initialTargetJob.id);
        } else if (list.length > 0) {
          setSelectedJobId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching jobs for skill gap:', err);
      }
    };
    fetchJobs();
  }, [initialTargetJob]);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;
  const matchResult: MatchScoreResult = activeJob
    ? calculateJobMatch(applicantProfile, activeJob)
    : {
        overallScore: 0,
        category: 'Low Match',
        categoryColor: 'rose',
        requiredCompatibility: 0,
        preferredCompatibility: 0,
        experienceCompatibility: 0,
        educationCompatibility: 0,
        matchedRequiredSkills: [],
        missingRequiredSkills: [],
        matchedPreferredSkills: [],
        missingPreferredSkills: [],
        allMatchedSkills: [],
        allMissingSkills: [],
        additionalSkills: [],
        explanation: '',
      };

  const totalRequired = activeJob
    ? (activeJob.requiredSkills?.length || 0) + (activeJob.preferredSkills?.length || 0)
    : 0;
  const totalMatched = matchResult.allMatchedSkills.length;
  const totalMissing = matchResult.allMissingSkills.length;
  const skillCompletionPercentage =
    totalRequired > 0 ? Math.round((totalMatched / totalRequired) * 100) : 100;

  // Mark skill as learned -> appends to applicant profile
  const handleMarkAsLearned = async (skillName: string) => {
    if (!applicantProfile) return;
    setLearningActionLoading(skillName);
    try {
      const updatedTools = [...(applicantProfile.tools || []), skillName];
      await saveApplicantProfile({ tools: updatedTools });
      setLearnedSkills((prev) => new Set([...prev, skillName]));
    } catch (err) {
      console.error('Error marking skill as learned:', err);
    } finally {
      setLearningActionLoading(null);
    }
  };

  // Why skill is required generator
  const getSkillExplanation = (skill: string) => {
    const s = skill.toLowerCase();
    if (s.includes('react') || s.includes('vue') || s.includes('angular')) {
      return {
        why: 'Required for architecting interactive client-side single-page applications, UI state management, and real-time DOM rendering.',
        importance: 'High' as const,
        howToLearn: 'Build 2 project components, study state hooks and context, and integrate API endpoints.',
      };
    }
    if (s.includes('python') || s.includes('fastapi') || s.includes('django')) {
      return {
        why: 'Central backend language for data transformation pipelines, asynchronous microservices, and AI model orchestration.',
        importance: 'High' as const,
        howToLearn: 'Practice clean OOP syntax, write REST APIs using FastAPI, and connect to PostgreSQL.',
      };
    }
    if (s.includes('docker') || s.includes('kubernetes')) {
      return {
        why: 'Essential for containerizing microservices, ensuring reproducible build environments, and zero-downtime deployment pipelines.',
        importance: 'High' as const,
        howToLearn: 'Write Dockerfiles with multi-stage builds, run Docker Compose locally, and containerize a web app.',
      };
    }
    if (s.includes('aws') || s.includes('cloud') || s.includes('azure') || s.includes('gcp')) {
      return {
        why: 'Industry standard cloud infrastructure hosting scalable storage, serverless lambdas, and relational databases.',
        importance: 'High' as const,
        howToLearn: 'Complete AWS Cloud Practitioner exercises, configure S3 buckets, and deploy serverless functions.',
      };
    }
    if (s.includes('sql') || s.includes('postgres') || s.includes('mongo')) {
      return {
        why: 'Core data persistence layer necessary for ACID transaction safety, relational queries, and data integrity.',
        importance: 'High' as const,
        howToLearn: 'Practice complex joins, indexing strategies, and database schema migrations.',
      };
    }
    return {
      why: `Crucial industry skill demanded in ${activeJob?.title || 'this role'} for efficient system design, maintainability, and quality.`,
      importance: 'Medium' as const,
      howToLearn: 'Follow official developer documentation, complete freeCodeCamp interactive labs, and build a portfolio repo.',
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Targeted Skill Calibration</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Skill Gap Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Compare your profile against target jobs to identify exact missing competencies and fast-track learning.
          </p>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 pl-2">Target Job:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-xs font-bold text-indigo-600 bg-indigo-50/60 p-2 rounded-xl border border-indigo-200 focus:outline-none cursor-pointer max-w-xs"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skill Improvement Dashboard Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left flex-1">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {activeJob?.title} @ {activeJob?.company}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Skill Alignment: {skillCompletionPercentage}% Complete
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              You possess <strong className="text-emerald-400">{totalMatched}</strong> of{' '}
              <strong className="text-white">{totalRequired}</strong> skills required or preferred
              for this position. Master the <strong className="text-rose-400">{totalMissing} missing skills</strong> below to maximize your interview selection rate!
            </p>

            <div className="w-full bg-slate-800 rounded-full h-3 max-w-md mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-3 rounded-full transition-all duration-700"
                style={{ width: `${skillCompletionPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 min-w-[100px]">
              <div className="text-2xl font-black text-emerald-400">{totalMatched}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Matched (Green)</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 min-w-[100px]">
              <div className="text-2xl font-black text-rose-400">{totalMissing}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Missing (Red)</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 min-w-[100px]">
              <div className="text-2xl font-black text-blue-400">
                {matchResult.additionalSkills.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Extra (Blue)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Categories Section (Section 7 A, B, C) */}
      <div className="grid grid-cols-1 gap-8">
        {/* Category B: Missing Skills - Red (High priority actionable list) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-rose-500" />
              <h3 className="text-lg font-black text-slate-900">
                Missing Skills ({matchResult.allMissingSkills.length}) – Red
              </h3>
            </div>
            <span className="text-xs text-rose-600 font-semibold">Priority Gap Focus</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchResult.allMissingSkills.map((skill) => {
              const details = getSkillExplanation(skill);
              const isLearned = learnedSkills.has(skill);

              return (
                <div
                  key={skill}
                  className="p-5 rounded-2xl bg-white border border-rose-200 hover:border-rose-300 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900">{skill}</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                          {details.importance} Priority
                        </span>
                      </div>
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-700">Why required: </strong>
                        <span className="text-slate-600">{details.why}</span>
                      </div>
                      <div>
                        <strong className="text-slate-700">Recommended Path: </strong>
                        <span className="text-slate-600">{details.howToLearn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <button
                      onClick={() => onNavigateToCourses(skill)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>View Courses</span>
                    </button>

                    <button
                      onClick={() => handleMarkAsLearned(skill)}
                      disabled={isLearned || learningActionLoading === skill}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isLearned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isLearned ? 'Marked as Learned!' : 'Mark as Learned'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {matchResult.allMissingSkills.length === 0 && (
              <div className="col-span-2 p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Zero Missing Skills!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  You possess 100% of the required technical qualifications for this role.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category A: Matched Skills - Green */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <h3 className="text-lg font-black text-slate-900">
              Matched Skills ({matchResult.allMatchedSkills.length}) – Green
            </h3>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div className="flex flex-wrap gap-2">
              {matchResult.allMatchedSkills.map((skill) => (
                <div
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{skill}</span>
                </div>
              ))}
              {matchResult.allMatchedSkills.length === 0 && (
                <span className="text-xs text-slate-500 italic">No skills matched yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Category C: Additional Skills - Blue */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <h3 className="text-lg font-black text-slate-900">
              Additional Skills ({matchResult.additionalSkills.length}) – Blue
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Skills extracted from your resume that give you a competitive edge beyond the base requirements.
          </p>

          <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-xs">
            <div className="flex flex-wrap gap-2">
              {matchResult.additionalSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200"
                >
                  {skill}
                </span>
              ))}
              {matchResult.additionalSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic">None</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
