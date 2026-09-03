import { request } from "./client";

// Notification API surface mirroring internal/notification/handler.go.

export interface Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const notificationApi = {
  list(): Promise<Notification[]> {
    return request<Notification[]>("/api/v1/notifications");
  },

  unreadCount(): Promise<number> {
    return request<{ count: number }>(
      "/api/v1/notifications/unread-count",
    ).then((r) => r.count);
  },

  markRead(id: string): Promise<void> {
    return request<void>(`/api/v1/notifications/${id}/read`, {
      method: "POST",
    });
  },

  markAllRead(): Promise<void> {
    return request<void>("/api/v1/notifications/read-all", { method: "POST" });
  },
};
