'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  SaveIcon, DownloadIcon, PlusIcon, Trash2Icon, ChevronDownIcon, ChevronUpIcon,
  InfoIcon, UserIcon, GraduationCapIcon, BriefcaseIcon, CodeIcon,
  AwardIcon, GlobeIcon, FolderIcon, CheckCircleIcon,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { CvBuilderContent, CvTemplate } from '@/types';
import {
  getDocumentById, createDocument, updateDocument, exportToPdf,
} from '@/services/cvBuilder.service';

const TEMPLATES: { key: CvTemplate; label: string; desc: string; color: string }[] = [
  { key: 'MODERN', label: 'Hiện đại', desc: 'Navy header', color: 'border-blue-400 bg-[#e8f5f0]' },
  { key: 'CLASSIC', label: 'Cổ điển', desc: 'Đơn giản', color: 'border-gray-400 bg-gray-50' },
  { key: 'CREATIVE', label: 'Sáng tạo', desc: 'Hồng/tím', color: 'border-pink-400 bg-pink-50' },
];

const emptyContent = (): CvBuilderContent => ({
  personalInfo: { fullName: '', email: '', phone: '', address: '', headline: '', summary: '' },
  educations: [],
  experiences: [],
  skills: [],
  certifications: [],
  languages: [],
  projects: [],
});

type FormValues = CvBuilderContent & { skillsText: string };

function toFormValues(c: CvBuilderContent): FormValues {
  return { ...c, skillsText: (c.skills ?? []).join(', ') };
}

function fromFormValues(f: FormValues): CvBuilderContent {
  return {
    personalInfo: f.personalInfo,
    educations: f.educations ?? [],
    experiences: f.experiences ?? [],
    skills: f.skillsText
      ? f.skillsText.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    certifications: f.certifications ?? [],
    languages: f.languages ?? [],
    projects: f.projects ?? [],
  };
}

