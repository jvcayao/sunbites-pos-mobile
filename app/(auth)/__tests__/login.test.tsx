import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import LoginScreen from "../login";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/auth";
import { AxiosError } from "axios";
import type { ReactNode } from "react";

jest.mock("@/api/auth");
jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn(),
}));

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

const mockLogin = jest.fn();

function Wrapper({ children }: { children: ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>;
}

function renderLogin() {
  return render(<LoginScreen />, { wrapper: Wrapper });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuthStore.mockReturnValue({ login: mockLogin } as any);
});

// ── Form renders ──────────────────────────────────────────────────────────────

describe("LoginScreen — renders", () => {
  it("shows email input, password input, and sign-in button", () => {
    renderLogin();
    expect(screen.getByTestId("email-input")).toBeTruthy();
    expect(screen.getByTestId("password-input")).toBeTruthy();
    expect(screen.getByTestId("login-submit")).toBeTruthy();
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("LoginScreen — client-side validation", () => {
  it("shows email format error when invalid email is submitted", async () => {
    renderLogin();
    fireEvent.changeText(screen.getByTestId("email-input"), "not-an-email");
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(screen.getByText("Enter a valid email address")).toBeTruthy();
    });
  });

  it("shows password length error when password is too short", async () => {
    renderLogin();
    fireEvent.changeText(screen.getByTestId("email-input"), "user@example.com");
    fireEvent.changeText(screen.getByTestId("password-input"), "short");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeTruthy();
    });
  });

  it("does not call the API when validation fails", async () => {
    renderLogin();
    fireEvent.changeText(screen.getByTestId("email-input"), "bad-email");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(mockAuthApi.login).not.toHaveBeenCalled();
    });
  });
});

// ── Successful login ──────────────────────────────────────────────────────────

describe("LoginScreen — successful login", () => {
  it("calls authApi.login with the entered credentials", async () => {
    mockAuthApi.login.mockResolvedValue({
      data: { token: "tok", user: { id: 1 } },
    } as any);
    mockLogin.mockResolvedValue(undefined);
    renderLogin();
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@sunbites.com",
    );
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith(
        "user@sunbites.com",
        "password123",
      );
    });
  });
});

// ── Error states ──────────────────────────────────────────────────────────────

describe("LoginScreen — error states", () => {
  it("shows generic auth error for 401 response (prevents email enumeration)", async () => {
    const err = new AxiosError("Unauthorized", "401", {} as any, {}, {
      status: 401,
      data: { message: "Unauthorized" },
    } as any);
    mockAuthApi.login.mockRejectedValue(err);
    renderLogin();
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@sunbites.com",
    );
    fireEvent.changeText(screen.getByTestId("password-input"), "wrongpass");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(screen.getByText("Incorrect email or password.")).toBeTruthy();
    });
  });

  it("shows rate-limit message for 429 response", async () => {
    const err = new AxiosError(
      "Too Many Requests",
      "429",
      {} as any,
      {},
      {
        status: 429,
        data: {},
      } as any,
    );
    mockAuthApi.login.mockRejectedValue(err);
    renderLogin();
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@sunbites.com",
    );
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(
        screen.getByText("Too many attempts. Please wait a minute."),
      ).toBeTruthy();
    });
  });

  it("shows offline message when there is no network response", async () => {
    const err = new AxiosError("Network Error");
    // No response property — simulates network failure
    mockAuthApi.login.mockRejectedValue(err);
    renderLogin();
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@sunbites.com",
    );
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(
        screen.getByText(
          "No internet connection. Check your network and try again.",
        ),
      ).toBeTruthy();
    });
  });
});

// ── Loading state ─────────────────────────────────────────────────────────────

describe("LoginScreen — loading state", () => {
  it("disables the submit button while request is in flight", async () => {
    let resolve!: (v: any) => void;
    mockAuthApi.login.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderLogin();
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@sunbites.com",
    );
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      const btn = screen.getByTestId("login-submit");
      expect(btn.props.accessibilityState?.disabled).toBe(true);
    });
    // Cleanup — resolve the promise
    act(() => {
      resolve({ data: { token: "tok", user: { id: 1 } } });
    });
  });
});

// ── Rate limit lock ───────────────────────────────────────────────────────────

describe("LoginScreen — rate limit lock after 5 failures", () => {
  async function failLogin(times: number) {
    const err = new AxiosError("Unauthorized", "401", {} as any, {}, {
      status: 401,
      data: { message: "Unauthorized" },
    } as any);
    mockAuthApi.login.mockRejectedValue(err);
    for (let i = 0; i < times; i++) {
      fireEvent.press(screen.getByTestId("login-submit"));
      await waitFor(() => {
        expect(screen.getByText("Incorrect email or password.")).toBeTruthy();
      });
    }
  }

  it("locks the form and shows account-locked message after 5 failures", async () => {
    renderLogin();
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@sunbites.com",
    );
    fireEvent.changeText(screen.getByTestId("password-input"), "wrongpass1");
    await failLogin(5);
    await waitFor(() => {
      expect(screen.getByText(/Too many failed attempts/)).toBeTruthy();
    });
    const btn = screen.getByTestId("login-submit");
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });
});
