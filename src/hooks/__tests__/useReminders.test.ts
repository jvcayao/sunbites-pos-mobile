import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useReminderBellCount,
  useEligibleParents,
  useSendReminders,
  useReminderParentDetail,
} from "../useReminders";
import { remindersApi } from "@/api/reminders";

jest.mock("@/api/reminders", () => ({
  remindersApi: {
    bellCount: jest.fn(),
    eligibleParents: jest.fn(),
    send: jest.fn(),
    parentDetail: jest.fn(),
  },
}));

const mockApi = remindersApi as jest.Mocked<typeof remindersApi>;

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  }
  return Wrapper;
}

beforeEach(() => jest.clearAllMocks());

describe("useReminderBellCount", () => {
  it("returns bell count from API", async () => {
    mockApi.bellCount.mockResolvedValue({ data: { count: 5 } } as any);
    const { result } = renderHook(() => useReminderBellCount(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ count: 5 });
    expect(mockApi.bellCount).toHaveBeenCalled();
  });

  it("transitions to error state on API failure", async () => {
    mockApi.bellCount.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useReminderBellCount(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe("useEligibleParents", () => {
  it("fetches first page via useInfiniteQuery", async () => {
    const page1 = {
      data: [{ id: 1, full_name: "Maria Santos" }],
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
    mockApi.eligibleParents.mockResolvedValue({ data: page1 } as any);

    const { result } = renderHook(() => useEligibleParents(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.eligibleParents).toHaveBeenCalledWith({ page: 1 });
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
    mockApi.eligibleParents.mockResolvedValue({ data: emptyPage } as any);

    const { result } = renderHook(() => useEligibleParents(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].data).toEqual([]);
  });
});

describe("useSendReminders", () => {
  it("calls send API and invalidates bell-count and eligible-parents on success", async () => {
    mockApi.send.mockResolvedValue({
      data: { sent: 2, skipped: 0, skipped_names: [] },
    } as any);

    const { result } = renderHook(() => useSendReminders(), {
      wrapper: createWrapper(),
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    result.current.mutate({ parent_ids: [1, 2] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.send).toHaveBeenCalledWith({ parent_ids: [1, 2] });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["reminders-bell-count"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["reminders"] }),
    );
  });

  it("passes force flag to API", async () => {
    mockApi.send.mockResolvedValue({
      data: { sent: 1, skipped: 0, skipped_names: [] },
    } as any);

    const { result } = renderHook(() => useSendReminders(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ parent_ids: [3], force: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.send).toHaveBeenCalledWith({ parent_ids: [3], force: true });
  });
});

describe("useReminderParentDetail", () => {
  it("returns parent detail from API", async () => {
    const detail = {
      id: 1,
      full_name: "Maria Santos",
      email: "maria@example.com",
      phone: null,
      students: [],
    };
    mockApi.parentDetail.mockResolvedValue({ data: detail } as any);

    const { result } = renderHook(() => useReminderParentDetail(1), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(detail);
    expect(mockApi.parentDetail).toHaveBeenCalledWith(1);
  });

  it("transitions to error state on API failure", async () => {
    mockApi.parentDetail.mockRejectedValue(new Error("Not found"));
    const { result } = renderHook(() => useReminderParentDetail(99), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
