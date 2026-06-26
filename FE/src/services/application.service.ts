import axiosInstance from '@/lib/axios';
import type {
  Application,
  ApplicationRequest,
  ApplicationStatus,
  AiScore,
  CoverLetterResponse,
  RecommendedJobsResponse,
  UpdateApplicationStatusRequest,
} from '@/types';

export async function apply(data: ApplicationRequest): Promise<Application> {
  const res = await axiosInstance.post<Application>('/api/applications', data);
  return res.data;
}

export async function getMyApplications(): Promise<Application[]> {
  const res = await axiosInstance.get<Application[]>('/api/candidate/applications');
  return res.data;
}

export async function getMyApplicationForJob(jobId: string): Promise<Application | null> {
  try {
    const res = await axiosInstance.get<Application>(`/api/candidate/applications/job/${jobId}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function getAllApplicationsForRecruiter(): Promise<Application[]> {
  const res = await axiosInstance.get<Application[]>('/api/recruiter/applications');
  return res.data;
}

export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  const res = await axiosInstance.get<Application[]>(`/api/recruiter/jobs/${jobId}/applications`);
  return res.data;
}

export async function getApplicationById(id: string): Promise<Application> {
  const res = await axiosInstance.get<Application>(`/api/recruiter/applications/${id}`);
  return res.data;
}

export async function updateStatus(
  id: string,
  status: ApplicationStatus,
  note?: string
): Promise<Application> {
  const body: UpdateApplicationStatusRequest = { status, note };
  const res = await axiosInstance.put<Application>(`/api/recruiter/applications/${id}/status`, body);
  return res.data;
}

export async function withdrawApplication(id: string): Promise<Application> {
  const res = await axiosInstance.put<Application>(`/api/candidate/applications/${id}/withdraw`);
  return res.data;
}

export async function getRecommendedJobs(): Promise<RecommendedJobsResponse> {
  const res = await axiosInstance.get<RecommendedJobsResponse>('/api/candidate/jobs/recommended');
  return res.data;
}

export async function getApplicationScore(id: string): Promise<AiScore> {
  const res = await axiosInstance.get<AiScore>(`/api/recruiter/applications/${id}/score`);
  return res.data;
}

export async function getMyCandidateScore(applicationId: string): Promise<AiScore> {
  const res = await axiosInstance.get<AiScore>(`/api/candidate/applications/${applicationId}/score`);
  return res.data;
}

export async function generateCoverLetter(jobId: string): Promise<CoverLetterResponse> {
  const res = await axiosInstance.post<CoverLetterResponse>('/api/candidate/cover-letter/generate', { jobId });
  return res.data;
}
