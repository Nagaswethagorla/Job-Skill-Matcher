import { ApplicantProfile } from '../types';

export interface ResumeHealthCheck {
  id: string;
  label: string;
  passed: boolean;
  score: number;
  maxScore: number;
  detail: string;
}

export interface ResumeSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  actionTab: 'upload-resume' | 'my-profile';
  actionLabel: string;
}

export interface ResumeHealthReport {
  score: number;
  grade: 'Industry Ready' | 'Strong' | 'Developing' | 'Needs Attention';
  color: 'emerald' | 'blue' | 'amber' | 'rose';
  checks: ResumeHealthCheck[];
  suggestions: ResumeSuggestion[];
  passedCount: number;
  totalChecks: number;
}

export function analyzeResumeHealth(profile: ApplicantProfile | null): ResumeHealthReport {
  if (!profile) {
    return {
      score: 0,
      grade: 'Needs Attention',
      color: 'rose',
      checks: [
        {
          id: 'resume-file',
          label: 'Resume Document Uploaded',
          passed: false,
          score: 0,
          maxScore: 15,
          detail: 'No PDF or DOCX resume file detected',
        },
      ],
      suggestions: [
        {
          id: 'upload-first',
          title: 'Upload your resume (PDF or DOCX)',
          description:
            'Industry ATS systems require a structured resume document. Upload yours for AI parsing and health scoring.',
          priority: 'High',
          actionTab: 'upload-resume',
          actionLabel: 'Upload Resume',
        },
      ],
      passedCount: 0,
      totalChecks: 7,
    };
  }

  const totalTechSkills =
    (profile.programmingLanguages?.length || 0) +
    (profile.frameworks?.length || 0) +
    (profile.tools?.length || 0);

  const hasContact = Boolean(
    profile.fullName?.trim() && profile.email?.trim() && profile.phone?.trim()
  );
  const hasResumeFile = Boolean(profile.resumeFileName?.trim());
  const hasSummary = Boolean(profile.summary && profile.summary.trim().length >= 40);
  const hasEducation = Boolean(profile.degree?.trim() && profile.college?.trim());
  const hasTechDepth = totalTechSkills >= 6;
  const hasExperienceOrProjects =
    (profile.experience?.length || 0) >= 1 ||
    (profile.projects?.length || 0) >= 2 ||
    (profile.experienceYears || 0) >= 1;
  const hasSoftAndCerts =
    (profile.softSkills?.length || 0) >= 2 && (profile.certifications?.length || 0) >= 1;

  const checks: ResumeHealthCheck[] = [
    {
      id: 'resume-file',
      label: 'Active Resume Document',
      passed: hasResumeFile,
      score: hasResumeFile ? 15 : 0,
      maxScore: 15,
      detail: hasResumeFile
        ? `Attached: ${profile.resumeFileName}`
        : 'Upload a PDF or DOCX for ATS verification',
    },
    {
      id: 'contact',
      label: 'Complete Contact Header',
      passed: hasContact,
      score: hasContact ? 15 : profile.fullName && profile.email ? 8 : 0,
      maxScore: 15,
      detail: hasContact
        ? 'Name, email, and phone verified'
        : 'Missing phone number or contact field',
    },
    {
      id: 'summary',
      label: 'Executive Career Summary',
      passed: hasSummary,
      score: hasSummary ? 15 : profile.summary?.trim() ? 7 : 0,
      maxScore: 15,
      detail: hasSummary
        ? 'Clear summary meets 40+ character standard'
        : 'Add a concise 2-3 sentence summary highlighting impact',
    },
    {
      id: 'tech-skills',
      label: 'Technical Skill Breadth (6+ Skills)',
      passed: hasTechDepth,
      score: Math.min(20, Math.round((totalTechSkills / 6) * 20)),
      maxScore: 20,
      detail: `${totalTechSkills} technical skills indexed across languages, frameworks & tools`,
    },
    {
      id: 'experience-projects',
      label: 'Experience & Project Evidence',
      passed: hasExperienceOrProjects,
      score:
        (profile.experience?.length || 0) > 0 && (profile.projects?.length || 0) > 0
          ? 15
          : hasExperienceOrProjects
          ? 10
          : 0,
      maxScore: 15,
      detail:
        (profile.experience?.length || 0) > 0 || (profile.projects?.length || 0) > 0
          ? `${profile.experience?.length || 0} roles, ${profile.projects?.length || 0} projects`
          : `${profile.experienceYears || 0} yrs experience noted; add detailed role/project entries`,
    },
    {
      id: 'education',
      label: 'Education & Institution',
      passed: hasEducation,
      score: hasEducation ? 10 : profile.degree?.trim() ? 5 : 0,
      maxScore: 10,
      detail: hasEducation
        ? `${profile.degree} • ${profile.college}`
        : 'Specify both degree title and college/university',
    },
    {
      id: 'soft-certs',
      label: 'Soft Skills & Certifications',
      passed: hasSoftAndCerts,
      score:
        (profile.softSkills?.length || 0) >= 2 && (profile.certifications?.length || 0) >= 1
          ? 10
          : (profile.softSkills?.length || 0) > 0 || (profile.certifications?.length || 0) > 0
          ? 5
          : 0,
      maxScore: 10,
      detail: `${profile.softSkills?.length || 0} soft skills, ${profile.certifications?.length || 0} certifications`,
    },
  ];

  const score = Math.min(
    100,
    checks.reduce((sum, item) => sum + item.score, 0)
  );

  let grade: ResumeHealthReport['grade'] = 'Needs Attention';
  let color: ResumeHealthReport['color'] = 'rose';
  if (score >= 85) {
    grade = 'Industry Ready';
    color = 'emerald';
  } else if (score >= 65) {
    grade = 'Strong';
    color = 'blue';
  } else if (score >= 45) {
    grade = 'Developing';
    color = 'amber';
  }

  const suggestions: ResumeSuggestion[] = [];

  if (!hasResumeFile) {
    suggestions.push({
      id: 'sug-file',
      title: 'Upload a verified PDF or DOCX resume',
      description:
        'Recruiters and ATS pipelines expect a downloadable formatted resume alongside your structured skills profile.',
      priority: 'High',
      actionTab: 'upload-resume',
      actionLabel: 'Upload Resume',
    });
  }

  if (!hasSummary) {
    suggestions.push({
      id: 'sug-summary',
      title: 'Add a targeted professional summary',
      description:
        'Industry best practice: lead with a 2-sentence summary stating your core domain, years of experience, and primary tech stack.',
      priority: 'High',
      actionTab: 'my-profile',
      actionLabel: 'Edit Summary',
    });
  }

  if (!hasTechDepth) {
    suggestions.push({
      id: 'sug-skills',
      title: `Expand technical skill keywords (${totalTechSkills}/6 recommended)`,
      description:
        'Include specific databases, cloud providers, testing tools, and frameworks to improve ATS match rates.',
      priority: 'High',
      actionTab: 'upload-resume',
      actionLabel: 'Update Skills',
    });
  }

  if (!hasContact) {
    suggestions.push({
      id: 'sug-contact',
      title: 'Complete your contact information',
      description:
        'Ensure your phone number and verified email are included so recruiters can schedule interviews quickly.',
      priority: 'Medium',
      actionTab: 'my-profile',
      actionLabel: 'Update Contact',
    });
  }

  if (!hasEducation) {
    suggestions.push({
      id: 'sug-education',
      title: 'Add university / college name and degree',
      description:
        'Many automated screening filters check both degree level and institution name for eligibility.',
      priority: 'Medium',
      actionTab: 'my-profile',
      actionLabel: 'Add Education',
    });
  }

  if ((profile.projects?.length || 0) === 0 && (profile.experience?.length || 0) === 0) {
    suggestions.push({
      id: 'sug-projects',
      title: 'Include quantified work experience or project highlights',
      description:
        'Re-upload a resume containing project descriptions with measurable outcomes (e.g., latency reduced by 30%).',
      priority: 'Medium',
      actionTab: 'upload-resume',
      actionLabel: 'Parse Full Resume',
    });
  }

  if (!hasSoftAndCerts) {
    suggestions.push({
      id: 'sug-certs',
      title: 'Add industry certifications & collaboration skills',
      description:
        'Listing recognized credentials (AWS, Google, Coursera) and soft skills like Agile Leadership boosts recruiter confidence.',
      priority: 'Low',
      actionTab: 'upload-resume',
      actionLabel: 'Add Credentials',
    });
  }

  return {
    score,
    grade,
    color,
    checks,
    suggestions,
    passedCount: checks.filter((c) => c.passed).length,
    totalChecks: checks.length,
  };
}
