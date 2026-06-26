export interface JobCategory {
  value: string;
  label: string;
  icon: string;
}

export const JOB_CATEGORIES: JobCategory[] = [
  { value: 'CNTT', label: 'Công nghệ thông tin', icon: '💻' },
  { value: 'KINH_DOANH', label: 'Kinh doanh / Bán hàng', icon: '📈' },
  { value: 'MARKETING', label: 'Marketing / Quảng cáo', icon: '📣' },
  { value: 'KE_TOAN', label: 'Kế toán / Kiểm toán', icon: '📊' },
  { value: 'NHAN_SU', label: 'Nhân sự / Hành chính', icon: '👥' },
  { value: 'CHAM_SOC_KH', label: 'Chăm sóc khách hàng', icon: '🎧' },
  { value: 'XAY_DUNG', label: 'Xây dựng / Kiến trúc', icon: '🏗️' },
  { value: 'GIAO_DUC', label: 'Giáo dục / Đào tạo', icon: '📚' },
  { value: 'Y_TE', label: 'Y tế / Dược phẩm', icon: '⚕️' },
  { value: 'LAO_DONG_PT', label: 'Lao động phổ thông', icon: '🔧' },
  { value: 'THIET_KE', label: 'Thiết kế / Sáng tạo', icon: '🎨' },
  { value: 'VAN_TAI', label: 'Vận tải / Logistics', icon: '🚚' },
];

export const POPULAR_CITIES = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'Bình Dương', 'Đồng Nai', 'Bắc Ninh', 'Hưng Yên', 'Long An',
];
