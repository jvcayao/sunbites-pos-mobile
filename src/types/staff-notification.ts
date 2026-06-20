export type AnnouncementFQCN = 'App\\Notifications\\AnnouncementNotification'
export type PreRegistrationFQCN = 'App\\Notifications\\PreRegistrationNotification'

export interface AnnouncementData {
  announcement_id: number
  title: string | null
  message: string
  sender_name: string
  sent_at: string
}

export interface PreRegistrationData {
  pre_registration_id: number
  student_name: string
  enrollment_type: string
  branch_name: string
  submitted_at: string
}

export type StaffNotification =
  | { id: string; type: AnnouncementFQCN; data: AnnouncementData; read_at: string | null; created_at: string }
  | { id: string; type: PreRegistrationFQCN; data: PreRegistrationData; read_at: string | null; created_at: string }

export function getNotificationTitle(n: StaffNotification): string {
  switch (n.type) {
    case 'App\\Notifications\\AnnouncementNotification':
      return n.data.title ?? 'Announcement'
    case 'App\\Notifications\\PreRegistrationNotification':
      return `New Pre-Registration: ${n.data.student_name}`
  }
}

export function getNotificationRoute(n: StaffNotification): string | null {
  switch (n.type) {
    case 'App\\Notifications\\AnnouncementNotification':
      return `/(app)/announcements/${n.data.announcement_id}`
    case 'App\\Notifications\\PreRegistrationNotification':
      return `/(app)/pre-registrations/${n.data.pre_registration_id}`
    default:
      return null
  }
}
