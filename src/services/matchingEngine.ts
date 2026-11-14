import { ApplicantProfile, JobPosting, MatchScoreResult, MatchCategory } from '../types';

// Map of canonical skill names and common variations/synonyms
const skillSynonyms: Record<string, string[]> = {
  javascript: ['js', 'ecmascript', 'javascript/typescript', 'vanilla js'],
  typescript: ['ts', 'typescript'],
  react: ['react.js', 'reactjs', 'react native'],
  'node.js': ['node', 'nodejs'],
  'express.js': ['express', 'expressjs'],
  python: ['python3', 'py'],
  postgresql: ['postgres', 'psql'],
  mongodb: ['mongo'],
  docker: ['containerization', 'docker compose'],
  kubernetes: ['k8s'],
  aws: ['amazon web services', 'aws cloud'],
  'google cloud': ['gcp', 'google cloud platform'],
  'html/css': ['html', 'css', 'html5', 'css3'],
  sql: ['relational databases', 'mysql', 'postgresql', 'sqlite'],
  'tailwind css': ['tailwind', 'tailwindcss'],
  'machine learning': ['ml', 'deep learning'],
  'rest api': ['rest', 'restful api', 'apis'],
  git: ['github', 'gitlab', 'version control'],
};

function normalizeSkill(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9#+.]/g, '').trim();
}

function skillMatches(applicantSkill: string, targetSkill: string): boolean {
  const normApp = normalizeSkill(applicantSkill);
  const normTarget = normalizeSkill(targetSkill);

  if (normApp === normTarget) return true;
  if (normApp.includes(normTarget) || normTarget.includes(normApp)) return true;

  // Check synonym mappings
  for (const [canonical, syns] of Object.entries(skillSynonyms)) {
    const group = [canonical, ...syns].map(normalizeSkill);
    if (group.includes(normApp) && group.includes(normTarget)) {
      return true;
    }
  }

  return false;
}

