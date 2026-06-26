'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  BriefcaseIcon, UserCircleIcon, ChevronDownIcon,
  FileTextIcon, ClipboardListIcon, PenSquareIcon,
  BuildingIcon, LayoutDashboardIcon, CreditCardIcon,
  UsersIcon, LogOutIcon, SettingsIcon, SparklesIcon,
  BookmarkIcon, BellIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

/* ── Candidate mega-menu sections ─────────────────────────── */
const CANDIDATE_MENU = [
  {
    heading: 'Hồ sơ & CV',
    items: [
      { href: '/candidate/profile', icon: UserCircleIcon, label: 'Hồ sơ của tôi', desc: 'Cập nhật thông tin cá nhân' },
      { href: '/candidate/cv', icon: FileTextIcon, label: 'Quản lý CV', desc: 'Upload và quản lý file CV' },
      { href: '/candidate/cv-builder', icon: PenSquareIcon, label: 'Tạo CV online', desc: 'Tạo CV đẹp bằng AI, xuất PDF' },
    ],
  },
  {
    heading: 'Việc làm',
    items: [
      { href: '/jobs', icon: BriefcaseIcon, label: 'Tìm việc làm', desc: 'Khám phá hàng ngàn cơ hội' },
      { href: '/candidate/applications', icon: ClipboardListIcon, label: 'Đơn ứng tuyển', desc: 'Theo dõi trạng thái đơn' },
    ],
  },
];

const RECRUITER_MENU = [
  { href: '/recruiter/dashboard', icon: LayoutDashboardIcon, label: 'Dashboard' },
  { href: '/recruiter/company', icon: BuildingIcon, label: 'Thông tin công ty' },
  { href: '/recruiter/jobs', icon: BriefcaseIcon, label: 'Tin tuyển dụng' },
  { href: '/recruiter/subscription', icon: CreditCardIcon, label: 'Gói dịch vụ' },
];

const ADMIN_MENU = [
  { href: '/admin/dashboard', icon: LayoutDashboardIcon, label: 'Dashboard' },
  { href: '/admin/users', icon: UsersIcon, label: 'Quản lý Users' },
  { href: '/admin/companies', icon: BuildingIcon, label: 'Quản lý Công ty' },
  { href: '/admin/subscriptions', icon: CreditCardIcon, label: 'Subscriptions' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const roleLabel = user?.role === 'CANDIDATE' ? 'Ứng viên'
    : user?.role === 'RECRUITER' ? 'Nhà tuyển dụng'
    : 'Admin';

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-[#0d6b4e] text-xl shrink-0">
          <BriefcaseIcon className="h-6 w-6" />
          RecruitAI
        </Link>

        {/* Nav links — role-aware */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          {(!user || user.role === 'CANDIDATE') && (<>
            <Link href="/jobs" className={cn('hover:text-[#0d7a5f] transition-colors', pathname.startsWith('/jobs') && 'text-[#0d7a5f] font-semibold')}>
              Việc làm
            </Link>
            <Link href="/candidate/cv-builder" className={cn('hover:text-[#0d7a5f] transition-colors', pathname.startsWith('/candidate/cv-builder') && 'text-[#0d7a5f] font-semibold')}>
              Tạo CV
            </Link>
            <Link href="/jobs?nlMode=1" className={cn('hover:text-[#0d7a5f] transition-colors flex items-center gap-1', pathname.startsWith('/jobs') && pathname.includes('nlMode') && 'text-[#0d7a5f] font-semibold')}>
              <SparklesIcon className="h-3.5 w-3.5" /> Công cụ AI
            </Link>
          </>)}
          {(!user || user.role === 'RECRUITER') && (
            <Link href="/pricing" className={cn('hover:text-[#0d7a5f] transition-colors', pathname === '/pricing' && 'text-[#0d7a5f] font-semibold')}>
              Bảng giá
            </Link>
          )}
          {user?.role === 'RECRUITER' && (
            <Link href="/recruiter/candidates" className={cn('hover:text-[#0d7a5f] transition-colors', pathname === '/recruiter/candidates' && 'text-[#0d7a5f] font-semibold')}>
              Hồ sơ ứng viên
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}

          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#0d6b4e] px-3 py-2">
                Đăng nhập
              </Link>
              <Link href="/register" className="rounded-lg bg-[#0d6b4e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a5a40] transition-colors">
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-[#0d6b4e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 max-w-[120px] truncate leading-tight">{user.fullName}</p>
                  <p className="text-xs text-[#0d6b4e] font-medium leading-tight">{roleLabel}</p>
                </div>
                <ChevronDownIcon className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden"
                  style={{ minWidth: user.role === 'CANDIDATE' ? 520 : 220 }}>

                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#0d6b4e] to-teal-600 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.fullName}</p>
                        <p className="text-xs text-green-100">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate mega menu */}
                  {user.role === 'CANDIDATE' && (
                    <div className="flex">
                      {CANDIDATE_MENU.map((section) => (
                        <div key={section.heading} className="flex-1 p-3 border-r border-gray-100 last:border-r-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">
                            {section.heading}
                          </p>
                          {section.items.map(({ href, icon: Icon, label, desc }) => (
                            <Link
                              key={href}
                              href={href}
                              className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-green-50 transition-colors group"
                            >
                              <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-lg bg-gray-100 group-hover:bg-[#0d6b4e] flex items-center justify-center transition-colors">
                                <Icon className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-[#0d6b4e] transition-colors leading-tight">{label}</p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}

                      {/* Quick tip */}
                      <div className="w-44 p-3 bg-green-50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Gợi ý</p>
                        <div className="rounded-xl bg-white border border-green-100 p-3">
                          <SparklesIcon className="h-5 w-5 text-[#0d6b4e] mb-2" />
                          <p className="text-xs font-semibold text-gray-800 leading-snug">Dùng AI Cover Letter</p>
                          <p className="text-xs text-gray-500 mt-1 leading-snug">Tạo thư xin việc chuyên nghiệp chỉ trong 5 giây</p>
                          <Link href="/jobs" className="mt-2 block text-xs text-[#0d6b4e] font-semibold hover:underline">
                            Ứng tuyển ngay →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recruiter menu */}
                  {user.role === 'RECRUITER' && (
                    <div className="p-2">
                      {RECRUITER_MENU.map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#0d6b4e] transition-colors group"
                        >
                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#0d6b4e] transition-colors" />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Admin menu */}
                  {user.role === 'ADMIN' && (
                    <div className="p-2">
                      {ADMIN_MENU.map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#0d6b4e] transition-colors group"
                        >
                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#0d6b4e] transition-colors" />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Logout */}
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
