export type RecipientType = 'parents' | 'staff'

export interface AnnouncementListItem {
  id: number
  title: string | null
  message_preview: string
  sender_name: string
  recipient_type: RecipientType
  recipient_count: number
  read_count: number
  created_at: string
}

export interface AnnouncementRecipient {
  id: number
  full_name: string
  read_at: string | null
}

export interface AnnouncementDetail extends AnnouncementListItem {
  message: string
  recipients: AnnouncementRecipient[]
}

export interface CreateAnnouncementDto {
  title?: string
  message: string
  recipient_type: RecipientType
  recipient_ids: number[]
}
