import { remindersApi } from '../reminders'
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

describe('remindersApi.bellCount', () => {
  it('GETs /reminders/bell-count', async () => {
    mockClient.get.mockResolvedValue({ data: { count: 3 } })
    await remindersApi.bellCount()
    expect(mockClient.get).toHaveBeenCalledWith('/reminders/bell-count')
  })
})

describe('remindersApi.eligibleParents', () => {
  it('GETs /reminders/eligible-parents without params', async () => {
    mockClient.get.mockResolvedValue({ data: { data: [], meta: {} } })
    await remindersApi.eligibleParents()
    expect(mockClient.get).toHaveBeenCalledWith('/reminders/eligible-parents', { params: undefined })
  })

  it('passes pagination params when provided', async () => {
    mockClient.get.mockResolvedValue({ data: { data: [] } })
    await remindersApi.eligibleParents({ page: 2, per_page: 15 })
    expect(mockClient.get).toHaveBeenCalledWith('/reminders/eligible-parents', {
      params: { page: 2, per_page: 15 },
    })
  })
})

describe('remindersApi.send', () => {
  it('POSTs /reminders/send with parent_ids', async () => {
    mockClient.post.mockResolvedValue({ data: { sent: 2, skipped: 0, skipped_names: [] } })
    await remindersApi.send({ parent_ids: [1, 2] })
    expect(mockClient.post).toHaveBeenCalledWith('/reminders/send', { parent_ids: [1, 2] })
  })

  it('POSTs /reminders/send with force flag', async () => {
    mockClient.post.mockResolvedValue({ data: { sent: 1, skipped: 0, skipped_names: [] } })
    await remindersApi.send({ parent_ids: [3], force: true })
    expect(mockClient.post).toHaveBeenCalledWith('/reminders/send', { parent_ids: [3], force: true })
  })
})

describe('remindersApi.parentDetail', () => {
  it('GETs /reminders/parents/{id}', async () => {
    mockClient.get.mockResolvedValue({ data: { id: 1, full_name: 'Maria Santos' } })
    await remindersApi.parentDetail(42)
    expect(mockClient.get).toHaveBeenCalledWith('/reminders/parents/42')
  })
})
