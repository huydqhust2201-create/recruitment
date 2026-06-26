export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  email: string;
  role: UserRole;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'CANDIDATE' | 'RECRUITER';
}

export interface CandidateProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  headline?: string;
  currentPosition?: string;
  currentCompany?: string;
  bio?: string;
  yearsOfExperience?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  city?: string;
  address?: string;
  careerGoals?: string;
  profileCompleteness: number;
  hasCvEmbedding: boolean;
  lastActive?: string;
  updatedAt?: string;
}

export interface CandidateProfileRequest {
  headline?: string;
  currentPosition?: string;
  currentCompany?: string;
  bio?: string;
  yearsOfExperience?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  city?: string;
  address?: string;
  careerGoals?: string;
}

export interface CvFile {
  id: number;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: CompanySize;
  description?: string;
  city?: string;
  isVerified: boolean;
}

export type CompanySize = '1_10' | '11_50' | '51_200' | '201_500' | '500_PLUS';

export interface JobSkill {
  skillId: number;
  skillName: string;
  isRequired: boolean;
  level?: string;
}

export interface Job {
  id: string;  // UUID từ BE
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  benefits?: string;
  jobType: JobType;
  level: JobLevel;
  industry?: string;
  city: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryPublic: boolean;
  status: JobStatus;
  viewCount: number;
  applyCount: number;
  deadline?: string;
  publishedAt?: string;
  createdAt: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  skills: JobSkill[];
  similarityScore?: number;
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID' | 'INTERNSHIP';
export type JobLevel = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface JobCriteria {
  id: string;
  jobId: string;
  jobTitle: string;
  skillWeight: number;
  experienceWeight: number;
  educationWeight: number;
  passThreshold: number;
  customInstructions?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateFullName: string;
  candidateEmail: string;
  candidateHeadline?: string;
  candidateCurrentPosition?: string;
  candidateYearsExp?: number;
  candidateCity?: string;
  cvFileId: string;
  cvFileUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  aiMatchScore?: number;
  passedThreshold?: boolean;
  skillScore?: number;
  experienceScore?: number;
  educationScore?: number;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationRequest {
  jobId: string;
  cvFileId: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  note?: string;
}

export interface RecommendedJobsResponse {
  hasCvEmbedding: boolean;
  jobs: Job[];
}

export interface AiScore {
  id: string;
  applicationId: string;
  vectorScore?: number;
  llmScore?: number;
  skillScore?: number;
  experienceScore?: number;
  educationScore?: number;
  finalScore?: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  improvementSuggestions?: string[];
  aiModelUsed?: string;
  tokensUsed?: number;
  scoredAt?: string;
}

export interface CoverLetterResponse {
  content: string;
  jobTitle: string;
  companyName: string;
}

// ── CV Builder ────────────────────────────────────────────

export type CvTemplate = 'MODERN' | 'CLASSIC' | 'CREATIVE';

export interface CvPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  headline?: string;
  summary?: string;
}

export interface CvEducationItem {
  school: string;
  degree: string;
  major: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CvExperienceItem {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface CvCertificationItem {
  name: string;
  issuer?: string;
  issuedDate?: string;
}

export interface CvLanguageItem {
  name: string;
  level?: string;
}

export interface CvProjectItem {
  name: string;
  description?: string;
  techStack?: string;
  link?: string;
}

export interface CvBuilderContent {
  personalInfo: CvPersonalInfo;
  educations: CvEducationItem[];
  experiences: CvExperienceItem[];
  skills: string[];
  certifications: CvCertificationItem[];
  languages: CvLanguageItem[];
  projects: CvProjectItem[];
}

export interface CvBuilderDocument {
  id: string;
  title: string;
  template: CvTemplate;
  content: CvBuilderContent;
  exportedCvFileId?: string;
  exportedCvFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}
