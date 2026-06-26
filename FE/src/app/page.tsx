'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import axiosInstance from '@/lib/axios';
import type { Job, PageResponse } from '@/types';
import { JOB_CATEGORIES, POPULAR_CITIES } from '@/constants/categories';
import { formatSalary, timeAgo, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';
import {
  SearchIcon, MapPinIcon, BuildingIcon, BriefcaseIcon,
  SparklesIcon, ChevronRightIcon, FlameIcon, TrendingUpIcon,
  ShieldCheckIcon, ClockIcon, ArrowRightIcon,
} from 'lucide-react';

// ── Trending keyword chips ─────────────────────────────────
const TRENDING = [
  'Lập trình Java', 'React Developer', 'Kế toán tổng hợp', 'Marketing Online',
  'Chăm sóc khách hàng', 'Nhân viên kinh doanh', 'Data Analyst', 'UI/UX Designer',
];

// ── Hot job card ───────────────────────────────────────────
function HotJobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.slug}`}>
      <div className="group bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-lg transition-all h-full flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {job.companyLogo
              ? <img src={job.companyLogo} alt="" className="h-full w-full object-contain" />
              : <BuildingIcon className="h-6 w-6 text-gray-300" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{job.companyName}</p>
          </div>
          {job.applyCount >= 8 && (
            <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
              <FlameIcon className="h-3 w-3" /> HOT
            </span>
          )}
        </div>

        <p className="text-sm font-bold text-green-600 mb-3">
          {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            <MapPinIcon className="h-3 w-3" />{job.city}
          </span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {JOB_TYPE_LABELS[job.jobType]}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {JOB_LEVEL_LABELS[job.level]}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          <ClockIcon className="h-3 w-3" />
          <span>{timeAgo(job.publishedAt || job.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Main landing page ─────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [hotJobs, setHotJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeCat, setActiveCat] = useState(0);
  const catTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch hot jobs
  useEffect(() => {
    axiosInstance.get<PageResponse<Job>>('/api/jobs', { params: { size: 9, page: 0 } })
      .then(res => setHotJobs(res.data.content))
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  // Category auto-rotate
  const startCatTimer = useCallback(() => {
    if (catTimerRef.current) clearInterval(catTimerRef.current);
    catTimerRef.current = setInterval(() => setActiveCat(i => (i + 1) % JOB_CATEGORIES.length), 3000);
  }, []);
  useEffect(() => { startCatTimer(); return () => { if (catTimerRef.current) clearInterval(catTimerRef.current); }; }, [startCatTimer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (city) params.set('city', city);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#0d6b4e] via-[#0f8060] to-[#1a9970] py-14 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium opacity-80 mb-2">Tiếp lợi thế, nối thành công</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Tìm việc làm nhanh 24h,<br />
            <span className="text-yellow-300">việc làm mới nhất</span> trên toàn quốc
          </h1>
          <p className="text-green-100 text-base mb-8">
            Tiếp cận <strong className="text-white">60.000+</strong> tin tuyển dụng việc làm mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto">
            <div className="flex items-center flex-1 px-4 py-3 gap-3 border-b sm:border-b-0 sm:border-r border-gray-200">
              <SearchIcon className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Vị trí tuyển dụng, tên công ty..."
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center px-4 py-3 gap-3 border-b sm:border-b-0 sm:border-r border-gray-200">
              <MapPinIcon className="h-5 w-5 text-gray-400 shrink-0" />
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="text-sm text-gray-700 focus:outline-none bg-transparent"
              >
                <option value="">Địa điểm</option>
                {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="bg-[#0d6b4e] hover:bg-[#0a5a40] text-white font-semibold px-8 py-3 text-sm transition-colors shrink-0">
              <SearchIcon className="h-4 w-4 inline mr-2" />Tìm kiếm
            </button>
          </form>

          {/* Trending */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <span className="text-green-200 text-sm">Được tìm nhiều:</span>
            {TRENDING.map(kw => (
              <button
                key={kw}
                onClick={() => { setKeyword(kw); router.push(`/jobs?keyword=${encodeURIComponent(kw)}`); }}
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs hover:bg-white/20 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories + Quick links ── */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category list */}
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800 mb-4">Khám phá theo ngành nghề</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {JOB_CATEGORIES.map((cat, i) => (
                  <Link
                    key={cat.value}
                    href={`/jobs?industry=${cat.value}`}
                    onMouseEnter={() => { setActiveCat(i); startCatTimer(); }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all border ${
                      activeCat === i
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="leading-tight text-xs">{cat.label}</span>
                    <ChevronRightIcon className="h-3 w-3 ml-auto shrink-0 opacity-50" />
                  </Link>
                ))}
              </div>
            </div>

            {/* City quick links */}
            <div className="lg:w-52 shrink-0">
              <h2 className="text-base font-bold text-gray-800 mb-4">Việc làm theo khu vực</h2>
              <div className="flex flex-col gap-1.5">
                {POPULAR_CITIES.slice(0, 8).map(c => (
                  <Link
                    key={c}
                    href={`/jobs?city=${encodeURIComponent(c)}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors group"
                  >
                    <MapPinIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-green-600" />
                    {c}
                    <ArrowRightIcon className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hot jobs ── */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FlameIcon className="h-5 w-5 text-red-500" />
                Việc làm nổi bật
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Cập nhật mới nhất từ các nhà tuyển dụng hàng đầu</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 transition-colors">
              Xem tất cả <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse h-44">
                  <div className="flex gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-gray-200 shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Chưa có việc làm nào. Hãy chạy seed data để thêm dữ liệu mẫu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotJobs.map(job => <HotJobCard key={job.id} job={job} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gradient-to-r from-green-700 to-teal-600 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: <BriefcaseIcon className="h-6 w-6 mx-auto mb-2 opacity-80" />, value: '10.000+', label: 'Việc làm' },
              { icon: <BuildingIcon className="h-6 w-6 mx-auto mb-2 opacity-80" />, value: '500+', label: 'Nhà tuyển dụng' },
              { icon: <SparklesIcon className="h-6 w-6 mx-auto mb-2 opacity-80" />, value: 'AI', label: 'Chấm điểm tự động' },
              { icon: <TrendingUpIcon className="h-6 w-6 mx-auto mb-2 opacity-80" />, value: '24/7', label: 'Hỗ trợ ứng tuyển' },
            ].map((s, i) => (
              <div key={i}>
                {s.icon}
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-green-100 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Tại sao chọn RecruitAI?</h2>
            <p className="text-gray-500 mt-2">Công nghệ AI tiên tiến giúp tìm việc nhanh hơn, thông minh hơn</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <SparklesIcon className="h-7 w-7 text-blue-600" />,
                color: 'bg-blue-50',
                title: 'AI Phân tích CV',
                desc: 'Hệ thống AI tự động phân tích và chấm điểm CV, giúp bạn biết mức độ phù hợp với từng vị trí.',
              },
              {
                icon: <TrendingUpIcon className="h-7 w-7 text-green-600" />,
                color: 'bg-green-50',
                title: 'Gợi ý việc làm thông minh',
                desc: 'Dựa trên kỹ năng và kinh nghiệm, AI gợi ý những công việc phù hợp nhất với hồ sơ của bạn.',
              },
              {
                icon: <ShieldCheckIcon className="h-7 w-7 text-purple-600" />,
                color: 'bg-purple-50',
                title: 'CV Builder tích hợp',
                desc: 'Tạo CV chuyên nghiệp với nhiều mẫu đẹp, xuất PDF ngay trên trình duyệt, không cần phần mềm.',
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className={`inline-flex rounded-xl ${f.color} p-3 mb-4`}>{f.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-900 py-12 text-white text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-3">Sẵn sàng bắt đầu?</h2>
          <p className="text-gray-400 mb-7 text-sm">Tạo hồ sơ ngay hôm nay và để AI tìm công việc mơ ước cho bạn</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/register" className="rounded-xl bg-[#0d6b4e] hover:bg-[#0a5a40] px-7 py-3 font-semibold text-sm transition-colors">
              Đăng ký ứng viên miễn phí
            </Link>
            <Link href="/jobs" className="rounded-xl border border-gray-600 hover:border-gray-400 px-7 py-3 font-semibold text-sm transition-colors">
              Khám phá việc làm →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 text-gray-500 py-6 text-center text-xs">
        © 2025 RecruitAI — Hệ thống tuyển dụng thông minh tích hợp AI · Đồ án tốt nghiệp
      </footer>
    </div>
  );
}
