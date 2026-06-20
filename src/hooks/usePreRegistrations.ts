import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { preRegistrationsApi } from "@/api/pre-registrations";
import type { PaginatedResponse } from "@/types/common";
import type {
  PreRegistrationStatus,
  PreRegistrationListItem,
  PreRegistrationDetail,
  UpdatePreRegistrationDto,
} from "@/types/pre-registration";

interface ListParams {
  status?: PreRegistrationStatus;
  page?: number;
  per_page?: number;
}

const KEY = {
  list: () => ["pre-registrations"] as const,
  detail: (id: number) => ["pre-registration", id] as const,
  pendingCount: () => ["pre-registrations-pending-count"] as const,
};

export function usePreRegistrationList(params: Omit<ListParams, "page">) {
  return useInfiniteQuery({
    queryKey: [...KEY.list(), params] as const,
    queryFn: ({ pageParam = 1 }) =>
      preRegistrationsApi
        .list({ ...params, page: pageParam as number })
        .then((r) => r.data as PaginatedResponse<PreRegistrationListItem>),
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function usePreRegistrationDetail(id: number) {
  return useQuery({
    queryKey: KEY.detail(id),
    queryFn: () =>
      preRegistrationsApi.show(id).then((r) => r.data as PreRegistrationDetail),
  });
}

export function usePendingCount() {
  return useQuery({
    queryKey: KEY.pendingCount(),
    queryFn: () =>
      preRegistrationsApi
        .list({ status: "pending", per_page: 1 })
        .then(
          (r) =>
            (r.data as PaginatedResponse<PreRegistrationListItem>).meta.total,
        ),
  });
}

export function useUpdatePreRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePreRegistrationDto;
    }) => preRegistrationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: KEY.detail(id) });
    },
  });
}

function invalidateListAndCount(
  qc: ReturnType<typeof useQueryClient>,
  id: number,
): void {
  void qc.invalidateQueries({ queryKey: KEY.list() });
  void qc.invalidateQueries({ queryKey: KEY.detail(id) });
  void qc.invalidateQueries({ queryKey: KEY.pendingCount() });
}

export function useApprovePreRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => preRegistrationsApi.approve(id),
    onSuccess: (_, id) => invalidateListAndCount(qc, id),
  });
}

export function useRejectPreRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      rejection_reason,
    }: {
      id: number;
      rejection_reason: string;
    }) => preRegistrationsApi.reject(id, { rejection_reason }),
    onSuccess: (_, { id }) => invalidateListAndCount(qc, id),
  });
}

export function useReactivatePreRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => preRegistrationsApi.reactivate(id),
    onSuccess: (_, id) => invalidateListAndCount(qc, id),
  });
}
