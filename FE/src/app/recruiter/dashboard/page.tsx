'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axios';
import type { Job } from '@/types';
import {
  BriefcaseIcon, UsersIcon, EyeIcon, PlusIcon, ArrowRightIcon,
  SparklesIcon, SearchIcon, MapPinIcon, FileTextIcon,
  TrendingUpIcon, ExternalLinkIcon, ChevronDownIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getAllApplicationsForRecruiter } from '@/services/application.service';
import type { Application, ApplicationStatus } from '@/types';

const BRAND = '#0d7a5f';
const BRAND_DARK = '#0a5c47';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  SUBMITTED:    { label: 'Đã nộp',         color: 'bg-gray-100 text-gray-600' },
  REVIEWING:    { label: 'Đang xem xét',   color: 'bg-blue-100 text-blue-700' },
  SHORTLISTED:  { label: 'Vòng trong',     color: 'bg-indigo-100 text-indigo-700' },
  INTERVIEWING: { label: 'Phỏng vấn',      color: 'bg-purple-100 text-purple-700' },
  OFFERED:      { label: 'Đề xuất offer',  color: 'bg-green-100 text-green-700' },
  REJECTED:     { label: 'Không phù hợp',  color: 'bg-red-100 text-red-700' },
  WITHDRAWN:    { label: 'Đã rút',         color: 'bg-yellow-100 text-yellow-700' },
};

interface CandidateSearchResult {
  id: string;
  fullName: string;
  email: string;
  headline?: string;
  currentPosition?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  city?: string;
  skills: string[];
  cvFileUrl?: string;
  matchScore: number;
}

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Active', DRAFT: 'Nháp', PAUSED: 'Tạm dừng', CLOSED: 'Đã đóng' };
const STATUS_STYLES: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-700', DRAFT: 'bg-gray-100 text-gray-600', PAUSED: 'bg-yellow-100 text-yellow-700', CLOSED: 'bg-red-100 text-red-700' };

