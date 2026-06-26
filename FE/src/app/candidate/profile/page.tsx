'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import type { CandidateProfile, CandidateProfileRequest } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { SparklesIcon, UserCircleIcon, PencilIcon, CheckIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { COMPANY_SIZE_LABELS } from '@/lib/utils';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const CITY_OPTIONS = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'Bình Dương', 'Đồng Nai', 'Nha Trang', 'Huế', 'Khác',
].map((c) => ({ value: c, label: c }));

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CandidateProfileRequest>({});

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get<CandidateProfile>('/api/candidate/profile');
      setProfile(res.data);
      setForm({
        headline: res.data.headline ?? '',
        currentPosition: res.data.currentPosition ?? '',
        currentCompany: res.data.currentCompany ?? '',
        bio: res.data.bio ?? '',
        yearsOfExperience: res.data.yearsOfExperience ?? undefined,
        gender: res.data.gender,
        dateOfBirth: res.data.dateOfBirth ?? '',
        city: res.data.city ?? '',
        address: res.data.address ?? '',
        careerGoals: res.data.careerGoals ?? '',
      });
      // Auto-enable editing for new/empty profiles
      const isEmpty = !res.data.headline && !res.data.bio && !res.data.currentPosition && !res.data.city;
      if (isEmpty) setEditing(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/api/candidate/profile', form);
      toast.success('Cập nhật hồ sơ thành công!');
      setEditing(false);
      fetchProfile();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#e8f5f0] flex items-center justify-center">
              <UserCircleIcon className="h-10 w-10 text-[#0d7a5f]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.fullName}</h1>
              <p className="text-sm text-gray-500">{profile.email}</p>
              {profile.headline && <p className="text-sm text-[#0d7a5f] font-medium mt-0.5">{profile.headline}</p>}
              {profile.hasCvEmbedding && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5f0] px-2 py-0.5 text-xs font-medium text-[#0d7a5f] mt-1">
                  <SparklesIcon className="h-3 w-3" /> AI Ready
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Độ hoàn thiện hồ sơ</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${profile.profileCompleteness}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-[#0d7a5f]">{profile.profileCompleteness}%</span>
              </div>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <PencilIcon className="h-4 w-4" /> Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                  Hủy
                </Button>
                <Button size="sm" loading={saving} onClick={handleSave}>
                  <CheckIcon className="h-4 w-4" /> Lưu
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Thông tin cá nhân</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Tiêu đề nghề nghiệp"
            placeholder="VD: Senior Frontend Developer"
            value={form.headline ?? ''}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            disabled={!editing}
          />
          <Input
            label="Vị trí hiện tại"
            placeholder="VD: Software Engineer"
            value={form.currentPosition ?? ''}
            onChange={(e) => setForm({ ...form, currentPosition: e.target.value })}
            disabled={!editing}
          />
          <Input
            label="Công ty hiện tại"
            placeholder="Tên công ty đang làm việc"
            value={form.currentCompany ?? ''}
            onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
            disabled={!editing}
          />
          <Input
            label="Số năm kinh nghiệm"
            type="number"
            min={0}
            max={50}
            placeholder="0"
            value={form.yearsOfExperience ?? ''}
            onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value ? Number(e.target.value) : undefined })}
            disabled={!editing}
          />
          <Select
            label="Giới tính"
            options={GENDER_OPTIONS}
            placeholder="Chọn giới tính"
            value={form.gender ?? ''}
            onChange={(e) => setForm({ ...form, gender: e.target.value as CandidateProfileRequest['gender'] })}
            disabled={!editing}
          />
          <Input
            label="Ngày sinh"
            type="date"
            value={form.dateOfBirth ?? ''}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            disabled={!editing}
          />
          <Select
            label="Thành phố"
            options={CITY_OPTIONS}
            placeholder="Chọn thành phố"
            value={form.city ?? ''}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            disabled={!editing}
          />
          <Input
            label="Địa chỉ"
            placeholder="Địa chỉ cụ thể"
            value={form.address ?? ''}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5">
          <Textarea
            label="Giới thiệu bản thân"
            placeholder="Viết vài dòng giới thiệu về bản thân, kinh nghiệm và điểm mạnh của bạn..."
            value={form.bio ?? ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            disabled={!editing}
            rows={4}
          />
          <Textarea
            label="Mục tiêu nghề nghiệp"
            placeholder="Mục tiêu ngắn hạn và dài hạn trong sự nghiệp của bạn..."
            value={form.careerGoals ?? ''}
            onChange={(e) => setForm({ ...form, careerGoals: e.target.value })}
            disabled={!editing}
            rows={4}
          />
        </div>

        {editing && (
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Hủy thay đổi
            </Button>
            <Button loading={saving} onClick={handleSave}>
              Lưu hồ sơ
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
