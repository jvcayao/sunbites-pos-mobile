import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  usePreRegistrationList,
  usePreRegistrationDetail,
  usePendingCount,
  useUpdatePreRegistration,
  useApprovePreRegistration,
  useRejectPreRegistration,
  useReactivatePreRegistration,
} from "../usePreRegistrations";
import { preRegistrationsApi } from "@/api/pre-registrations";

jest.mock("@/api/pre-registrations", () => ({
  preRegistrationsApi: {
    list: jest.fn(),
    show: jest.fn(),
    update: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    reactivate: jest.fn(),
  },
}));

const mockApi = preRegistrationsApi as jest.Mocked<typeof preRegistrationsApi>;

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  }
  return Wrapper;
}

beforeEach(() => jest.clearAllMocks());

describe("usePreRegistrationList", () => {
  it("fetches first page via useInfiniteQuery", async () => {
    const page1 = {
      data: [{ id: 1, full_name: "Maria Santos", status: "pending" }],
      meta: {
        current_page: 1,
        last_page: 2,
        total: 2,
        per_page: 15,
        from: 1,
        to: 1,
      },
      links: { first: "", last: "", prev: null, next: "page2" },
    };
    mockApi.list.mockResolvedValue({ data: page1 } as any);

    const { result } = renderHook(
      () => usePreRegistrationList({ status: "pending" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.list).toHaveBeenCalledWith({ status: "pending", page: 1 });
    expect(result.current.data?.pages[0]).toEqual(page1);
  });

  it("returns empty pages on empty list", async () => {
    const emptyPage = {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
        from: 0,
        to: 0,
      },
      links: { first: "", last: "", prev: null, next: null },
    };
    mockApi.list.mockResolvedValue({ data: emptyPage } as any);

    const { result } = renderHook(() => usePreRegistrationList({}), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].data).toEqual([]);
  });
});

describe("usePreRegistrationDetail", () => {
  it("returns detail from API", async () => {
    const detail = { id: 5, full_name: "Maria Santos", status: "pending" };
    mockApi.show.mockResolvedValue({ data: detail } as any);

    const { result } = renderHook(() => usePreRegistrationDetail(5), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(detail);
    expect(mockApi.show).toHaveBeenCalledWith(5);
  });

  it("transitions to error state on API failure", async () => {
    mockApi.show.mockRejectedValue(new Error("Not found"));
    const { result } = renderHook(() => usePreRegistrationDetail(99), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("usePendingCount", () => {
  it("returns total from meta when fetching pending with per_page=1", async () => {
    mockApi.list.mockResolvedValue({
      data: {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 7,
          per_page: 1,
          from: 0,
          to: 0,
        },
        links: { first: "", last: "", prev: null, next: null },
      },
    } as any);

    const { result } = renderHook(() => usePendingCount(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(7);
    expect(mockApi.list).toHaveBeenCalledWith({
      status: "pending",
      per_page: 1,
    });
  });

  it("returns 0 when API returns total of 0", async () => {
    mockApi.list.mockResolvedValue({
      data: {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 1,
          from: 0,
          to: 0,
        },
        links: { first: "", last: "", prev: null, next: null },
      },
    } as any);

    const { result } = renderHook(() => usePendingCount(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });
});

describe("useUpdatePreRegistration", () => {
  it("calls update API and invalidates detail on success", async () => {
    mockApi.update.mockResolvedValue({ data: { id: 5 } } as any);

    const { result } = renderHook(() => useUpdatePreRegistration(), {
      wrapper: createWrapper(),
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    result.current.mutate({ id: 5, data: { first_name: "Maria" } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.update).toHaveBeenCalledWith(5, { first_name: "Maria" });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["pre-registration", 5] }),
    );
  });
});

describe("useApprovePreRegistration", () => {
  it("calls approve API and invalidates list, detail, and pending count on success", async () => {
    mockApi.approve.mockResolvedValue({ data: { student_id: 10 } } as any);

    const { result } = renderHook(() => useApprovePreRegistration(), {
      wrapper: createWrapper(),
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    result.current.mutate(5);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.approve).toHaveBeenCalledWith(5);
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["pre-registrations"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["pre-registration", 5] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["pre-registrations-pending-count"],
      }),
    );
  });
});

describe("useRejectPreRegistration", () => {
  it("calls reject API with reason and invalidates list, detail, pending count", async () => {
    mockApi.reject.mockResolvedValue({ data: {} } as any);

    const { result } = renderHook(() => useRejectPreRegistration(), {
      wrapper: createWrapper(),
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    result.current.mutate({
      id: 8,
      rejection_reason: "Incomplete details provided here.",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.reject).toHaveBeenCalledWith(8, {
      rejection_reason: "Incomplete details provided here.",
    });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["pre-registrations"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["pre-registrations-pending-count"],
      }),
    );
  });
});

describe("useReactivatePreRegistration", () => {
  it("calls reactivate API and invalidates list, detail, pending count", async () => {
    mockApi.reactivate.mockResolvedValue({ data: {} } as any);

    const { result } = renderHook(() => useReactivatePreRegistration(), {
      wrapper: createWrapper(),
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    result.current.mutate(3);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.reactivate).toHaveBeenCalledWith(3);
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["pre-registrations"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["pre-registration", 3] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["pre-registrations-pending-count"],
      }),
    );
  });
});
