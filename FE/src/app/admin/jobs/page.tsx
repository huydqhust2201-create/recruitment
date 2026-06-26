'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { BriefcaseIcon, EyeIcon, EyeOffIcon, SearchIcon } from 'lucide-react';

interface AdminJob {
  id: string;
  title: string;
  companyName: string;
  city: string;
  status: string;
  applyCount: number;
  createdAt: string;
}

const BRAND = '#0d7a5f';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang tuyển', DRAFT: 'Nháp', PAUSED: 'Tạm dừng', CLOSED: 'Đã đóng',
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-[#e8f5f0] text-[#0d7a5f]',
  DRAFT: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-red-100 text-red-700',
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<AdminJob[]>(`/api/admin/jobs?page=${p}&size=20`);
      setJobs(res.data);
    } catch {
      toast.error('Không thể tải danh sách tin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const toggleJob = async (id: string) => {
    try {
      const res = await axiosInstance.put<{ id: string; status: string }>(`/api/admin/jobs/${id}/toggle-active`);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: res.data.status } : j));
      toast.success('Đã cập nhật trạng thái tin');
    } catch {
      toast.error('Không thể cập nhật');
    }
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kiểm duyệt tin tuyển dụng</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ẩn / hiện tin vi phạm chính sách nền tảng</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm tiêu đề, công ty..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0d7a5f]/30" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tiêu đề</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Công ty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Thành phố</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Đơn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Không có tin nào</td></tr>
              ) : filtered.map(j => (
                <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-gray-300 shrink-0" />
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">{j.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{j.companyName}</td>
                  <td className="px-4 py-3 text-gray-600">{j.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{j.applyCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[j.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[j.status] ?? j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleJob(j.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: j.status === 'ACTIVE' ? '#ef4444' : BRAND }}>
                      {j.status === 'ACTIVE'
                        ? <><EyeOffIcon className="h-3.5 w-3.5" /> Tạm dừng</>
                        : <><EyeIcon className="h-3.5 w-3.5" /> Kích hoạt</>
                      }
                    </button>
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
        <button onClick={() => setPage(p => p + 1)} disabled={jobs.length < 20}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40">Sau</button>
      </div>
    </div>
  );
}