// ── Accordion section ─────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800">
          {icon} {title}
        </span>
        {open ? <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 flex flex-col gap-4 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400';
const textareaCls = inputCls + ' resize-none';

// ── Live Preview ──────────────────────────────────────────
function CvPreview({ content, template }: { content: CvBuilderContent; template: CvTemplate }) {
  const p = content.personalInfo ?? {};
  const headerBg = template === 'MODERN' ? '#1a4ba5' : template === 'CREATIVE' ? '#a62477' : '#444';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-xs shadow-sm" style={{ fontFamily: 'sans-serif', minHeight: 500 }}>
      {/* Header */}
      <div style={{ background: headerBg, color: '#fff', padding: '20px 24px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{p.fullName || 'Họ và tên'}</p>
        {p.headline && <p style={{ opacity: 0.85, fontSize: 11 }}>{p.headline}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 6, opacity: 0.85, fontSize: 10 }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.address && <span>{p.address}</span>}
        </div>
      </div>

      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Summary */}
        {p.summary && (
          <div>
            <p style={{ fontWeight: 600, color: headerBg, marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Giới thiệu</p>
            <p style={{ color: '#555', lineHeight: 1.5 }}>{p.summary}</p>
          </div>
        )}

        {/* Experience */}
        {(content.experiences ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 600, color: headerBg, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Kinh nghiệm</p>
            {content.experiences.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontWeight: 600, color: '#222' }}>{e.position} — {e.company}</p>
                <p style={{ color: '#888', fontSize: 10 }}>{e.startDate}{e.current ? ' — Hiện tại' : e.endDate ? ` — ${e.endDate}` : ''}</p>
                {e.description && <p style={{ color: '#555', marginTop: 2, lineHeight: 1.4 }}>{e.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {(content.educations ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 600, color: headerBg, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Học vấn</p>
            {content.educations.map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <p style={{ fontWeight: 600, color: '#222' }}>{e.school}</p>
                <p style={{ color: '#555', fontSize: 10 }}>{e.degree}{e.major ? ` — ${e.major}` : ''}</p>
                <p style={{ color: '#888', fontSize: 10 }}>{e.startDate}{e.endDate ? ` — ${e.endDate}` : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(content.skills ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 600, color: headerBg, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Kỹ năng</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {content.skills.map((s, i) => (
                <span key={i} style={{ background: '#f0f4ff', color: headerBg, borderRadius: 4, padding: '2px 8px', fontSize: 10 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {(content.projects ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 600, color: headerBg, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Dự án</p>
            {content.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <p style={{ fontWeight: 600, color: '#222' }}>{pr.name}</p>
                {pr.techStack && <p style={{ color: '#888', fontSize: 10 }}>{pr.techStack}</p>}
                {pr.description && <p style={{ color: '#555', lineHeight: 1.4 }}>{pr.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {(content.languages ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 600, color: headerBg, marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Ngôn ngữ</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {content.languages.map((l, i) => (
                <span key={i} style={{ color: '#555' }}>{l.name}{l.level ? ` (${l.level})` : ''}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────
function CvBuilderEditor() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = params.id as string;
  const isNew = docId === 'new';
  const defaultTemplate = (searchParams.get('template') as CvTemplate) ?? 'MODERN';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [template, setTemplate] = useState<CvTemplate>(defaultTemplate);
  const [docTitle, setDocTitle] = useState('CV của tôi');
  const [previewContent, setPreviewContent] = useState<CvBuilderContent>(emptyContent());

  const { register, control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: toFormValues(emptyContent()),
  });

  const educations = useFieldArray({ control, name: 'educations' });
  const experiences = useFieldArray({ control, name: 'experiences' });
  const certifications = useFieldArray({ control, name: 'certifications' });
  const languages = useFieldArray({ control, name: 'languages' });
  const projects = useFieldArray({ control, name: 'projects' });

  // Live preview — useWatch chỉ trigger khi giá trị thực sự thay đổi,
  // khác với watch() trả về object mới mỗi render gây vòng lặp vô hạn.
  const watchedValues = useWatch({ control });
  useEffect(() => {
    setPreviewContent(fromFormValues(watchedValues as FormValues));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  // Load existing document
  useEffect(() => {
    if (isNew) return;
    getDocumentById(docId)
      .then((doc) => {
        setTemplate(doc.template);
        setDocTitle(doc.title);
        if (doc.exportedCvFileUrl) setExportedUrl(doc.exportedCvFileUrl);
        setSavedDocId(doc.id);
        reset(toFormValues(doc.content));
        setPreviewContent(doc.content);
      })
      .catch(() => toast.error('Không tải được CV'))
      .finally(() => setLoading(false));
  }, [docId, isNew, reset]);

  const onSave = useCallback(async (values: FormValues) => {
    setSaving(true);
    try {
      const content = fromFormValues(values);
      if (isNew && !savedDocId) {
        const doc = await createDocument(docTitle, template, content);
        setSavedDocId(doc.id);
        router.replace(`/candidate/cv-builder/${doc.id}`);
        toast.success('Đã lưu CV');
      } else {
        const id = savedDocId ?? docId;
        await updateDocument(id, docTitle, template, content);
        toast.success('Đã lưu CV');
      }
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }, [isNew, savedDocId, docId, docTitle, template, router]);

  const onExport = async () => {
    const id = savedDocId ?? (isNew ? null : docId);
    if (!id) {
      toast.error('Hãy lưu CV trước khi xuất PDF');
      return;
    }
    setExporting(true);
    try {
      const cvFile = await exportToPdf(id);
      setExportedUrl(cvFile.fileUrl);
      toast.success('Xuất PDF thành công! CV đã được thêm vào Quản lý CV');
      window.open(cvFile.fileUrl, '_blank');
    } catch {
      toast.error('Xuất PDF thất bại');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/candidate/cv-builder')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Danh sách CV
          </button>
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="text-lg font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none px-1 py-0.5 transition-colors"
            placeholder="Tên CV..."
          />
        </div>
        <div className="flex items-center gap-2">
          {exportedUrl && (
            <a href={exportedUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4" /> Tải PDF
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" onClick={handleSubmit(onSave)} loading={saving}>
            <SaveIcon className="h-4 w-4" /> Lưu
          </Button>
          <Button size="sm" onClick={onExport} loading={exporting}>
            <DownloadIcon className="h-4 w-4" /> Xuất PDF
          </Button>
        </div>
      </div>

      {/* Template selector */}
      <div className="flex gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTemplate(t.key)}
            className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ${
              template === t.key ? t.color + ' shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {t.label}
            <span className="block text-xs font-normal opacity-70">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* 2-column layout: form + preview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {/* ── Left: form ── */}
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSave)}>

          {/* Personal info */}
          <Section title="Thông tin cá nhân" icon={<UserIcon className="h-4 w-4" />} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Họ và tên *">
                <input {...register('personalInfo.fullName')} className={inputCls} placeholder="Nguyễn Văn A" />
              </Field>
              <Field label="Email *">
                <input {...register('personalInfo.email')} className={inputCls} placeholder="email@example.com" type="email" />
              </Field>
              <Field label="Điện thoại">
                <input {...register('personalInfo.phone')} className={inputCls} placeholder="0912 345 678" />
              </Field>
              <Field label="Địa chỉ">
                <input {...register('personalInfo.address')} className={inputCls} placeholder="Hà Nội" />
              </Field>
            </div>
            <Field label="Chức danh / Mục tiêu nghề nghiệp">
              <input {...register('personalInfo.headline')} className={inputCls} placeholder="Software Engineer | 3 năm kinh nghiệm" />
            </Field>
            <Field label="Giới thiệu bản thân" hint="3-5 câu ngắn gọn về điểm mạnh và mục tiêu">
              <textarea {...register('personalInfo.summary')} rows={3} className={textareaCls} placeholder="Tôi là..." />
            </Field>
          </Section>

          {/* Kinh nghiệm */}
          <Section title="Kinh nghiệm làm việc" icon={<BriefcaseIcon className="h-4 w-4" />}>
            {experiences.fields.map((field, i) => (
              <div key={field.id} className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Vị trí #{i + 1}</p>
                  <button type="button" onClick={() => experiences.remove(i)} className="text-red-400 hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Chức vụ *">
                    <input {...register(`experiences.${i}.position`)} className={inputCls} placeholder="Software Engineer" />
                  </Field>
                  <Field label="Công ty *">
                    <input {...register(`experiences.${i}.company`)} className={inputCls} placeholder="Công ty ABC" />
                  </Field>
                  <Field label="Bắt đầu">
                    <input {...register(`experiences.${i}.startDate`)} className={inputCls} placeholder="01/2022" />
                  </Field>
                  <Field label="Kết thúc">
                    <input {...register(`experiences.${i}.endDate`)} className={inputCls} placeholder="12/2023" />
                  </Field>
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`experiences.${i}.current`}
                    render={({ field: f }) => (
                      <input type="checkbox" id={`cur-${i}`} checked={!!f.value} onChange={f.onChange} className="h-4 w-4 rounded border-gray-300" />
                    )}
                  />
                  <label htmlFor={`cur-${i}`} className="text-xs text-gray-600">Đang làm việc tại đây</label>
                </div>
                <Field label="Mô tả công việc" hint="Dùng gạch đầu dòng (- ) để liệt kê thành tích">
                  <textarea {...register(`experiences.${i}.description`)} rows={3} className={textareaCls} placeholder="- Phát triển tính năng X giúp tăng 30% hiệu suất..." />
                </Field>
              </div>
            ))}
            <button
              type="button"
              onClick={() => experiences.append({ company: '', position: '', startDate: '', endDate: '', current: false, description: '' })}
              className="flex items-center gap-2 text-sm text-[#0d7a5f] hover:text-[#0a5c47] font-medium"
            >
              <PlusIcon className="h-4 w-4" /> Thêm kinh nghiệm
            </button>
          </Section>

          {/* Học vấn */}
          <Section title="Học vấn" icon={<GraduationCapIcon className="h-4 w-4" />}>
            {educations.fields.map((field, i) => (
              <div key={field.id} className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Trường #{i + 1}</p>
                  <button type="button" onClick={() => educations.remove(i)} className="text-red-400 hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Trường">
                    <input {...register(`educations.${i}.school`)} className={inputCls} placeholder="ĐH Bách Khoa Hà Nội" />
                  </Field>
                  <Field label="Bằng cấp">
                    <input {...register(`educations.${i}.degree`)} className={inputCls} placeholder="Cử nhân" />
                  </Field>
                  <Field label="Ngành học">
                    <input {...register(`educations.${i}.major`)} className={inputCls} placeholder="Công nghệ thông tin" />
                  </Field>
                  <div className="flex gap-2">
                    <Field label="Từ">
                      <input {...register(`educations.${i}.startDate`)} className={inputCls} placeholder="2019" />
                    </Field>
                    <Field label="Đến">
                      <input {...register(`educations.${i}.endDate`)} className={inputCls} placeholder="2023" />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => educations.append({ school: '', degree: '', major: '', startDate: '', endDate: '', description: '' })}
              className="flex items-center gap-2 text-sm text-[#0d7a5f] hover:text-[#0a5c47] font-medium"
            >
              <PlusIcon className="h-4 w-4" /> Thêm học vấn
            </button>
          </Section>

          {/* Kỹ năng */}
          <Section title="Kỹ năng" icon={<CodeIcon className="h-4 w-4" />}>
            <Field label="Danh sách kỹ năng" hint="Cách nhau bởi dấu phẩy: React, TypeScript, Java, SQL...">
              <textarea {...register('skillsText')} rows={2} className={textareaCls} placeholder="React, TypeScript, Spring Boot, PostgreSQL, Docker..." />
            </Field>
          </Section>

          {/* Dự án */}
          <Section title="Dự án nổi bật" icon={<FolderIcon className="h-4 w-4" />}>
            {projects.fields.map((field, i) => (
              <div key={field.id} className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Dự án #{i + 1}</p>
                  <button type="button" onClick={() => projects.remove(i)} className="text-red-400 hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tên dự án">
                    <input {...register(`projects.${i}.name`)} className={inputCls} placeholder="E-commerce Platform" />
                  </Field>
                  <Field label="Link / GitHub">
                    <input {...register(`projects.${i}.link`)} className={inputCls} placeholder="github.com/..." />
                  </Field>
                </div>
                <Field label="Công nghệ sử dụng">
                  <input {...register(`projects.${i}.techStack`)} className={inputCls} placeholder="React, Node.js, MongoDB" />
                </Field>
                <Field label="Mô tả">
                  <textarea {...register(`projects.${i}.description`)} rows={2} className={textareaCls} placeholder="Chức năng chính, quy mô, vai trò của bạn..." />
                </Field>
              </div>
            ))}
            <button
              type="button"
              onClick={() => projects.append({ name: '', description: '', techStack: '', link: '' })}
              className="flex items-center gap-2 text-sm text-[#0d7a5f] hover:text-[#0a5c47] font-medium"
            >
              <PlusIcon className="h-4 w-4" /> Thêm dự án
            </button>
          </Section>

          {/* Chứng chỉ */}
          <Section title="Chứng chỉ" icon={<AwardIcon className="h-4 w-4" />}>
            {certifications.fields.map((field, i) => (
              <div key={field.id} className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Chứng chỉ #{i + 1}</p>
                  <button type="button" onClick={() => certifications.remove(i)} className="text-red-400 hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Tên chứng chỉ">
                    <input {...register(`certifications.${i}.name`)} className={inputCls} placeholder="AWS SAA" />
                  </Field>
                  <Field label="Tổ chức cấp">
                    <input {...register(`certifications.${i}.issuer`)} className={inputCls} placeholder="Amazon" />
                  </Field>
                  <Field label="Ngày cấp">
                    <input {...register(`certifications.${i}.issuedDate`)} className={inputCls} placeholder="06/2023" />
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => certifications.append({ name: '', issuer: '', issuedDate: '' })}
              className="flex items-center gap-2 text-sm text-[#0d7a5f] hover:text-[#0a5c47] font-medium"
            >
              <PlusIcon className="h-4 w-4" /> Thêm chứng chỉ
            </button>
          </Section>

          {/* Ngôn ngữ */}
          <Section title="Ngoại ngữ" icon={<GlobeIcon className="h-4 w-4" />}>
            {languages.fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-3">
                <input {...register(`languages.${i}.name`)} className={inputCls + ' flex-1'} placeholder="Tiếng Anh" />
                <input {...register(`languages.${i}.level`)} className={inputCls + ' flex-1'} placeholder="B2 / Thành thạo" />
                <button type="button" onClick={() => languages.remove(i)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2Icon className="h-4 w-4" /></button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => languages.append({ name: '', level: '' })}
              className="flex items-center gap-2 text-sm text-[#0d7a5f] hover:text-[#0a5c47] font-medium"
            >
              <PlusIcon className="h-4 w-4" /> Thêm ngôn ngữ
            </button>
          </Section>

          {/* Tips */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="flex items-center gap-2 font-semibold text-amber-800 mb-2"><InfoIcon className="h-4 w-4" /> Mẹo viết CV hiệu quả</p>
            <ul className="text-xs text-amber-700 flex flex-col gap-1 list-disc list-inside">
              <li>Dùng động từ hành động: <em>Phát triển, Xây dựng, Tối ưu, Quản lý...</em></li>
              <li>Thêm số liệu cụ thể: <em>tăng 30%, giảm 2 giây, xử lý 10.000 đơn/ngày</em></li>
              <li>Điều chỉnh kỹ năng theo từng JD — dùng đúng từ khóa của nhà tuyển dụng</li>
              <li>Giữ CV dưới 2 trang — chỉ liệt kê kinh nghiệm liên quan trong 5-10 năm gần nhất</li>
              <li>Giới thiệu bản thân nên có: điểm mạnh chính + số năm kinh nghiệm + mục tiêu</li>
            </ul>
          </div>

          {/* Bottom save */}
          <div className="flex gap-3">
            <Button type="submit" variant="outline" loading={saving} className="flex-1">
              <SaveIcon className="h-4 w-4" /> Lưu CV
            </Button>
            <Button type="button" onClick={onExport} loading={exporting} className="flex-1">
              <DownloadIcon className="h-4 w-4" /> Xuất PDF
            </Button>
          </div>

          {exportedUrl && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-700">CV đã được xuất. <a href={exportedUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline">Xem PDF</a></p>
            </div>
          )}
        </form>

        {/* ── Right: live preview ── */}
        <div className="sticky top-24">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Xem trước</p>
          <CvPreview content={previewContent} template={template} />
        </div>
      </div>
    </div>
  );
}

export default function CvBuilderEditorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}>
      <CvBuilderEditor />
    </Suspense>
  );
}
