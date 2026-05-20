'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import type { Job, PageResponse } from '@/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  PlusIcon, EyeIcon, UsersIcon, PencilIcon,
  BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon,
} from 'lucide-react';
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
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<PageResponse<Job>>('/api/recruiter/jobs', {
        params: { page, size: 10 },
      });
      setJobs(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách job');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handlePublish = async (id: number) => {
    setPublishingId(id);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/publish`);
      toast.success('Đăng tin thành công!');
      fetchJobs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Đăng tin thất bại');
    } finally {
      setPublishingId(null);
    }
  };

  const handleClose = async (id: number) => {
    if (!confirm('Đóng tin tuyển dụng này?')) return;
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/close`);
      toast.success('Đã đóng tin');
      fetchJobs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin tuyển dụng</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Đang tải...' : `${total} tin tuyển dụng`}
          </p>
        </div>
        <Link href="/recruiter/jobs/create">
          <Button>
            <PlusIcon className="h-4 w-4" /> Đăng tin mới
          </Button>
        </Link>
      </div>

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
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/recruiter/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
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
                  <Button
                    size="sm"
                    loading={publishingId === job.id}
                    onClick={() => handlePublish(job.id)}
                  >
                    Đăng tin
                  </Button>
                )}
                {job.status === 'ACTIVE' && (
                  <Button variant="danger" size="sm" onClick={() => handleClose(job.id)}>
                    Đóng tin
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
              >
                {p + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
