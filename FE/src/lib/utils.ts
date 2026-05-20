import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSalary(min?: number, max?: number, isPublic?: boolean): string {
  if (!isPublic) return 'Thỏa thuận';
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  if (max) return `Đến ${fmt(max)}`;
  return 'Thỏa thuận';
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return '1 ngày trước';
  if (days < 30) return `${days} ngày trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  REMOTE: 'Làm từ xa',
  HYBRID: 'Kết hợp',
  INTERNSHIP: 'Thực tập',
};

export const JOB_LEVEL_LABELS: Record<string, string> = {
  INTERN: 'Thực tập sinh',
  JUNIOR: 'Junior',
  MID: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  MANAGER: 'Manager',
};

export const COMPANY_SIZE_LABELS: Record<string, string> = {
  '1_10': '1 - 10 nhân viên',
  '11_50': '11 - 50 nhân viên',
  '51_200': '51 - 200 nhân viên',
  '201_500': '201 - 500 nhân viên',
  '500_PLUS': 'Trên 500 nhân viên',
};
