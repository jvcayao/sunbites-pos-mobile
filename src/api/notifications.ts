import client from "./client";
import type { PaginatedResponse } from "@/types/common";
import type { StaffNotification } from "@/types/staff-notification";

export const notificationsApi = {
  unreadCount: (): Promise<{ data: { count: number } }> =>
    client.get<{ count: number }>("/staff/notifications/unread-count"),

  list: (params?: {
    page?: number;
    per_page?: number;
  }): Promise<{ data: PaginatedResponse<StaffNotification> }> =>
    client.get<PaginatedResponse<StaffNotification>>("/staff/notifications", {
      params,
    }),

  markRead: (id: string): Promise<unknown> =>
    client.patch(`/staff/notifications/${id}/read`),

  markAllRead: (): Promise<unknown> =>
    client.post("/staff/notifications/mark-all-read"),

  destroy: (id: string): Promise<unknown> =>
    client.delete(`/staff/notifications/${id}`),
};
