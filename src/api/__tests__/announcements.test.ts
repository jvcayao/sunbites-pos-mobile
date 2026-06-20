import { announcementsApi } from '../announcements'
import client from '../client'

jest.mock('../client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

const mockClient = client as jest.Mocked<typeof client>

beforeEach(() => jest.clearAllMocks())

describe('announcementsApi.list', () => {
  it('GETs /announcements without params', async () => {
    mockClient.get.mockResolvedValue({ data: { data: [], meta: {} } })
    await announcementsApi.list()
    expect(mockClient.get).toHaveBeenCalledWith('/announcements', { params: undefined })
  })

  it('passes page param when provided', async () => {
    mockClient.get.mockResolvedValue({ data: { data: [] } })
    await announcementsApi.list({ page: 2 })
    expect(mockClient.get).toHaveBeenCalledWith('/announcements', { params: { page: 2 } })
  })

  it('passes per_page param when provided', async () => {
    mockClient.get.mockResolvedValue({ data: { data: [] } })
    await announcementsApi.list({ page: 1, per_page: 10 })
    expect(mockClient.get).toHaveBeenCalledWith('/announcements', {
      params: { page: 1, per_page: 10 },
    })
  })
})

describe('announcementsApi.show', () => {
  it('GETs /announcements/{id}', async () => {
    mockClient.get.mockResolvedValue({ data: {} })
    await announcementsApi.show(42)
    expect(mockClient.get).toHaveBeenCalledWith('/announcements/42')
  })
})

describe('announcementsApi.create', () => {
  it('POSTs /announcements with payload', async () => {
    mockClient.post.mockResolvedValue({ data: {} })
    const payload = {
      message: 'Test message',
      recipient_type: 'parents' as const,
      recipient_ids: [1, 2],
    }
    await announcementsApi.create(payload)
    expect(mockClient.post).toHaveBeenCalledWith('/announcements', payload)
  })

  it('includes optional title when provided', async () => {
    mockClient.post.mockResolvedValue({ data: {} })
    const payload = {
      title: 'Holiday Notice',
      message: 'Canteen closed Monday.',
      recipient_type: 'staff' as const,
      recipient_ids: [5],
    }
    await announcementsApi.create(payload)
    expect(mockClient.post).toHaveBeenCalledWith('/announcements', payload)
  })
})
