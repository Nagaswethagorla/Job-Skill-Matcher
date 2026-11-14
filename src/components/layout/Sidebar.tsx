import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileUp,
  Search,
  FileCheck2,
  GitCompare,
  GraduationCap,
  User,
  LogOut,
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { role, logout, userProfile, profileCompletion, applicantProfile } = useAuth();

  // Navigation configurations based on role
  const applicantNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload-resume', label: 'Upload Resume', icon: FileUp, badge: applicantProfile?.resumeFileName ? 'Uploaded' : 'Required' },
    { id: 'find-jobs', label: 'Find Jobs', icon: Search },
    { id: 'my-applications', label: 'My Applications', icon: FileCheck2 },
    { id: 'skill-gap', label: 'Skill Gap Analysis', icon: GitCompare },
    { id: 'recommended-courses', label: 'Recommended Courses', icon: GraduationCap },
    { id: 'my-profile', label: 'My Profile', icon: User },
  ];

  const recruiterNav: NavItem[] = [
    { id: 'recruiter-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'post-job', label: 'Post a Job', icon: PlusCircle },
    { id: 'manage-jobs', label: 'Manage Jobs', icon: Briefcase },
    { id: 'find-candidates', label: 'Find Candidates', icon: Users },
    { id: 'recruiter-applications', label: 'Applications', icon: FileCheck2 },
    { id: 'recruiter-profile', label: 'Recruiter Profile', icon: User },
  ];

  const currentNav = role === 'recruiter' ? recruiterNav : applicantNav;

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Dark Navy Blue Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0b1329] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900/50">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-wide">
                Career<span className="text-indigo-400">Assistant</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {role === 'recruiter' ? 'Recruiter Portal' : 'Applicant Portal'}
              </div>
            </div>
          </div>

          {/* Profile Completion Indicator (For Applicants) */}
          {role === 'applicant' && (
            <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Profile Readiness</span>
                <span className="text-indigo-400 font-bold">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                {profileCompletion < 80 ? (
                  <span>Upload resume to reach 100%</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Profile fully calibrated
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Nav Items List */}
          <nav className="px-3 mt-4 space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badge === 'Uploaded'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Info and Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-slate-200 truncate">
                  {userProfile?.displayName || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {userProfile?.email || 'user@example.com'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
