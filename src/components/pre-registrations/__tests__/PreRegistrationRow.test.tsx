import { render, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { PreRegistrationRow } from "../PreRegistrationRow";
import type { PreRegistrationListItem } from "@/types/pre-registration";

const mockOnPress = jest.fn();

function wrap(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <PaperProvider>{children}</PaperProvider>,
  });
}

const pendingItem: PreRegistrationListItem = {
  id: 1,
  first_name: "Maria",
  last_name: "Santos",
  full_name: "Maria Santos",
  status: "pending",
  enrollment_type: "subscription",
  submitted_at: "2026-06-15T00:00:00Z",
  expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  contact_name: "Jose Santos",
};

const nonSubscriptionItem: PreRegistrationListItem = {
  id: 2,
  first_name: "Carlos",
  last_name: "Reyes",
  full_name: "Carlos Reyes",
  status: "pending",
  enrollment_type: "non_subscription",
  submitted_at: "2026-06-14T00:00:00Z",
  expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  contact_name: "Ana Reyes",
};

beforeEach(() => jest.clearAllMocks());

describe("PreRegistrationRow", () => {
  it("renders student full name", () => {
    wrap(<PreRegistrationRow item={pendingItem} onPress={mockOnPress} />);
    expect(screen.getByText("Maria Santos")).toBeTruthy();
  });

  it("renders contact name", () => {
    wrap(<PreRegistrationRow item={pendingItem} onPress={mockOnPress} />);
    expect(screen.getByText(/Jose Santos/)).toBeTruthy();
  });

  it("shows Subscription badge for subscription enrollment type", () => {
    wrap(<PreRegistrationRow item={pendingItem} onPress={mockOnPress} />);
    expect(screen.getByText("Subscription")).toBeTruthy();
  });

  it("shows Non-Subscription badge for non_subscription enrollment type", () => {
    wrap(
      <PreRegistrationRow item={nonSubscriptionItem} onPress={mockOnPress} />,
    );
    expect(screen.getByText("Non-Subscription")).toBeTruthy();
  });

  it("shows expiry warning indicator when expiring within 3 days", () => {
    wrap(<PreRegistrationRow item={pendingItem} onPress={mockOnPress} />);
    expect(screen.getByTestId("expiry-warning")).toBeTruthy();
  });

  it("does not show expiry warning when not expiring soon", () => {
    wrap(
      <PreRegistrationRow item={nonSubscriptionItem} onPress={mockOnPress} />,
    );
    expect(screen.queryByTestId("expiry-warning")).toBeNull();
  });

  it("does not show expiry date when status is not pending", () => {
    const approvedItem = { ...pendingItem, status: "approved" as const };
    wrap(<PreRegistrationRow item={approvedItem} onPress={mockOnPress} />);
    expect(screen.queryByTestId("expiry-warning")).toBeNull();
  });

  it("calls onPress with item id when row is pressed", () => {
    wrap(<PreRegistrationRow item={pendingItem} onPress={mockOnPress} />);
    fireEvent.press(screen.getByTestId("pre-reg-row-1"));
    expect(mockOnPress).toHaveBeenCalledWith(1);
  });
});
