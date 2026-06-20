import client from './client'
import type { PaginatedResponse } from '@/types/common'
import type {
  PreRegistrationStatus,
  PreRegistrationListItem,
  PreRegistrationDetail,
  UpdatePreRegistrationDto,
} from '@/types/pre-registration'

interface ListParams {
  status?: PreRegistrationStatus
  page?: number
  per_page?: number
}

export const preRegistrationsApi = {
  list: (params?: ListParams) =>
    client.get<PaginatedResponse<PreRegistrationListItem>>('/pre-registrations', { params }),

  show: (id: number) =>
    client.get<PreRegistrationDetail>(`/pre-registrations/${id}`),

  update: (id: number, data: UpdatePreRegistrationDto) =>
    client.patch<PreRegistrationDetail>(`/pre-registrations/${id}`, data),

  approve: (id: number) =>
    client.post<{ student_id: number }>(`/pre-registrations/${id}/approve`),

  reject: (id: number, data: { rejection_reason: string }) =>
    client.post(`/pre-registrations/${id}/reject`, data),

  reactivate: (id: number) =>
    client.post(`/pre-registrations/${id}/reactivate`),
}
