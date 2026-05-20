'use client';

import { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import type { CvFile } from '@/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  UploadIcon, FileTextIcon, TrashIcon, StarIcon, DownloadIcon, SparklesIcon, AlertCircleIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCvs(); }, []);

  const handleUpload = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File không được vượt quá ${MAX_SIZE_MB}MB`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axiosInstance.post('/api/candidate/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Upload CV thành công!');
      fetchCvs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa CV này?')) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/api/candidate/cv/${id}`);
      toast.success('Đã xóa CV');
      setCvFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (id: number) => {
    setSettingPrimaryId(id);
    try {
      await axiosInstance.put(`/api/candidate/cv/${id}/primary`);
      toast.success('Đã đặt làm CV chính');
      setCvFiles((prev) => prev.map((f) => ({ ...f, isPrimary: f.id === id })));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý CV</h1>
          <p className="text-sm text-gray-500 mt-1">Upload CV để AI phân tích và đề xuất công việc phù hợp</p>
        </div>
        <Button onClick={() => inputRef.current?.click()} loading={uploading}>
          <UploadIcon className="h-4 w-4" /> Upload CV
        </Button>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-500">Đang upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-blue-100 p-4">
              <UploadIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Kéo thả file hoặc click để chọn</p>
              <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX — tối đa {MAX_SIZE_MB}MB</p>
            </div>
          </div>
        )}
      </div>

      {/* CV list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : cvFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <FileTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Chưa có CV nào</p>
          <p className="text-sm text-gray-400 mt-1">Upload CV đầu tiên của bạn để bắt đầu</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cvFiles.map((cv) => (
            <div
              key={cv.id}
              className={`bg-white rounded-2xl border p-5 flex items-center gap-4 transition-all ${
                cv.isPrimary ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                <FileTextIcon className="h-6 w-6 text-red-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{cv.fileName}</p>
                  {cv.isPrimary && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <StarIcon className="h-3 w-3" /> CV chính
                    </span>
                  )}
                  <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <SparklesIcon className="h-3 w-3" /> AI Ready
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(cv.fileSizeKb / 1024).toFixed(1)} MB · {cv.fileType.split('/').pop()?.toUpperCase()} · Upload {formatDate(cv.uploadedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!cv.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(cv.id)}
                    disabled={settingPrimaryId === cv.id}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {settingPrimaryId === cv.id ? <LoadingSpinner size="sm" /> : 'Đặt làm chính'}
                  </button>
                )}
                <a
                  href={cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <DownloadIcon className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(cv.id)}
                  disabled={deletingId === cv.id}
                  className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {deletingId === cv.id ? <LoadingSpinner size="sm" /> : <TrashIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
        <AlertCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">CV chính sẽ được dùng để ứng tuyển</p>
          <p className="text-xs text-blue-700 mt-0.5">AI sẽ phân tích CV của bạn và tự động gợi ý những công việc phù hợp nhất.</p>
        </div>
      </div>
    </div>
  );
}
