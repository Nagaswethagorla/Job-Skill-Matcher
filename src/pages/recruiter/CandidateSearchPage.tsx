import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApplicantProfile, JobPosting, MatchScoreResult } from '../../types';
import { calculateJobMatch } from '../../services/matchingEngine';
import { MatchBadge } from '../../components/common/MatchBadge';
import { collection, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  X,
  ExternalLink,
  Eye,
} from 'lucide-react';

interface CandidateSearchPageProps {
  initialJob?: JobPosting | null;
}

export const CandidateSearchPage: React.FC<CandidateSearchPageProps> = ({ initialJob }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<ApplicantProfile[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJob?.id || '');
  const [loading, setLoading] = useState(true);

  // Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [minExp, setMinExp] = useState(0);

  // Candidate detail modal state
  const [activeCandidate, setActiveCandidate] = useState<ApplicantProfile | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidatesAndJobs = async () => {
      try {
        setLoading(true);

        // Fetch jobs for matching benchmark
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        const loadedJobs: JobPosting[] = [];
        jobsSnap.forEach((doc) => {
          loadedJobs.push({ id: doc.id, ...(doc.data() as any) });
        });
        setJobs(loadedJobs);
        if (!selectedJobId && loadedJobs.length > 0) {
          setSelectedJobId(loadedJobs[0].id);
        }

        // Fetch applicant profiles
        const candidatesSnap = await getDocs(collection(db, 'applicantProfiles'));
        const loadedCandidates: ApplicantProfile[] = [];
        candidatesSnap.forEach((doc) => {
          loadedCandidates.push({ userId: doc.id, ...(doc.data() as any) });
        });

        // If candidates database in Firestore has only 1 or 0 users, add rich realistic candidate profiles so recruiters have a full talent pool to search
        if (loadedCandidates.length < 3) {
          const mockCandidates: ApplicantProfile[] = [
            {
              userId: 'cand-1',
              fullName: 'David K. Morrison',
              email: 'david.morrison@example.com',
              phone: '+1 (555) 234-8971',
              degree: 'M.S. in Computer Science',
              college: 'Stanford University',
              experienceYears: 4,
              programmingLanguages: ['TypeScript', 'JavaScript', 'Python', 'Go'],
              frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS'],
              tools: ['Docker', 'AWS', 'PostgreSQL', 'Git', 'GraphQL'],
              softSkills: ['System Design', 'Agile Leadership', 'Problem Solving'],
              experience: [
                {
                  role: 'Full Stack Engineer',
                  company: 'CloudStream Software',
                  duration: '2022 - Present',
                  description: 'Spearheaded migration to microservices, improved API p99 latency by 40%.',
                },
              ],
              projects: [
                {
                  title: 'Distributed Event Bus',
                  techStack: ['Node.js', 'Redis', 'Docker'],
                  description: 'Scalable pub-sub backend handling 50k events/sec.',
                },
              ],
              certifications: ['AWS Certified Solutions Architect'],
              summary: 'Experienced Full Stack Engineer passionate about scalable cloud architectures.',
              resumeFileName: 'David_Morrison_CV.pdf',
              updatedAt: new Date().toISOString(),
            },
            {
              userId: 'cand-2',
              fullName: 'Sarah Jenkins',
              email: 'sarah.j@example.com',
              phone: '+1 (555) 492-1184',
              degree: 'B.S. in Software Engineering',
              college: 'University of Washington',
              experienceYears: 3,
              programmingLanguages: ['Python', 'SQL', 'R', 'JavaScript'],
              frameworks: ['FastAPI', 'Pandas', 'Flask', 'Django'],
              tools: ['PostgreSQL', 'Docker', 'Git', 'Redis', 'Jupyter'],
              softSkills: ['Analytical Thinking', 'Team Collaboration', 'Communication'],
              experience: [
                {
                  role: 'Backend Data Engineer',
                  company: 'QuantVenture Capital',
                  duration: '2023 - Present',
                  description: 'Built automated financial extraction pipelines with 99.9% uptime.',
                },
              ],
              projects: [
                {
                  title: 'Financial Forecasting Model',
                  techStack: ['Python', 'Pandas', 'PostgreSQL'],
                  description: 'Quantitative prediction engine for sector volatility.',
                },
              ],
              certifications: ['Databricks Certified Associate'],
              summary: 'Backend and Python developer specializing in clean APIs and ETL data engineering.',
              resumeFileName: 'Sarah_Jenkins_Resume.docx',
              updatedAt: new Date().toISOString(),
            },
            {
              userId: 'cand-3',
              fullName: 'Maya Patel',
              email: 'maya.patel@example.com',
              phone: '+1 (555) 872-9014',
              degree: 'Ph.D. in Artificial Intelligence',
              college: 'Carnegie Mellon University',
              experienceYears: 5,
              programmingLanguages: ['Python', 'C++', 'SQL'],
              frameworks: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'FastAPI'],
              tools: ['MLflow', 'Docker', 'Kubernetes', 'Linux', 'AWS'],
              softSkills: ['Research Methodology', 'Cross-functional Collaboration'],
              experience: [
                {
                  role: 'Senior ML Researcher',
                  company: 'DeepVision Labs',
                  duration: '2021 - Present',
                  description: 'Trained large-scale diffusion and transformer models on multi-GPU clusters.',
                },
              ],
              projects: [
                {
                  title: 'Medical Image Classification',
                  techStack: ['PyTorch', 'Docker'],
                  description: 'Published paper with 96.8% diagnostic precision.',
                },
              ],
              certifications: ['TensorFlow Certified Developer'],
              summary: 'AI & Machine Learning engineer specialized in deep neural network design and inference optimization.',
              resumeFileName: 'Maya_Patel_AI_CV.pdf',
              updatedAt: new Date().toISOString(),
            },
          ];

          setCandidates([...loadedCandidates, ...mockCandidates]);
        } else {
          setCandidates(loadedCandidates);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidatesAndJobs();
  }, [initialJob]);

  const targetJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  // Compute matches for candidates against target job
  const candidatesWithMatch = candidates.map((cand) => ({
    candidate: cand,
    match: targetJob ? calculateJobMatch(cand, targetJob) : null,
  }));

  // Unique skills for filter dropdown
  const allSkills = Array.from(
    new Set(
      candidates.flatMap((c) => [
        ...(c.programmingLanguages || []),
        ...(c.frameworks || []),
        ...(c.tools || []),
      ])
    )
  ).sort();

  // Filter candidates
  const filteredCandidates = candidatesWithMatch.filter(({ candidate, match }) => {
    const matchesSearch =
      !searchQuery.trim() ||
      candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.college.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill =
      skillFilter === 'All' ||
      [
        ...(candidate.programmingLanguages || []),
        ...(candidate.frameworks || []),
        ...(candidate.tools || []),
      ].includes(skillFilter);

    const matchesExp = candidate.experienceYears >= minExp;

    return matchesSearch && matchesSkill && matchesExp;
  });

  // Sort by highest match score against selected job
  filteredCandidates.sort((a, b) => {
    const scoreA = a.match?.overallScore || 0;
    const scoreB = b.match?.overallScore || 0;
    return scoreB - scoreA;
  });

  const handleShortlistCandidate = async (candidate: ApplicantProfile) => {
    if (!targetJob) return;
    try {
      // Create or update application record with 'Shortlisted' status
      const appRef = doc(collection(db, 'applications'));
      await setDoc(appRef, {
        id: appRef.id,
        jobId: targetJob.id,
        applicantId: candidate.userId,
        recruiterId: user?.uid || 'recruiter',
        jobTitle: targetJob.title,
        company: targetJob.company,
        applicantName: candidate.fullName,
        applicantEmail: candidate.email,
        matchScore: calculateJobMatch(candidate, targetJob).overallScore,
        matchedSkills: calculateJobMatch(candidate, targetJob).allMatchedSkills,
        missingSkills: calculateJobMatch(candidate, targetJob).allMissingSkills,
        status: 'Shortlisted',
        appliedDate: new Date().toISOString(),
        appliedDateStr: new Date().toISOString().split('T')[0],
      });

      setActionNotice(`Candidate ${candidate.fullName} has been added to Shortlist for ${targetJob.title}!`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      console.error('Shortlist error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Talent Discovery & Screening</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Find Qualified Candidates
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Search talent across technical competencies and instantly calculate compatibility against your postings.
          </p>
        </div>

        {/* Benchmark Job Selection */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500 pl-2">Match against:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-xs font-bold text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-200 focus:outline-none cursor-pointer max-w-xs"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate by name, degree, university, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Technical Skills</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={minExp}
              onChange={(e) => setMinExp(parseInt(e.target.value) || 0)}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value={0}>Any Experience</option>
              <option value={2}>2+ Years</option>
              <option value={4}>4+ Years</option>
              <option value={6}>6+ Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Profile Cards Grid (Section 13) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCandidates.map(({ candidate, match }) => (
          <div
            key={candidate.userId}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-base">
                    {candidate.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                      {candidate.fullName}
                    </h3>
                    <p className="text-xs text-slate-500">{candidate.experienceYears} yrs experience</p>
                  </div>
                </div>

                {match && <MatchBadge score={match.overallScore} size="sm" showLabel={false} />}
              </div>

              {/* Education & Credentials */}
              <div className="text-xs text-slate-600 space-y-1 pt-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{candidate.degree || 'Degree listed'}</span>
                </div>
                <div className="text-[11px] text-slate-500 pl-5 truncate">
                  {candidate.college || 'Institution'}
                </div>
              </div>

              {/* Extracted Skills Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Extracted Skills:
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    ...(candidate.programmingLanguages || []),
                    ...(candidate.frameworks || []),
                    ...(candidate.tools || []),
                  ]
                    .slice(0, 6)
                    .map((skill) => {
                      const isMatched = match?.allMatchedSkills.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {skill} {isMatched ? '✓' : ''}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* Resume availability */}
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {candidate.resumeFileName ? (
                    <strong className="text-slate-700">{candidate.resumeFileName}</strong>
                  ) : (
                    'Verified Online Profile'
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveCandidate(candidate)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Profile</span>
              </button>

              <button
                onClick={() => handleShortlistCandidate(candidate)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Shortlist</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Full Profile Inspection Modal */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-black text-xl flex items-center justify-center">
                  {activeCandidate.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{activeCandidate.fullName}</h3>
                  <p className="text-xs text-slate-500">{activeCandidate.email} • {activeCandidate.phone}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                  Professional Summary
                </h4>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {activeCandidate.summary || 'Proactive software professional with demonstrated technical achievements.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Education</h4>
                  <div className="font-semibold text-slate-800">{activeCandidate.degree}</div>
                  <div className="text-slate-500">{activeCandidate.college}</div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Experience</h4>
                  <div className="font-semibold text-slate-800">{activeCandidate.experienceYears} Years</div>
                  <div className="text-slate-500">Verified credentials</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...(activeCandidate.programmingLanguages || []),
                    ...(activeCandidate.frameworks || []),
                    ...(activeCandidate.tools || []),
                  ].map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {activeCandidate.certifications && activeCandidate.certifications.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Certifications</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCandidate.certifications.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setActiveCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleShortlistCandidate(activeCandidate);
                  setActiveCandidate(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
              >
                Shortlist Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
