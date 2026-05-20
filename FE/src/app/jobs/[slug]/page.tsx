'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import axiosInstance from '@/lib/axios';
import type { Job } from '@/types';
import { formatSalary, formatDate, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import {
  MapPinIcon, BriefcaseIcon, ClockIcon, UsersIcon,
  BuildingIcon, CalendarIcon, ArrowLeftIcon, EyeIcon, SparklesIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <><Navbar /><PageLoader /></>;
  if (!job) return null;

  const handleApply = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      router.push('/login');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }
    toast.success('Chức năng ứng tuyển sẽ sớm ra mắt!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" /> Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
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
                  <p className="text-blue-600 font-medium mt-1">{job.companyName}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Tag icon={<MapPinIcon className="h-3.5 w-3.5" />}>{job.city}</Tag>
                    <Tag icon={<BriefcaseIcon className="h-3.5 w-3.5" />}>{JOB_TYPE_LABELS[job.jobType]}</Tag>
                    <Tag icon={<ClockIcon className="h-3.5 w-3.5" />}>{JOB_LEVEL_LABELS[job.level]}</Tag>
                    {job.industry && <Tag icon={<BuildingIcon className="h-3.5 w-3.5" />}>{job.industry}</Tag>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={handleApply} className="flex-1">
                  Ứng tuyển ngay
                </Button>
                <Button variant="outline" size="lg">
                  Lưu việc làm
                </Button>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <Section title="Mô tả công việc">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{job.description}</div>
              </Section>
            )}

            {/* Requirements */}
            {job.requirements && (
              <Section title="Yêu cầu ứng viên">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{job.requirements}</div>
              </Section>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Section title="Quyền lợi">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{job.benefits}</div>
              </Section>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <Section title="Kỹ năng yêu cầu">
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s.skillId}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        s.isRequired ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.skillName}
                      {s.isRequired && <span className="ml-1 text-xs text-blue-500">*</span>}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">* Kỹ năng bắt buộc</p>
              </Section>
            )}
          </div>

          {/* Sidebar */}
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
                {user?.role === 'CANDIDATE' && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 mb-4">
                    <SparklesIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-blue-700">Upload CV để AI phân tích mức độ phù hợp</p>
                  </div>
                )}
                <Button size="lg" className="w-full" onClick={handleApply}>
                  Ứng tuyển ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
