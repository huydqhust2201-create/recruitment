'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import axiosInstance from '@/lib/axios';
import type { Job, PageResponse } from '@/types';
import { formatSalary, timeAgo, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SearchIcon, MapPinIcon, BriefcaseIcon, BuildingIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CITIES = ['', 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
const LEVELS = ['', 'INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', city: '', level: '' });
  const [search, setSearch] = useState({ keyword: '', city: '', level: '' });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 10 };
      if (search.keyword) params.keyword = search.keyword;
      if (search.city) params.city = search.city;
      if (search.level) params.level = search.level;

      const res = await axiosInstance.get<PageResponse<Job>>('/api/jobs', { params });
      setJobs(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách việc làm');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(filters);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search bar */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên việc làm, kỹ năng, công ty..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả địa điểm</option>
              {CITIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả cấp độ</option>
              {LEVELS.filter(Boolean).map((l) => <option key={l} value={l}>{JOB_LEVEL_LABELS[l]}</option>)}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {loading ? 'Đang tải...' : `Tìm thấy ${total.toLocaleString()} việc làm`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy việc làm phù hợp</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khoá hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                  }`}
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
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.slug}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-contain" />
            ) : (
              <BuildingIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-green-600">{formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <MapPinIcon className="h-3.5 w-3.5" /> {job.city}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {JOB_TYPE_LABELS[job.jobType]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {JOB_LEVEL_LABELS[job.level]}
              </span>
              {job.skills.slice(0, 3).map((s) => (
                <span key={s.skillId} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {s.skillName}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-xs text-gray-400">+{job.skills.length - 3}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">{timeAgo(job.publishedAt || job.createdAt)}</p>
          {job.deadline && (
            <p className="text-xs text-gray-400">Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
