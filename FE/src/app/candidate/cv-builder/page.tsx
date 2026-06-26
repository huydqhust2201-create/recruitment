'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenSquareIcon, PlusIcon, TrashIcon, DownloadIcon, FileTextIcon, ClockIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { CvBuilderDocument } from '@/types';
import { getMyDocuments, deleteDocument } from '@/services/cvBuilder.service';
import { formatDate } from '@/lib/utils';

const TEMPLATE_LABEL: Record<string, string> = {
  MODERN: 'Hiện đại',
  CLASSIC: 'Cổ điển',
  CREATIVE: 'Sáng tạo',
};

const TEMPLATE_COLOR: Record<string, string> = {
  MODERN: 'bg-[#e8f5f0] text-[#0d7a5f]',
  CLASSIC: 'bg-gray-100 text-gray-700',
  CREATIVE: 'bg-pink-100 text-pink-700',
};

export default function CvBuilderListPage() {
  const [docs, setDocs] = useState<CvBuilderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo CV</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo CV chuyên nghiệp với nhiều mẫu đẹp, xuất PDF ngay trong trình duyệt</p>
        </div>
        <Link href="/candidate/cv-builder/new">
          <Button>
            <PlusIcon className="h-4 w-4" /> Tạo CV mới
          </Button>
        </Link>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'MODERN', title: 'Hiện đại', desc: 'Dải màu header, bố cục rõ ràng — phù hợp ngành IT, tài chính', color: 'border-blue-300 bg-[#e8f5f0]' },
          { key: 'CLASSIC', desc: 'Đơn cột tối giản, thanh lịch — dành cho mọi ngành nghề', title: 'Cổ điển', color: 'border-gray-300 bg-gray-50' },
          { key: 'CREATIVE', title: 'Sáng tạo', desc: 'Header màu nổi bật, cá tính — marketing, thiết kế, truyền thông', color: 'border-pink-300 bg-pink-50' },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/candidate/cv-builder/new?template=${t.key}`}
            className={`rounded-2xl border-2 ${t.color} p-5 hover:shadow-md transition-shadow cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">{t.title}</span>
              <PenSquareIcon className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">{t.desc}</p>
          </Link>
        ))}
      </div>

      {/* Document list */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">CV đã tạo</h2>

        {loading ? (
          <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <FileTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Chưa có CV nào</p>
            <p className="text-sm text-gray-400 mt-1">Chọn một mẫu phía trên để bắt đầu tạo CV</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {docs.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-blue-200 transition-colors">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-[#e8f5f0] flex items-center justify-center">
                  <FileTextIcon className="h-6 w-6 text-blue-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TEMPLATE_COLOR[doc.template] ?? 'bg-gray-100 text-gray-600'}`}>
                      {TEMPLATE_LABEL[doc.template] ?? doc.template}
                    </span>
                    {doc.exportedCvFileId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        ✓ Đã xuất PDF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" /> Cập nhật {formatDate(doc.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/candidate/cv-builder/${doc.id}`}>
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                      Chỉnh sửa
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
