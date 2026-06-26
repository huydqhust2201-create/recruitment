'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ClipboardListIcon, SparklesIcon, BuildingIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, AlertCircleIcon, LightbulbIcon, MoreHorizontalIcon } from 'lucide-react';

import { PageLoader } from '@/components/ui/LoadingSpinner';
import { getMyApplications, withdrawApplication, getMyCandidateScore } from '@/services/application.service';
import type { Application, ApplicationStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  SUBMITTED: { label: 'Đã nộp', color: 'bg-gray-100 text-gray-700' },
  REVIEWING: { label: 'Đang xem xét', color: 'bg-[#e8f5f0] text-[#0d7a5f]' },
  SHORTLISTED: { label: 'Vào vòng trong', color: 'bg-teal-100 text-teal-700' },
  INTERVIEWING: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-700' },
  OFFERED: { label: 'Nhận offer', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Không phù hợp', color: 'bg-red-100 text-red-700' },
  WITHDRAWN: { label: 'Đã rút', color: 'bg-yellow-100 text-yellow-700' },
};

import type { AiScore } from '@/types';




const WITHDRAWABLE: ApplicationStatus[] = ['SUBMITTED', 'REVIEWING'];

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [aiScores, setAiScores] = useState<Record<string, AiScore>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách đơn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const toggleExpand = async (app: Application) => {
    if (expandedId === app.id) { setExpandedId(null); return; }
    setExpandedId(app.id);
    if (!aiScores[app.id] && app.aiMatchScore != null) {
      try {
        const score = await getMyCandidateScore(app.id);
        setAiScores((prev) => ({ ...prev, [app.id]: score }));
      } catch { /* score chưa có, bỏ qua */ }
    }
  };

  const handleWithdraw = async (app: Application) => {
    if (!confirm(`Bạn chắc chắn muốn hủy ứng tuyển vị trí "${app.jobTitle}"?`)) return;
    setWithdrawingId(app.id);
    try {
      const updated = await withdrawApplication(app.id);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast.success('Đã hủy ứng tuyển');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy ứng tuyển');
    } finally {
      setWithdrawingId(null);
    }
  };

  const stats = {
    total: applications.length,
    reviewing: applications.filter((a) => a.status === 'REVIEWING' || a.status === 'SUBMITTED').length,
    interviewing: applications.filter((a) => a.status === 'INTERVIEWING' || a.status === 'SHORTLISTED').length,
    offered: applications.filter((a) => a.status === 'OFFERED').length,
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn ứng tuyển</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng đơn', value: stats.total },
          { label: 'Đang xem xét', value: stats.reviewing },
          { label: 'Phỏng vấn', value: stats.interviewing },
          { label: 'Nhận offer', value: stats.offered },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-[#0d7a5f]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ClipboardListIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Chưa có đơn ứng tuyển nào</p>
          <p className="text-sm text-gray-400 mt-1">Tìm việc và ứng tuyển ngay</p>
          <Link href="/jobs" className="mt-4 inline-block text-sm text-[#0d7a5f] hover:underline">
            Xem việc làm →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status];
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <BuildingIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                      <p className="text-sm text-gray-500">{app.companyName}</p>
                      <p className="text-xs text-gray-400 mt-2">Nộp {formatDate(app.appliedAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      {/* ⋯ menu — chỉ hiện khi có thể rút đơn */}
                      {WITHDRAWABLE.includes(app.status) && (
                        <div className="relative" ref={menuRef}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          >
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </button>
                          {openMenuId === app.id && (
                            <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[160px]">
                              <button
                                onClick={() => { setOpenMenuId(null); handleWithdraw(app); }}
                                disabled={withdrawingId === app.id}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                <XCircleIcon className="h-3.5 w-3.5" />
                                {withdrawingId === app.id ? 'Đang rút...' : 'Rút đơn ứng tuyển'}
                              </button>
                              <p className="px-3 pb-2 pt-1 text-[10px] text-gray-400 border-t border-gray-100 mt-1">
                                Chỉ rút được trước khi nhà tuyển dụng xem xét
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {app.passedThreshold === true && (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Đạt tiêu chuẩn
                      </span>
                    )}
                    {app.aiMatchScore != null && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <SparklesIcon className="h-3.5 w-3.5 text-[#0d7a5f]" />
                        Phù hợp:{' '}
                        <span className="font-semibold text-[#0d7a5f]">
                          {Math.round(app.aiMatchScore * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {app.aiMatchScore != null && (
                  <button
                    onClick={() => toggleExpand(app)}
                    className="mt-3 flex items-center gap-1 text-xs text-[#0d7a5f] hover:text-[#0a5c47] font-medium"
                  >
                    <SparklesIcon className="h-3.5 w-3.5" />
                    Xem phân tích AI
                    {expandedId === app.id ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>

              {expandedId === app.id && (() => {
                const score = aiScores[app.id];
                return (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 flex flex-col gap-4">
                    {/* Score bars */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Kỹ năng', value: score?.skillScore },
                        { label: 'Kinh nghiệm', value: score?.experienceScore },
                        { label: 'Học vấn', value: score?.educationScore },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{label}</span>
                            <span className="font-semibold text-gray-700">{value != null ? `${Math.round(value * 100)}%` : '—'}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0d7a5f] rounded-full transition-all"
                              style={{ width: value != null ? `${value * 100}%` : '0%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {score?.matchedSkills && score.matchedSkills.length > 0 && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-semibold text-green-700 mb-2">
                          <CheckCircleIcon className="h-3.5 w-3.5" /> Kỹ năng phù hợp
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {score.matchedSkills.map((s) => (
                            <span key={s} className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700 font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {score?.missingSkills && score.missingSkills.length > 0 && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-semibold text-orange-600 mb-2">
                          <AlertCircleIcon className="h-3.5 w-3.5" /> Kỹ năng còn thiếu
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {score.missingSkills.map((s) => (
                            <span key={s} className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-700 font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {score?.improvementSuggestions && score.improvementSuggestions.length > 0 && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-semibold text-[#0d7a5f] mb-2">
                          <LightbulbIcon className="h-3.5 w-3.5" /> Gợi ý cải thiện
                        </p>
                        <ul className="flex flex-col gap-1">
                          {score.improvementSuggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <span className="text-blue-400 mt-0.5">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {score?.recommendation && (
                      <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-3">{score.recommendation}</p>
                    )}

                    {!score && (
                      <p className="text-xs text-gray-400 text-center py-2">Đang tải phân tích...</p>
                    )}
                  </div>
                );
              })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
