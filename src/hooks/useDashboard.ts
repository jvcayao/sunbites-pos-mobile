import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";
import type { StaffStatus, DashboardData } from "@/types/dashboard";

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get().then((r) => r.data as DashboardData),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useUpdateStaffStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: StaffStatus }) =>
      dashboardApi.updateStaffStatus(userId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}
