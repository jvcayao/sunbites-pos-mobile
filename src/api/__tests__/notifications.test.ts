import { notificationsApi } from "../notifications";
import client from "../client";

jest.mock("../client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockClient = client as jest.Mocked<typeof client>;

beforeEach(() => jest.clearAllMocks());

describe("notificationsApi.unreadCount", () => {
  it("GETs /staff/notifications/unread-count", async () => {
    mockClient.get.mockResolvedValue({ data: { count: 3 } });
    await notificationsApi.unreadCount();
    expect(mockClient.get).toHaveBeenCalledWith(
      "/staff/notifications/unread-count",
    );
  });
});

describe("notificationsApi.list", () => {
  it("GETs /staff/notifications without params", async () => {
    mockClient.get.mockResolvedValue({ data: { data: [], meta: {} } });
    await notificationsApi.list();
    expect(mockClient.get).toHaveBeenCalledWith("/staff/notifications", {
      params: undefined,
    });
  });

  it("passes page param when provided", async () => {
    mockClient.get.mockResolvedValue({ data: { data: [] } });
    await notificationsApi.list({ page: 2 });
    expect(mockClient.get).toHaveBeenCalledWith("/staff/notifications", {
      params: { page: 2 },
    });
  });
});

describe("notificationsApi.markRead", () => {
  it("PATCHes /staff/notifications/{id}/read", async () => {
    mockClient.patch.mockResolvedValue({ data: {} });
    await notificationsApi.markRead("uuid-123");
    expect(mockClient.patch).toHaveBeenCalledWith(
      "/staff/notifications/uuid-123/read",
    );
  });
});

describe("notificationsApi.markAllRead", () => {
  it("POSTs /staff/notifications/mark-all-read", async () => {
    mockClient.post.mockResolvedValue({ data: {} });
    await notificationsApi.markAllRead();
    expect(mockClient.post).toHaveBeenCalledWith(
      "/staff/notifications/mark-all-read",
    );
  });
});

describe("notificationsApi.destroy", () => {
  it("DELETEs /staff/notifications/{id}", async () => {
    mockClient.delete.mockResolvedValue({ data: {} });
    await notificationsApi.destroy("uuid-456");
    expect(mockClient.delete).toHaveBeenCalledWith(
      "/staff/notifications/uuid-456",
    );
  });
});
