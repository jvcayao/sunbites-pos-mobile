import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PreRegistrationActions } from "../PreRegistrationActions";

const mockApprove = jest.fn();
const mockNavigateBack = jest.fn();
const mockOnRejectPress = jest.fn();
const mockOnReactivatePress = jest.fn();

jest.mock("@/hooks/usePreRegistrations", () => ({
  useApprovePreRegistration: () => ({
    mutate: mockApprove,
    isPending: false,
  }),
  useReactivatePreRegistration: () => ({
    mutate: mockReactivate,
    isPending: false,
  }),
}));

const mockReactivate = jest.fn();

jest.mock("@/store/auth", () => ({
  useAuthStore: (selector: (s: { user: { roles: string[] } }) => unknown) =>
    selector({ user: { roles: ["admin"] } }),
}));

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(ui, {
    wrapper: ({ children }) => (
      <PaperProvider>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </PaperProvider>
    ),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("PreRegistrationActions — pending status (admin)", () => {
  it("shows Approve and Reject buttons for pending status", () => {
    wrap(
      <PreRegistrationActions
        preRegistrationId={5}
        status="pending"
        onRejectPress={mockOnRejectPress}
        onReactivatePress={mockOnReactivatePress}
        onApproveSuccess={mockNavigateBack}
      />,
    );
    expect(screen.getByTestId("approve-btn")).toBeTruthy();
    expect(screen.getByTestId("reject-btn")).toBeTruthy();
  });

  it("calls approve mutation with pre-registration id when Approve is pressed", () => {
    wrap(
      <PreRegistrationActions
        preRegistrationId={5}
        status="pending"
        onRejectPress={mockOnRejectPress}
        onReactivatePress={mockOnReactivatePress}
        onApproveSuccess={mockNavigateBack}
      />,
    );
    fireEvent.press(screen.getByTestId("approve-btn"));
    expect(mockApprove).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("calls onRejectPress when Reject is pressed", () => {
    wrap(
      <PreRegistrationActions
        preRegistrationId={5}
        status="pending"
        onRejectPress={mockOnRejectPress}
        onReactivatePress={mockOnReactivatePress}
        onApproveSuccess={mockNavigateBack}
      />,
    );
    fireEvent.press(screen.getByTestId("reject-btn"));
    expect(mockOnRejectPress).toHaveBeenCalled();
  });
});

describe("PreRegistrationActions — expired status", () => {
  it("shows Reactivate button for expired status", () => {
    wrap(
      <PreRegistrationActions
        preRegistrationId={3}
        status="expired"
        onRejectPress={mockOnRejectPress}
        onReactivatePress={mockOnReactivatePress}
        onApproveSuccess={mockNavigateBack}
      />,
    );
    expect(screen.getByTestId("reactivate-btn")).toBeTruthy();
    expect(screen.queryByTestId("approve-btn")).toBeNull();
  });
});

describe("PreRegistrationActions — approved/rejected status", () => {
  it("shows no action buttons for approved status", () => {
    wrap(
      <PreRegistrationActions
        preRegistrationId={7}
        status="approved"
        onRejectPress={mockOnRejectPress}
        onReactivatePress={mockOnReactivatePress}
        onApproveSuccess={mockNavigateBack}
      />,
    );
    expect(screen.queryByTestId("approve-btn")).toBeNull();
    expect(screen.queryByTestId("reject-btn")).toBeNull();
    expect(screen.queryByTestId("reactivate-btn")).toBeNull();
  });
});