// ── Hero banner ────────────────────────────────────────────
function HeroBanner({ jobs, applications }: { jobs: Job[]; applications: Application[] }) {
  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
  const totalCvs = applications.length;
  const passedCount = applications.filter(a => a.passedThreshold === true).length;
  const matchRate = totalCvs > 0 ? Math.round((passedCount / totalCvs) * 100) : 0;

  return (
    <div className="rounded-2xl text-white p-6 sm:p-8" style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
      <p className="text-green-200 text-sm mb-1">Tuyển dụng thông minh với AI</p>
      <h2 className="text-2xl font-bold mb-5">Tìm ứng viên phù hợp</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold">{activeJobs}</p>
          <p className="text-green-200 text-xs mt-0.5">Tin đang tuyển</p>
        </div>
        <div>
          <p className="text-3xl font-bold">{totalCvs}</p>
          <p className="text-green-200 text-xs mt-0.5">CV đã nhận</p>
        </div>
        <div>
          <p className="text-3xl font-bold">{matchRate}%</p>
          <p className="text-green-200 text-xs mt-0.5">Tỷ lệ match AI</p>
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: Tin tuyển dụng ──────────────────────────────────
function JobsTab({ jobs, loading }: { jobs: Job[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Tin tuyển dụng gần đây</h2>
        <Link href="/recruiter/jobs" className="text-sm flex items-center gap-1"
          style={{ color: BRAND }}>
          Xem tất cả <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-10">
          <BriefcaseIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500">Chưa có tin tuyển dụng nào</p>
          <Link href="/recruiter/jobs/create" className="mt-3 inline-block text-sm" style={{ color: BRAND }}>
            Đăng tin đầu tiên →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {jobs.map(job => (
            <Link key={job.id} href={`/recruiter/jobs/${job.id}`}
              className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
              <div>
                <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">Đăng {formatDate(job.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><EyeIcon className="h-3.5 w-3.5" />{job.viewCount}</span>
                <span className="flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" />{job.applyCount}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[job.status] ?? job.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-100">
        <Link href="/recruiter/company">
          <div className="rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all flex items-center gap-3 group"
            style={{ ['--hover-border' as string]: BRAND }}>
            <div className="rounded-lg bg-gray-50 p-2.5"><TrendingUpIcon className="h-4 w-4" style={{ color: BRAND }} /></div>
            <div>
              <p className="font-medium text-gray-900 text-sm group-hover:text-[#0d7a5f] transition-colors">Cập nhật thông tin công ty</p>
              <p className="text-xs text-gray-400 mt-0.5">Logo, mô tả, địa chỉ</p>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </Link>
        <Link href="/recruiter/jobs/create">
          <div className="rounded-xl border border-dashed border-gray-300 p-4 hover:shadow-sm transition-all flex items-center gap-3">
            <div className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--brand-light)' }}>
              <PlusIcon className="h-4 w-4" style={{ color: BRAND }} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Đăng tin tuyển dụng mới</p>
              <p className="text-xs text-gray-400 mt-0.5">Tạo JD và thiết lập tiêu chí AI</p>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </Link>
      </div>
    </div>
  );
}

// ── Tab 2: Tìm CV ứng viên ─────────────────────────────────
function CvSearchTab({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState('');
  const [skills, setSkills] = useState('');
  const [city, setCity] = useState('');
  const [expRange, setExpRange] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CandidateSearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  const expOptions = [
    { label: 'Kinh nghiệm...', min: undefined, max: undefined },
    { label: '0 – 1 năm', min: 0, max: 1 },
    { label: '2 – 3 năm', min: 2, max: 3 },
    { label: '3+ năm', min: 3, max: undefined },
    { label: '5+ năm', min: 5, max: undefined },
  ];

  const cities = ['', 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương'];

  const handleSearch = useCallback(async () => {
    setSearching(true);
    const expOpt = expOptions.find((_, i) => String(i) === expRange);
    try {
      const res = await axiosInstance.post<CandidateSearchResult[]>('/api/recruiter/search-candidates', {
        jobId: selectedJob || null,
        skills: skills || null,
        city: city || null,
        minExp: expOpt?.min ?? null,
        maxExp: expOpt?.max ?? null,
      });
      setResults(res.data);
      setSearched(true);
    } catch {
      toast.error('Tìm kiếm thất bại');
    } finally {
      setSearching(false);
    }
  }, [selectedJob, skills, city, expRange]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="h-4 w-4" style={{ color: BRAND }} />
        <h2 className="font-semibold text-gray-900">Tìm CV theo yêu cầu</h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--brand-light)', color: BRAND }}>AI Matching</span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="relative">
          <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 pr-8 text-sm bg-white focus:outline-none focus:ring-2 text-gray-700">
            <option value="">Chọn tin tuyển dụng...</option>
            {jobs.filter(j => j.status === 'ACTIVE').map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select value={expRange} onChange={e => setExpRange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 pr-8 text-sm bg-white focus:outline-none text-gray-700">
            {expOptions.map((o, i) => <option key={i} value={String(i)}>{o.label}</option>)}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <input value={skills} onChange={e => setSkills(e.target.value)}
          placeholder="Kỹ năng (Python, React...)"
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 text-gray-700"
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />

        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select value={city} onChange={e => setCity(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 pl-9 pr-8 py-2.5 text-sm bg-white focus:outline-none text-gray-700">
            {cities.map(c => <option key={c} value={c}>{c || 'Địa điểm...'}</option>)}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <button onClick={handleSearch} disabled={searching}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        style={{ background: `linear-gradient(90deg, ${BRAND}, ${BRAND_DARK})` }}>
        <SparklesIcon className="h-4 w-4" />
        {searching ? 'Đang tìm kiếm...' : 'Tìm ứng viên phù hợp với AI'}
      </button>

      {/* Results */}
      {searching && (
        <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>
      )}

      {!searching && searched && results.length === 0 && (
        <div className="text-center py-10 text-gray-500 mt-4">
          <SearchIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="font-medium">Không tìm thấy ứng viên phù hợp</p>
          <p className="text-sm mt-1 text-gray-400">Thử thay đổi bộ lọc hoặc kỹ năng tìm kiếm</p>
        </div>
      )}

      {!searching && results.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          <p className="text-sm text-gray-500">Tìm thấy <span className="font-semibold text-gray-800">{results.length}</span> ứng viên</p>
          {results.map(r => {
            const pct = Math.round(r.matchScore * 100);
            const initials = r.fullName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
            return (
              <div key={r.id} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                {/* Avatar */}
                <div className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{r.fullName}</p>
                  <p className="text-xs font-medium truncate" style={{ color: BRAND }}>
                    {r.headline || r.currentPosition || 'Ứng viên'}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                    {r.currentPosition && r.headline && <span>{r.currentPosition}</span>}
                    {r.yearsOfExperience != null && (
                      <span>{r.yearsOfExperience} năm KN</span>
                    )}
                    {r.city && (
                      <span className="flex items-center gap-0.5">· {r.city}</span>
                    )}
                  </div>
                  {r.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {r.skills.slice(0, 4).map(s => (
                        <span key={s} className="rounded-full px-2 py-0.5 text-xs"
                          style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-dark)' }}>
                          {s}
                        </span>
                      ))}
                      {r.skills.length > 4 && (
                        <span className="rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-500">
                          +{r.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Match + actions */}
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold" style={{ color: BRAND }}>{pct}%</p>
                  <div className="w-20 h-1.5 rounded-full bg-gray-100 mt-1 mb-2 ml-auto">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: BRAND }} />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">phù hợp</p>
                  {r.cvFileUrl && (
                    <a href={r.cvFileUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors"
                      style={{ backgroundColor: 'var(--brand-light)', color: BRAND }}>
                      <FileTextIcon className="h-3 w-3" /> CV
                      <ExternalLinkIcon className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!searching && !searched && (
        <div className="text-center py-8 mt-2 text-gray-400">
          <SparklesIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">Điền bộ lọc và bấm tìm kiếm để AI gợi ý ứng viên phù hợp</p>
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Đơn ứng tuyển ──────────────────────────────────
function ApplicationsTab({ applications, loading }: { applications: Application[]; loading: boolean }) {
  const recent = applications.slice(0, 8);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Đơn ứng tuyển gần đây</h2>
        <Link href="/recruiter/candidates" className="text-sm flex items-center gap-1" style={{ color: BRAND }}>
          Xem tất cả <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : recent.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Chưa có đơn ứng tuyển</div>
      ) : (
        <div className="flex flex-col gap-2">
          {recent.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            return (
              <div key={app.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                <div className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center font-bold text-white text-xs"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
                  {app.candidateFullName?.split(' ').slice(-1)[0]?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{app.candidateFullName}</p>
                  <p className="text-xs text-gray-400 truncate">{app.jobTitle}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {app.aiMatchScore != null && (
                    <span className="text-xs font-bold" style={{ color: BRAND }}>{Math.round(app.aiMatchScore * 100)}%</span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'cv-search' | 'applications'>('jobs');

  useEffect(() => {
    axiosInstance.get<Job[]>('/api/recruiter/jobs')
      .then(res => setJobs(res.data))
      .catch(() => toast.error('Lỗi tải dữ liệu'))
      .finally(() => setLoadingJobs(false));

    getAllApplicationsForRecruiter()
      .then(data => setApplications(data))
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, []);

  const TABS = [
    { id: 'jobs' as const, label: 'Tin tuyển dụng' },
    { id: 'cv-search' as const, label: 'Tìm CV ứng viên' },
    { id: 'applications' as const, label: 'Đơn ứng tuyển' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user?.fullName}!</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý tin tuyển dụng và tìm ứng viên phù hợp</p>
        </div>
        <Link href="/recruiter/jobs/create">
          <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ background: BRAND }}>
            <PlusIcon className="h-4 w-4" /> Đăng tin mới
          </button>
        </Link>
      </div>

      {/* Hero banner */}
      <HeroBanner jobs={jobs} applications={applications} />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
            style={activeTab === tab.id
              ? { borderColor: BRAND, color: BRAND }
              : { borderColor: 'transparent', color: '#6b7280' }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'jobs' && <JobsTab jobs={jobs.slice(0, 5)} loading={loadingJobs} />}
      {activeTab === 'cv-search' && <CvSearchTab jobs={jobs} />}
      {activeTab === 'applications' && <ApplicationsTab applications={applications} loading={loadingApps} />}
    </div>
  );
}
