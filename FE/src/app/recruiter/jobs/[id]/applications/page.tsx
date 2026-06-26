'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon, UserIcon, FileTextIcon, XIcon } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { getApplicationsByJob, getApplicationScore, updateStatus } from '@/services/application.service';
import type { Application, ApplicationStatus, AiScore } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  SUBMITTED: { label: 'Đã nộp', color: 'bg-gray-100 text-gray-600' },
  REVIEWING: { label: 'Đang xem xét', color: 'bg-[#e8f5f0] text-[#0d7a5f]' },
  SHORTLISTED: { label: 'Vòng trong', color: 'bg-teal-100 text-teal-700' },
  INTERVIEWING: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-700' },
  OFFERED: { label: 'Đề xuất offer', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Không phù hợp', color: 'bg-red-100 text-red-700' },
  WITHDRAWN: { label: 'Đã rút', color: 'bg-yellow-100 text-yellow-700' },
};

const RECRUITER_STATUSES: ApplicationStatus[] = [
  'REVIEWING', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED',
];

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scoreModal, setScoreModal] = useState<AiScore | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getApplicationsByJob(id);
      setApplications(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) => (b.aiMatchScore ?? -1) - (a.aiMatchScore ?? -1)),
    [applications]
  );

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
    setUpdatingId(applicationId);
    try {
      await updateStatus(applicationId, status);
      toast.success('Đã cập nhật trạng thái');
      fetchApplications();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  const openScoreModal = async (applicationId: string) => {
    setLoadingScore(true);
    try {
      const score = await getApplicationScore(applicationId);
      setScoreModal(score);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Chưa có phân tích AI');
    } finally {
      setLoadingScore(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href={`/recruiter/jobs/${id}`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách ứng viên</h1>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} ứng viên — sắp xếp theo điểm AI</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Chưa có ứng viên nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedApplications.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status];
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#e8f5f0] flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-[#0d7a5f]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.candidateFullName}</h3>
                      <p className="text-sm text-gray-500">{app.candidateEmail}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {app.cvFileUrl && (
                          <a
                            href={app.cvFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                          >
                            <FileTextIcon className="h-3 w-3" /> Xem CV
                          </a>
                        )}
                        <span className="text-xs text-gray-400">Nộp {formatDate(app.appliedAt)}</span>
                      </div>
                      {(app.skillScore != null || app.experienceScore != null || app.educationScore != null) && (
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {app.skillScore != null && (
                            <span className="rounded bg-[#e8f5f0] px-2 py-0.5 text-[#0d7a5f]">
                              Skill: {Math.round(app.skillScore * 100)}%
                            </span>
                          )}
                          {app.experienceScore != null && (
                            <span className="rounded bg-teal-50 px-2 py-0.5 text-teal-700">
                              KN: {Math.round(app.experienceScore * 100)}%
                            </span>
                          )}
                          {app.educationScore != null && (
                            <span className="rounded bg-purple-50 px-2 py-0.5 text-purple-700">
                              HV: {Math.round(app.educationScore * 100)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    {app.passedThreshold === true && (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Pass</span>
                    )}
                    {app.passedThreshold === false && app.aiMatchScore != null && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Fail</span>
                    )}
                    {app.aiMatchScore != null ? (
                      <div className="flex items-center gap-1">
                        <SparklesIcon className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-sm font-bold text-[#0d7a5f]">
                          {Math.round(app.aiMatchScore * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Đang chấm AI...</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  {app.status !== 'WITHDRAWN' && (
                    <select
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d7a5f]"
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                    >
                      {RECRUITER_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    loading={loadingScore}
                    onClick={() => openScoreModal(app.id)}
                  >
                    <SparklesIcon className="h-3.5 w-3.5" /> Xem phân tích AI
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {scoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Phân tích AI</h2>
              <button onClick={() => setScoreModal(null)} className="text-gray-400 hover:text-gray-600">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <ScoreCard label="Tổng điểm" value={scoreModal.finalScore} highlight />
              <ScoreCard label="Vector" value={scoreModal.vectorScore} />
              <ScoreCard label="LLM avg" value={scoreModal.llmScore} />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <ScoreCard label="Kỹ năng" value={scoreModal.skillScore} />
              <ScoreCard label="Kinh nghiệm" value={scoreModal.experienceScore} />
              <ScoreCard label="Học vấn" value={scoreModal.educationScore} />
            </div>

            {scoreModal.strengths && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Điểm mạnh</p>
                <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3">{scoreModal.strengths}</p>
              </div>
            )}
            {scoreModal.weaknesses && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Điểm yếu</p>
                <p className="text-sm text-gray-700 bg-red-50 rounded-lg p-3">{scoreModal.weaknesses}</p>
              </div>
            )}
            {scoreModal.recommendation && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Khuyến nghị</p>
                <p className="text-sm text-gray-700 bg-[#e8f5f0] rounded-lg p-3">{scoreModal.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value, highlight }: { label: string; value?: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-[#e8f5f0]' : 'bg-gray-50'}`}>
      <p className={`text-xl font-bold ${highlight ? 'text-[#0d7a5f]' : 'text-gray-800'}`}>
        {value != null ? `${Math.round(value * 100)}%` : '—'}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
