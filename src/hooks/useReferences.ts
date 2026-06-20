import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { referencesApi } from '@/api/references'
import type { SchoolMonth } from '@/types/student'

// ── Inventory ─────────────────────────────────────────────────────────────────

export function useInventoryList() {
  return useQuery({
    queryKey: ['references', 'inventory'],
    queryFn: () => referencesApi.inventory.list().then((r) => r.data),
  })
}

export function useInventoryHistory(params?: object) {
  return useQuery({
    queryKey: ['references', 'inventory-history', params],
    queryFn: () => referencesApi.inventory.history(params).then((r) => r.data),
  })
}

export function useCreateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: object) => referencesApi.inventory.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'inventory'] }),
  })
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => referencesApi.inventory.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'inventory'] }),
  })
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => referencesApi.inventory.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'inventory'] }),
  })
}

export function useArchiveInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => referencesApi.inventory.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'inventory'] }),
  })
}

// ── Meal Planner ──────────────────────────────────────────────────────────────

export function useMealPlanner(month: SchoolMonth, week: number) {
  return useQuery({
    queryKey: ['references', 'meal-planner', month, week],
    queryFn: () => referencesApi.mealPlanner.show(month, week).then((r) => r.data),
  })
}

export function useUpdateMealPlanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: object) => referencesApi.mealPlanner.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'meal-planner'] }),
  })
}

export function useResetMealPlanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: object) => referencesApi.mealPlanner.reset(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'meal-planner'] }),
  })
}

export function useUpdateMealPlannerVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: object) => referencesApi.mealPlanner.updateVisibility(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'meal-planner'] }),
  })
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useUserList(params?: object) {
  return useInfiniteQuery({
    queryKey: ['references', 'users', params],
    queryFn: ({ pageParam = 1 }) =>
      referencesApi.users.list({ ...(params ?? {}), page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.current_page < last.meta?.last_page ? last.meta.current_page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useUserDetail(id: number) {
  return useQuery({
    queryKey: ['references', 'user', id],
    queryFn: () => referencesApi.users.show(id).then((r) => r.data),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: object) => referencesApi.users.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'users'] }),
  })
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: object) => referencesApi.users.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['references', 'users'] })
      void qc.invalidateQueries({ queryKey: ['references', 'user', id] })
    },
  })
}

export function useDeactivateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => referencesApi.users.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'user', id] }),
  })
}

export function useReactivateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => referencesApi.users.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'user', id] }),
  })
}

// ── Branches ──────────────────────────────────────────────────────────────────

export function useBranchList() {
  return useQuery({
    queryKey: ['references', 'branches'],
    queryFn: () => referencesApi.branches.list().then((r) => r.data),
  })
}

export function useUpdateBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => referencesApi.branches.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'branches'] }),
  })
}

export function useToggleBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => referencesApi.branches.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'branches'] }),
  })
}

// ── Subscription Config ───────────────────────────────────────────────────────

export function useMonthlyAmounts(year: number) {
  return useQuery({
    queryKey: ['references', 'monthly-amounts', year],
    queryFn: () => referencesApi.subscriptionConfig.getMonthlyAmounts(year).then((r) => r.data),
  })
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['references', 'system-settings'],
    queryFn: () => referencesApi.systemSettings.list().then((r) => r.data),
  })
}

export function useUpdateSystemSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string | number }) =>
      referencesApi.systemSettings.update(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'system-settings'] }),
  })
}

// ── Parents ───────────────────────────────────────────────────────────────────

export function useParentList(params?: object) {
  return useInfiniteQuery({
    queryKey: ['references', 'parents', params],
    queryFn: ({ pageParam = 1 }) =>
      referencesApi.parents.list({ ...(params ?? {}), page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.current_page < last.meta?.last_page ? last.meta.current_page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useParentDetail(id: number) {
  return useQuery({
    queryKey: ['references', 'parent', id],
    queryFn: () => referencesApi.parents.show(id).then((r) => r.data),
  })
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export function useFeedbackList(params?: object) {
  return useInfiniteQuery({
    queryKey: ['references', 'feedback', params],
    queryFn: ({ pageParam = 1 }) =>
      referencesApi.feedback.list({ ...(params ?? {}), page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.current_page < last.meta?.last_page ? last.meta.current_page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useUpdateFeedback() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => referencesApi.feedback.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'feedback'] }),
  })
}

export function useDeleteFeedback() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => referencesApi.feedback.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'feedback'] }),
  })
}
