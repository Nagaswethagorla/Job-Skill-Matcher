import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApplicantProfile, WorkExperienceItem, ProjectItem } from '../../types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Trash2,
  RefreshCw,
  Plus,
  X,
  Save,
  Briefcase,
  GraduationCap,
  Wrench,
  Code2,
  HeartHandshake,
  Layers,
  Award,
} from 'lucide-react';

export const ResumeUploadPage: React.FC = () => {
  const { user, applicantProfile, saveApplicantProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form edit states initialized from applicantProfile
  const [formData, setFormData] = useState<ApplicantProfile>(() => {
    return (
      applicantProfile || {
        userId: user?.uid || '',
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        degree: '',
        college: '',
        graduationYear: '',
        experienceYears: 1,
        programmingLanguages: [],
        frameworks: [],
        tools: [],
        softSkills: [],
        experience: [],
        projects: [],
        certifications: [],
        summary: '',
      }
    );
  });

  // Tag input temp strings
  const [newProgLang, setNewProgLang] = useState('');
  const [newFramework, setNewFramework] = useState('');
  const [newTool, setNewTool] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragOver(true);
    } else if (e.type === 'dragleave') {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate type
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMsg('Invalid file format. Please upload a PDF or DOCX resume.');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10 MB limit.');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setUploadProgress(20);

    const uploadPayload = new FormData();
    uploadPayload.append('resume', file);
    uploadPayload.append('userId', user?.uid || '');

    try {
      setUploadProgress(50);
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: uploadPayload,
      });

      setUploadProgress(85);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to process resume');
      }

      const result = await res.json();
      setUploadProgress(100);

      if (result.success && result.extractedData) {
        const extracted = result.extractedData;
        const updated: ApplicantProfile = {
          ...formData,
          fullName: extracted.fullName || formData.fullName || user?.displayName || '',
          email: extracted.email || formData.email || user?.email || '',
          phone: extracted.phone || formData.phone || '',
          degree: extracted.degree || formData.degree || '',
          college: extracted.college || formData.college || '',
          graduationYear: extracted.graduationYear || formData.graduationYear || '',
          experienceYears:
            typeof extracted.experienceYears === 'number'
              ? extracted.experienceYears
              : formData.experienceYears,
          programmingLanguages: Array.from(
            new Set([...(extracted.programmingLanguages || []), ...formData.programmingLanguages])
          ),
          frameworks: Array.from(
            new Set([...(extracted.frameworks || []), ...formData.frameworks])
          ),
          tools: Array.from(new Set([...(extracted.tools || []), ...formData.tools])),
          softSkills: Array.from(
            new Set([...(extracted.softSkills || []), ...formData.softSkills])
          ),
          experience: extracted.experience || formData.experience || [],
          projects: extracted.projects || formData.projects || [],
          certifications: Array.from(
            new Set([...(extracted.certifications || []), ...formData.certifications])
          ),
          summary: extracted.summary || formData.summary || '',
          resumeFileName: file.name,
          updatedAt: new Date().toISOString(),
        };

        setFormData(updated);
        await saveApplicantProfile(updated);
        setSuccessMsg(
          `Resume "${file.name}" analyzed successfully via ${
            result.source === 'gemini-ai' ? 'Gemini AI' : 'Technical Resume Extractor'
          }!`
        );
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setErrorMsg(err.message || 'Error processing uploaded resume file.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await saveApplicantProfile(formData);
      setSuccessMsg('Your profile and extracted skills have been updated successfully!');
    } catch (err: any) {
      setErrorMsg('Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to remove your uploaded resume?')) {
      setSelectedFile(null);
      const updated = { ...formData, resumeFileName: undefined };
      setFormData(updated);
      await saveApplicantProfile(updated);
      setSuccessMsg('Resume reference removed.');
    }
  };

  // Helper to add skill tag
  const addTag = (
    key: 'programmingLanguages' | 'frameworks' | 'tools' | 'softSkills' | 'certifications',
    val: string,
    setVal: (v: string) => void
  ) => {
    if (!val.trim()) return;
    const current = formData[key] || [];
    if (!current.includes(val.trim())) {
      setFormData({ ...formData, [key]: [...current, val.trim()] });
    }
    setVal('');
  };

  // Helper to remove skill tag
  const removeTag = (
    key: 'programmingLanguages' | 'frameworks' | 'tools' | 'softSkills' | 'certifications',
    index: number
  ) => {
    const current = formData[key] || [];
    setFormData({
      ...formData,
      [key]: current.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Gemini AI Resume Analyzer</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Upload & Parse Resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your resume in PDF or DOCX format. Our Gemini AI engine will accurately extract
          your technical skills, experience, education, and credentials for instant job matching.
        </p>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Resume Upload Dropzone Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4 shadow-xs">
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            {isProcessing
              ? 'Extracting & Parsing with Gemini AI...'
              : 'Drop your resume file here, or click to browse'}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
            Supports <strong>PDF</strong> and <strong>DOCX</strong> (Max size: 10 MB). Private,
            secure, and processed on protected backend.
          </p>

          {/* Progress Bar */}
          {uploadProgress !== null && (
            <div className="max-w-md mx-auto mt-6">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 mb-1">
                <span>Analyzing document contents...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Existing Resume Badge */}
        {formData.resumeFileName && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>{formData.resumeFileName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    Analyzed Active Resume
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Last synchronized {new Date(formData.updatedAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Replace Resume
              </button>
              <button
                type="button"
                onClick={handleDeleteResume}
                className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Profile Review & Edit Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              Extracted Profile & Skills
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and adjust the extracted profile details below. Any corrections will immediately
              update your job match scoring.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>

        {/* Basic Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Alexandra Chen"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="applicant@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        {/* Education & Experience Years */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Major</label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="B.S. in Computer Science"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="University of California, Berkeley"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="40"
              value={formData.experienceYears}
              onChange={(e) =>
                setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Professional Summary</label>
          <textarea
            rows={3}
            value={formData.summary || ''}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief overview of technical focus, strengths, and career objectives..."
          />
        </div>

        {/* Technical Skills: Programming Languages */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Programming Languages ({formData.programmingLanguages?.length || 0})
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.programmingLanguages?.map((lang, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200"
              >
                {lang}
                <button
                  type="button"
                  onClick={() => removeTag('programmingLanguages', idx)}
                  className="hover:text-indigo-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newProgLang}
              onChange={(e) => setNewProgLang(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('programmingLanguages', newProgLang, setNewProgLang);
                }
              }}
              placeholder="Add language (e.g. Python, TypeScript)..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
            <button
              type="button"
              onClick={() => addTag('programmingLanguages', newProgLang, setNewProgLang)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100"
            >
              Add
            </button>
          </div>
        </div>

        {/* Technical Skills: Frameworks & Libraries */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Frameworks & Libraries ({formData.frameworks?.length || 0})
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.frameworks?.map((fw, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200"
              >
                {fw}
                <button
                  type="button"
                  onClick={() => removeTag('frameworks', idx)}
                  className="hover:text-purple-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newFramework}
              onChange={(e) => setNewFramework(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('frameworks', newFramework, setNewFramework);
                }
              }}
              placeholder="Add framework (e.g. React, Next.js, FastAPI)..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
            <button
              type="button"
              onClick={() => addTag('frameworks', newFramework, setNewFramework)}
              className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-purple-100"
            >
              Add
            </button>
          </div>
        </div>

        {/* Tools & Technologies */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Tools, Cloud & Databases ({formData.tools?.length || 0})
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tools?.map((tool, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200"
              >
                {tool}
                <button
                  type="button"
                  onClick={() => removeTag('tools', idx)}
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
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('tools', newTool, setNewTool);
                }
              }}
              placeholder="Add tool (e.g. Docker, PostgreSQL, AWS)..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
            <button
              type="button"
              onClick={() => addTag('tools', newTool, setNewTool)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100"
            >
              Add
            </button>
          </div>
        </div>

        {/* Soft Skills & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Soft Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.softSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeTag('softSkills', idx)}
                    className="hover:text-slate-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('softSkills', newSoftSkill, setNewSoftSkill);
                  }
                }}
                placeholder="e.g. Team Leadership, Problem Solving..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-hidden"
              />
              <button
                type="button"
                onClick={() => addTag('softSkills', newSoftSkill, setNewSoftSkill)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Certifications</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.certifications?.map((cert, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200"
                >
                  <Award className="w-3 h-3 text-emerald-600" />
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeTag('certifications', idx)}
                    className="hover:text-emerald-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('certifications', newCertification, setNewCertification);
                  }
                }}
                placeholder="e.g. AWS Certified Developer..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-hidden"
              />
              <button
                type="button"
                onClick={() => addTag('certifications', newCertification, setNewCertification)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
