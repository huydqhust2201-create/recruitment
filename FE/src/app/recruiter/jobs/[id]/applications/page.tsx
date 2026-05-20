'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon, UserIcon, FileTextIcon, MapPinIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const STAGE_CONFIG = {
  APPLIED: { label: 'Đã nộp', color: 'bg-gray-100 text-gray-600' },
  SCREENING: { label: 'Đang sàng lọc', color: 'bg-blue-100 text-blue-700' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-700' },
  OFFERED: { label: 'Đề xuất offer', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Không phù hợp', color: 'bg-red-100 text-red-700' },
};

const MOCK_APPLICATIONS = [
  {
    id: 1, candidateName: 'Nguyễn Văn A', email: 'nguyenvana@email.com',
    city: 'Hồ Chí Minh', currentPosition: 'Frontend Developer',
    yearsOfExperience: 3, stage: 'SCREENING', aiScore: 88,
    appliedAt: '2024-01-15', hasCv: true,
  },
  {
    id: 2, candidateName: 'Trần Thị B', email: 'tranthib@email.com',
    city: 'Hà Nội', currentPosition: 'React Developer',
    yearsOfExperience: 2, stage: 'INTERVIEW', aiScore: 76,
    appliedAt: '2024-01-14', hasCv: true,
  },
  {
    id: 3, candidateName: 'Lê Văn C', email: 'levanc@email.com',
    city: 'Đà Nẵng', currentPosition: 'Junior Developer',
    yearsOfExperience: 1, stage: 'APPLIED', aiScore: 52,
    appliedAt: '2024-01-13', hasCv: false,
  },
];

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href={`/recruiter/jobs/${id}`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách ứng viên</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_APPLICATIONS.length} ứng viên đã ứng tuyển</p>
        </div>
      </div>

      {/* Mock notice */}
      <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
        <SparklesIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-900">Đang sử dụng dữ liệu demo</p>
          <p className="text-xs text-yellow-700 mt-0.5">API quản lý ứng viên đang được phát triển.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(STAGE_CONFIG).map(([stage, cfg]) => (
          <div key={stage} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-lg font-bold text-gray-900">
              {MOCK_APPLICATIONS.filter((a) => a.stage === stage).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {MOCK_APPLICATIONS.map((app) => {
          const stageCfg = STAGE_CONFIG[app.stage as keyof typeof STAGE_CONFIG];
          return (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.candidateName}</h3>
                    <p className="text-sm text-gray-500">{app.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <MapPinIcon className="h-3.5 w-3.5" /> {app.city}
                      </span>
                      <span className="text-xs text-gray-500">{app.currentPosition}</span>
                      <span className="text-xs text-gray-500">{app.yearsOfExperience} năm KN</span>
                      {app.hasCv && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          <FileTextIcon className="h-3 w-3" /> Có CV
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Nộp {formatDate(app.appliedAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${stageCfg.color}`}>
                    {stageCfg.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-sm font-bold text-blue-600">{app.aiScore}</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <select className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {Object.entries(STAGE_CONFIG).map(([s, cfg]) => (
                    <option key={s} value={s} selected={s === app.stage}>{cfg.label}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">← Chuyển trạng thái (demo)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
