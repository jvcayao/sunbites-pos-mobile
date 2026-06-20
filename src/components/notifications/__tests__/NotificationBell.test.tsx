import { render, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";

import { useNotificationUnreadCount } from "@/hooks/useNotifications";
import { NotificationBell } from "../NotificationBell";

jest.mock("@/hooks/useNotifications", () => ({
  useNotificationUnreadCount: jest.fn(),
}));

const mockUseCount = useNotificationUnreadCount as jest.MockedFunction<
  typeof useNotificationUnreadCount
>;

function makeWrapper() {
  const qc = new QueryClient();
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  }
  return Wrapper;
}

beforeEach(() => jest.clearAllMocks());

describe("NotificationBell", () => {
  it("renders the bell icon", () => {
    mockUseCount.mockReturnValue({ data: { count: 0 } } as any);
    render(<NotificationBell />, { wrapper: makeWrapper() });
    expect(screen.getByTestId("notification-bell")).toBeTruthy();
  });

  it("hides badge when count is 0", () => {
    mockUseCount.mockReturnValue({ data: { count: 0 } } as any);
    render(<NotificationBell />, { wrapper: makeWrapper() });
    expect(screen.queryByTestId("notification-badge")).toBeNull();
  });

  it("shows badge when count is greater than 0", () => {
    mockUseCount.mockReturnValue({ data: { count: 3 } } as any);
    render(<NotificationBell />, { wrapper: makeWrapper() });
    expect(screen.getByTestId("notification-badge")).toBeTruthy();
  });

  it("navigates to notifications page on press", () => {
    mockUseCount.mockReturnValue({ data: { count: 0 } } as any);
    render(<NotificationBell />, { wrapper: makeWrapper() });
    fireEvent.press(screen.getByTestId("notification-bell"));
    expect(router.push).toHaveBeenCalledWith("/(app)/notifications");
  });
});
