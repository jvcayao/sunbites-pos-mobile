import { render, screen } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";
import { Text, PaperProvider } from "react-native-paper";
import { useReminderBellCount } from "@/hooks/useReminders";

jest.mock("@/hooks/useReminders", () => ({
  useReminderBellCount: jest.fn(),
}));

const mockUseCount = useReminderBellCount as jest.MockedFunction<
  typeof useReminderBellCount
>;

// Minimal component that captures the badge logic used in _layout.tsx
function ReminderBadgeFixture(): React.JSX.Element {
  const { data } = useReminderBellCount();
  const count = data?.count ?? 0;
  return (
    <View>
      {count > 0 ? (
        <Text testID="reminder-badge">{count}</Text>
      ) : (
        <Text testID="reminder-badge-hidden">hidden</Text>
      )}
    </View>
  );
}

beforeEach(() => jest.clearAllMocks());

describe("Reminder tab badge logic", () => {
  it("shows badge when bell count is greater than 0", () => {
    mockUseCount.mockReturnValue({ data: { count: 3 } } as any);
    render(
      <PaperProvider>
        <ReminderBadgeFixture />
      </PaperProvider>,
    );
    expect(screen.getByTestId("reminder-badge")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("hides badge when bell count is 0", () => {
    mockUseCount.mockReturnValue({ data: { count: 0 } } as any);
    render(
      <PaperProvider>
        <ReminderBadgeFixture />
      </PaperProvider>,
    );
    expect(screen.queryByTestId("reminder-badge")).toBeNull();
    expect(screen.getByTestId("reminder-badge-hidden")).toBeTruthy();
  });

  it("hides badge when data is undefined", () => {
    mockUseCount.mockReturnValue({ data: undefined } as any);
    render(
      <PaperProvider>
        <ReminderBadgeFixture />
      </PaperProvider>,
    );
    expect(screen.queryByTestId("reminder-badge")).toBeNull();
  });
});
