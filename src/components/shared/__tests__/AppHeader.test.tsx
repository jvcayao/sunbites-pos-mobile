import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { useAuthStore } from "@/store/auth";
import { AppHeader } from "../AppHeader";

jest.mock("@/hooks/useNotifications", () => ({
  useNotificationUnreadCount: jest.fn(() => ({ data: { count: 0 } })),
}));

jest.mock("@/components/notifications/NotificationBell", () => ({
  NotificationBell: function MockBell() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "notification-bell" }, "Bell");
  },
}));

const mockBranch = { id: 1, name: "Main Branch", slug: "main-branch" };

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ activeBranch: mockBranch, token: null, user: null });
});

describe("AppHeader — BranchPill integration", () => {
  it("renders BranchPill by default", () => {
    render(<AppHeader title="Dashboard" />);
    expect(screen.getByText("Main Branch")).toBeTruthy();
  });

  it("hides BranchPill when showBranchPill is false", () => {
    render(<AppHeader title="More" showBranchPill={false} />);
    expect(screen.queryByText("Main Branch")).toBeNull();
  });

  it("renders custom right content alongside BranchPill", () => {
    render(
      <AppHeader
        title="POS"
        right={<Text testID="custom-right">Custom</Text>}
      />,
    );
    expect(screen.getByText("Main Branch")).toBeTruthy();
    expect(screen.getByTestId("custom-right")).toBeTruthy();
  });

  it("always renders NotificationBell last", () => {
    render(<AppHeader title="Dashboard" />);
    expect(screen.getByTestId("notification-bell")).toBeTruthy();
  });
});
