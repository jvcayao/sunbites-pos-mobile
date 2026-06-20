import { posApi } from '../pos'
import client from '../client'

jest.mock('../client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockClient = client as jest.Mocked<typeof client>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('posApi.getLinkedStock', () => {
  it('GETs /references/menu-items/{id}/ingredients', async () => {
    mockClient.get.mockResolvedValue({ data: [] })
    await posApi.getLinkedStock(7)
    expect(mockClient.get).toHaveBeenCalledWith('/references/menu-items/7/ingredients')
  })
})

describe('posApi.attachLinkedStock', () => {
  it('POSTs /references/menu-items/{id}/ingredients with dto', async () => {
    mockClient.post.mockResolvedValue({ data: {} })
    await posApi.attachLinkedStock(7, { inventory_item_id: 3, quantity_used: 2 })
    expect(mockClient.post).toHaveBeenCalledWith(
      '/references/menu-items/7/ingredients',
      { inventory_item_id: 3, quantity_used: 2 },
    )
  })
})

describe('posApi.detachLinkedStock', () => {
  it('DELETEs /references/menu-items/{menuItemId}/ingredients/{inventoryItemId}', async () => {
    mockClient.delete.mockResolvedValue({ data: {} })
    await posApi.detachLinkedStock(7, 3)
    expect(mockClient.delete).toHaveBeenCalledWith(
      '/references/menu-items/7/ingredients/3',
    )
  })
})

describe('posApi.adjustStock', () => {
  it('POSTs with reason field (not notes)', async () => {
    mockClient.post.mockResolvedValue({ data: {} })
    await posApi.adjustStock(5, { type: 'restock', quantity: 10, reason: 'Delivery' })
    expect(mockClient.post).toHaveBeenCalledWith(
      '/pos/inventory/5/adjust',
      { type: 'restock', quantity: 10, reason: 'Delivery' },
    )
  })
})
