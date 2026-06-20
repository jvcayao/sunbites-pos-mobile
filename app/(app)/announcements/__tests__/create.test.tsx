import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateAnnouncementScreen from "../create";
import { useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { useToastStore } from "@/components/shared/ErrorToast";
import { referencesApi } from "@/api/references";
import { router } from "expo-router";

jest.mock("@/hooks/useAnnouncements", () => ({
  useCreateAnnouncement: jest.fn(),
}));

jest.mock("@/api/references", () => ({
  referencesApi: {
    parents: { list: jest.fn() },
    users: { list: jest.fn() },
  },
}));

const mockUseCreateAnnouncement = useCreateAnnouncement as jest.MockedFunction<
  typeof useCreateAnnouncement
>;
const mockParentsList = referencesApi.parents.list as jest.Mock;
const mockUsersList = referencesApi.users.list as jest.Mock;

const mockParents = [
  { id: 1, full_name: "Maria Santos" },
  { id: 2, full_name: "Ana Reyes" },
];

const mockStaff = [
  { id: 10, full_name: "Manager One" },
  { id: 11, full_name: "Supervisor Two" },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>{children}</PaperProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParentsList.mockResolvedValue({ data: { data: mockParents } });
  mockUsersList.mockResolvedValue({ data: { data: mockStaff } });
});

describe("CreateAnnouncementScreen — initial render", () => {
  it("shows message input and recipient type pill", async () => {
    mockUseCreateAnnouncement.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
    } as any);
    render(<CreateAnnouncementScreen />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByTestId("message-input")).toBeTruthy();
      expect(screen.getByTestId("pill-parents")).toBeTruthy();
      expect(screen.getByTestId("pill-staff")).toBeTruthy();
    });
  });

  it("send button is disabled when message is empty", async () => {
    mockUseCreateAnnouncement.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
    } as any);
    render(<CreateAnnouncementScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByTestId("send-button")).toBeTruthy());
    expect(screen.getByTestId("send-button")).toBeDisabled();
  });
});

describe("CreateAnnouncementScreen — character count", () => {
  it("shows live character count on message input", async () => {
    mockUseCreateAnnouncement.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
    } as any);
    render(<CreateAnnouncementScreen />, { wrapper: Wrapper });
    await waitFor(() =>
      expect(screen.getByTestId("message-input")).toBeTruthy(),
    );

    fireEvent.changeText(screen.getByTestId("message-input"), "Hello world");
    expect(screen.getByText("11/1000")).toBeTruthy();
  });
});

describe("CreateAnnouncementScreen — validation", () => {
  it("shows error when trying to send with no recipients selected", async () => {
    const mockMutate = jest.fn();
    mockUseCreateAnnouncement.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    } as any);
    render(<CreateAnnouncementScreen />, { wrapper: Wrapper });
    await waitFor(() =>
      expect(screen.getByTestId("message-input")).toBeTruthy(),
    );

    fireEvent.changeText(screen.getByTestId("message-input"), "Test message");

    await waitFor(() =>
      expect(screen.getByTestId("send-button")).not.toBeDisabled(),
    );
    fireEvent.press(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Please select at least one recipient"),
      ).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });
});

describe("CreateAnnouncementScreen — submit", () => {
  it("calls create mutation with correct payload when form is valid", async () => {
    const mockMutate = jest.fn();
    mockUseCreateAnnouncement.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    } as any);
    render(<CreateAnnouncementScreen />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(screen.getByTestId("message-input")).toBeTruthy(),
    );
    fireEvent.changeText(
      screen.getByTestId("message-input"),
      "Important announcement",
    );

    await waitFor(() =>
      expect(screen.getByTestId("recipient-row-1")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("recipient-row-1"));

    await waitFor(() =>
      expect(screen.getByTestId("send-button")).not.toBeDisabled(),
    );
    fireEvent.press(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Important announcement",
          recipient_type: "parents",
          recipient_ids: [1],
        }),
        expect.any(Object),
      );
    });
  });

  it("shows success toast and navigates back on successful submission", async () => {
    const mutate = jest.fn().mockImplementation((_data, opts) => {
      opts?.onSuccess?.();
    });
    mockUseCreateAnnouncement.mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: false,
    } as any);
    render(<CreateAnnouncementScreen />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(screen.getByTestId("message-input")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("message-input"), "Test");

    await waitFor(() =>
      expect(screen.getByTestId("recipient-row-1")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("recipient-row-1"));

    await waitFor(() =>
      expect(screen.getByTestId("send-button")).not.toBeDisabled(),
    );
    fireEvent.press(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(useToastStore.getState().message).toBe("Announcement sent");
      expect(useToastStore.getState().visible).toBe(true);
      expect(router.back).toHaveBeenCalled();
    });
  });
});
