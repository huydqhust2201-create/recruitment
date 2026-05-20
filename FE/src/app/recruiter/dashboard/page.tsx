'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axios';
import type { Job, PageResponse } from '@/types';
import { BriefcaseIcon, UsersIcon, EyeIcon, PlusIcon, ArrowRightIcon, TrendingUpIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get<PageResponse<Job>>('/api/recruiter/jobs', { params: { page: 0, size: 5 } })
      .then((res) => setJobs(res.data.content))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) => j.status === 'ACTIVE');
  const totalApply = jobs.reduce((sum, j) => sum + j.applyCount, 0);
  const totalViews = jobs.reduce((sum, j) => sum + j.viewCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user?.fullName}!</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tin tuyển dụng và theo dõi ứng viên</p>
        </div>
        <Link href="/recruiter/jobs/create">
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-4 w-4" /> Đăng tin mới
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<BriefcaseIcon className="h-5 w-5 text-blue-600" />} label="Tin đang active" value={activeJobs.length} bg="bg-blue-50" />
        <StatCard icon={<BriefcaseIcon className="h-5 w-5 text-gray-600" />} label="Tổng tin đăng" value={jobs.length} bg="bg-gray-100" />
        <StatCard icon={<UsersIcon className="h-5 w-5 text-green-600" />} label="Lượt ứng tuyển" value={totalApply} bg="bg-green-50" />
        <StatCard icon={<EyeIcon className="h-5 w-5 text-purple-600" />} label="Lượt xem" value={totalViews} bg="bg-purple-50" />
      </div>

      {/* Recent jobs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Tin tuyển dụng gần đây</h2>
          <Link href="/recruiter/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Xem tất cả <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10">
            <BriefcaseIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có tin tuyển dụng nào</p>
            <Link href="/recruiter/jobs/create" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700">
              Đăng tin đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {jobs.map((job) => (
              <Link key={job.id} href={`/recruiter/jobs/${job.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Đăng {formatDate(job.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><EyeIcon className="h-3.5 w-3.5" /> {job.viewCount}</span>
                  <span className="flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" /> {job.applyCount}</span>
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink href="/recruiter/company" icon={<TrendingUpIcon className="h-5 w-5 text-indigo-600" />} title="Cập nhật thông tin công ty" desc="Logo, mô tả công ty, địa chỉ" />
        <QuickLink href="/recruiter/jobs/create" icon={<PlusIcon className="h-5 w-5 text-blue-600" />} title="Đăng tin tuyển dụng mới" desc="Tạo JD và thiết lập tiêu chí AI" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex rounded-lg ${bg} p-2 mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4 group">
        <div className="flex-shrink-0 rounded-xl bg-gray-50 p-3">{icon}</div>
        <div>
          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        <ArrowRightIcon className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
      </div>
    </Link>
  );
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active', DRAFT: 'Nháp', PAUSED: 'Tạm dừng', CLOSED: 'Đã đóng',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
