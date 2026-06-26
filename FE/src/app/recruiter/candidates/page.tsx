'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  SparklesIcon, UserIcon, FileTextIcon, XIcon, SearchIcon,
  BriefcaseIcon, ChevronDownIcon, ExternalLinkIcon, MapPinIcon, ClockIcon,
} from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { getAllApplicationsForRecruiter, getApplicationScore, updateStatus } from '@/services/application.service';
import type { Application, ApplicationStatus, AiScore } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  SUBMITTED:    { label: 'Đã nộp',          color: 'bg-gray-100 text-gray-600' },
  REVIEWING:    { label: 'Đang xem xét',    color: 'bg-[#e8f5f0] text-[#0d7a5f]' },
  SHORTLISTED:  { label: 'Vòng trong',      color: 'bg-teal-100 text-teal-700' },
  INTERVIEWING: { label: 'Phỏng vấn',       color: 'bg-purple-100 text-purple-700' },
  OFFERED:      { label: 'Đề xuất offer',   color: 'bg-green-100 text-green-700' },
  REJECTED:     { label: 'Không phù hợp',   color: 'bg-red-100 text-red-700' },
  WITHDRAWN:    { label: 'Đã rút',          color: 'bg-yellow-100 text-yellow-700' },
};

const MOVE_STATUSES: ApplicationStatus[] = ['REVIEWING', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED'];

function ScoreBar({ value, label, color }: { value?: number; label: string; color: string }) {
  if (value == null) return null;
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-medium text-gray-700">{pct}%</span>
    </div>
  );
}

