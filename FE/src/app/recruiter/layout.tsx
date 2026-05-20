'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboardIcon, BuildingIcon, BriefcaseIcon, PlusIcon } from 'lucide-react';

const NAV = [
  { href: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { href: '/recruiter/company', label: 'Thông tin công ty', icon: BuildingIcon },
  { href: '/recruiter/jobs', label: 'Tin tuyển dụng', icon: BriefcaseIcon },
  { href: '/recruiter/jobs/create', label: 'Đăng tin mới', icon: PlusIcon },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'RECRUITER')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return <PageLoader />;
  if (!user || user.role !== 'RECRUITER') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-200 p-3 lg:sticky lg:top-24">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nhà tuyển dụng</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{user.fullName}</p>
              </div>
              {NAV.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === '/recruiter/jobs'
                    ? pathname === href
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      href === '/recruiter/jobs/create' && 'mt-2 border border-dashed border-gray-300'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
