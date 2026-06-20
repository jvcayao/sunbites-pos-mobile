import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsApi } from "@/api/students";
import type { EnrollPayload, EnrollmentFormData } from "@/types/enrollment";

export function useEnrollmentFormData() {
  return useQuery<EnrollmentFormData>({
    queryKey: ["enrollment-form-data"],
    queryFn: () =>
      studentsApi
        .enrollmentFormData()
        .then((r) => r.data as EnrollmentFormData),
    staleTime: 5 * 60_000,
  });
}

export function useEnrollStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EnrollPayload) =>
      studentsApi.enroll(payload).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
