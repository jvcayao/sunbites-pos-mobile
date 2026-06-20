import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { remindersApi } from "@/api/reminders";
import type { PaginatedResponse } from "@/types/common";
import type { EligibleParent } from "@/types/reminder";

const BELL_COUNT_KEY = ["reminders-bell-count"] as const;
const LIST_KEY = ["reminders"] as const;

export function useReminderBellCount() {
  return useQuery({
    queryKey: BELL_COUNT_KEY,
    queryFn: () => remindersApi.bellCount().then((r) => r.data),
  });
}

export function useEligibleParents(params?: { per_page?: number }) {
  return useInfiniteQuery({
    queryKey: LIST_KEY,
    queryFn: ({ pageParam }) =>
      remindersApi
        .eligibleParents({ page: pageParam as number, ...params })
        .then((r) => r.data),
    getNextPageParam: (lastPage) => {
      const page = lastPage as PaginatedResponse<EligibleParent>;
      return page.meta.current_page < page.meta.last_page
        ? page.meta.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
}

export function useSendReminders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { parent_ids: number[]; force?: boolean }) =>
      remindersApi.send(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BELL_COUNT_KEY });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useReminderParentDetail(id: number) {
  return useQuery({
    queryKey: ["reminders-parent", id],
    queryFn: () => remindersApi.parentDetail(id).then((r) => r.data),
    enabled: id > 0,
  });
}
