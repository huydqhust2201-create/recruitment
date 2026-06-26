'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  BuildingIcon, MapPinIcon, GlobeIcon, UsersIcon, BriefcaseIcon,
  ShieldCheckIcon, ArrowLeftIcon, ClockIcon,
} from 'lucide-react';
import { formatSalary, JOB_TYPE_LABELS, JOB_LEVEL_LABELS, timeAgo } from '@/lib/utils';

const BRAND = '#0d7a5f';

interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  city?: string;
  isVerified: boolean;
}

interface CompanyJob {
  id: string;
  title: string;
  slug: string;
  city: string;
  jobType: string;
  level: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryPublic: boolean;
  applyCount: number;
  deadline?: string;
  publishedAt?: string;
}

const SIZE_LABELS: Record<string, string> = {
  '1_10': '1–10 nhân viên',
  '11_50': '11–50 nhân viên',
  '51_200': '51–200 nhân viên',
  '201_500': '201–500 nhân viên',
  '500_PLUS': '500+ nhân viên',
};

export default function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      axiosInstance.get<CompanyDetail>(`/api/public/companies/${id}`),
      axiosInstance.get<CompanyJob[]>(`/api/public/companies/${id}/jobs`),
    ]).then(([cRes, jRes]) => {
      setCompany(cRes.data);
      setJobs(jRes.data);
    }).catch(() => {
      setError('Không tìm thấy công ty');
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen" style={{ background: 'var(--surface-tinted)' }}>
      <Navbar />
      <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
    </div>
  );

  if (error || !company) return (
    <div className="min-h-screen" style={{ background: 'var(--surface-tinted)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <BuildingIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">{error || 'Không tìm thấy công ty'}</p>
        <Link href="/jobs" className="mt-4 inline-block text-sm" style={{ color: BRAND }}>← Quay lại tìm việc</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-tinted)' }}>
      <Navbar />

      {/* Hero banner */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND}, #0a5c47)` }} className="pt-10 pb-8 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-green-200 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeftIcon className="h-4 w-4" /> Quay lại tìm việc
          </Link>

          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              {company.logoUrl
                ? <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain p-1" />
                : <BuildingIcon className="h-9 w-9 text-gray-400" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                {company.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-white/20 text-white">
                    <ShieldCheckIcon className="h-3.5 w-3.5" /> Đã xác minh
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-green-200 text-sm">
                {company.industry && <span>{company.industry}</span>}
                {company.city && <span className="flex items-center gap-1"><MapPinIcon className="h-3.5 w-3.5" />{company.city}</span>}
                {company.companySize && <span className="flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" />{SIZE_LABELS[company.companySize] ?? company.companySize}</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors">
                    <GlobeIcon className="h-3.5 w-3.5" />{company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — description */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {company.description && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Giới thiệu công ty</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{company.description}</p>
            </div>
          )}

          {/* Job listings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4" style={{ color: BRAND }} />
                Vị trí đang tuyển
                <span className="text-xs font-normal rounded-full px-2 py-0.5" style={{ backgroundColor: 'var(--brand-light)', color: BRAND }}>
                  {jobs.length} vị trí
                </span>
              </h2>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <BriefcaseIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Chưa có vị trí tuyển dụng</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {jobs.map(job => (
                  <Link key={job.id} href={`/jobs/${job.slug}`}>
                    <div className="rounded-xl border border-gray-200 p-4 hover:border-[#b2dfcf] hover:shadow-sm transition-all"
                      onMouseEnter={e => (e.currentTarget.style.borderColor = BRAND)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                      <p className="font-semibold text-gray-900 text-sm mb-1">{job.title}</p>
                      <p className="text-sm font-medium mb-2" style={{ color: BRAND }}>
                        {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)}
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 flex items-center gap-1 text-gray-600">
                          <MapPinIcon className="h-3 w-3" />{job.city}
                        </span>
                        <span className="rounded-full px-2.5 py-0.5 font-medium"
                          style={{ backgroundColor: 'var(--tag-fulltime-bg)', color: 'var(--tag-fulltime-text)' }}>
                          {JOB_TYPE_LABELS[job.jobType]}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600">
                          {JOB_LEVEL_LABELS[job.level]}
                        </span>
                        {job.publishedAt && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-400 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />{timeAgo(job.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — info sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin công ty</h3>
            <div className="flex flex-col gap-3 text-sm">
              {company.industry && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-20 shrink-0">Ngành</span>
                  <span className="text-gray-900 font-medium">{company.industry}</span>
                </div>
              )}
              {company.companySize && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-20 shrink-0">Quy mô</span>
                  <span className="text-gray-900 font-medium">{SIZE_LABELS[company.companySize] ?? company.companySize}</span>
                </div>
              )}
              {company.city && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-20 shrink-0">Địa điểm</span>
                  <span className="text-gray-900 font-medium">{company.city}</span>
                </div>
              )}
              {company.website && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-20 shrink-0">Website</span>
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="font-medium truncate" style={{ color: BRAND }}>
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {company.isVerified && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm"
                style={{ color: BRAND }}>
                <ShieldCheckIcon className="h-4 w-4 shrink-0" />
                <span className="font-medium">Công ty đã được xác minh bởi RecruitAI</span>
              </div>
            )}
          </div>

          <Link href={`/jobs?companyId=${company.id}`}>
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center hover:border-[#0d7a5f] transition-colors">
              <p className="text-sm font-medium" style={{ color: BRAND }}>Xem tất cả {jobs.length} tin tuyển dụng</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
