'use client';

import { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import type { CvFile } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import {
  UploadCloudIcon, FileTextIcon, TrashIcon, StarIcon, ExternalLinkIcon,
  SparklesIcon, AlertCircleIcon, CheckCircle2Icon, PenSquareIcon, ZapIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function CvCard({ cv, onDelete, onSetPrimary, deleting, settingPrimary }: {
  cv: CvFile;
  onDelete: (id: number) => void;
  onSetPrimary: (id: number) => void;
  deleting: boolean;
  settingPrimary: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ext = cv.fileType.includes('pdf') ? 'PDF' : cv.fileType.includes('word') ? 'DOCX' : 'DOC';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
        cv.isPrimary
          ? 'border-[#0d6b4e] shadow-md shadow-green-100'
          : hovered
          ? 'border-gray-300 shadow-lg shadow-gray-100 -translate-y-0.5'
          : 'border-gray-200'
      }`}
    >
      {/* Primary ribbon */}
      {cv.isPrimary && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0d6b4e] to-teal-400" />
      )}

      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div className={`relative flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
          cv.isPrimary ? 'bg-green-50' : hovered ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <FileTextIcon className={`h-7 w-7 transition-colors ${cv.isPrimary ? 'text-[#0d6b4e]' : 'text-red-400'}`} />
          <span className={`absolute -bottom-1 -right-1 text-[9px] font-bold rounded px-1 py-0.5 ${
            ext === 'PDF' ? 'bg-red-500 text-white' : 'bg-[#e8f5f0]0 text-white'
          }`}>{ext}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 truncate">{cv.fileName}</p>
            {cv.isPrimary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                <StarIcon className="h-3 w-3 fill-green-500 text-green-500" /> CV chính
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5f0] px-2.5 py-0.5 text-xs font-medium text-[#0d7a5f]">
              <SparklesIcon className="h-3 w-3" /> AI Ready
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {(cv.fileSizeKb / 1024).toFixed(1)} MB · Upload {formatDate(cv.uploadedAt)}
          </p>

          {/* Action buttons - visible on hover or always for primary */}
          <div className={`flex items-center gap-2 mt-3 transition-all duration-200 ${hovered || cv.isPrimary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
            <a
              href={cv.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" /> Xem CV
            </a>
            {!cv.isPrimary && (
              <button
                onClick={() => onSetPrimary(cv.id)}
                disabled={settingPrimary}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 hover:bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors disabled:opacity-50"
              >
                {settingPrimary ? <LoadingSpinner size="sm" /> : <><CheckCircle2Icon className="h-3.5 w-3.5" /> Đặt làm chính</>}
              </button>
            )}
            <button
              onClick={() => onDelete(cv.id)}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? <LoadingSpinner size="sm" /> : <><TrashIcon className="h-3.5 w-3.5" /> Xóa</>}
            </button>
          </div>
        </div>
      </div>

      {/* Hover overlay hint for primary */}
      {cv.isPrimary && hovered && (
        <div className="px-5 pb-4 text-xs text-[#0d6b4e] font-medium flex items-center gap-1">
          <ZapIcon className="h-3.5 w-3.5" />
          CV này sẽ được dùng khi ứng tuyển và AI chấm điểm tự động
        </div>
      )}
    </div>
  );
}

export default function CandidateCvPage() {
  const [cvFiles, setCvFiles] = useState<CvFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchCvs = async () => {
    try {
      const res = await axiosInstance.get<CvFile[]>('/api/candidate/cv');
      setCvFiles(res.data);
    } catch {
      toast.error('Không thể tải danh sách CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCvs(); }, []);

  const handleUpload = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) { toast.error('Chỉ chấp nhận file PDF, DOC, DOCX'); return; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { toast.error(`File không được vượt quá ${MAX_SIZE_MB}MB`); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axiosInstance.post('/api/candidate/cv/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Upload CV thành công! AI đang phân tích...');
      fetchCvs();
    } catch { toast.error('Upload thất bại'); }
    finally { setUploading(false); }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa CV này?')) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/api/candidate/cv/${id}`);
      toast.success('Đã xóa CV');
      setCvFiles(prev => prev.filter(f => f.id !== id));
    } catch { toast.error('Xóa thất bại'); }
    finally { setDeletingId(null); }
  };

  const handleSetPrimary = async (id: number) => {
    setSettingPrimaryId(id);
    try {
      await axiosInstance.put(`/api/candidate/cv/${id}/primary`);
      toast.success('Đã đặt làm CV chính');
      setCvFiles(prev => prev.map(f => ({ ...f, isPrimary: f.id === id })));
    } catch { toast.error('Thao tác thất bại'); }
    finally { setSettingPrimaryId(null); }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý CV</h1>
          <p className="text-sm text-gray-500 mt-1">Upload CV để AI phân tích và đề xuất công việc phù hợp nhất</p>
        </div>
        <Link
          href="/candidate/cv-builder"
          className="flex items-center gap-2 rounded-xl border border-[#0d6b4e] px-4 py-2 text-sm font-semibold text-[#0d6b4e] hover:bg-green-50 transition-colors"
        >
          <PenSquareIcon className="h-4 w-4" /> Tạo CV online
        </Link>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
          dragOver ? 'border-[#0d6b4e] bg-green-50 scale-[1.01]' : 'border-gray-300 hover:border-[#0d6b4e] hover:bg-green-50/30'
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-gray-600">Đang upload và phân tích bằng AI...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`rounded-full p-4 transition-colors ${dragOver ? 'bg-[#0d6b4e]' : 'bg-gray-100'}`}>
              <UploadCloudIcon className={`h-9 w-9 transition-colors ${dragOver ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Kéo thả file vào đây hoặc <span className="text-[#0d6b4e] underline">chọn file</span></p>
              <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX — tối đa {MAX_SIZE_MB}MB</p>
            </div>
          </div>
        )}
      </div>

      {/* CV list */}
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
      ) : cvFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FileTextIcon className="h-8 w-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700">Chưa có CV nào</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Upload CV đầu tiên để AI bắt đầu phân tích và gợi ý việc làm</p>
          <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#0d6b4e] text-white px-5 py-2 text-sm font-semibold hover:bg-[#0a5a40] transition-colors">
            <UploadCloudIcon className="h-4 w-4" /> Upload CV ngay
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cvFiles.map(cv => (
            <CvCard
              key={cv.id}
              cv={cv}
              onDelete={handleDelete}
              onSetPrimary={handleSetPrimary}
              deleting={deletingId === cv.id}
              settingPrimary={settingPrimaryId === cv.id}
            />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 p-4">
          <SparklesIcon className="h-5 w-5 text-[#0d6b4e] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">AI tự động phân tích</p>
            <p className="text-xs text-green-700 mt-0.5">Sau khi upload, AI sẽ đọc CV và chấm điểm độ phù hợp với từng tin tuyển dụng.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-[#e8f5f0] border border-blue-100 p-4">
          <AlertCircleIcon className="h-5 w-5 text-[#0d7a5f] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">CV chính được ưu tiên</p>
            <p className="text-xs text-[#0d7a5f] mt-0.5">CV đánh dấu <strong>chính</strong> sẽ được dùng khi ứng tuyển nếu bạn không chọn CV khác.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
