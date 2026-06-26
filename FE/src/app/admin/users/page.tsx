'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<AdminUser[]>(`/api/admin/users?page=${p}&size=20`);
      setUsers(res.data);
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const toggleActive = async (id: string) => {
    try {
      const res = await axiosInstance.put<{ id: string; isActive: boolean }>(`/api/admin/users/${id}/toggle-active`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: res.data.isActive } : u));
      toast.success('Đã cập nhật trạng thái người dùng');
    } catch {
      toast.error('Không thể cập nhật');
    }
  };

  const roleLabel: Record<string, string> = {
    CANDIDATE: 'Ứng viên',
    RECRUITER: 'Nhà tuyển dụng',
    ADMIN: 'Admin',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý người dùng</h1>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'RECRUITER' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {roleLabel[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {u.isActive ? 'Hoạt động' : 'Bị khoá'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(u.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {u.isActive ? 'Khoá' : 'Mở khoá'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40"
        >
          Trước
        </button>
        <span className="px-3 py-1.5 text-sm">Trang {page + 1}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={users.length < 20}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
