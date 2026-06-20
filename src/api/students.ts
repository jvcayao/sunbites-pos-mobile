import client from './client'

export const studentsApi = {
  // Enrollment
  enrollmentFormData: () =>
    client.get('/enrollment'),
  enroll: (data: object) =>
    client.post('/enrollment', data),

  // List & detail
  list: (params?: object) =>
    client.get('/students', { params }),
  show: (id: number) =>
    client.get(`/students/${id}`),
  update: (id: number, data: object) =>
    client.put(`/students/${id}`, data),
  destroy: (id: number) =>
    client.delete(`/students/${id}`),

  // Status & type
  updateStatus: (id: number, data: { enrollment_status: string; reason?: string }) =>
    client.patch(`/students/${id}/status`, data),
  updateType: (id: number, student_type: string) =>
    client.patch(`/students/${id}/type`, { student_type }),

  // QR
  regenerateQr: (id: number) =>
    client.post(`/students/${id}/regenerate-qr`),

  // Wallet
  topUp: (id: number, data: { amount: number; payment_method: string; reference_number?: string; note?: string }) =>
    client.post(`/students/${id}/wallet/top-up`, data),
  walletTransactions: (id: number) =>
    client.get(`/students/${id}/wallet/transactions`),

  // Credit
  settleCredit: (id: number) =>
    client.post(`/students/${id}/credit/settle`),

  // Order history
  orders: (id: number, page?: number) =>
    client.get(`/students/${id}/orders`, { params: { page } }),

  // Payments
  payments: (id: number) =>
    client.get(`/students/${id}/payments`),
  togglePayment: (id: number, paymentId: number) =>
    client.patch(`/students/${id}/payments/${paymentId}`),
  // NOTE: /amount suffix required — confirmed from API spec
  updatePaymentAmount: (id: number, paymentId: number, amount: number) =>
    client.patch(`/students/${id}/payments/${paymentId}/amount`, { amount }),
  addSubscriptionRange: (id: number, data: object) =>
    client.post(`/students/${id}/payments/range`, data),

  // Contacts
  listContacts: (id: number) =>
    client.get(`/students/${id}/contacts`),
  createContact: (id: number, data: object) =>
    client.post(`/students/${id}/contacts`, data),
  updateContact: (id: number, contactId: number, data: object) =>
    client.put(`/students/${id}/contacts/${contactId}`, data),
  removeContact: (id: number, contactId: number) =>
    client.delete(`/students/${id}/contacts/${contactId}`),
  resendActivation: (id: number, contactId: number) =>
    client.post(`/students/${id}/contacts/${contactId}/resend-activation`),
}
