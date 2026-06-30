'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenSquareIcon, TrashIcon, DownloadIcon, FileTextIcon, ClockIcon, CheckIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CvPreview from '@/components/cv/CvPreview';
import type { CvBuilderDocument, CvTemplate, CvBuilderContent } from '@/types';
import { getMyDocuments, deleteDocument } from '@/services/cvBuilder.service';
import { formatDate } from '@/lib/utils';

// ── Sample CV data để hiển thị trong thumbnail ────────────
const SAMPLE: CvBuilderContent = {
  personalInfo: {
    fullName: 'Nguyễn Minh Khoa',
    email: 'khoa@gmail.com',
    phone: '0912 345 678',
    address: 'Hà Nội',
    headline: 'Frontend Developer | 3 năm kinh nghiệm',
    summary: 'Kỹ sư phần mềm 3 năm kinh nghiệm trong phát triển web với React, Next.js. Đam mê xây dựng giao diện đẹp và hiệu năng cao.',
  },
  experiences: [
    {
      position: 'Senior Frontend Developer',
      company: 'VNG Corporation',
      startDate: '01/2022',
      endDate: '',
      current: true,
      description: 'Dẫn dắt team 4 người phát triển dashboard quản trị nội bộ dùng React + TypeScript. Cải thiện hiệu năng tải trang 40%.',
    },
    {
      position: 'Frontend Developer',
      company: 'FPT Software',
      startDate: '06/2020',
      endDate: '12/2021',
      current: false,
      description: 'Xây dựng các tính năng mới cho hệ thống CRM với Vue.js và REST API.',
    },
  ],
  educations: [
    {
      school: 'Đại học Bách Khoa Hà Nội',
      degree: 'Kỹ sư',
      major: 'Công nghệ Thông tin',
      startDate: '2016',
      endDate: '2020',
    },
  ],
  skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
  certifications: [
    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' },
  ],
  languages: [
    { name: 'Tiếng Anh', level: 'IELTS 7.0' },
    { name: 'Tiếng Nhật', level: 'N3' },
  ],
  projects: [
    {
      name: 'RecruitAI Platform',
      techStack: 'Next.js · Spring Boot · PostgreSQL · pgvector',
      description: 'Nền tảng tuyển dụng AI gợi ý việc làm phù hợp dựa trên CV embedding.',
    },
  ],
};

// ── Template definitions ───────────────────────────────────
const TEMPLATES: {
  key: CvTemplate;
  label: string;
  desc: string;
  tags: string[];
  badge?: string;
  badgeColor?: string;
  accentColor: string;
}[] = [
  {
    key: 'MODERN',
    label: 'Hiện đại',
    desc: 'Header màu nổi bật, cấu trúc rõ ràng. Phù hợp ngành IT, tài chính, ngân hàng.',
    tags: ['IT', 'Tài chính', 'Phổ biến'],
    badge: '⭐ Phổ biến nhất',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: '#1a4ba5',
  },
  {
    key: 'PROFESSIONAL',
    label: 'Chuyên nghiệp',
    desc: 'Sidebar tối bên trái, ảnh đại diện, thanh kỹ năng. Phù hợp cấp quản lý.',
    tags: ['Quản lý', 'Senior', 'Ấn tượng'],
    badge: '🏆 Nổi bật',
    badgeColor: 'bg-[#e8f5f0] text-[#0d7a5f]',
    accentColor: '#1e3a5f',
  },
  {
    key: 'CLASSIC',
    label: 'Cổ điển',
    desc: 'Đơn giản, thanh lịch, dễ đọc. Phù hợp mọi ngành — an toàn và chuyên nghiệp.',
    tags: ['Đa ngành', 'Tối giản', 'ATS-friendly'],
    accentColor: '#333',
  },
  {
    key: 'CREATIVE',
    label: 'Sáng tạo',
    desc: 'Màu sắc cá tính, layout năng động. Phù hợp marketing, thiết kế, truyền thông.',
    tags: ['Marketing', 'Design', 'Creative'],
    accentColor: '#a62477',
  },
  {
    key: 'MINIMAL',
    label: 'Tối giản',
    desc: 'Font chữ serif thanh lịch, không màu sắc dư thừa. Phù hợp học thuật, luật.',
    tags: ['Học thuật', 'Luật', 'Serif'],
    accentColor: '#111',
  },
];

const TEMPLATE_LABEL: Record<string, string> = {
  MODERN: 'Hiện đại', CLASSIC: 'Cổ điển', CREATIVE: 'Sáng tạo',
  PROFESSIONAL: 'Chuyên nghiệp', MINIMAL: 'Tối giản',
};
const TEMPLATE_COLOR: Record<string, string> = {
  MODERN: 'bg-blue-50 text-blue-700',
  CLASSIC: 'bg-gray-100 text-gray-700',
  CREATIVE: 'bg-pink-100 text-pink-700',
  PROFESSIONAL: 'bg-[#e8f5f0] text-[#0d7a5f]',
  MINIMAL: 'bg-amber-50 text-amber-700',
};

