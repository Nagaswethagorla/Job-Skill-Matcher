import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CourseRecommendation, JobPosting } from '../../types';
import { calculateJobMatch } from '../../services/matchingEngine';
import { getCoursesForSkill } from '../../services/courseData';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  GraduationCap,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  Filter,
  Search,
  Code2,
  Award,
} from 'lucide-react';

interface CoursesPageProps {
  initialSkill?: string;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ initialSkill }) => {
  const { applicantProfile } = useAuth();
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSkill || 'React');
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');

  // Discover all missing skills across active jobs
  useEffect(() => {
    const fetchMissingSkills = async () => {
      try {
        const snap = await getDocs(collection(db, 'jobs'));
        const allMissing = new Set<string>();
        snap.forEach((doc) => {
          const job = { id: doc.id, ...(doc.data() as any) } as JobPosting;
          const match = calculateJobMatch(applicantProfile, job);
          match.allMissingSkills.forEach((s) => allMissing.add(s));
        });

        const list = Array.from(allMissing);
        if (list.length > 0) {
          setMissingSkills(list);
          if (!initialSkill && !list.includes(selectedSkill)) {
            setSelectedSkill(list[0]);
          }
        } else {
          // Default skills if none missing
          setMissingSkills(['React', 'TypeScript', 'Docker', 'AWS', 'Python', 'PostgreSQL']);
        }
      } catch (err) {
        console.warn('Courses page missing skills scan note:', err);
        setMissingSkills(['React', 'TypeScript', 'Docker', 'AWS', 'Python', 'PostgreSQL']);
      }
    };
    fetchMissingSkills();
  }, [applicantProfile]);

  // Load courses for the selected skill
  useEffect(() => {
    if (!selectedSkill) return;

    const loadCourses = async () => {
      setLoading(true);
      try {
        // Try backend AI / verified endpoint first
        const res = await fetch('/api/recommend-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skill: selectedSkill }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
            setCourses(data.courses);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend course endpoint note, using verified catalog:', err);
      }

      // Fallback to verified real course catalog
      const local = getCoursesForSkill(selectedSkill);
      setCourses(local);
      setLoading(false);
    };

    loadCourses();
  }, [selectedSkill]);

  // Filter courses by platform or level
  const filteredCourses = courses.filter((c) => {
    const matchesPlatform =
      filterPlatform === 'All' || c.learningPlatform.toLowerCase() === filterPlatform.toLowerCase();
    const matchesLevel = filterLevel === 'All' || c.level === filterLevel;
    return matchesPlatform && matchesLevel;
  });

  const getPlatformBadge = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('coursera')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (p.includes('freecodecamp')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (p.includes('udemy')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4" />
          <span>Curated Learning Pathways</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          AI Course Recommendations
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Verified official resources and accredited courses targeted directly at closing your job skill gaps.
        </p>
      </div>

      {/* Select Missing Skill Horizontal Scroll Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Select Missing Skill to Learn:
          </span>
          <span className="text-xs text-slate-400">
            {missingSkills.length} identified gaps
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {missingSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSkill === skill
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-102'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Overview Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Recommended Courses for <span className="text-indigo-600">"{selectedSkill}"</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            All courses feature verifiable curriculum links and practical portfolio exercises.
          </p>
        </div>

        {/* Platform & Level Filter */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Platforms</option>
            <option value="Coursera">Coursera</option>
            <option value="freeCodeCamp">freeCodeCamp</option>
            <option value="Udemy">Udemy</option>
            <option value="Official Docs">Official Docs</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCourses.map((course, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getPlatformBadge(
                    course.learningPlatform
                  )}`}
                >
                  {course.learningPlatform}
                </span>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {course.level}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
                {course.courseName}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {course.courseDescription}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">
                Skill: <span className="text-indigo-600 font-bold">{course.skillCovered}</span>
              </span>

              <a
                href={course.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <span>Open Verified Course</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
