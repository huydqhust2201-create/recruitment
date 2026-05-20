'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboardIcon, UserIcon, FileTextIcon, BriefcaseIcon, ClipboardListIcon } from 'lucide-react';

const NAV = [
  { href: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { href: '/candidate/profile', label: 'Hồ sơ', icon: UserIcon },
  { href: '/candidate/cv', label: 'Quản lý CV', icon: FileTextIcon },
  { href: '/candidate/jobs', label: 'Tìm việc', icon: BriefcaseIcon },
  { href: '/candidate/applications', label: 'Đơn ứng tuyển', icon: ClipboardListIcon },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CANDIDATE')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return <PageLoader />;
  if (!user || user.role !== 'CANDIDATE') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-200 p-3 lg:sticky lg:top-24">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ứng viên</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{user.fullName}</p>
              </div>
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
