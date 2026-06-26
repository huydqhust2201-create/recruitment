'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import type { Job } from '@/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PlusIcon, EyeIcon, UsersIcon, PencilIcon, BriefcaseIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, JOB_LEVEL_LABELS, JOB_TYPE_LABELS } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active', DRAFT: 'Nháp', PAUSED: 'Tạm dừng', CLOSED: 'Đã đóng',
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // BE trả về List<JobResponse>, không phải Page
      const res = await axiosInstance.get<Job[]>('/api/recruiter/jobs');
      setJobs(res.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách job');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    const handleFocus = () => fetchJobs();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchJobs]);

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/publish`);
      toast.success('Đăng tin thành công!');
      fetchJobs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng tin thất bại';
      if (msg.includes('tiêu')) {
        toast.error('Cần thiết lập tiêu chí AI trước khi đăng tin. Vào Chi tiết → Thiết lập tiêu chí.');
      } else {
        toast.error(msg);
      }
    } finally {
      setPublishingId(null);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Đóng tin tuyển dụng này?')) return;
    setClosingId(id);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/close`);
      toast.success('Đã đóng tin');
      fetchJobs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setClosingId(null);
    }
  };

  const handlePause = async (id: string) => {
    setPausingId(id);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/pause`);
      toast.success('Đã tạm dừng tin');
      fetchJobs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setPausingId(null);
    }
  };

  const handleResume = async (id: string) => {
    setResumingId(id);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/resume`);
      toast.success('Đã tiếp tục đăng tin');
      fetchJobs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setResumingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin tuyển dụng</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Đang tải...' : `${jobs.length} tin tuyển dụng`}
          </p>
        </div>
        <Link href="/recruiter/jobs/create">
          <Button>
            <PlusIcon className="h-4 w-4" /> Đăng tin mới
          </Button>
        </Link>
      </div>

      {/* Hướng dẫn đăng tin */}
      {!loading && jobs.some((j) => j.status === 'DRAFT') && (
        <div className="flex items-start gap-3 rounded-xl bg-[#e8f5f0] border border-[#b2dfcf] p-4">
          <PencilIcon className="h-5 w-5 text-[#0d7a5f] shrink-0 mt-0.5" />
          <p className="text-sm text-[#0a5c47]">
            Tin ở trạng thái <strong>Nháp</strong> cần vào <strong>Chi tiết → Thiết lập tiêu chí AI</strong> trước, sau đó mới có thể đăng tin.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Chưa có tin tuyển dụng</p>
          <Link href="/recruiter/jobs/create" className="mt-4 inline-block">
            <Button><PlusIcon className="h-4 w-4" /> Đăng tin đầu tiên</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#b2dfcf] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/recruiter/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-[#0d7a5f] transition-colors">
                      {job.title}
                    </Link>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[job.status] ?? job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span>{job.city}</span>
                    <span>{JOB_TYPE_LABELS[job.jobType]}</span>
                    <span>{JOB_LEVEL_LABELS[job.level]}</span>
                    {job.deadline && <span>Hạn: {formatDate(job.deadline)}</span>}
                    <span>Đăng: {formatDate(job.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
                  <span className="flex items-center gap-1"><EyeIcon className="h-4 w-4" /> {job.viewCount}</span>
                  <span className="flex items-center gap-1"><UsersIcon className="h-4 w-4" /> {job.applyCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <Link href={`/recruiter/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-3.5 w-3.5" /> Chi tiết
                  </Button>
                </Link>
                <Link href={`/recruiter/jobs/${job.id}/applications`}>
                  <Button variant="outline" size="sm">
                    <UsersIcon className="h-3.5 w-3.5" /> Ứng viên ({job.applyCount})
                  </Button>
                </Link>
                {job.status === 'DRAFT' && (
                  <Button size="sm" loading={publishingId === job.id} onClick={() => handlePublish(job.id)}>
                    Đăng tin
                  </Button>
                )}
                {job.status === 'ACTIVE' && (
                  <>
                    <Button variant="outline" size="sm" loading={pausingId === job.id} onClick={() => handlePause(job.id)}>
                      Tạm dừng
                    </Button>
                    <Button variant="danger" size="sm" loading={closingId === job.id} onClick={() => handleClose(job.id)}>
                      Đóng tin
                    </Button>
                  </>
                )}
                {job.status === 'PAUSED' && (
                  <>
                    <Button size="sm" loading={resumingId === job.id} onClick={() => handleResume(job.id)}>
                      Tiếp tục
                    </Button>
                    <Button variant="danger" size="sm" loading={closingId === job.id} onClick={() => handleClose(job.id)}>
                      Đóng tin
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
