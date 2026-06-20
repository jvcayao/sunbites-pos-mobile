import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";
import type { PaginatedResponse } from "@/types/common";
import type { StaffNotification } from "@/types/staff-notification";

const UNREAD_COUNT_KEY = ["staff-notifications-unread-count"] as const;
const LIST_KEY = ["staff-notifications"] as const;

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data),
  });
}

export function useNotificationList() {
  return useInfiniteQuery({
    queryKey: LIST_KEY,
    queryFn: ({ pageParam }) =>
      notificationsApi.list({ page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (lastPage) => {
      const page = lastPage as PaginatedResponse<StaffNotification>;
      return page.meta.current_page < page.meta.last_page
        ? page.meta.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.destroy(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
