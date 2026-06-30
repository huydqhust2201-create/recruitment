'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axios';
import type { CandidateProfile, Job } from '@/types';
import {
  SparklesIcon, FileTextIcon, BriefcaseIcon, ClipboardListIcon,
  ArrowRightIcon, UserIcon, PenSquareIcon, BookmarkCheckIcon,
  MapPinIcon, BuildingIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRecommendedJobs } from '@/services/application.service';
import { formatSalary, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';

const BRAND = '#0d7a5f';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [aiJobs, setAiJobs] = useState<Job[]>([]);
  const [hasCvEmbedding, setHasCvEmbedding] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get<CandidateProfile>('/api/candidate/profile')
      .then(res => setProfile(res.data))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Không thể tải hồ sơ'));
  }, []);

  useEffect(() => {
    setAiLoading(true);
    getRecommendedJobs()
      .then(data => {
        setHasCvEmbedding(data.hasCvEmbedding);
        setAiJobs(data.jobs.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setAiLoading(false));
  }, []);

  const completeness = profile?.profileCompleteness ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#0d7a5f] to-[#0a5c47] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Xin chào, {user?.fullName}!</h1>
        <p className="text-green-100 mt-1 text-sm">Hãy hoàn thiện hồ sơ để tăng cơ hội được tuyển dụng.</p>

        {profile && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">Hoàn thiện hồ sơ</span>
              <span className="text-sm font-bold">{completeness}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/30">
              <div
                className="h-2 rounded-full bg-white transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            {profile.hasCvEmbedding && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                <SparklesIcon className="h-3.5 w-3.5" />
                AI Ready — CV đã được xử lý
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickCard
          href="/candidate/profile"
          icon={<UserIcon className="h-6 w-6 text-[#0d7a5f]" />}
          title="Cập nhật hồ sơ"
          desc="Điền đầy đủ thông tin để tăng cơ hội được nhà tuyển dụng chú ý"
          color="bg-[#e8f5f0]"
        />
        <QuickCard
          href="/candidate/cv"
          icon={<FileTextIcon className="h-6 w-6 text-green-600" />}
          title="Quản lý CV"
          desc="Upload CV để AI phân tích và đề xuất việc làm phù hợp"
          color="bg-green-50"
        />
        <QuickCard
          href="/candidate/cv-builder"
          icon={<PenSquareIcon className="h-6 w-6 text-teal-600" />}
          title="Tạo CV online"
          desc="Dùng CV Builder để tạo CV đẹp với nhiều mẫu, xuất PDF ngay lập tức"
          color="bg-teal-50"
        />
        <QuickCard
          href="/candidate/saved-jobs"
          icon={<BookmarkCheckIcon className="h-6 w-6 text-[#0d7a5f]" />}
          title="Việc đã lưu"
          desc="Xem lại danh sách việc làm bạn đã đánh dấu để ứng tuyển sau"
          color="bg-[#e8f5f0]"
        />
        <QuickCard
          href="/candidate/jobs"
          icon={<BriefcaseIcon className="h-6 w-6 text-purple-600" />}
          title="Tìm việc làm AI"
          desc="AI gợi ý việc làm phù hợp nhất dựa trên CV của bạn"
          color="bg-purple-50"
        />
        <QuickCard
          href="/candidate/applications"
          icon={<ClipboardListIcon className="h-6 w-6 text-orange-600" />}
          title="Đơn ứng tuyển"
          desc="Theo dõi trạng thái các đơn ứng tuyển của bạn"
          color="bg-orange-50"
        />
      </div>

      {/* AI Recommended Jobs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" style={{ color: BRAND }} />
            <h2 className="font-semibold text-gray-900">Việc làm AI gợi ý</h2>
          </div>
          <Link href="/candidate/jobs"
            className="text-xs font-medium flex items-center gap-1 hover:underline"
            style={{ color: BRAND }}>
            Xem tất cả <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {!hasCvEmbedding && !aiLoading ? (
          <div className="text-center py-8 rounded-xl" style={{ backgroundColor: 'var(--brand-light)' }}>
            <SparklesIcon className="mx-auto h-8 w-8 mb-2" style={{ color: BRAND }} />
            <p className="text-sm font-medium text-gray-800">Upload CV để nhận gợi ý AI</p>
            <p className="text-xs text-gray-500 mt-1">AI sẽ phân tích CV và đề xuất công việc phù hợp nhất</p>
            <Link href="/candidate/cv"
              className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: BRAND }}>
              Upload CV ngay
            </Link>
          </div>
        ) : aiLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : aiJobs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Chưa có gợi ý. Thử cập nhật hồ sơ hoặc upload CV mới.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiJobs.map(job => <AiJobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>

      {/* Profile tips */}
      {profile && completeness < 100 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Gợi ý hoàn thiện hồ sơ</h2>
          <div className="flex flex-col gap-3">
            {!profile.headline && <Tip text="Thêm tiêu đề nghề nghiệp" href="/candidate/profile" />}
            {!profile.bio && <Tip text="Viết giới thiệu bản thân" href="/candidate/profile" />}
            {!profile.city && <Tip text="Thêm địa chỉ / thành phố" href="/candidate/profile" />}
            {!profile.hasCvEmbedding && <Tip text="Upload CV để AI phân tích" href="/candidate/cv" />}
          </div>
        </div>
      )}
    </div>
  );
}

function AiJobCard({ job }: { job: Job }) {
  const score = job.similarityScore;
  return (
    <Link href={`/jobs/${job.slug}`}>
      <div className="rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-all hover:border-[#0d7a5f] group">
        <div className="flex items-start gap-2 mb-2">
          <div className="h-9 w-9 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {job.companyLogo
              ? <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-contain" />
              : <BuildingIcon className="h-4 w-4 text-gray-300" />}
          </div>
          {score !== undefined && (
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--brand-light)', color: BRAND }}>
              {Math.round(score * 100)}% phù hợp
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#0d7a5f] transition-colors">{job.title}</h3>
        <p className="text-xs text-gray-500 truncate mb-1">{job.companyName}</p>
        <p className="text-xs font-semibold" style={{ color: BRAND }}>
          {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)}
        </p>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
          <MapPinIcon className="h-3 w-3" />{job.city}
          <span className="ml-2 rounded-full bg-gray-100 px-1.5 py-0.5">{JOB_TYPE_LABELS[job.jobType]}</span>
        </div>
      </div>
    </Link>
  );
}

function QuickCard({ href, icon, title, desc, color }: {
  href: string; icon: React.ReactNode; title: string; desc: string; color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#0d7a5f] hover:shadow-sm transition-all group">
        <div className={`inline-flex rounded-xl ${color} p-2.5 mb-3`}>{icon}</div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-[#0d7a5f] transition-colors">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-[#0d7a5f] transition-colors" />
        </div>
      </div>
    </Link>
  );
}

function Tip({ text, href }: { text: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 hover:bg-[#e8f5f0] transition-colors group">
      <span className="text-sm text-gray-700">{text}</span>
      <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-[#0d7a5f] transition-colors" />
    </Link>
  );
}
