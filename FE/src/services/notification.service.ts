import axiosInstance from '@/lib/axios';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await axiosInstance.get<Notification[]>('/api/notifications');
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await axiosInstance.get<{ count: number }>('/api/notifications/unread-count');
  return res.data.count;
}

export async function markRead(id: string): Promise<void> {
  await axiosInstance.put(`/api/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await axiosInstance.put('/api/notifications/read-all');
}
