export interface User {
  email: string;
  role: 'CANDIDATE' | 'RECRUITER';
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: 'CANDIDATE' | 'RECRUITER';
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
  id: number;
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
  id: number;
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
  companyId: number;
  companyName: string;
  companyLogo?: string;
  skills: JobSkill[];
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID' | 'INTERNSHIP';
export type JobLevel = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface JobCriteria {
  id: number;
  jobId: number;
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