function AiScoreModal({ score, onClose }: { score: AiScore; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-[#0d7a5f]" />
            <h2 className="text-lg font-bold text-gray-900">Phân tích AI</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Tổng điểm', value: score.finalScore, highlight: true },
            { label: 'Vector', value: score.vectorScore },
            { label: 'LLM', value: score.llmScore },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-xl p-3 text-center ${highlight ? 'bg-[#e8f5f0]' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${highlight ? 'text-[#0d7a5f]' : 'text-gray-800'}`}>
                {value != null ? `${Math.round(value * 100)}%` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mb-5">
          <ScoreBar value={score.skillScore} label="Kỹ năng" color="bg-[#0d7a5f]" />
          <ScoreBar value={score.experienceScore} label="Kinh nghiệm" color="bg-teal-500" />
          <ScoreBar value={score.educationScore} label="Học vấn" color="bg-purple-400" />
        </div>

        {score.strengths && (
          <div className="mb-3 bg-green-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">Điểm mạnh</p>
            <p className="text-sm text-gray-700">{score.strengths}</p>
          </div>
        )}
        {score.weaknesses && (
          <div className="mb-3 bg-red-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Điểm cần cải thiện</p>
            <p className="text-sm text-gray-700">{score.weaknesses}</p>
          </div>
        )}
        {score.recommendation && (
          <div className="bg-[#e8f5f0] rounded-xl p-3">
            <p className="text-xs font-semibold text-[#0d7a5f] mb-1">Khuyến nghị</p>
            <p className="text-sm text-gray-700">{score.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecruiterCandidatesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scoreModal, setScoreModal] = useState<AiScore | null>(null);
  const [loadingScoreId, setLoadingScoreId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllApplicationsForRecruiter();
      setApplications(data);
    } catch {
      toast.error('Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Unique job titles for filter dropdown
  const jobs = useMemo(() => {
    const map = new Map<string, string>();
    applications.forEach(a => { if (a.jobId && a.jobTitle) map.set(a.jobId, a.jobTitle); });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [applications]);

  const filtered = useMemo(() => {
    let list = applications;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.candidateFullName?.toLowerCase().includes(q) ||
        a.candidateEmail?.toLowerCase().includes(q) ||
        a.jobTitle?.toLowerCase().includes(q)
      );
    }
    if (filterJob) list = list.filter(a => a.jobId === filterJob);
    if (filterStatus) list = list.filter(a => a.status === filterStatus);
    return list;
  }, [applications, search, filterJob, filterStatus]);

  const handleStatus = async (id: string, status: ApplicationStatus) => {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
      toast.success('Đã cập nhật trạng thái');
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  const openScore = async (id: string) => {
    setLoadingScoreId(id);
    try {
      const score = await getApplicationScore(id);
      setScoreModal(score);
    } catch {
      toast.error('Chưa có phân tích AI cho ứng viên này');
    } finally {
      setLoadingScoreId(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ ứng viên</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng hợp CV và đơn ứng tuyển từ tất cả tin tuyển dụng của bạn
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng ứng viên', value: applications.length, color: 'text-gray-800' },
          { label: 'Chờ xem xét', value: applications.filter(a => a.status === 'SUBMITTED').length, color: 'text-[#0d7a5f]' },
          { label: 'Vòng trong', value: applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEWING').length, color: 'text-teal-600' },
          { label: 'Đề xuất offer', value: applications.filter(a => a.status === 'OFFERED').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên, email ứng viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d6b4e]/30"
          />
        </div>
        <div className="relative">
          <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select
            value={filterJob}
            onChange={e => setFilterJob(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d6b4e]/30 bg-white min-w-[180px]"
          >
            <option value="">Tất cả vị trí</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as ApplicationStatus | '')}
            className="appearance-none rounded-xl border border-gray-200 px-4 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d6b4e]/30 bg-white min-w-[150px]"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 -mt-2">
        Hiển thị <span className="font-semibold text-gray-800">{filtered.length}</span> ứng viên
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">Không tìm thấy ứng viên</p>
          <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc đăng thêm tin tuyển dụng</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            const initials = app.candidateFullName?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?';
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-[#0d6b4e] to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900">{app.candidateFullName}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      {app.passedThreshold === true && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">✓ AI Pass</span>
                      )}
                    </div>

                    {/* Candidate profile info */}
                    {app.candidateHeadline && (
                      <p className="text-sm font-medium text-[#0d7a5f]">{app.candidateHeadline}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{app.candidateEmail}</span>
                      {app.candidateCurrentPosition && (
                        <>
                          <span>·</span>
                          <span>{app.candidateCurrentPosition}</span>
                        </>
                      )}
                      {app.candidateYearsExp != null && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <ClockIcon className="h-3 w-3" />
                            {app.candidateYearsExp} năm KN
                          </span>
                        </>
                      )}
                      {app.candidateCity && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPinIcon className="h-3 w-3" />
                            {app.candidateCity}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Job info */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                      <BriefcaseIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium text-gray-600">{app.jobTitle}</span>
                      <span>·</span>
                      <span>Nộp {formatDate(app.appliedAt)}</span>
                    </div>

                    {/* AI scores mini */}
                    {app.aiMatchScore != null && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <SparklesIcon className="h-3.5 w-3.5 text-[#0d7a5f]" />
                          <span className="text-sm font-bold text-[#0d7a5f]">{Math.round(app.aiMatchScore * 100)}%</span>
                          <span className="text-xs text-gray-400">phù hợp</span>
                        </div>
                        {app.skillScore != null && (
                          <span className="text-xs bg-[#e8f5f0] text-[#0d7a5f] rounded px-1.5 py-0.5">
                            Skill {Math.round(app.skillScore * 100)}%
                          </span>
                        )}
                        {app.experienceScore != null && (
                          <span className="text-xs bg-teal-50 text-teal-700 rounded px-1.5 py-0.5">
                            KN {Math.round(app.experienceScore * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {app.cvFileUrl && (
                      <a
                        href={app.cvFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d6b4e] hover:bg-[#0a5a40] text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        <FileTextIcon className="h-3.5 w-3.5" />
                        Xem CV
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      loading={loadingScoreId === app.id}
                      onClick={() => openScore(app.id)}
                    >
                      <SparklesIcon className="h-3.5 w-3.5" /> Phân tích AI
                    </Button>
                  </div>
                </div>

                {/* Status changer */}
                {app.status !== 'WITHDRAWN' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <span className="text-xs text-gray-500 shrink-0">Chuyển trạng thái:</span>
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={e => handleStatus(app.id, e.target.value as ApplicationStatus)}
                      className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d6b4e] disabled:opacity-50 bg-white"
                    >
                      {MOVE_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                    {updatingId === app.id && (
                      <span className="text-xs text-gray-400">Đang lưu...</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {scoreModal && <AiScoreModal score={scoreModal} onClose={() => setScoreModal(null)} />}
    </div>
  );
}
