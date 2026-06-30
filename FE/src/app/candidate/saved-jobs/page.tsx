'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import type { Job } from '@/types';
import { formatSalary, timeAgo, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  BookmarkCheckIcon, BookmarkIcon, MapPinIcon, ClockIcon,
  BuildingIcon, BriefcaseIcon, FlameIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BRAND = '#0d7a5f';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsavingId, setUnsavingId] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance.get<Job[]>('/api/candidate/saved-jobs')
      .then(res => setJobs(res.data))
      .catch(() => toast.error('Không thể tải danh sách việc đã lưu'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId: string) => {
    setUnsavingId(jobId);
    try {
      await axiosInstance.delete(`/api/candidate/saved-jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast.success('Đã bỏ lưu việc làm');
    } catch {
      toast.error('Không thể bỏ lưu, vui lòng thử lại');
    } finally {
      setUnsavingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Việc làm đã lưu</h1>
          <p className="text-sm text-gray-500 mt-0.5">{jobs.length} việc làm</p>
        </div>
        <Link href="/jobs"
          className="text-sm font-medium px-4 py-2 rounded-xl border transition-colors hover:bg-gray-50"
          style={{ color: BRAND, borderColor: 'var(--brand-mid)' }}>
          Tìm thêm việc
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Chưa có việc làm nào được lưu</p>
          <p className="text-gray-400 text-sm mt-1">Nhấn biểu tượng bookmark trên mỗi tin để lưu lại</p>
          <Link href="/jobs"
            className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: BRAND }}>
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map(job => (
            <SavedJobCard
              key={job.id}
              job={job}
              unsaving={unsavingId === job.id}
              onUnsave={() => handleUnsave(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedJobCard({ job, unsaving, onUnsave }: { job: Job; unsaving: boolean; onUnsave: () => void }) {
  const isHot = job.applyCount >= 10;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all flex flex-col relative"
      onMouseEnter={e => (e.currentTarget.style.borderColor = BRAND)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
    >
      {/* Unsave button */}
      <button
        onClick={onUnsave}
        disabled={unsaving}
        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
        title="Bỏ lưu"
      >
        <BookmarkCheckIcon className="h-4 w-4" style={{ color: unsaving ? '#d1d5db' : BRAND }} />
      </button>

      <Link href={`/jobs/${job.slug}`} className="flex flex-col flex-1">
        <div className="flex items-start gap-2 mb-3 pr-8">
          <div className="h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {job.companyLogo
              ? <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-contain" />
              : <BuildingIcon className="h-6 w-6 text-gray-300" />}
          </div>
          {isHot && (
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ml-auto shrink-0"
              style={{ backgroundColor: '#fef2f2', color: 'var(--accent-hot)' }}>
              <FlameIcon className="h-3 w-3" /> HOT
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">{job.title}</h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{job.companyName}</p>
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>
          {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            <MapPinIcon className="h-3 w-3" /> {job.city}
          </span>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: 'var(--tag-fulltime-bg)', color: 'var(--tag-fulltime-text)' }}>
            {JOB_TYPE_LABELS[job.jobType]}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {JOB_LEVEL_LABELS[job.level]}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          <ClockIcon className="h-3 w-3" />
          <span>{timeAgo(job.publishedAt || job.createdAt)}</span>
          {job.deadline && (
            <span className={`ml-auto font-medium ${new Date(job.deadline) < new Date() ? 'text-red-400' : ''}`}>
              Hạn {new Date(job.deadline).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
