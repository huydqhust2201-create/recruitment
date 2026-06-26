'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import axiosInstance from '@/lib/axios';
import type { Job, CvFile, Application, ApplicationStatus } from '@/types';
import { formatSalary, formatDate, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import {
  MapPinIcon, BriefcaseIcon, ClockIcon, UsersIcon,
  BuildingIcon, CalendarIcon, ArrowLeftIcon, EyeIcon, SparklesIcon, XIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apply, getMyApplicationForJob, generateCoverLetter } from '@/services/application.service';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Đã nộp đơn',
  REVIEWING: 'Đang xem xét',
  SHORTLISTED: 'Vào vòng trong',
  INTERVIEWING: 'Đang phỏng vấn',
  OFFERED: 'Nhận offer',
  REJECTED: 'Không phù hợp',
  WITHDRAWN: 'Đã rút đơn',
};

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cvFiles, setCvFiles] = useState<CvFile[]>([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);

  useEffect(() => {
    if (!slug) return;
    axiosInstance
      .get<Job>(`/api/jobs/slug/${slug}`)
      .then((res) => setJob(res.data))
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Không tìm thấy việc làm');
        router.push('/jobs');
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  useEffect(() => {
    if (!job || user?.role !== 'CANDIDATE') return;
    getMyApplicationForJob(job.id).then(setExistingApplication);
  }, [job, user]);

  const openApplyModal = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      router.push(`/login?redirect=/jobs/${slug}`);
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }
    if (!job) return;
    if (job.status !== 'ACTIVE') {
      toast.error('Tin tuyển dụng không còn mở');
      return;
    }
    if (existingApplication) {
      toast('Bạn đã ứng tuyển tin này');
      return;
    }

    try {
      const res = await axiosInstance.get<CvFile[]>('/api/candidate/cv');
      const files = res.data;
      if (files.length === 0) {
        toast.error('Vui lòng upload CV trước khi ứng tuyển');
        router.push('/candidate/cv');
        return;
      }
      setCvFiles(files);
      const primary = files.find((f) => f.isPrimary) ?? files[0];
      setSelectedCvId(String(primary.id));
      setShowApplyModal(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách CV');
    }
  };

  const handleSubmitApplication = async () => {
    if (!job || !selectedCvId) return;
    setSubmitting(true);
    try {
      const result = await apply({
        jobId: job.id,
        cvFileId: selectedCvId,
        coverLetter: coverLetter.trim() || undefined,
      });
      setExistingApplication(result);
      setJob((prev) => prev ? { ...prev, applyCount: prev.applyCount + 1 } : prev);
      setShowApplyModal(false);
      toast.success('Ứng tuyển thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ứng tuyển thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Navbar /><PageLoader /></>;
  if (!job) return null;

  const canApply = user?.role === 'CANDIDATE' && job.status === 'ACTIVE' && !existingApplication;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d7a5f] mb-6 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" /> Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-contain" />
                  ) : (
                    <BuildingIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-[#0d7a5f] font-medium mt-1">{job.companyName}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Tag icon={<MapPinIcon className="h-3.5 w-3.5" />}>{job.city}</Tag>
                    <Tag icon={<BriefcaseIcon className="h-3.5 w-3.5" />}>{JOB_TYPE_LABELS[job.jobType]}</Tag>
                    <Tag icon={<ClockIcon className="h-3.5 w-3.5" />}>{JOB_LEVEL_LABELS[job.level]}</Tag>
                    {job.industry && <Tag icon={<BuildingIcon className="h-3.5 w-3.5" />}>{job.industry}</Tag>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {existingApplication ? (
                  <div className="flex-1 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
                    ✓ {STATUS_LABELS[existingApplication.status]} — {formatDate(existingApplication.appliedAt)}
                  </div>
                ) : (
                  <Button size="lg" onClick={openApplyModal} className="flex-1" disabled={!canApply && user?.role === 'CANDIDATE'}>
                    {job.status !== 'ACTIVE' ? 'Tin đã đóng' : 'Ứng tuyển ngay'}
                  </Button>
                )}
              </div>
            </div>

            {job.description && (
              <Section title="Mô tả công việc">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{job.description}</div>
              </Section>
            )}
            {job.requirements && (
              <Section title="Yêu cầu ứng viên">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{job.requirements}</div>
              </Section>
            )}
            {job.benefits && (
              <Section title="Quyền lợi">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{job.benefits}</div>
              </Section>
            )}
            {job.skills.length > 0 && (
              <Section title="Kỹ năng yêu cầu">
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s.skillId}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        s.isRequired ? 'bg-[#e8f5f0] text-[#0d7a5f]' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.skillName}
                      {s.isRequired && <span className="ml-1 text-xs text-[#0a5c47]">*</span>}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin chung</h3>
              <div className="flex flex-col gap-4">
                <InfoRow label="Mức lương" value={formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)} highlight />
                <InfoRow label="Hình thức" value={JOB_TYPE_LABELS[job.jobType]} />
                <InfoRow label="Cấp độ" value={JOB_LEVEL_LABELS[job.level]} />
                {job.deadline && <InfoRow label="Hạn nộp" value={formatDate(job.deadline)} icon={<CalendarIcon className="h-4 w-4" />} />}
                <InfoRow label="Lượt xem" value={`${job.viewCount}`} icon={<EyeIcon className="h-4 w-4" />} />
                <InfoRow label="Đã ứng tuyển" value={`${job.applyCount} người`} icon={<UsersIcon className="h-4 w-4" />} />
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                {user?.role === 'CANDIDATE' && !existingApplication && (
                  <div className="flex items-center gap-2 rounded-lg bg-[#e8f5f0] p-3 mb-4">
                    <SparklesIcon className="h-4 w-4 text-[#0d7a5f] shrink-0" />
                    <p className="text-xs text-[#0a5c47]">Chọn CV phù hợp để nộp đơn</p>
                  </div>
                )}
                {existingApplication ? (
                  <div className="w-full rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-center text-sm font-medium text-green-800">
                    {STATUS_LABELS[existingApplication.status]}
                  </div>
                ) : (
                  <Button size="lg" className="w-full" onClick={openApplyModal} disabled={job.status !== 'ACTIVE'}>
                    {job.status !== 'ACTIVE' ? 'Tin đã đóng' : 'Ứng tuyển ngay'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Nộp đơn ứng tuyển</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{job.title} — {job.companyName}</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Chọn CV</label>
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0d7a5f] focus:outline-none focus:ring-1 focus:ring-[#0d7a5f]"
                >
                  {cvFiles.map((cv) => (
                    <option key={cv.id} value={String(cv.id)}>
                      {cv.fileName}{cv.isPrimary ? ' (CV chính)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Thư giới thiệu (tùy chọn)</label>
                  <button
                    type="button"
                    disabled={generatingLetter}
                    onClick={async () => {
                      if (!job) return;
                      setGeneratingLetter(true);
                      try {
                        const res = await generateCoverLetter(job.id);
                        setCoverLetter(res.content);
                        toast.success('AI đã tạo thư xin việc cho bạn!');
                      } catch {
                        toast.error('Không thể tạo thư, vui lòng thử lại');
                      } finally {
                        setGeneratingLetter(false);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-[#0d7a5f] hover:text-[#0a5c47] disabled:opacity-50 font-medium"
                  >
                    <SparklesIcon className="h-3.5 w-3.5" />
                    {generatingLetter ? 'Đang tạo...' : 'Viết bằng AI'}
                  </button>
                </div>
                <Textarea
                  placeholder="Giới thiệu ngắn về bản thân và lý do ứng tuyển..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowApplyModal(false)} disabled={submitting}>
                  Hủy
                </Button>
                <Button onClick={handleSubmitApplication} loading={submitting}>
                  Gửi đơn ứng tuyển
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
      {icon}{children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, highlight, icon }: { label: string; value: string; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-gray-500 flex items-center gap-1">{icon}{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-green-600' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}
