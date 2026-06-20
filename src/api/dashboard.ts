import client from './client'

export const dashboardApi = {
  get: () =>
    client.get('/dashboard'),

  // API endpoint is /staff-daily-statuses (not /dashboard/staff-status)
  updateStaffStatus: (userId: number, status: string) =>
    client.post('/staff-daily-statuses', { user_id: userId, status }),
}
