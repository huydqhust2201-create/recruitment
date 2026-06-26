'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import type { Job, JobCriteria } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon, EyeIcon, UsersIcon, SparklesIcon, CheckIcon, PencilIcon, AlertCircleIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatSalary, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active', DRAFT: 'Nháp', PAUSED: 'Tạm dừng', CLOSED: 'Đã đóng',
};

interface CriteriaForm {
  skillWeight: number;
  experienceWeight: number;
  educationWeight: number;
  passThreshold: number;
  customInstructions: string;
}

export default function RecruiterJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [criteria, setCriteria] = useState<JobCriteria | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [closing, setClosing] = useState(false);
  const [criteriaForm, setCriteriaForm] = useState<CriteriaForm>({
    skillWeight: 40, experienceWeight: 35, educationWeight: 25,
    passThreshold: 0.7, customInstructions: '',
  });
  const [savingCriteria, setSavingCriteria] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(false);
  const [criteriaErrors, setCriteriaErrors] = useState<Partial<CriteriaForm>>({});

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const [jobRes, criteriaRes] = await Promise.allSettled([
          axiosInstance.get<Job>(`/api/recruiter/jobs/${id}`),
          axiosInstance.get<JobCriteria>(`/api/recruiter/jobs/${id}/criteria`),
        ]);

        if (jobRes.status === 'fulfilled') {
          setJob(jobRes.value.data);
        } else {
          toast.error('Không tìm thấy job');
          router.push('/recruiter/jobs');
          return;
        }

        if (criteriaRes.status === 'fulfilled') {
          const c = criteriaRes.value.data;
          setCriteria(c);
          setCriteriaForm({
            skillWeight: c.skillWeight,
            experienceWeight: c.experienceWeight,
            educationWeight: c.educationWeight,
            passThreshold: c.passThreshold,
            customInstructions: c.customInstructions ?? '',
          });
        } else {
          setEditingCriteria(true);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, router]);

  const totalWeight = criteriaForm.skillWeight + criteriaForm.experienceWeight + criteriaForm.educationWeight;

  const validateCriteria = () => {
    const e: Partial<Record<keyof CriteriaForm, string>> = {};
    if (totalWeight !== 100) {
      (e as Record<string, string>).skillWeight = `Tổng các trọng số phải bằng 100 (hiện tại: ${totalWeight})`;
    }
    if (criteriaForm.passThreshold < 0 || criteriaForm.passThreshold > 1) {
      (e as Record<string, string>).passThreshold = 'Ngưỡng đạt phải từ 0.0 đến 1.0';
    }
    setCriteriaErrors(e as Partial<CriteriaForm>);
    return Object.keys(e).length === 0;
  };

  const handleSaveCriteria = async () => {
    if (!validateCriteria()) return;
    setSavingCriteria(true);
    try {
      const res = await axiosInstance.post<JobCriteria>(`/api/recruiter/jobs/${id}/criteria`, criteriaForm);
      setCriteria(res.data);
      setEditingCriteria(false);
      toast.success('Lưu tiêu chí AI thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSavingCriteria(false);
    }
  };

  const handlePublish = async () => {
    setPublishingId(true);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/publish`);
      setJob((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
      toast.success('Đăng tin thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Đăng tin thất bại');
    } finally {
      setPublishingId(false);
    }
  };

  const handlePause = async () => {
    setPausing(true);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/pause`);
      setJob((prev) => prev ? { ...prev, status: 'PAUSED' } : prev);
      toast.success('Đã tạm dừng tin');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setPausing(false);
    }
  };

  const handleResume = async () => {
    setResuming(true);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/resume`);
      setJob((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
      toast.success('Đã tiếp tục đăng tin');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setResuming(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Đóng tin tuyển dụng này?')) return;
    setClosing(true);
    try {
      await axiosInstance.put(`/api/recruiter/jobs/${id}/close`);
      setJob((prev) => prev ? { ...prev, status: 'CLOSED' } : prev);
      toast.success('Đã đóng tin');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!job) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/recruiter/jobs" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[job.status] ?? job.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{job.city} · {JOB_TYPE_LABELS[job.jobType]} · {JOB_LEVEL_LABELS[job.level]}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/recruiter/jobs/${id}/applications`}>
            <Button variant="outline" size="sm">
              <UsersIcon className="h-4 w-4" /> Ứng viên ({job.applyCount})
            </Button>
          </Link>
          {job.status === 'DRAFT' && (
            <Button size="sm" loading={publishingId} onClick={handlePublish}>
              Đăng tin
            </Button>
          )}
          {job.status === 'ACTIVE' && (
            <>
              <Button variant="outline" size="sm" loading={pausing} onClick={handlePause}>
                Tạm dừng
              </Button>
              <Button variant="danger" size="sm" loading={closing} onClick={handleClose}>
                Đóng tin
              </Button>
            </>
          )}
          {job.status === 'PAUSED' && (
            <>
              <Button size="sm" loading={resuming} onClick={handleResume}>
                Tiếp tục
              </Button>
              <Button variant="danger" size="sm" loading={closing} onClick={handleClose}>
                Đóng tin
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Job details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Thông tin công việc</h2>
              <Link href={`/recruiter/jobs/${id}/edit`}>
                <Button variant="ghost" size="sm"><PencilIcon className="h-4 w-4" /> Chỉnh sửa</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-5">
              <InfoPair label="Mức lương" value={formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)} />
              <InfoPair label="Hạn nộp" value={job.deadline ? formatDate(job.deadline) : 'Không có'} />
              <InfoPair label="Lượt xem" value={`${job.viewCount}`} />
              <InfoPair label="Đã ứng tuyển" value={`${job.applyCount} người`} />
            </div>
            {job.description && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mô tả</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-5">{job.description}</p>
              </div>
            )}
            {job.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Kỹ năng</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s.skillId} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.isRequired ? 'bg-[#e8f5f0] text-[#0d7a5f]' : 'bg-gray-100 text-gray-600'}`}>
                      {s.skillName}{s.isRequired ? ' *' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Criteria */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-[#0d7a5f]" />
                <h2 className="font-semibold text-gray-900">Tiêu chí chấm điểm AI</h2>
              </div>
              {criteria && !editingCriteria && (
                <Button variant="ghost" size="sm" onClick={() => setEditingCriteria(true)}>
                  <PencilIcon className="h-4 w-4" /> Chỉnh sửa
                </Button>
              )}
            </div>

            {!editingCriteria && criteria ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <WeightCard label="Kỹ năng" value={criteria.skillWeight} />
                  <WeightCard label="Kinh nghiệm" value={criteria.experienceWeight} />
                  <WeightCard label="Học vấn" value={criteria.educationWeight} />
                </div>
                <InfoPair label="Ngưỡng đạt" value={`${(criteria.passThreshold * 100).toFixed(0)}%`} />
                {criteria.customInstructions && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hướng dẫn tùy chỉnh</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{criteria.customInstructions}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {!criteria && (
                  <div className="flex items-start gap-3 rounded-xl bg-[#e8f5f0] p-4">
                    <AlertCircleIcon className="h-5 w-5 text-[#0d7a5f] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#0a5c47]">Thiết lập tiêu chí để AI tự động chấm điểm và lọc ứng viên phù hợp</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Trọng số kỹ năng (%)"
                    type="number" min={0} max={100}
                    value={criteriaForm.skillWeight}
                    onChange={(e) => setCriteriaForm({ ...criteriaForm, skillWeight: Number(e.target.value) })}
                    error={typeof criteriaErrors.skillWeight === 'string' ? criteriaErrors.skillWeight : undefined}
                  />
                  <Input
                    label="Trọng số kinh nghiệm (%)"
                    type="number" min={0} max={100}
                    value={criteriaForm.experienceWeight}
                    onChange={(e) => setCriteriaForm({ ...criteriaForm, experienceWeight: Number(e.target.value) })}
                  />
                  <Input
                    label="Trọng số học vấn (%)"
                    type="number" min={0} max={100}
                    value={criteriaForm.educationWeight}
                    onChange={(e) => setCriteriaForm({ ...criteriaForm, educationWeight: Number(e.target.value) })}
                  />
                </div>

                <div className={`rounded-lg px-3 py-2 text-sm font-medium ${totalWeight === 100 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  Tổng trọng số: {totalWeight}/100
                  {totalWeight === 100 && ' ✓'}
                </div>

                <Input
                  label="Ngưỡng đạt (0.0 - 1.0)"
                  type="number" min={0} max={1} step={0.05}
                  value={criteriaForm.passThreshold}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, passThreshold: Number(e.target.value) })}
                  hint={`Ứng viên đạt từ ${(criteriaForm.passThreshold * 100).toFixed(0)}% điểm trở lên sẽ được xem xét`}
                />

                <Textarea
                  label="Hướng dẫn tùy chỉnh (tùy chọn)"
                  placeholder="VD: Ưu tiên ứng viên có kinh nghiệm startup, tiếng Anh tốt..."
                  value={criteriaForm.customInstructions}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, customInstructions: e.target.value })}
                  rows={3}
                />

                <div className="flex gap-3 justify-end">
                  {criteria && (
                    <Button variant="outline" onClick={() => setEditingCriteria(false)} disabled={savingCriteria}>
                      Hủy
                    </Button>
                  )}
                  <Button loading={savingCriteria} onClick={handleSaveCriteria}>
                    <CheckIcon className="h-4 w-4" /> Lưu tiêu chí
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500"><EyeIcon className="h-4 w-4" /> Lượt xem</span>
                <span className="font-bold text-gray-900">{job.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500"><UsersIcon className="h-4 w-4" /> Ứng tuyển</span>
                <span className="font-bold text-gray-900">{job.applyCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Link href={`/recruiter/jobs/${id}/applications`} className="block">
            <div className="bg-blue-600 rounded-2xl p-5 text-white hover:bg-blue-700 transition-colors">
              <UsersIcon className="h-6 w-6 mb-2" />
              <p className="font-semibold">Xem ứng viên</p>
              <p className="text-sm text-blue-200 mt-0.5">{job.applyCount} người đã ứng tuyển</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

function WeightCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 text-center">
      <p className="text-2xl font-bold text-[#0d7a5f]">{value}%</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
