import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Sparkles,
  User,
  LogOut,
  Bell,
  RefreshCw,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTab, setActiveTab }) => {
  const { user, userProfile, role, switchDemoRole, logout, profileCompletion } = useAuth();
  const [dailyStats, setDailyStats] = useState<{ appliedToday: number; remainingToday: number }>({
    appliedToday: 0,
    remainingToday: 10,
  });
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Fetch daily application stats for applicant
  const fetchStats = async () => {
    if (user && role === 'applicant') {
      try {
        const res = await fetch(`/api/applications/stats?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setDailyStats({
            appliedToday: data.appliedToday ?? 0,
            remainingToday: data.remainingToday ?? 10,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch application stats:', err);
      }
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [user, role]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Layers className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  JobSkill<span className="text-indigo-600">Matcher</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Career Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Skill Matching • Gap Analysis • Course Pathways
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Status badges and user dropdown */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* For applicants: Daily Application Limit tracker badge */}
          {role === 'applicant' && (
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                dailyStats.remainingToday > 3
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : dailyStats.remainingToday > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
              title="Daily application limit: 10 applications per calendar day"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                Today: <strong className="font-bold">{dailyStats.appliedToday}/10</strong> (
                {dailyStats.remainingToday} remaining)
              </span>
            </div>
          )}

          {/* Role Switcher Pill (Quick demo switcher for recruiters/applicants) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              <span className="text-slate-500">Mode:</span>
              <span
                className={`capitalize font-bold ${
                  role === 'recruiter' ? 'text-purple-600' : 'text-indigo-600'
                }`}
              >
                {role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch User Role
                </div>
                <button
                  onClick={() => {
                    switchDemoRole('applicant');
                    setShowRoleMenu(false);
                    setActiveTab('dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 ${
                    role === 'applicant' ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" /> Job Applicant Mode
                  </span>
                  {role === 'applicant' && <span className="text-xs">✓</span>}
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('recruiter');
                    setShowRoleMenu(false);
                    setActiveTab('recruiter-dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 ${
                    role === 'recruiter' ? 'font-bold text-purple-600 bg-purple-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-500" /> Recruiter Mode
                  </span>
                  {role === 'recruiter' && <span className="text-xs">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile Mini Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.displayName || user?.email || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{role} Account</div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
