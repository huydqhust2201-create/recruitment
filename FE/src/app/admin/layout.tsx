'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboardIcon, UsersIcon, BuildingIcon,
  CreditCardIcon, BriefcaseIcon, ShieldIcon,
} from 'lucide-react';

const BRAND = '#0d7a5f';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { href: '/admin/users', label: 'Người dùng', icon: UsersIcon },
  { href: '/admin/companies', label: 'Duyệt công ty', icon: BuildingIcon },
  { href: '/admin/jobs', label: 'Tin tuyển dụng', icon: BriefcaseIcon },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return <PageLoader />;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-tinted)' }}>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-52 shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-200 p-3 sticky top-24">
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <ShieldIcon className="h-4 w-4" style={{ color: BRAND }} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Admin</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{user.fullName}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-2">
                {NAV.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
                  return (
                    <Link key={href} href={href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-[#e8f5f0] text-[#0d7a5f]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
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
