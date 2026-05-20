'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ArrowLeftIcon, PlusIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'REMOTE', label: 'Làm từ xa' },
  { value: 'HYBRID', label: 'Kết hợp' },
  { value: 'INTERNSHIP', label: 'Thực tập' },
];

const JOB_LEVEL_OPTIONS = [
  { value: 'INTERN', label: 'Thực tập sinh' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Middle' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'MANAGER', label: 'Manager' },
];

const CITY_OPTIONS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Toàn quốc', 'Khác'].map(
  (c) => ({ value: c, label: c })
);

interface SkillInput {
  skillId: number;
  skillName: string;
  isRequired: boolean;
  level: string;
}

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  jobType: string;
  level: string;
  industry: string;
  city: string;
  salaryMin: string;
  salaryMax: string;
  isSalaryPublic: boolean;
  deadline: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishAfter, setPublishAfter] = useState(false);
  const [skillInput, setSkillInput] = useState({ name: '', isRequired: true, level: '' });
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [skillIdCounter, setSkillIdCounter] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});

  const [form, setForm] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    jobType: 'FULL_TIME',
    level: 'MID',
    industry: '',
    city: '',
    salaryMin: '',
    salaryMax: '',
    isSalaryPublic: true,
    deadline: '',
  });

  const validate = () => {
    const e: Partial<Record<keyof JobFormData, string>> = {};
    if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề';
    if (!form.description.trim()) e.description = 'Vui lòng nhập mô tả';
    if (!form.city) e.city = 'Vui lòng chọn thành phố';
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      e.salaryMax = 'Lương tối đa phải lớn hơn tối thiểu';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addSkill = () => {
    if (!skillInput.name.trim()) return;
    setSkills((prev) => [
      ...prev,
      { skillId: skillIdCounter, skillName: skillInput.name.trim(), isRequired: skillInput.isRequired, level: skillInput.level },
    ]);
    setSkillIdCounter((n) => n + 1);
    setSkillInput({ name: '', isRequired: true, level: '' });
  };

  const removeSkill = (id: number) => {
    setSkills((prev) => prev.filter((s) => s.skillId !== id));
  };

  const handleSubmit = async (publish: boolean) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements || undefined,
        benefits: form.benefits || undefined,
        jobType: form.jobType,
        level: form.level,
        industry: form.industry || undefined,
        city: form.city,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        isSalaryPublic: form.isSalaryPublic,
        deadline: form.deadline || undefined,
        skills: skills.map((s) => ({ skillId: s.skillId, isRequired: s.isRequired, level: s.level || undefined })),
      };

      const res = await axiosInstance.post<{ id: number }>('/api/recruiter/jobs', payload);
      const jobId = res.data.id;

      if (publish) {
        await axiosInstance.put(`/api/recruiter/jobs/${jobId}/publish`);
        toast.success('Đăng tin thành công!');
      } else {
        toast.success('Lưu nháp thành công!');
      }
      router.push(`/recruiter/jobs/${jobId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Tạo job thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/recruiter/jobs" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Điền đầy đủ thông tin để thu hút ứng viên phù hợp</p>
        </div>
      </div>

      {/* Basic info */}
      <FormSection title="Thông tin cơ bản">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Input
              label="Tiêu đề công việc"
              placeholder="VD: Senior Frontend Developer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={errors.title}
              required
            />
          </div>
          <Select label="Hình thức làm việc" options={JOB_TYPE_OPTIONS} value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} />
          <Select label="Cấp độ" options={JOB_LEVEL_OPTIONS} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          <Select
            label="Thành phố"
            options={CITY_OPTIONS}
            placeholder="Chọn thành phố"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            error={errors.city}
            required
          />
          <Input
            label="Ngành nghề"
            placeholder="VD: Công nghệ thông tin"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <Input
            label="Hạn nộp hồ sơ"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </div>
      </FormSection>

      {/* Salary */}
      <FormSection title="Mức lương">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Lương tối thiểu (VND)"
            type="number"
            placeholder="15000000"
            value={form.salaryMin}
            onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
          />
          <Input
            label="Lương tối đa (VND)"
            type="number"
            placeholder="30000000"
            value={form.salaryMax}
            onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            error={errors.salaryMax}
          />
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isSalaryPublic}
            onChange={(e) => setForm({ ...form, isSalaryPublic: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Hiển thị mức lương công khai</span>
        </label>
      </FormSection>

      {/* JD */}
      <FormSection title="Nội dung tuyển dụng">
        <div className="flex flex-col gap-5">
          <Textarea
            label="Mô tả công việc"
            placeholder="Mô tả chi tiết về công việc, trách nhiệm, dự án..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={errors.description}
            rows={6}
            required
          />
          <Textarea
            label="Yêu cầu ứng viên"
            placeholder="Kinh nghiệm, kỹ năng, bằng cấp cần có..."
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            rows={5}
          />
          <Textarea
            label="Quyền lợi"
            placeholder="Lương thưởng, bảo hiểm, du lịch, đào tạo..."
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            rows={4}
          />
        </div>
      </FormSection>

      {/* Skills */}
      <FormSection title="Kỹ năng yêu cầu">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Thêm kỹ năng (VD: React, Java, SQL...)"
            value={skillInput.name}
            onChange={(e) => setSkillInput({ ...skillInput, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={skillInput.isRequired}
              onChange={(e) => setSkillInput({ ...skillInput, isRequired: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            Bắt buộc
          </label>
          <Button variant="outline" onClick={addSkill}>
            <PlusIcon className="h-4 w-4" /> Thêm
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s.skillId}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  s.isRequired ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {s.skillName}
                {s.isRequired && <span className="text-xs text-blue-500">*</span>}
                <button onClick={() => removeSkill(s.skillId)} className="hover:text-red-500 transition-colors">
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">* = Kỹ năng bắt buộc</p>
      </FormSection>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pb-4">
        <Button variant="outline" onClick={() => handleSubmit(false)} loading={saving && !publishAfter}>
          Lưu nháp
        </Button>
        <Button
          onClick={() => { setPublishAfter(true); handleSubmit(true); }}
          loading={saving && publishAfter}
        >
          Đăng tin ngay
        </Button>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}
