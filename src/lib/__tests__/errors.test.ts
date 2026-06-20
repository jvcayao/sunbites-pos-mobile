import axios from 'axios'
import { getApiError } from '../errors'

// Helper to create a mock Axios error
function makeAxiosError(status: number, message?: string) {
  const err = new axios.AxiosError(
    'Request failed',
    String(status),
    {} as any,
    {},
    { status, data: message !== undefined ? { message } : undefined } as any,
  )
  return err
}

describe('getApiError', () => {
  it('returns a specific message for 429 rate-limit errors', () => {
    const err = makeAxiosError(429)
    expect(getApiError(err)).toBe('Too many attempts. Please wait a minute.')
  })

  it('returns the offline message when there is no response', () => {
    const err = new axios.AxiosError('Network Error')
    expect(getApiError(err)).toBe('No internet connection. Check your network and try again.')
  })

  it('returns the server message for other API errors', () => {
    const err = makeAxiosError(422, 'The email has already been taken.')
    expect(getApiError(err)).toBe('The email has already been taken.')
  })

  it('falls back to a generic message when server provides no message', () => {
    const err = makeAxiosError(500)
    expect(getApiError(err)).toBe('Something went wrong. Please try again.')
  })

  it('returns a generic message for non-Axios errors', () => {
    expect(getApiError(new Error('boom'))).toBe('An unexpected error occurred.')
    expect(getApiError('string error')).toBe('An unexpected error occurred.')
    expect(getApiError(null)).toBe('An unexpected error occurred.')
  })
})
