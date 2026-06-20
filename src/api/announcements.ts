import client from "./client";
import type {
  AnnouncementListItem,
  AnnouncementDetail,
  CreateAnnouncementDto,
} from "@/types/announcement";
import type { PaginatedResponse } from "@/types/common";

export const announcementsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    client.get<PaginatedResponse<AnnouncementListItem>>("/announcements", {
      params,
    }),

  show: (id: number) => client.get<AnnouncementDetail>(`/announcements/${id}`),

  create: (data: CreateAnnouncementDto) =>
    client.post<AnnouncementDetail>("/announcements", data),
};
