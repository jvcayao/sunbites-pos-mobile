import { render, fireEvent, screen } from '@testing-library/react-native'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaperProvider } from 'react-native-paper'

jest.mock('@/lib/relative-time', () => ({
  relativeTime: jest.fn(() => '2m ago'),
}))

import { router } from 'expo-router'
import { NotificationRow } from '../NotificationRow'
import type { StaffNotification } from '@/types/staff-notification'

const unreadAnnouncement: StaffNotification = {
  id: 'n1',
  type: 'App\\Notifications\\AnnouncementNotification',
  data: {
    announcement_id: 10,
    title: 'New Update',
    message: 'Something important happened today.',
    sender_name: 'Admin',
    sent_at: '2026-06-20T08:00:00Z',
  },
  read_at: null,
  created_at: '2026-06-20T08:00:00Z',
}

const readPreReg: StaffNotification = {
  id: 'n2',
  type: 'App\\Notifications\\PreRegistrationNotification',
  data: {
    pre_registration_id: 5,
    student_name: 'Juan Dela Cruz',
    enrollment_type: 'subscription',
    branch_name: 'Main Branch',
    submitted_at: '2026-06-20T09:00:00Z',
  },
  read_at: '2026-06-20T10:00:00Z',
  created_at: '2026-06-20T09:00:00Z',
}

const mockOnMarkRead = jest.fn()
const mockOnDelete = jest.fn()

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
      <PaperProvider>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </PaperProvider>
    )
  }
  return Wrapper
}

beforeEach(() => jest.clearAllMocks())

describe('NotificationRow', () => {
  it('shows unread dot for unread notification', () => {
    render(
      <NotificationRow notification={unreadAnnouncement} onMarkRead={mockOnMarkRead} onDelete={mockOnDelete} />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByTestId('unread-dot')).toBeTruthy()
  })

  it('hides unread dot for read notification', () => {
    render(
      <NotificationRow notification={readPreReg} onMarkRead={mockOnMarkRead} onDelete={mockOnDelete} />,
      { wrapper: makeWrapper() },
    )
    expect(screen.queryByTestId('unread-dot')).toBeNull()
  })

  it('shows type-aware title from getNotificationTitle', () => {
    render(
      <NotificationRow notification={unreadAnnouncement} onMarkRead={mockOnMarkRead} onDelete={mockOnDelete} />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('New Update')).toBeTruthy()
  })

  it('shows relative timestamp', () => {
    render(
      <NotificationRow notification={unreadAnnouncement} onMarkRead={mockOnMarkRead} onDelete={mockOnDelete} />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('2m ago')).toBeTruthy()
  })

  it('shows context menu button', () => {
    render(
      <NotificationRow notification={unreadAnnouncement} onMarkRead={mockOnMarkRead} onDelete={mockOnDelete} />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByTestId('notification-menu-btn')).toBeTruthy()
  })

  it('navigates to pre-registration route when pre-registration notification row is pressed', () => {
    render(
      <NotificationRow notification={readPreReg} onMarkRead={mockOnMarkRead} onDelete={mockOnDelete} />,
      { wrapper: makeWrapper() },
    )
    fireEvent.press(screen.getByTestId('notification-row'))
    expect(router.push).toHaveBeenCalledWith('/(app)/pre-registrations/5')
  })
})
