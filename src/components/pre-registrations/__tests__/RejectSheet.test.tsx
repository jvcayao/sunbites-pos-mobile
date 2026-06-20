import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RejectSheet } from "../RejectSheet";

jest.mock("@/hooks/usePreRegistrations", () => ({
  useRejectPreRegistration: () => ({
    mutate: mockReject,
    isPending: false,
  }),
}));

const mockReject = jest.fn();
const mockOnDismiss = jest.fn();
const mockOnSuccess = jest.fn();

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

describe("RejectSheet", () => {
  it("renders the sheet with title when visible", () => {
    wrap(
      <RejectSheet
        preRegistrationId={5}
        visible={true}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    );
    expect(screen.getByText("Reject Pre-Registration")).toBeTruthy();
  });

  it("Confirm Rejection button is disabled when reason is empty", () => {
    wrap(
      <RejectSheet
        preRegistrationId={5}
        visible={true}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    );
    const confirmBtn = screen.getByTestId("confirm-rejection-btn");
    expect(confirmBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("Confirm Rejection button is disabled when reason is fewer than 10 chars", () => {
    wrap(
      <RejectSheet
        preRegistrationId={5}
        visible={true}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    );
    fireEvent.changeText(
      screen.getByTestId("rejection-reason-input"),
      "Too short",
    );
    const confirmBtn = screen.getByTestId("confirm-rejection-btn");
    expect(confirmBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("Confirm Rejection button becomes enabled when reason has 10+ chars", () => {
    wrap(
      <RejectSheet
        preRegistrationId={5}
        visible={true}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    );
    fireEvent.changeText(
      screen.getByTestId("rejection-reason-input"),
      "Incomplete information provided.",
    );
    const confirmBtn = screen.getByTestId("confirm-rejection-btn");
    expect(confirmBtn.props.accessibilityState?.disabled).toBe(false);
  });

  it("calls reject mutation with pre-registration id and reason on confirm", () => {
    wrap(
      <RejectSheet
        preRegistrationId={5}
        visible={true}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    );
    fireEvent.changeText(
      screen.getByTestId("rejection-reason-input"),
      "Incomplete information provided.",
    );
    fireEvent.press(screen.getByTestId("confirm-rejection-btn"));
    expect(mockReject).toHaveBeenCalledWith(
      { id: 5, rejection_reason: "Incomplete information provided." },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("calls onDismiss when Cancel is pressed", () => {
    wrap(
      <RejectSheet
        preRegistrationId={5}
        visible={true}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    );
    fireEvent.press(screen.getByTestId("cancel-rejection-btn"));
    expect(mockOnDismiss).toHaveBeenCalled();
  });
});
