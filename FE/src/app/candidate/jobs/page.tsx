'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { SparklesIcon, BriefcaseIcon, MapPinIcon, BuildingIcon, UploadIcon } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { getRecommendedJobs } from '@/services/application.service';
import type { Job } from '@/types';
import { formatSalary, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hasCvEmbedding, setHasCvEmbedding] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecommendedJobs();
      setJobs(data.jobs);
      setHasCvEmbedding(data.hasCvEmbedding);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải gợi ý việc làm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Việc làm phù hợp</h1>
          <p className="text-sm text-gray-500 mt-1">Gợi ý dựa trên embedding CV ↔ JD (pgvector)</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f0] px-3 py-1 text-sm font-medium text-[#0d7a5f]">
          <SparklesIcon className="h-4 w-4" /> AI Matching
        </span>
      </div>

      {!hasCvEmbedding && (
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <UploadIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">Upload CV để nhận gợi ý việc phù hợp</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Hệ thống cần tạo CV embedding trước. Đang hiển thị việc làm mới nhất.
            </p>
            <Link href="/candidate/cv" className="mt-2 inline-block">
              <Button size="sm">Upload CV ngay</Button>
            </Link>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Chưa có việc làm phù hợp</p>
          <Link href="/jobs" className="mt-4 inline-block text-sm text-[#0d7a5f] hover:underline">
            Xem tất cả việc làm →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#b2dfcf] hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <BuildingIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPinIcon className="h-3.5 w-3.5" /> {job.city}
                        </span>
                        <span className="rounded-full bg-[#e8f5f0] px-2 py-0.5 text-xs font-medium text-[#0d7a5f]">
                          {JOB_TYPE_LABELS[job.jobType]}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {JOB_LEVEL_LABELS[job.level]}
                        </span>
                      </div>
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job.skills.slice(0, 4).map((s) => (
                            <span key={s.skillId} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {s.skillName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {job.similarityScore != null && (
                      <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1">
                        <SparklesIcon className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-sm font-bold text-green-700">
                          Phù hợp {Math.round(job.similarityScore * 100)}%
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-green-600">
                      {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center py-4">
        <Link href="/jobs" className="text-sm font-medium text-[#0d7a5f] hover:text-[#0d7a5f]">
          Xem tất cả việc làm →
        </Link>
      </div>
    </div>
  );
}
