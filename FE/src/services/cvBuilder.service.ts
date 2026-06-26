import axiosInstance from '@/lib/axios';
import type { CvBuilderDocument, CvBuilderContent, CvTemplate, CvFile } from '@/types';

const BASE = '/api/candidate/cv-builder';

export async function getMyDocuments(): Promise<CvBuilderDocument[]> {
  const res = await axiosInstance.get<CvBuilderDocument[]>(BASE);
  return res.data;
}

export async function getDocumentById(id: string): Promise<CvBuilderDocument> {
  const res = await axiosInstance.get<CvBuilderDocument>(`${BASE}/${id}`);
  return res.data;
}

export async function createDocument(
  title: string,
  template: CvTemplate,
  content: CvBuilderContent
): Promise<CvBuilderDocument> {
  const res = await axiosInstance.post<CvBuilderDocument>(BASE, { title, template, content });
  return res.data;
}

export async function updateDocument(
  id: string,
  title: string,
  template: CvTemplate,
  content: CvBuilderContent
): Promise<CvBuilderDocument> {
  const res = await axiosInstance.put<CvBuilderDocument>(`${BASE}/${id}`, { title, template, content });
  return res.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}

export async function exportToPdf(id: string): Promise<CvFile> {
  const res = await axiosInstance.post<CvFile>(`${BASE}/${id}/export`);
  return res.data;
}
