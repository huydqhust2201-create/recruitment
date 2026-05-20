'use client';

import { ClipboardListIcon, SparklesIcon, BuildingIcon, MapPinIcon } from 'lucide-react';
import { formatDate, JOB_LEVEL_LABELS } from '@/lib/utils';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xem xét', color: 'bg-yellow-100 text-yellow-700' },
  REVIEWING: { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-700' },
  OFFERED: { label: 'Nhận offer', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Không phù hợp', color: 'bg-red-100 text-red-700' },
};

const MOCK_APPLICATIONS = [
  {
    id: 1, jobTitle: 'Frontend Developer', companyName: 'TechCorp Vietnam',
    city: 'Hồ Chí Minh', level: 'MID', status: 'REVIEWING',
    appliedAt: '2024-01-15', aiScore: 88,
  },
  {
    id: 2, jobTitle: 'React Native Developer', companyName: 'Mobile Studio',
    city: 'Hà Nội', level: 'JUNIOR', status: 'INTERVIEW',
    appliedAt: '2024-01-10', aiScore: 72,
  },
  {
    id: 3, jobTitle: 'UI/UX Developer', companyName: 'Design Agency',
    city: 'Đà Nẵng', level: 'JUNIOR', status: 'REJECTED',
    appliedAt: '2024-01-05', aiScore: 45,
  },
];

export default function CandidateApplicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn ứng tuyển</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
      </div>

      {/* Mock notice */}
      <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
        <SparklesIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-900">Đang sử dụng dữ liệu demo</p>
          <p className="text-xs text-yellow-700 mt-0.5">API ứng tuyển đang được phát triển. Dữ liệu bên dưới chỉ mang tính minh họa.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng đơn', value: 3 },
          { label: 'Đang xem xét', value: 1 },
          { label: 'Phỏng vấn', value: 1 },
          { label: 'Nhận offer', value: 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {MOCK_APPLICATIONS.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ClipboardListIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Chưa có đơn ứng tuyển nào</p>
          <p className="text-sm text-gray-400 mt-1">Ứng tuyển ngay để theo dõi tại đây</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {MOCK_APPLICATIONS.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG];
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <BuildingIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                      <p className="text-sm text-gray-500">{app.companyName}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPinIcon className="h-3.5 w-3.5" /> {app.city}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {JOB_LEVEL_LABELS[app.level]}
                        </span>
                        <span className="text-xs text-gray-400">Nộp {formatDate(app.appliedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <SparklesIcon className="h-3.5 w-3.5 text-blue-500" />
                      Điểm AI: <span className="font-semibold text-blue-600">{app.aiScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
