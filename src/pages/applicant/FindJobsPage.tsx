import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting, MatchScoreResult } from '../../types';
import { calculateJobMatch } from '../../services/matchingEngine';
import { MatchBadge } from '../../components/common/MatchBadge';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  Send,
  Sparkles,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  Check,
} from 'lucide-react';

interface FindJobsPageProps {
  onSelectJob: (job: JobPosting, match: MatchScoreResult) => void;
  onApply: (job: JobPosting) => Promise<void>;
  savedJobIds: Set<string>;
  onToggleSaveJob: (job: JobPosting) => Promise<void>;
  appliedJobIds: Set<string>;
  remainingToday: number;
}

export const FindJobsPage: React.FC<FindJobsPageProps> = ({
  onSelectJob,
  onApply,
  savedJobIds,
  onToggleSaveJob,
  appliedJobIds,
  remainingToday,
}) => {
  const { applicantProfile } = useAuth();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'latest'>('match');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'jobs'));
        const list: JobPosting[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as any) });
        });
        setJobs(list);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Compute matches for all jobs
  const jobsWithMatch = jobs.map((job) => ({
    job,
    match: calculateJobMatch(applicantProfile, job),
  }));

  // Unique filter options
  const locations = ['All', ...Array.from(new Set(jobs.map((j) => j.location.split('(')[0].trim())))];
  const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid'];
  const allSkills = Array.from(
    new Set(jobs.flatMap((j) => [...(j.requiredSkills || []), ...(j.preferredSkills || [])]))
  ).sort();

  // Filter logic
  const filteredJobs = jobsWithMatch.filter(({ job, match }) => {
    // Search query match (title, company, description)
    const matchesSearch =
      !searchQuery.trim() ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Location filter
    const matchesLocation =
      selectedLocation === 'All' || job.location.includes(selectedLocation);

    // Job Type filter
    const matchesType =
      selectedType === 'All' ||
      job.employmentType === selectedType ||
      job.location.toLowerCase().includes(selectedType.toLowerCase());

    // Experience filter
    const matchesExp =
      selectedExperience === 'All' ||
      (selectedExperience === 'Entry' && (job.experience.includes('1') || job.experience.includes('2') || job.experience.includes('Entry'))) ||
      (selectedExperience === 'Mid' && (job.experience.includes('3') || job.experience.includes('4'))) ||
      (selectedExperience === 'Senior' && (job.experience.includes('5') || job.experience.includes('Senior')));

    // Skill filter
    const matchesSkill =
      selectedSkill === 'All' ||
      job.requiredSkills.includes(selectedSkill) ||
      job.preferredSkills.includes(selectedSkill);

    // Platform filter
    const isUnstop = job.source === 'Unstop' || job.company.toLowerCase().includes('unstop');
    const matchesPlatform =
      selectedPlatform === 'All' ||
      (selectedPlatform === 'Unstop' && isUnstop) ||
      (selectedPlatform === 'Direct' && !isUnstop);

    return matchesSearch && matchesLocation && matchesType && matchesExp && matchesSkill && matchesPlatform;
  });

  // Sorting
  filteredJobs.sort((a, b) => {
    if (sortBy === 'match') {
      return b.match.overallScore - a.match.overallScore;
    } else {
      return new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Compatibility Search</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Find Matching Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Discover roles scored according to your extracted skills, experience, and credentials.
          </p>
        </div>

        {/* Daily limit badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-800 self-start sm:self-auto">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>
            Daily Limit: <strong className="text-indigo-950 font-bold">{remainingToday} of 10</strong>{' '}
            applications remaining today
          </span>
        </div>
      </div>

      {/* Search & Filter Bar Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Search input and Sort dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company name, or keywords..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer"
              >
                <option value="match">Highest Match %</option>
                <option value="latest">Latest Postings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Location */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Job Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Experience Level</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Entry">Entry (1-2 yrs)</option>
              <option value="Mid">Mid Level (3-4 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Filter by Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Skills</option>
              {allSkills.slice(0, 30).map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* Platform / Source Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Platform Source</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none font-bold"
            >
              <option value="All">All Postings</option>
              <option value="Unstop">Unstop Challenges & Drives</option>
              <option value="Direct">Direct Company Postings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredJobs.length}</strong> matching positions
        </span>
        {(searchQuery || selectedLocation !== 'All' || selectedType !== 'All' || selectedExperience !== 'All' || selectedSkill !== 'All' || selectedPlatform !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocation('All');
              setSelectedType('All');
              setSelectedExperience('All');
              setSelectedSkill('All');
              setSelectedPlatform('All');
            }}
            className="text-indigo-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Job Cards Grid */}
      <div className="space-y-4">
        {filteredJobs.map(({ job, match }) => {
          const isSaved = savedJobIds.has(job.id);
          const hasApplied = appliedJobIds.has(job.id);

          return (
            <div
              key={job.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Column: Job Info & Skills */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-4">
                  {/* Company Avatar / Logo */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                    {job.company.charAt(0)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => onSelectJob(job, match)}
                        className="text-lg font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition"
                      >
                        {job.title}
                      </h3>
                      {job.source === 'Unstop' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black shrink-0">
                          {job.platformBadge || 'Unstop Challenge'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-1 font-medium">
                      <span className="font-bold text-slate-800">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salary}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {job.employmentType}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags pill matrix */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Skills:</span>
                  {job.requiredSkills.map((skill) => {
                    const isMatched = match.allMatchedSkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {skill} {isMatched ? '✓' : '✗'}
                      </span>
                    );
                  })}
                  {job.preferredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      +{skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Circular MatchBadge & Actions */}
              <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                <div
                  onClick={() => onSelectJob(job, match)}
                  className="cursor-pointer hover:scale-105 transition"
                  title="Click to view detailed compatibility breakdown"
                >
                  <MatchBadge score={match.overallScore} size="md" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleSaveJob(job)}
                    className={`p-2.5 rounded-xl border text-slate-600 transition ${
                      isSaved
                        ? 'bg-amber-50 text-amber-600 border-amber-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => onSelectJob(job, match)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onApply(job)}
                    disabled={hasApplied || remainingToday <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
                      hasApplied
                        ? 'bg-emerald-600 text-white cursor-default'
                        : remainingToday <= 0
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{hasApplied ? 'Applied' : 'Apply'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && !loading && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No jobs match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, location, or skill filters to see more job openings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
