'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';

interface AdminSub {
  id: string;
  companyName: string;
  planCode: string;
  status: string;
  startedAt: string;
  expiresAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<AdminSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get<AdminSub[]>('/api/admin/subscriptions')
      .then(r => setSubs(r.data))
      .finally(() => setLoading(false));
  }, []);

  const planColor: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    BASIC: 'bg-blue-100 text-blue-700',
    PRO: 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Subscription</h1>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Công ty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gói</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bắt đầu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hết hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subs.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.companyName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${planColor[s.planCode] ?? 'bg-gray-100 text-gray-600'}`}>
                      {s.planCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      s.status === 'EXPIRED' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.startedAt ? new Date(s.startedAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subs.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">Chưa có subscription nào</p>
          )}
        </div>
      )}
    </div>
  );
}
