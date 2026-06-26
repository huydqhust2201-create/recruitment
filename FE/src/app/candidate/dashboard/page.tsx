'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axios';
import type { CandidateProfile } from '@/types';
import { SparklesIcon, FileTextIcon, BriefcaseIcon, ClipboardListIcon, ArrowRightIcon, UserIcon, PenSquareIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    axiosInstance
      .get<CandidateProfile>('/api/candidate/profile')
      .then((res) => setProfile(res.data))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Không thể tải hồ sơ'));
  }, []);

  const completeness = profile?.profileCompleteness ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Xin chào, {user?.fullName}!</h1>
        <p className="text-blue-100 mt-1 text-sm">Hãy hoàn thiện hồ sơ để tăng cơ hội được tuyển dụng.</p>

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
          href="/candidate/jobs"
          icon={<BriefcaseIcon className="h-6 w-6 text-purple-600" />}
          title="Tìm việc làm"
          desc="Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn"
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

function QuickCard({ href, icon, title, desc, color }: {
  href: string; icon: React.ReactNode; title: string; desc: string; color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
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