// ── Template thumbnail (scaled-down real preview) ─────────
function TemplateThumbnail({ template }: { template: CvTemplate }) {
  const INNER_W = 560;
  const OUTER_W = 186;
  const scale = OUTER_W / INNER_W;
  const OUTER_H = Math.round(INNER_W * 1.414 * scale);

  return (
    <div
      style={{ width: OUTER_W, height: OUTER_H, overflow: 'hidden', position: 'relative', flexShrink: 0 }}
      className="rounded-lg border border-gray-100 shadow-sm"
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: INNER_W, pointerEvents: 'none' }}>
        <CvPreview content={SAMPLE} template={template} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function CvBuilderListPage() {
  const [docs, setDocs] = useState<CvBuilderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredTpl, setHoveredTpl] = useState<CvTemplate | null>(null);

  useEffect(() => {
    getMyDocuments()
      .then(setDocs)
      .catch(() => toast.error('Không thể tải danh sách CV'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa CV "${title}"?`)) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success('Đã xóa CV');
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo CV chuyên nghiệp</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chọn mẫu, điền thông tin và xuất PDF — miễn phí, không cần cài đặt
        </p>
      </div>

      {/* ── Template gallery ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Chọn mẫu CV</h2>
          <span className="text-xs text-gray-400">{TEMPLATES.length} mẫu có sẵn</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.key}
              onMouseEnter={() => setHoveredTpl(tpl.key)}
              onMouseLeave={() => setHoveredTpl(null)}
              className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-[#0d7a5f] transition-all duration-200 hover:shadow-lg overflow-hidden flex flex-col"
            >
              {/* Badge */}
              {tpl.badge && (
                <div className={`absolute top-2 left-2 z-10 text-xs font-semibold px-2 py-0.5 rounded-full ${tpl.badgeColor}`}>
                  {tpl.badge}
                </div>
              )}

              {/* Thumbnail preview */}
              <div className="relative bg-gray-50 flex items-start justify-center p-3 pt-5 overflow-hidden" style={{ minHeight: 200 }}>
                <TemplateThumbnail template={tpl.key} />

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${hoveredTpl === tpl.key ? 'opacity-100' : 'opacity-0'}`}>
                  <Link
                    href={`/candidate/cv-builder/new?template=${tpl.key}`}
                    className="bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:bg-[#0d7a5f] hover:text-white transition-colors"
                  >
                    Dùng mẫu này
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{tpl.label}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{tpl.desc}</p>
                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {tpl.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <Link
                  href={`/candidate/cv-builder/new?template=${tpl.key}`}
                  className="mt-2 w-full text-center text-sm font-medium py-2 rounded-xl border border-[#0d7a5f] text-[#0d7a5f] hover:bg-[#0d7a5f] hover:text-white transition-colors"
                >
                  Dùng mẫu này
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features list ── */}
      <div className="bg-gradient-to-r from-[#0d7a5f]/5 to-[#0a5c47]/5 rounded-2xl border border-[#0d7a5f]/20 p-5">
        <p className="text-sm font-semibold text-[#0d7a5f] mb-3">Tất cả tính năng đều miễn phí</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            'Preview trực tiếp khi nhập',
            'Xuất file PDF chất lượng cao',
            'Lưu nhiều phiên bản CV',
            'ATS-friendly (máy quét CV)',
          ].map((f) => (
            <div key={f} className="flex items-start gap-2">
              <CheckIcon className="h-4 w-4 text-[#0d7a5f] mt-0.5 shrink-0" />
              <span className="text-xs text-gray-600">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── My CVs ── */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">CV của tôi</h2>

        {loading ? (
          <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <FileTextIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Chưa có CV nào</p>
            <p className="text-sm text-gray-400 mt-1">Chọn một mẫu phía trên để bắt đầu</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {docs.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-[#0d7a5f]/40 hover:shadow-sm transition-all">
                <div className="h-12 w-12 rounded-xl bg-[#e8f5f0] flex items-center justify-center shrink-0">
                  <FileTextIcon className="h-6 w-6 text-[#0d7a5f]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TEMPLATE_COLOR[doc.template] ?? 'bg-gray-100 text-gray-600'}`}>
                      {TEMPLATE_LABEL[doc.template] ?? doc.template}
                    </span>
                    {doc.exportedCvFileId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <CheckIcon className="h-3 w-3" /> Đã xuất PDF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" /> Cập nhật {formatDate(doc.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/candidate/cv-builder/${doc.id}`}>
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                      <PenSquareIcon className="h-3.5 w-3.5" /> Chỉnh sửa
                    </button>
                  </Link>
                  {doc.exportedCvFileUrl && (
                    <a
                      href={doc.exportedCvFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-gray-400 hover:text-[#0d7a5f] hover:bg-[#e8f5f0] transition-colors"
                      title="Tải PDF"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={deletingId === doc.id}
                    className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    title="Xóa"
                  >
                    {deletingId === doc.id ? <LoadingSpinner size="sm" /> : <TrashIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
