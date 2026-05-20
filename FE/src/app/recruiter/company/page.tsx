'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import type { Company } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { BuildingIcon, PencilIcon, CheckIcon, ShieldCheckIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { COMPANY_SIZE_LABELS } from '@/lib/utils';

const SIZE_OPTIONS = Object.entries(COMPANY_SIZE_LABELS).map(([value, label]) => ({ value, label }));

const INDUSTRY_OPTIONS = [
  'Công nghệ thông tin', 'Tài chính - Ngân hàng', 'Thương mại điện tử',
  'Marketing - Truyền thông', 'Giáo dục', 'Y tế', 'Sản xuất', 'Bất động sản', 'Khác',
].map((i) => ({ value: i, label: i }));

const CITY_OPTIONS = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Khác',
].map((c) => ({ value: c, label: c }));

interface CompanyForm {
  name: string;
  website: string;
  industry: string;
  companySize: string;
  description: string;
  city: string;
}

export default function RecruiterCompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyForm>({
    name: '', website: '', industry: '', companySize: '', description: '', city: '',
  });
  const [errors, setErrors] = useState<Partial<CompanyForm>>({});

  const fetchCompany = async () => {
    try {
      const res = await axiosInstance.get<Company[]>('/api/recruiter/companies');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const c = res.data[0];
        setCompany(c);
        setForm({
          name: c.name ?? '',
          website: c.website ?? '',
          industry: c.industry ?? '',
          companySize: c.companySize ?? '',
          description: c.description ?? '',
          city: c.city ?? '',
        });
      } else {
        setEditing(true);
      }
    } catch {
      setEditing(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompany(); }, []);

  const validate = () => {
    const e: Partial<CompanyForm> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên công ty';
    if (!form.city) e.city = 'Vui lòng chọn thành phố';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (company) {
        const res = await axiosInstance.put<Company>(`/api/recruiter/companies/${company.id}`, form);
        setCompany(res.data);
        toast.success('Cập nhật thông tin công ty thành công!');
      } else {
        const res = await axiosInstance.post<Company>('/api/recruiter/companies', form);
        setCompany(res.data);
        toast.success('Tạo công ty thành công!');
      }
      setEditing(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông tin công ty</h1>
          <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin để thu hút ứng viên tài năng</p>
        </div>
        {company && !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <PencilIcon className="h-4 w-4" /> Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Company header */}
      {company && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
            ) : (
              <BuildingIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{company.name}</h2>
              {company.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <ShieldCheckIcon className="h-3 w-3" /> Đã xác minh
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{company.city} · {company.industry}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 block">
                {company.website}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">
          {company ? 'Chỉnh sửa thông tin' : 'Tạo thông tin công ty'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Tên công ty"
            placeholder="Công ty TNHH ABC"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            disabled={!editing}
            required
          />
          <Input
            label="Website"
            type="url"
            placeholder="https://company.com"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            disabled={!editing}
          />
          <Select
            label="Ngành nghề"
            options={INDUSTRY_OPTIONS}
            placeholder="Chọn ngành nghề"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            disabled={!editing}
          />
          <Select
            label="Quy mô công ty"
            options={SIZE_OPTIONS}
            placeholder="Chọn quy mô"
            value={form.companySize}
            onChange={(e) => setForm({ ...form, companySize: e.target.value })}
            disabled={!editing}
          />
          <Select
            label="Thành phố"
            options={CITY_OPTIONS}
            placeholder="Chọn thành phố"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            error={errors.city}
            disabled={!editing}
            required
          />
        </div>
        <div className="mt-5">
          <Textarea
            label="Mô tả công ty"
            placeholder="Giới thiệu về công ty, văn hóa làm việc, phúc lợi..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={!editing}
            rows={5}
          />
        </div>

        {editing && (
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
            {company && (
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                Hủy
              </Button>
            )}
            <Button loading={saving} onClick={handleSave}>
              <CheckIcon className="h-4 w-4" />
              {company ? 'Lưu thay đổi' : 'Tạo công ty'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
