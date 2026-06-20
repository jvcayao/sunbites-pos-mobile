import { getNotificationTitle, getNotificationRoute } from '../staff-notification'
import type { StaffNotification } from '../staff-notification'

const announcement: StaffNotification = {
  id: 'uuid-1',
  type: 'App\\Notifications\\AnnouncementNotification',
  data: {
    announcement_id: 42,
    title: 'School Holiday',
    message: 'The canteen will be closed on Monday.',
    sender_name: 'Admin',
    sent_at: '2026-06-20T08:00:00Z',
  },
  read_at: null,
  created_at: '2026-06-20T08:00:00Z',
}

const announcementNoTitle: StaffNotification = {
  id: 'uuid-2',
  type: 'App\\Notifications\\AnnouncementNotification',
  data: {
    announcement_id: 43,
    title: null,
    message: 'Some message',
    sender_name: 'Admin',
    sent_at: '2026-06-20T08:00:00Z',
  },
  read_at: null,
  created_at: '2026-06-20T08:00:00Z',
}

const preRegistration: StaffNotification = {
  id: 'uuid-3',
  type: 'App\\Notifications\\PreRegistrationNotification',
  data: {
    pre_registration_id: 7,
    student_name: 'Maria Santos',
    enrollment_type: 'subscription',
    branch_name: 'Main Branch',
    submitted_at: '2026-06-20T09:00:00Z',
  },
  read_at: '2026-06-20T10:00:00Z',
  created_at: '2026-06-20T09:00:00Z',
}

describe('getNotificationTitle', () => {
  it('returns announcement title when present', () => {
    expect(getNotificationTitle(announcement)).toBe('School Holiday')
  })

  it('returns "Announcement" when title is null', () => {
    expect(getNotificationTitle(announcementNoTitle)).toBe('Announcement')
  })

  it('returns pre-registration title with student name', () => {
    expect(getNotificationTitle(preRegistration)).toBe('New Pre-Registration: Maria Santos')
  })
})

describe('getNotificationRoute', () => {
  it('returns announcement route with id', () => {
    expect(getNotificationRoute(announcement)).toBe('/(app)/announcements/42')
  })

  it('returns pre-registration route with id', () => {
    expect(getNotificationRoute(preRegistration)).toBe('/(app)/pre-registrations/7')
  })
})
