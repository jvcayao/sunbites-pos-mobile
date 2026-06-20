import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { posApi } from "@/api/pos";
import type { TransactionParams } from "@/types/pos";
import type { PaginatedResponse } from "@/types/common";
import type { Order } from "@/types/order";
import type { PosMenuItem } from "@/types/menu";

export function usePosMenuItems() {
  return useQuery({
    queryKey: ["pos-menu-items"],
    queryFn: () => posApi.menuItems().then((r) => r.data as PosMenuItem[]),
    staleTime: 60_000,
  });
}

export function usePosTransactions(params: Omit<TransactionParams, "page">) {
  return useInfiniteQuery({
    queryKey: ["pos-transactions", params],
    queryFn: ({ pageParam = 1 }) =>
      posApi
        .transactions({ ...params, page: pageParam as number })
        .then((r) => r.data as PaginatedResponse<Order>),
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function usePosInventory() {
  return useQuery({
    queryKey: ["pos-inventory"],
    queryFn: () => posApi.posInventory().then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: posApi.checkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos-transactions"] }),
  });
}

export function useVoidOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      posApi.voidOrder(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos-transactions"] }),
  });
}

export function useLookupStudent() {
  return useMutation({
    mutationFn: posApi.lookupStudent,
  });
}

export function useToggleMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => posApi.toggleMenuItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos-menu-items"] }),
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: posApi.createMenuItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos-menu-items"] }),
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof posApi.updateMenuItem>[1];
    }) => posApi.updateMenuItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos-menu-items"] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => posApi.deleteMenuItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos-menu-items"] }),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof posApi.adjustStock>[1];
    }) => posApi.adjustStock(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos-inventory"] }),
  });
}

export function useLinkedStock(menuItemId: number) {
  return useQuery({
    queryKey: ["pos-linked-stock", menuItemId],
    queryFn: () => posApi.getLinkedStock(menuItemId).then((r) => r.data),
    enabled: menuItemId > 0,
  });
}

export function useAttachLinkedStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      menuItemId,
      data,
    }: {
      menuItemId: number;
      data: Parameters<typeof posApi.attachLinkedStock>[1];
    }) => posApi.attachLinkedStock(menuItemId, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ["pos-linked-stock", vars.menuItemId],
      });
      void qc.invalidateQueries({ queryKey: ["pos-menu-items"] });
    },
  });
}

export function useDetachLinkedStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      menuItemId,
      inventoryItemId,
    }: {
      menuItemId: number;
      inventoryItemId: number;
    }) => posApi.detachLinkedStock(menuItemId, inventoryItemId),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ["pos-linked-stock", vars.menuItemId],
      });
      void qc.invalidateQueries({ queryKey: ["pos-menu-items"] });
    },
  });
}
