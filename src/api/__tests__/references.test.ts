import { referencesApi } from "../references";
import client from "../client";

jest.mock("../client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockClient = client as jest.Mocked<typeof client>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("referencesApi.inventory.logs", () => {
  it("GETs /references/inventory/{id}/logs", async () => {
    mockClient.get.mockResolvedValue({ data: [] });
    await referencesApi.inventory.logs(42);
    expect(mockClient.get).toHaveBeenCalledWith(
      "/references/inventory/42/logs",
    );
  });
});

describe("referencesApi.inventory.history", () => {
  it("GETs /references/inventory/history with params", async () => {
    mockClient.get.mockResolvedValue({ data: [] });
    const params = { from: "2025-01-01", type: "restock" };
    await referencesApi.inventory.history(params);
    expect(mockClient.get).toHaveBeenCalledWith(
      "/references/inventory/history",
      { params },
    );
  });
});

describe("referencesApi.feedback.markRead", () => {
  it("PATCHes /references/feedback/{id}/mark-read", async () => {
    mockClient.patch.mockResolvedValue({ data: {} });
    await referencesApi.feedback.markRead(7);
    expect(mockClient.patch).toHaveBeenCalledWith(
      "/references/feedback/7/mark-read",
    );
  });
});

describe("referencesApi.feedback.reply", () => {
  it("POSTs /references/feedback/{id}/reply with message", async () => {
    mockClient.post.mockResolvedValue({ data: {} });
    await referencesApi.feedback.reply(7, "Thank you!");
    expect(mockClient.post).toHaveBeenCalledWith(
      "/references/feedback/7/reply",
      { message: "Thank you!" },
    );
  });
});
