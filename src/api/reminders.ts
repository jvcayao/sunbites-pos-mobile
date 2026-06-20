import client from "./client";
import type { PaginatedResponse } from "@/types/common";
import type {
  EligibleParent,
  ReminderParentDetail,
  SendRemindersResponse,
} from "@/types/reminder";

export const remindersApi = {
  bellCount: (): Promise<{ data: { count: number } }> =>
    client.get<{ count: number }>("/reminders/bell-count"),

  eligibleParents: (params?: {
    page?: number;
    per_page?: number;
  }): Promise<{ data: PaginatedResponse<EligibleParent> }> =>
    client.get<PaginatedResponse<EligibleParent>>(
      "/reminders/eligible-parents",
      { params },
    ),

  send: (data: {
    parent_ids: number[];
    force?: boolean;
  }): Promise<{ data: SendRemindersResponse }> =>
    client.post<SendRemindersResponse>("/reminders/send", data),

  parentDetail: (id: number): Promise<{ data: ReminderParentDetail }> =>
    client.get<ReminderParentDetail>(`/reminders/parents/${id}`),
};
