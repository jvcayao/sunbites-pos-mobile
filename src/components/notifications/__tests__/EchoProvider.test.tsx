import { render } from "@testing-library/react-native";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Echo from "laravel-echo";
import { useAuthStore } from "@/store/auth";
import { EchoProvider } from "../EchoProvider";

jest.mock("laravel-echo", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    private: jest.fn().mockReturnValue({ notification: jest.fn() }),
    disconnect: jest.fn(),
  })),
}));

jest.mock("pusher-js/react-native", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn(),
}));

const MockEcho = Echo as jest.MockedClass<typeof Echo>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  }
  return Wrapper;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EchoProvider", () => {
  it("renders nothing (returns null)", () => {
    mockUseAuthStore.mockImplementation((sel: any) =>
      sel({ token: null, user: null, activeBranch: null }),
    );
    const { toJSON } = render(<EchoProvider />, { wrapper: makeWrapper() });
    expect(toJSON()).toBeNull();
  });

  it("does not connect when token is absent", () => {
    mockUseAuthStore.mockImplementation((sel: any) =>
      sel({ token: null, user: null, activeBranch: null }),
    );
    render(<EchoProvider />, { wrapper: makeWrapper() });
    expect(MockEcho).not.toHaveBeenCalled();
  });

  it("connects when token and userId are present", () => {
    mockUseAuthStore.mockImplementation((sel: any) =>
      sel({ token: "bearer-token", user: { id: 42 }, activeBranch: null }),
    );
    render(<EchoProvider />, { wrapper: makeWrapper() });
    expect(MockEcho).toHaveBeenCalled();
  });

  it("disconnects on unmount", () => {
    mockUseAuthStore.mockImplementation((sel: any) =>
      sel({ token: "bearer-token", user: { id: 42 }, activeBranch: null }),
    );
    const { unmount } = render(<EchoProvider />, { wrapper: makeWrapper() });
    const echoInstance = MockEcho.mock.results[0].value as any;
    unmount();
    expect(echoInstance.disconnect).toHaveBeenCalled();
  });

  it("subscribes to staff.{userId} channel", () => {
    mockUseAuthStore.mockImplementation((sel: any) =>
      sel({ token: "bearer-token", user: { id: 99 }, activeBranch: null }),
    );
    render(<EchoProvider />, { wrapper: makeWrapper() });
    const echoInstance = MockEcho.mock.results[0].value as any;
    expect(echoInstance.private).toHaveBeenCalledWith("staff.99");
  });
});
