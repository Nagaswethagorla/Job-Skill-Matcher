export type UserRole = 'applicant' | 'recruiter';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: string;
}

export interface WorkExperienceItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface ProjectItem {
  title: string;
  techStack: string[];
  description: string;
}

export interface ApplicantProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  degree: string;
  college: string;
  graduationYear?: string;
  experienceYears: number;
  programmingLanguages: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
  experience: WorkExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  summary?: string;
  resumeFileName?: string;
  updatedAt?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  education: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  vacancies: number;
  status: 'active' | 'closed';
  recruiterId: string;
  recruiterName?: string;
  createdAt: string;
  updatedAt?: string;
  source?: 'Unstop' | 'Direct Employer' | string;
  platformBadge?: string;
  externalUrl?: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Rejected'
  | 'Selected';

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  recruiterId: string;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  status: ApplicationStatus;
  appliedDate: string;
  appliedDateStr: string;
  notes?: string;
  source?: 'Unstop' | 'Direct Employer' | string;
  roundName?: string;
  challengeUrl?: string;
}

export interface SavedJob {
  id: string;
  applicantId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  savedAt: string;
}

export interface LearningSkill {
  id: string;
  applicantId: string;
  skillName: string;
  status: 'to_learn' | 'in_progress' | 'completed';
  category?: string;
  importance?: 'High' | 'Medium' | 'Low';
  reason?: string;
  howToLearn?: string;
  updatedAt: string;
}

export interface CourseRecommendation {
  courseName: string;
  learningPlatform: 'Coursera' | 'freeCodeCamp' | 'Udemy' | 'Official Docs' | string;
  skillCovered: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  courseDescription: string;
  courseUrl: string;
}

export type MatchCategory = 'Excellent Match' | 'Good Match' | 'Moderate Match' | 'Low Match';

export interface MatchScoreResult {
  overallScore: number;
  category: MatchCategory;
  categoryColor: 'emerald' | 'blue' | 'amber' | 'rose';
  requiredCompatibility: number; // 60% weight
  preferredCompatibility: number; // 20% weight
  experienceCompatibility: number; // 10% weight
  educationCompatibility: number; // 10% weight
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  allMatchedSkills: string[];
  allMissingSkills: string[];
  additionalSkills: string[];
  explanation: string;
}
