'use client';

import Link from 'next/link';
import { SparklesIcon, BriefcaseIcon, MapPinIcon, BuildingIcon } from 'lucide-react';
import { formatSalary, JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from '@/lib/utils';

const MOCK_JOBS = [
  {
    id: 1, title: 'Frontend Developer (React)', slug: 'frontend-developer-react',
    companyName: 'TechCorp Vietnam', city: 'Hồ Chí Minh',
    jobType: 'FULL_TIME', level: 'MID', salaryMin: 20000000, salaryMax: 35000000, isSalaryPublic: true,
    matchScore: 92, skills: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    id: 2, title: 'Backend Java Developer', slug: 'backend-java-developer',
    companyName: 'FinTech Solutions', city: 'Hà Nội',
    jobType: 'HYBRID', level: 'JUNIOR', salaryMin: 15000000, salaryMax: 25000000, isSalaryPublic: true,
    matchScore: 85, skills: ['Java', 'Spring Boot', 'PostgreSQL'],
  },
  {
    id: 3, title: 'Full Stack Developer', slug: 'full-stack-developer',
    companyName: 'Startup Hub', city: 'Đà Nẵng',
    jobType: 'REMOTE', level: 'SENIOR', salaryMin: 40000000, salaryMax: 60000000, isSalaryPublic: true,
    matchScore: 78, skills: ['Next.js', 'Node.js', 'MongoDB'],
  },
];

export default function CandidateJobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Việc làm phù hợp</h1>
          <p className="text-sm text-gray-500 mt-1">Được gợi ý dựa trên hồ sơ và CV của bạn</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          <SparklesIcon className="h-4 w-4" /> AI Matching
        </span>
      </div>

      {/* Mock notice */}
      <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
        <SparklesIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-900">Tính năng AI Matching đang phát triển</p>
          <p className="text-xs text-yellow-700 mt-0.5">Đây là dữ liệu demo. Khi API sẵn sàng, hệ thống sẽ gợi ý việc làm thực dựa trên CV của bạn.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_JOBS.map((job) => (
          <Link key={job.id} href={`/jobs/${job.slug}`}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
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
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {JOB_TYPE_LABELS[job.jobType]}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {JOB_LEVEL_LABELS[job.level]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.map((s) => (
                        <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1">
                    <SparklesIcon className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-sm font-bold text-green-700">{job.matchScore}% phù hợp</span>
                  </div>
                  <p className="text-sm font-medium text-green-600">
                    {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryPublic)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center py-4">
        <Link href="/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Xem tất cả việc làm →
        </Link>
      </div>
    </div>
  );
}
