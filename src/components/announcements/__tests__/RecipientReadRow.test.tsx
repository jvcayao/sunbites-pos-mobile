import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { RecipientReadRow } from '../RecipientReadRow'

describe('RecipientReadRow', () => {
  it('displays recipient name', () => {
    render(
      <RecipientReadRow
        recipient={{ id: 1, full_name: 'Maria Santos', read_at: '2026-06-20T10:00:00Z' }}
      />,
    )
    expect(screen.getByText('Maria Santos')).toBeTruthy()
  })

  it('shows formatted read timestamp for read recipients', () => {
    render(
      <RecipientReadRow
        recipient={{ id: 1, full_name: 'Maria Santos', read_at: '2026-06-20T10:00:00Z' }}
      />,
    )
    expect(screen.queryByText('Not yet read')).toBeNull()
    expect(screen.getByTestId('read-timestamp-1')).toBeTruthy()
  })

  it('shows "Not yet read" for unread recipients', () => {
    render(
      <RecipientReadRow
        recipient={{ id: 2, full_name: 'Ana Reyes', read_at: null }}
      />,
    )
    expect(screen.getByText('Not yet read')).toBeTruthy()
  })

  it('shows check icon for read recipients', () => {
    render(
      <RecipientReadRow
        recipient={{ id: 1, full_name: 'Maria Santos', read_at: '2026-06-20T10:00:00Z' }}
      />,
    )
    expect(screen.getByTestId('read-check-1')).toBeTruthy()
  })

  it('does not show check icon for unread recipients', () => {
    render(
      <RecipientReadRow
        recipient={{ id: 2, full_name: 'Ana Reyes', read_at: null }}
      />,
    )
    expect(screen.queryByTestId('read-check-2')).toBeNull()
  })
})
