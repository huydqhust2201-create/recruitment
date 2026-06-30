'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, ShieldXIcon, BuildingIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

interface AdminCompany {
  id: string;
  name: string;
  industry: string;
  city: string;
  logoUrl: string;
  isVerified: boolean;
  createdAt: string;
  recruiterName?: string;
  recruiterEmail?: string;
}

const BRAND = '#0d7a5f';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unverified' | 'verified'>('all');

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<AdminCompany[]>(`/api/admin/companies?page=${p}&size=20`);
      setCompanies(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleVerify = async (id: string, verify: boolean) => {
    try {
      const endpoint = verify ? `/api/admin/companies/${id}/verify` : `/api/admin/companies/${id}/unverify`;
      await axiosInstance.put(endpoint);
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, isVerified: verify } : c));
      toast.success(verify ? 'Đã xác minh công ty' : 'Đã huỷ xác minh công ty');
    } catch {
      toast.error('Không thể cập nhật');
    }
  };

  const filtered = companies.filter(c => {
    if (filter === 'verified') return c.isVerified;
    if (filter === 'unverified') return !c.isVerified;
    return true;
  });

  const unverifiedCount = companies.filter(c => !c.isVerified).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý công ty</h1>
          <p className="text-sm text-gray-500 mt-0.5">Duyệt và xác minh danh tính nhà tuyển dụng</p>
        </div>
        {unverifiedCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white"
            style={{ backgroundColor: '#ef4444' }}>
            {unverifiedCount} chưa xác minh
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unverified', 'verified'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors border"
            style={filter === f
              ? { backgroundColor: BRAND, color: '#fff', borderColor: BRAND }
              : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#d1d5db' }
            }>
            {f === 'all' ? 'Tất cả' : f === 'unverified' ? 'Chưa xác minh' : 'Đã xác minh'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Công ty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nhà tuyển dụng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngành</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Thành phố</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Không có công ty nào
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {c.logoUrl
                          ? <img src={c.logoUrl} alt={c.name} className="h-full w-full object-contain" />
                          : <BuildingIcon className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <Link href={`/companies/${c.id}`} target="_blank"
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#0d7a5f] transition-colors">
                          Xem trang công ty <ExternalLinkIcon className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.recruiterName ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.recruiterName}</p>
                        <p className="text-xs text-gray-400">{c.recruiterEmail}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Không có recruiter</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.industry || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    {c.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#e8f5f0] text-[#0d7a5f]">
                        <ShieldCheckIcon className="h-3 w-3" /> Đã xác minh
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-700">
                        <ShieldXIcon className="h-3 w-3" /> Chưa xác minh
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.isVerified ? (
                      <button onClick={() => handleVerify(c.id, false)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors">
                        Huỷ xác minh
                      </button>
                    ) : (
                      <button onClick={() => handleVerify(c.id, true)}
                        className="text-xs font-semibold transition-colors"
                        style={{ color: BRAND }}>
                        ✓ Xác minh ngay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40">Trước</button>
        <span className="px-3 py-1.5 text-sm text-gray-600">Trang {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={companies.length < 20}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40">Sau</button>
      </div>
    </div>
  );
}
