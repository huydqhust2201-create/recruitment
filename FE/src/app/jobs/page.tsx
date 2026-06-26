'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import axiosInstance from '@/lib/axios';
import type { Job, PageResponse } from '@/types';
import { formatSalary, timeAgo, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  SearchIcon, MapPinIcon, BriefcaseIcon, BuildingIcon,
  ChevronLeftIcon, ChevronRightIcon, FlameIcon, ClockIcon,
  SparklesIcon, BotIcon, FileCheckIcon, BarChart3Icon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { JOB_CATEGORIES, POPULAR_CITIES } from '@/constants/categories';

const BRAND = '#0d7a5f';
const BRAND_DARK = '#0a5c47';

const QUICK_CATS = [
  { label: 'IT / Phần mềm', value: 'CNTT' },
  { label: 'Marketing', value: 'MARKETING' },
  { label: 'Kế toán', value: 'KE_TOAN' },
  { label: 'Nhân sự', value: 'NHAN_SU' },
  { label: 'Bán hàng', value: 'KINH_DOANH' },
  { label: 'Thiết kế', value: 'THIET_KE' },
];

const FEATURES = [
  { icon: <BotIcon className="h-7 w-7" style={{ color: BRAND }} />, title: 'AI gợi ý việc làm', desc: 'Phù hợp với CV của bạn' },
  { icon: <FileCheckIcon className="h-7 w-7" style={{ color: BRAND }} />, title: 'AI Cover Letter', desc: 'Tạo thư xin việc trong 5 giây' },
  { icon: <BarChart3Icon className="h-7 w-7" style={{ color: BRAND }} />, title: 'CV Score', desc: 'Đánh giá điểm hồ sơ tự động' },
];

// ── Category sidebar ───────────────────────────────────────
function CategorySidebar({ industry, onChange }: { industry: string; onChange: (v: string) => void }) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Ngành nghề</p>
        </div>
        <nav className="p-2 flex flex-col gap-0.5">
          <button
            onClick={() => onChange('')}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors ${!industry ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
            style={!industry ? { backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)' } : {}}
          >
            <span>🗂️</span> Tất cả ngành
          </button>
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onChange(cat.value)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors ${industry === cat.value ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
              style={industry === cat.value ? { backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)' } : {}}
            >
              <span>{cat.icon}</span>
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

// ── Location chips ─────────────────────────────────────────
function LocationChips({ city, onChange }: { city: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {['', ...POPULAR_CITIES].map((c) => (
        <button
          key={c || '__all'}
          onClick={() => onChange(c)}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border flex items-center gap-1"
          style={city === c
            ? { backgroundColor: BRAND, color: '#fff', borderColor: BRAND }
            : { background: '#fff', color: '#4b5563', borderColor: '#d1d5db' }
          }
        >
          {c ? <><MapPinIcon className="h-3 w-3" />{c}</> : 'Tất cả'}
        </button>
      ))}
    </div>
  );
}

// ── Job card ───────────────────────────────────────────────
function JobCard({ job }: { job: Job }) {
  const isHot = job.applyCount >= 10;
  return (
    <Link href={`/jobs/${job.slug}`}>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all h-full flex flex-col"
        style={{ ['--tw-border-opacity' as string]: '1' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = BRAND)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {job.companyLogo
              ? <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-contain" />
              : <BuildingIcon className="h-6 w-6 text-gray-300" />}
          </div>
          {isHot && (
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold shrink-0"
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
          {job.deadline && <span className="ml-auto">Hạn {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>}
        </div>
      </div>
    </Link>
  );
}

// ── Inner component that uses useSearchParams ──────────────
function JobsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [level, setLevel] = useState('');
  const [draftKeyword, setDraftKeyword] = useState(searchParams.get('keyword') || '');
  const [nlMode, setNlMode] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  const [nlSearching, setNlSearching] = useState(false);
  const [nlSummary, setNlSummary] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 9 };
      if (keyword) params.keyword = keyword;
      if (city) params.city = city;
      if (level) params.level = level;
      if (industry) params.industry = industry;
      const res = await axiosInstance.get<PageResponse<Job>>('/api/jobs', { params });
      setJobs(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Không thể tải danh sách việc làm');
    } finally {
      setLoading(false);
    }
  }, [page, keyword, city, level, industry]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(draftKeyword);
    setPage(0);
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const handleCityChange = (c: string) => { setCity(c); setPage(0); };
  const handleIndustryChange = (v: string) => { setIndustry(v); setPage(0); };
  const handleQuickCat = (v: string) => { setIndustry(v); setPage(0); router.push(`/jobs?industry=${v}`); };

  const handleNlSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setNlSearching(true);
    setNlSummary('');
    try {
      const res = await axiosInstance.post<{ parsed: { keyword: string; city: string; level: string; industry: string; summary: string }; jobs: PageResponse<Job> }>('/api/jobs/search/nl', { query: nlQuery });
      const { parsed, jobs: result } = res.data;
      setJobs(result.content);
      setTotal(result.totalElements);
      setTotalPages(result.totalPages);
      setNlSummary(parsed.summary || '');
      if (parsed.keyword) setKeyword(parsed.keyword);
      if (parsed.city) setCity(parsed.city);
      if (parsed.level) setLevel(parsed.level);
      if (parsed.industry) setIndustry(parsed.industry);
    } catch {
      toast.error('Tìm kiếm AI thất bại, vui lòng thử lại');
    } finally {
      setNlSearching(false);
    }
  };

  const LEVELS = ['', 'INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER'];

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-tinted)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div ref={heroRef} style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }} className="text-white pt-10 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            ✦ AI-Powered Recruitment
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2">
            Tìm việc nhanh chóng<br />
            <span className="text-yellow-300">với sức mạnh AI</span>
          </h1>
          <p className="text-green-100 text-sm mb-6">
            Hệ thống AI chấm điểm &amp; gợi ý việc làm phù hợp nhất với bạn
          </p>

          {/* Search toggle */}
          <div className="flex justify-center gap-2 mb-4">
            <button onClick={() => setNlMode(false)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={!nlMode ? { backgroundColor: '#fff', color: BRAND } : { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              <SearchIcon className="h-3 w-3" /> Tìm thường
            </button>
            <button onClick={() => setNlMode(true)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={nlMode ? { backgroundColor: '#fff', color: BRAND } : { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              <SparklesIcon className="h-3 w-3" /> Tìm bằng AI
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto">
            {nlMode ? (
              <form onSubmit={handleNlSearch} className="flex">
                <div className="relative flex-1">
                  <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: BRAND }} />
                  <input
                    type="text"
                    placeholder='Ví dụ: "Tôi muốn tìm việc Java senior lương 30 triệu ở Hà Nội"'
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button type="submit" disabled={nlSearching}
                  className="px-6 py-3.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shrink-0"
                  style={{ background: BRAND }}>
                  {nlSearching ? 'Đang phân tích...' : 'Tìm bằng AI'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSearch} className="flex">
                <div className="flex items-center flex-1 px-4 border-r border-gray-200">
                  <SearchIcon className="h-4 w-4 text-gray-400 shrink-0 mr-3" />
                  <input
                    value={draftKeyword}
                    onChange={e => setDraftKeyword(e.target.value)}
                    placeholder="Tên việc làm, kỹ năng, công ty..."
                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none py-3.5"
                  />
                </div>
                <div className="flex items-center px-4 border-r border-gray-200">
                  <MapPinIcon className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
                  <select value={city} onChange={e => { setCity(e.target.value); setPage(0); }}
                    className="text-sm text-gray-700 focus:outline-none bg-transparent py-3.5">
                    <option value="">Hà Nội ▾</option>
                    {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit"
                  className="px-6 py-3.5 text-sm font-semibold text-white shrink-0 flex items-center gap-2 transition-colors"
                  style={{ background: BRAND }}>
                  <SearchIcon className="h-4 w-4" /> Tìm kiếm
                </button>
              </form>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6 text-center">
            {[
              { value: '10K+', label: 'Việc làm' },
              { value: '5K+', label: 'Công ty' },
              { value: '2M+', label: 'Ứng viên' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-green-200">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {QUICK_CATS.map(c => (
              <button key={c.value} onClick={() => handleQuickCat(c.value)}
                className="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
                style={industry === c.value
                  ? { backgroundColor: '#fff', color: BRAND }
                  : { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }
                }>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI summary */}
      {nlSummary && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-start gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--brand-light)', border: `1px solid var(--brand-mid)` }}>
            <SparklesIcon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--brand-primary)' }} />
            <p className="text-xs" style={{ color: BRAND_DARK }}>
              <span className="font-semibold">AI hiểu:</span> {nlSummary}
            </p>
          </div>
        </div>
      )}

      {/* Feature cards */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-4 text-center hover:shadow-sm transition-shadow">
              <div className="flex justify-center mb-2">{f.icon}</div>
              <p className="text-sm font-semibold text-gray-800">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <CategorySidebar industry={industry} onChange={handleIndustryChange} />

          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* City chips */}
            <LocationChips city={city} onChange={handleCityChange} />

            {/* Level filter + results count */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600 font-medium">
                {loading ? 'Đang tải...' : (
                  <>
                    {industry && <span style={{ color: BRAND }}>{JOB_CATEGORIES.find(c => c.value === industry)?.label} · </span>}
                    <span>{total.toLocaleString()} việc làm</span>
                  </>
                )}
              </p>
              <select value={level} onChange={e => { setLevel(e.target.value); setPage(0); }}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white focus:outline-none">
                <option value="">Tất cả cấp độ</option>
                {['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER'].map(l =>
                  <option key={l} value={l}>{JOB_LEVEL_LABELS[l]}</option>)}
              </select>
            </div>

            {/* Job grid */}
            {loading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Không tìm thấy việc làm phù hợp</p>
                <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khoá hoặc bộ lọc</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                      style={p === page ? { backgroundColor: BRAND, color: '#fff', borderColor: BRAND } : { borderColor: '#d1d5db' }}>
                      {p + 1}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <JobsPageInner />
    </Suspense>
  );
}
