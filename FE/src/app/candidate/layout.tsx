'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboardIcon, UserIcon, FileTextIcon, BriefcaseIcon,
  ClipboardListIcon, PenSquareIcon, AlertCircleIcon, BookmarkCheckIcon,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

const BRAND = '#0d7a5f';

const NAV = [
  { href: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { href: '/candidate/profile', label: 'Hồ sơ', icon: UserIcon },
  { href: '/candidate/cv', label: 'Quản lý CV', icon: FileTextIcon },
  { href: '/candidate/cv-builder', label: 'Tạo CV', icon: PenSquareIcon },
  { href: '/candidate/jobs', label: 'Tìm việc AI', icon: BriefcaseIcon },
  { href: '/candidate/saved-jobs', label: 'Việc đã lưu', icon: BookmarkCheckIcon },
  { href: '/candidate/applications', label: 'Đơn ứng tuyển', icon: ClipboardListIcon },
];

function completenessColor(pct: number) {
  if (pct >= 80) return BRAND;
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

function completenessLabel(pct: number) {
  if (pct >= 80) return 'Hồ sơ đầy đủ';
  if (pct >= 50) return 'Hồ sơ trung bình';
  return 'Hồ sơ chưa đủ';
}

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [completeness, setCompleteness] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CANDIDATE')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      axiosInstance.get<{ profileCompleteness?: number }>('/api/candidate/profile')
        .then(res => setCompleteness(res.data.profileCompleteness ?? 0))
        .catch(() => setCompleteness(0));
    }
  }, [user]);

  if (loading) return <PageLoader />;
  if (!user || user.role !== 'CANDIDATE') return null;

  const pct = completeness ?? 0;
  const color = completenessColor(pct);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-tinted)' }}>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-200 p-3 lg:sticky lg:top-24">
              <div className="px-3 py-2 mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ứng viên</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{user.fullName}</p>
              </div>

              {/* Completeness bar */}
              {completeness !== null && (
                <div className="px-3 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color }}>
                      {completenessLabel(pct)}
                    </span>
                    <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  {pct < 80 && (
                    <Link href="/candidate/profile"
                      className="flex items-center gap-1 mt-1.5 text-xs transition-colors"
                      style={{ color }}>
                      <AlertCircleIcon className="h-3 w-3" />
                      {pct < 50 ? 'Điền hồ sơ để AI match tốt hơn' : 'Hoàn thiện hồ sơ'}
                    </Link>
                  )}
                </div>
              )}

              <div className="border-t border-gray-100 pt-1">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      pathname === href
                        ? 'bg-[#e8f5f0] text-[#0d7a5f]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
