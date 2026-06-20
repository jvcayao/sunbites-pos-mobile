import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { studentsApi } from "@/api/students";
import type {
  StudentListParams,
  UpdateStudentDto,
  TopUpDto,
  SubscriptionRangeDto,
  ContactDto,
  Student,
} from "@/types/student";
import type { PaginatedResponse } from "@/types/common";

const KEY = {
  list: (p: StudentListParams) => ["students", p] as const,
  detail: (id: number) => ["student", id] as const,
  contacts: (id: number) => ["student-contacts", id] as const,
  payments: (id: number) => ["student-payments", id] as const,
  orders: (id: number) => ["student-orders", id] as const,
  wallet: (id: number) => ["student-wallet", id] as const,
};

export function useStudentList(params: StudentListParams) {
  return useInfiniteQuery({
    queryKey: KEY.list(params),
    queryFn: ({ pageParam = 1 }) =>
      studentsApi
        .list({ ...params, page: pageParam as number })
        .then((r) => r.data as PaginatedResponse<Student>),
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useStudentDetail(id: number) {
  return useQuery({
    queryKey: KEY.detail(id),
    queryFn: () => studentsApi.show(id).then((r) => r.data as Student),
  });
}

export function useStudentContacts(id: number) {
  return useQuery({
    queryKey: KEY.contacts(id),
    queryFn: () => studentsApi.listContacts(id).then((r) => r.data),
  });
}

export function useStudentPayments(id: number) {
  return useQuery({
    queryKey: KEY.payments(id),
    queryFn: () => studentsApi.payments(id).then((r) => r.data),
  });
}

export function useStudentOrders(id: number) {
  return useInfiniteQuery({
    queryKey: KEY.orders(id),
    queryFn: ({ pageParam = 1 }) =>
      studentsApi.orders(id, pageParam as number).then((r) => r.data),
    getNextPageParam: (last: any) =>
      last.meta?.current_page < last.meta?.last_page
        ? last.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useStudentWalletTransactions(id: number) {
  return useQuery({
    queryKey: KEY.wallet(id),
    queryFn: () => studentsApi.walletTransactions(id).then((r) => r.data),
  });
}

function invalidateStudent(qc: ReturnType<typeof useQueryClient>, id: number) {
  void qc.invalidateQueries({ queryKey: KEY.detail(id) });
}

export function useUpdateStudent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStudentDto) => studentsApi.update(id, data),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentsApi.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { enrollment_status: string; reason?: string }) =>
      studentsApi.updateStatus(id, data),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

export function useUpdateType(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (student_type: string) =>
      studentsApi.updateType(id, student_type),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

export function useTopUp(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TopUpDto) => studentsApi.topUp(id, data),
    onSuccess: () => {
      invalidateStudent(qc, id);
      void qc.invalidateQueries({ queryKey: KEY.wallet(id) });
    },
  });
}

export function useTogglePayment(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: number) => studentsApi.togglePayment(id, paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.payments(id) }),
  });
}

export function useUpdatePaymentAmount(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      amount,
    }: {
      paymentId: number;
      amount: number;
    }) => studentsApi.updatePaymentAmount(id, paymentId, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.payments(id) }),
  });
}

export function useAddSubscriptionRange(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionRangeDto) =>
      studentsApi.addSubscriptionRange(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.payments(id) }),
  });
}

export function useRegenerateQr(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => studentsApi.regenerateQr(id),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

export function useCreateContact(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactDto) => studentsApi.createContact(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.contacts(id) }),
  });
}

export function useUpdateContact(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cId, data }: { cId: number; data: ContactDto }) =>
      studentsApi.updateContact(id, cId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.contacts(id) }),
  });
}

export function useRemoveContact(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cId: number) => studentsApi.removeContact(id, cId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.contacts(id) }),
  });
}

export function useResendActivation(id: number) {
  return useMutation({
    mutationFn: (cId: number) => studentsApi.resendActivation(id, cId),
  });
}
