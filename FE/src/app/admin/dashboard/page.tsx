'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import {
  UsersIcon, BuildingIcon, BriefcaseIcon, FileTextIcon,
  CheckCircleIcon, CreditCardIcon, ArrowRightIcon, ShieldCheckIcon,
  TrendingUpIcon,
} from 'lucide-react';

const BRAND = '#0d7a5f';

interface Stats {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  activeSubscriptions: number;
}

const QUICK_LINKS = [
  { href: '/admin/companies', label: 'Duyệt công ty chưa xác minh', icon: BuildingIcon, desc: 'Xác minh danh tính nhà tuyển dụng' },
  { href: '/admin/users', label: 'Quản lý người dùng', icon: UsersIcon, desc: 'Khoá / mở khoá tài khoản' },
  { href: '/admin/subscriptions', label: 'Quản lý subscriptions', icon: CreditCardIcon, desc: 'Xem gói dịch vụ đang hoạt động' },
  { href: '/admin/jobs', label: 'Kiểm duyệt tin tuyển dụng', icon: BriefcaseIcon, desc: 'Ẩn / hiện tin vi phạm' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get<Stats>('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => setError('Không thể tải dữ liệu'));
  }, []);

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-light)' }}>
          <ShieldCheckIcon className="h-5 w-5" style={{ color: BRAND }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Quản lý toàn bộ nền tảng RecruitAI</p>
        </div>
      </div>

      {/* Stats */}
      {!stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-8 w-8 bg-gray-100 rounded-lg mb-3" />
              <div className="h-6 w-16 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng người dùng', value: stats.totalUsers, icon: UsersIcon, color: 'bg-[#e8f5f0] text-[#0d7a5f]' },
            { label: 'Ứng viên', value: stats.totalCandidates, icon: UsersIcon, color: 'bg-teal-50 text-teal-600' },
            { label: 'Nhà tuyển dụng', value: stats.totalRecruiters, icon: UsersIcon, color: 'bg-orange-50 text-orange-600' },
            { label: 'Công ty', value: stats.totalCompanies, icon: BuildingIcon, color: 'bg-purple-50 text-purple-600' },
            { label: 'Tổng tin đăng', value: stats.totalJobs, icon: BriefcaseIcon, color: 'bg-blue-50 text-blue-600' },
            { label: 'Tin đang hoạt động', value: stats.activeJobs, icon: CheckCircleIcon, color: 'bg-[#e8f5f0] text-[#0d7a5f]' },
            { label: 'Tổng đơn ứng tuyển', value: stats.totalApplications, icon: FileTextIcon, color: 'bg-yellow-50 text-yellow-600' },
            { label: 'Subscription active', value: stats.activeSubscriptions, icon: CreditCardIcon, color: 'bg-pink-50 text-pink-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUpIcon className="h-4 w-4" style={{ color: BRAND }} />
          <h2 className="font-semibold text-gray-900">Tác vụ quản trị</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_LINKS.map(({ href, label, icon: Icon, desc }) => (
            <Link key={href} href={href}>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-[#b2dfcf] hover:shadow-sm transition-all group">
                <div className="rounded-lg p-2.5 shrink-0" style={{ backgroundColor: 'var(--brand-light)' }}>
                  <Icon className="h-4 w-4" style={{ color: BRAND }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm group-hover:text-[#0d7a5f] transition-colors">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
