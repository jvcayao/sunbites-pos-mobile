import { render, screen, fireEvent } from "@testing-library/react-native";
import { useAuthStore } from "@/store/auth";
import { performLogout } from "@/lib/logout";
import MoreScreen from "../index";

jest.mock("@/lib/logout", () => ({ performLogout: jest.fn() }));

jest.mock("@/components/shared/AppHeader", () => ({
  AppHeader: function MockHeader({ title }: { title: string }) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "app-header" }, title);
  },
}));

jest.mock("@/hooks/useLayout", () => ({
  useLayout: jest.fn(() => ({ isTablet: true, isLandscape: true })),
}));

const mockUser = {
  id: 1,
  first_name: "Juan",
  last_name: "dela Cruz",
  full_name: "Juan dela Cruz",
  email: "juan@sunbites.com",
  roles: ["admin" as const],
  branches: [],
};
const mockBranch = { id: 1, name: "Main Branch", slug: "main-branch" };

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: mockUser,
    activeBranch: mockBranch,
    token: "tok",
  });
});

describe("MoreScreen — user profile card", () => {
  it("renders user initials in avatar", () => {
    render(<MoreScreen />);
    expect(screen.getByText("JD")).toBeTruthy();
  });

  it("renders full name", () => {
    render(<MoreScreen />);
    expect(screen.getByText("Juan dela Cruz")).toBeTruthy();
  });

  it("renders email", () => {
    render(<MoreScreen />);
    expect(screen.getByText("juan@sunbites.com")).toBeTruthy();
  });

  it("renders capitalized role badge", () => {
    render(<MoreScreen />);
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("renders active branch name", () => {
    render(<MoreScreen />);
    expect(screen.getByText("Main Branch")).toBeTruthy();
  });

  it("renders EmptyState when user is null", () => {
    useAuthStore.setState({
      user: null,
      activeBranch: mockBranch,
      token: "tok",
    });
    render(<MoreScreen />);
    expect(screen.getByText("Session expired")).toBeTruthy();
  });
});

describe("MoreScreen — menu items", () => {
  it("renders Sign Out row", () => {
    render(<MoreScreen />);
    expect(screen.getByTestId("sign-out-row")).toBeTruthy();
  });

  it("calls performLogout when Sign Out is pressed", () => {
    render(<MoreScreen />);
    fireEvent.press(screen.getByTestId("sign-out-row"));
    expect(performLogout).toHaveBeenCalled();
  });

  it("renders placeholder items as disabled", () => {
    render(<MoreScreen />);
    expect(screen.getByTestId("placeholder-profile-settings")).toBeTruthy();
    expect(screen.getByTestId("placeholder-appearance")).toBeTruthy();
    expect(screen.getByTestId("placeholder-notifications")).toBeTruthy();
  });
});
