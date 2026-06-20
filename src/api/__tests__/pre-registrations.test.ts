import { preRegistrationsApi } from "../pre-registrations";
import client from "../client";

jest.mock("../client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockClient = client as jest.Mocked<typeof client>;

beforeEach(() => jest.clearAllMocks());

describe("preRegistrationsApi.list", () => {
  it("GETs /pre-registrations without params", async () => {
    mockClient.get.mockResolvedValue({ data: { data: [], meta: {} } });
    await preRegistrationsApi.list();
    expect(mockClient.get).toHaveBeenCalledWith("/pre-registrations", {
      params: undefined,
    });
  });

  it("passes status and pagination params when provided", async () => {
    mockClient.get.mockResolvedValue({ data: { data: [], meta: {} } });
    await preRegistrationsApi.list({
      status: "pending",
      page: 2,
      per_page: 15,
    });
    expect(mockClient.get).toHaveBeenCalledWith("/pre-registrations", {
      params: { status: "pending", page: 2, per_page: 15 },
    });
  });
});

describe("preRegistrationsApi.show", () => {
  it("GETs /pre-registrations/{id}", async () => {
    mockClient.get.mockResolvedValue({ data: { id: 42 } });
    await preRegistrationsApi.show(42);
    expect(mockClient.get).toHaveBeenCalledWith("/pre-registrations/42");
  });
});

describe("preRegistrationsApi.update", () => {
  it("PATCHes /pre-registrations/{id} with data", async () => {
    mockClient.patch.mockResolvedValue({ data: { id: 5 } });
    await preRegistrationsApi.update(5, { first_name: "Maria" });
    expect(mockClient.patch).toHaveBeenCalledWith("/pre-registrations/5", {
      first_name: "Maria",
    });
  });
});

describe("preRegistrationsApi.approve", () => {
  it("POSTs /pre-registrations/{id}/approve", async () => {
    mockClient.post.mockResolvedValue({ data: { student_id: 99 } });
    await preRegistrationsApi.approve(7);
    expect(mockClient.post).toHaveBeenCalledWith(
      "/pre-registrations/7/approve",
    );
  });
});

describe("preRegistrationsApi.reject", () => {
  it("POSTs /pre-registrations/{id}/reject with rejection_reason", async () => {
    mockClient.post.mockResolvedValue({ data: {} });
    await preRegistrationsApi.reject(8, {
      rejection_reason: "Incomplete information provided.",
    });
    expect(mockClient.post).toHaveBeenCalledWith(
      "/pre-registrations/8/reject",
      {
        rejection_reason: "Incomplete information provided.",
      },
    );
  });
});

describe("preRegistrationsApi.reactivate", () => {
  it("POSTs /pre-registrations/{id}/reactivate", async () => {
    mockClient.post.mockResolvedValue({ data: {} });
    await preRegistrationsApi.reactivate(3);
    expect(mockClient.post).toHaveBeenCalledWith(
      "/pre-registrations/3/reactivate",
    );
  });
});
