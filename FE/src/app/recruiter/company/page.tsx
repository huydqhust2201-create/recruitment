'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import type { Company } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
  BuildingIcon, PencilIcon, CheckIcon, ShieldCheckIcon, ShieldXIcon,
  ExternalLinkIcon, BriefcaseIcon, ArrowRightIcon, AlertCircleIcon,
} from 'lucide-react';
import Link from 'next/link';
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
  const [serverError, setServerError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyForm>({
    name: '', website: '', industry: '', companySize: '', description: '', city: '',
  });
  const [errors, setErrors] = useState<Partial<CompanyForm>>({});

  const fetchCompany = async () => {
    setServerError(false);
    try {
      const res = await axiosInstance.get<Company>('/api/recruiter/companies/me');
      // 204 = recruiter chưa có công ty
      if (res.status === 204 || !res.data) {
        setCompany(null);
        setEditing(true);
        return;
      }
      const c = res.data;
      setCompany(c);
      setEditing(false);
      setForm({
        name: c.name ?? '',
        website: c.website ?? '',
        industry: c.industry ?? '',
        companySize: c.companySize ?? '',
        description: c.description ?? '',
        city: c.city ?? '',
      });
    } catch (err: unknown) {
      // Phân biệt 404 "không có công ty" vs lỗi server thật
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setCompany(null);
        setEditing(true);
      } else {
        // Network error, 500, v.v → hiện lỗi, không cho tạo nhầm
        setServerError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompany(); }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (!editing) fetchCompany();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [editing]);

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
        setEditing(false);
      } else {
        const res = await axiosInstance.post<Company>('/api/recruiter/companies', form);
        setCompany(res.data);
        toast.success('Tạo công ty thành công!');
        // Refresh từ server để lấy data chuẩn
        await fetchCompany();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Lưu thất bại');
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

      {/* Server error banner */}
      {serverError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
          <AlertCircleIcon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Không thể kết nối server</p>
            <p className="text-xs text-red-600 mt-1">
              Không tải được thông tin công ty. Vui lòng kiểm tra server đang chạy rồi thử lại.
            </p>
            <button
              onClick={() => { setLoading(true); fetchCompany(); }}
              className="mt-3 text-xs font-medium text-red-700 underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

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
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5f0] px-2 py-0.5 text-xs font-medium text-[#0d7a5f]">
                  <ShieldCheckIcon className="h-3 w-3" /> Đã xác minh
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{company.city} · {company.industry}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0d7a5f] hover:underline mt-0.5 block">
                {company.website}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Form — chỉ hiện khi không có server error */}
      {!serverError && (
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
      )}

      {/* Status & impact panels */}
      {company && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Verification status */}
          <div className={`rounded-2xl border p-4 ${company.isVerified ? 'border-[#b2dfcf] bg-[#e8f5f0]' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {company.isVerified
                ? <ShieldCheckIcon className="h-5 w-5 text-[#0d7a5f]" />
                : <ShieldXIcon className="h-5 w-5 text-yellow-600" />
              }
              <p className={`font-semibold text-sm ${company.isVerified ? 'text-[#0d7a5f]' : 'text-yellow-700'}`}>
                {company.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
              </p>
            </div>
            <p className="text-xs text-gray-600">
              {company.isVerified
                ? 'Công ty của bạn có badge xác minh trên tất cả tin tuyển dụng, tăng độ tin cậy với ứng viên.'
                : 'Admin RecruitAI sẽ xem xét và xác minh công ty của bạn. Badge xác minh giúp thu hút ứng viên tốt hơn.'
              }
            </p>
          </div>

          {/* Public page link */}
          <Link href={`/companies/${company.id}`} target="_blank">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-sm hover:border-[#b2dfcf] transition-all cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLinkIcon className="h-5 w-5 text-[#0d7a5f]" />
                <p className="font-semibold text-sm text-gray-900">Trang công ty công khai</p>
              </div>
              <p className="text-xs text-gray-600">
                Ứng viên có thể xem trang giới thiệu công ty và tất cả tin tuyển dụng đang hoạt động tại đây.
              </p>
              <p className="text-xs font-medium mt-2 text-[#0d7a5f]">Mở trang công ty →</p>
            </div>
          </Link>

          {/* Post job CTA */}
          <Link href="/recruiter/jobs/create">
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 hover:shadow-sm hover:border-[#0d7a5f] transition-all cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <BriefcaseIcon className="h-5 w-5 text-[#0d7a5f]" />
                <p className="font-semibold text-sm text-gray-900">Đăng tin tuyển dụng</p>
              </div>
              <p className="text-xs text-gray-600">
                Thông tin công ty sẽ hiển thị trên tất cả tin tuyển dụng bạn đăng — logo, tên, thành phố.
              </p>
              <p className="text-xs font-medium mt-2 text-[#0d7a5f] flex items-center gap-1">
                Tạo tin mới <ArrowRightIcon className="h-3 w-3" />
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* No company yet */}
      {!serverError && !company && !editing && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <BuildingIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="font-medium text-gray-700">Bạn chưa có thông tin công ty</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Điền thông tin công ty để tin tuyển dụng của bạn hiển thị đầy đủ với ứng viên</p>
          <Button onClick={() => setEditing(true)}>Tạo thông tin công ty</Button>
        </div>
      )}
    </div>
  );
}
