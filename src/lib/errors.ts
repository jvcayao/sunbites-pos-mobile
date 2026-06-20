import axios from 'axios'

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'No internet connection. Check your network and try again.'
    if (err.response.status === 429) return 'Too many attempts. Please wait a minute.'
    return err.response.data?.message ?? 'Something went wrong. Please try again.'
  }
  return 'An unexpected error occurred.'
}