export function calculateJobMatch(
  profile: ApplicantProfile | null,
  job: JobPosting
): MatchScoreResult {
  // If no profile is loaded yet
  if (!profile) {
    return {
      overallScore: 0,
      category: 'Low Match',
      categoryColor: 'rose',
      requiredCompatibility: 0,
      preferredCompatibility: 0,
      experienceCompatibility: 0,
      educationCompatibility: 0,
      matchedRequiredSkills: [],
      missingRequiredSkills: job.requiredSkills || [],
      matchedPreferredSkills: [],
      missingPreferredSkills: job.preferredSkills || [],
      allMatchedSkills: [],
      allMissingSkills: [...(job.requiredSkills || []), ...(job.preferredSkills || [])],
      additionalSkills: [],
      explanation: 'Please upload or complete your resume profile to calculate match score.',
    };
  }

  // Combine all candidate skills
  const applicantSkills = [
    ...(profile.programmingLanguages || []),
    ...(profile.frameworks || []),
    ...(profile.tools || []),
    ...(profile.softSkills || []),
  ];

  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];

  // 1. Required Skills (Weight: 60%)
  const reqSkills = job.requiredSkills || [];
  reqSkills.forEach((reqSkill) => {
    const hasSkill = applicantSkills.some((appSkill) => skillMatches(appSkill, reqSkill));
    if (hasSkill) {
      matchedRequired.push(reqSkill);
    } else {
      missingRequired.push(reqSkill);
    }
  });

  const requiredScore = reqSkills.length > 0
    ? (matchedRequired.length / reqSkills.length) * 100
    : 100;

  // 2. Preferred Skills (Weight: 20%)
  const prefSkills = job.preferredSkills || [];
  prefSkills.forEach((prefSkill) => {
    const hasSkill = applicantSkills.some((appSkill) => skillMatches(appSkill, prefSkill));
    if (hasSkill) {
      matchedPreferred.push(prefSkill);
    } else {
      missingPreferred.push(prefSkill);
    }
  });

  const preferredScore = prefSkills.length > 0
    ? (matchedPreferred.length / prefSkills.length) * 100
    : 100;

  // 3. Experience Compatibility (Weight: 10%)
  // Parse required experience years (e.g., "3+ years", "2-4 years", "Entry level")
  let requiredYears = 1;
  const expMatch = job.experience.match(/(\d+)/);
  if (expMatch) {
    requiredYears = parseInt(expMatch[1], 10);
  } else if (/senior|lead/i.test(job.title) || /senior/i.test(job.experience)) {
    requiredYears = 5;
  }

  const applicantYears = profile.experienceYears || 0;
  let experienceScore = 100;
  if (applicantYears >= requiredYears) {
    experienceScore = 100;
  } else if (applicantYears > 0) {
    experienceScore = Math.max(30, Math.round((applicantYears / requiredYears) * 100));
  } else {
    experienceScore = 20;
  }

  // 4. Education Compatibility (Weight: 10%)
  let educationScore = 70;
  const applicantDegree = (profile.degree || '').toLowerCase();
  const jobEdu = (job.education || '').toLowerCase();

  if (!jobEdu || jobEdu.includes('any') || jobEdu.includes('open')) {
    educationScore = 100;
  } else if (
    (jobEdu.includes('master') && applicantDegree.includes('master')) ||
    (jobEdu.includes('bachelor') && (applicantDegree.includes('bachelor') || applicantDegree.includes('master') || applicantDegree.includes('tech') || applicantDegree.includes('b.s.'))) ||
    applicantDegree.includes('computer') ||
    applicantDegree.includes('engineering')
  ) {
    educationScore = 100;
  } else if (applicantDegree.length > 3) {
    educationScore = 80;
  } else {
    educationScore = 40;
  }

  // Calculate Weighted Overall Match Percentage:
  // Required: 60%
  // Preferred: 20%
  // Experience: 10%
  // Education: 10%
  const weightedTotal =
    requiredScore * 0.6 +
    preferredScore * 0.2 +
    experienceScore * 0.1 +
    educationScore * 0.1;

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedTotal)));

  // Categorization & Color
  let category: MatchCategory = 'Low Match';
  let categoryColor: 'emerald' | 'blue' | 'amber' | 'rose' = 'rose';

  if (overallScore >= 80) {
    category = 'Excellent Match';
    categoryColor = 'emerald';
  } else if (overallScore >= 60) {
    category = 'Good Match';
    categoryColor = 'blue';
  } else if (overallScore >= 40) {
    category = 'Moderate Match';
    categoryColor = 'amber';
  } else {
    category = 'Low Match';
    categoryColor = 'rose';
  }

  // Additional Skills (skills applicant has that are not explicitly required/preferred)
  const allJobSkills = [...reqSkills, ...prefSkills];
  const additionalSkills = applicantSkills.filter(
    (appSkill) => !allJobSkills.some((jobSkill) => skillMatches(appSkill, jobSkill))
  );

  // Generate clear explanation
  const explanationParts: string[] = [];
  explanationParts.push(
    `Required skills match: ${matchedRequired.length}/${reqSkills.length} (${Math.round(requiredScore)}% compatibility, weighted 60%).`
  );
  if (prefSkills.length > 0) {
    explanationParts.push(
      `Preferred skills match: ${matchedPreferred.length}/${prefSkills.length} (${Math.round(preferredScore)}% compatibility, weighted 20%).`
    );
  }
  explanationParts.push(
    `Experience: ${applicantYears} yrs vs ${job.experience} required (${experienceScore}%, weighted 10%).`
  );
  explanationParts.push(
    `Education: ${profile.degree || 'Degree'} matches requirements (${educationScore}%, weighted 10%).`
  );

  return {
    overallScore,
    category,
    categoryColor,
    requiredCompatibility: Math.round(requiredScore),
    preferredCompatibility: Math.round(preferredScore),
    experienceCompatibility: Math.round(experienceScore),
    educationCompatibility: Math.round(educationScore),
    matchedRequiredSkills: matchedRequired,
    missingRequiredSkills: missingRequired,
    matchedPreferredSkills: matchedPreferred,
    missingPreferredSkills: missingPreferred,
    allMatchedSkills: [...matchedRequired, ...matchedPreferred],
    allMissingSkills: [...missingRequired, ...missingPreferred],
    additionalSkills: Array.from(new Set(additionalSkills)),
    explanation: explanationParts.join(' '),
  };
}
