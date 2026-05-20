'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BriefcaseIcon, UserCircleIcon, ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-xl">
          <BriefcaseIcon className="h-6 w-6" />
          RecruitAI
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/jobs"
            className={cn(
              'text-sm font-medium transition-colors hover:text-blue-600',
              pathname.startsWith('/jobs') ? 'text-blue-600' : 'text-gray-600'
            )}
          >
            Việc làm
          </Link>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
                <span className="max-w-[120px] truncate">{user.fullName}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-2 shadow-lg"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Đăng nhập với</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      {user.role === 'CANDIDATE' ? 'Ứng viên' : 'Nhà tuyển dụng'}
                    </p>
                  </div>

                  {user.role === 'CANDIDATE' ? (
                    <>
                      <MenuItem href="/candidate/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MenuItem>
                      <MenuItem href="/candidate/profile" onClick={() => setMenuOpen(false)}>Hồ sơ của tôi</MenuItem>
                      <MenuItem href="/candidate/cv" onClick={() => setMenuOpen(false)}>Quản lý CV</MenuItem>
                      <MenuItem href="/candidate/applications" onClick={() => setMenuOpen(false)}>Đơn ứng tuyển</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem href="/recruiter/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MenuItem>
                      <MenuItem href="/recruiter/company" onClick={() => setMenuOpen(false)}>Công ty</MenuItem>
                      <MenuItem href="/recruiter/jobs" onClick={() => setMenuOpen(false)}>Tin tuyển dụng</MenuItem>
                    </>
                  )}

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
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

function MenuItem({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {children}
    </Link>
  );
}
