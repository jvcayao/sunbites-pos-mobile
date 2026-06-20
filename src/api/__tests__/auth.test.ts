import { authApi } from "../auth";
import client from "../client";

jest.mock("../client", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockClient = client as jest.Mocked<typeof client>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("authApi.login", () => {
  it("POSTs to /auth/login with email and password", async () => {
    mockClient.post.mockResolvedValue({ data: { token: "tok", user: {} } });
    await authApi.login("user@example.com", "secret123");
    expect(mockClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "user@example.com",
      password: "secret123",
    });
  });

  it("returns the axios response", async () => {
    const payload = { data: { token: "tok_xyz", user: { id: 1 } } };
    mockClient.post.mockResolvedValue(payload);
    const res = await authApi.login("u@u.com", "pass1234");
    expect(res).toEqual(payload);
  });
});

describe("authApi.logout", () => {
  it("POSTs to /auth/logout with no body", async () => {
    mockClient.post.mockResolvedValue({ data: {} });
    await authApi.logout();
    expect(mockClient.post).toHaveBeenCalledWith("/auth/logout");
  });
});

describe("authApi.me", () => {
  it("GETs /auth/user", async () => {
    mockClient.get.mockResolvedValue({ data: { id: 1 } });
    await authApi.me();
    expect(mockClient.get).toHaveBeenCalledWith("/auth/user");
  });
});

describe("authApi.setBranch", () => {
  it("POSTs to /auth/branch with branch_id", async () => {
    mockClient.post.mockResolvedValue({ data: {} });
    await authApi.setBranch(3);
    expect(mockClient.post).toHaveBeenCalledWith("/auth/branch", {
      branch_id: 3,
      previous_branch_id: undefined,
    });
  });

  it("includes previous_branch_id when provided", async () => {
    mockClient.post.mockResolvedValue({ data: {} });
    await authApi.setBranch(3, 1);
    expect(mockClient.post).toHaveBeenCalledWith("/auth/branch", {
      branch_id: 3,
      previous_branch_id: 1,
    });
  });
});
