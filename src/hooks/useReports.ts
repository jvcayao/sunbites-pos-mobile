import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import type {
  SalesReportParams, SalesReportResponse,
  StudentsReportParams,
  WalletReportParams,
  InventoryReportParams,
  BillingReportParams,
  CreditsReportParams,
  ActivityReportParams,
} from '@/types/reports'

export function useSalesReport(params: Omit<SalesReportParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: ({ pageParam = 1 }) =>
      reportsApi.sales({ ...params, page: pageParam as number }).then((r) => r.data as SalesReportResponse),
    getNextPageParam: (last) =>
      last.meta.page < last.meta.last_page ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useStudentsReport(params: Omit<StudentsReportParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['reports', 'students', params],
    queryFn: ({ pageParam = 1 }) =>
      reportsApi.students({ ...params, page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.page < last.meta?.last_page ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useWalletReport(params: Omit<WalletReportParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['reports', 'wallet', params],
    queryFn: ({ pageParam = 1 }) =>
      reportsApi.wallet({ ...params, page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.page < last.meta?.last_page ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useInventoryReport(params: InventoryReportParams) {
  return useQuery({
    queryKey: ['reports', 'inventory', params],
    queryFn: () => reportsApi.inventory(params).then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useBillingReport(params: Omit<BillingReportParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['reports', 'billing', params],
    queryFn: ({ pageParam = 1 }) =>
      reportsApi.billing({ ...params, page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.page < last.meta?.last_page ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useCreditsReport(params: Omit<CreditsReportParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['reports', 'credits', params],
    queryFn: ({ pageParam = 1 }) =>
      reportsApi.credits({ ...params, page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.page < last.meta?.last_page ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useActivityLog(params: Omit<ActivityReportParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['reports', 'activity', params],
    queryFn: ({ pageParam = 1 }) =>
      reportsApi.activity({ ...params, page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.page < last.meta?.last_page ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: ['reports', 'daily-summary', date],
    queryFn: () => reportsApi.dailySummary(date).then((r) => r.data),
  })
}
