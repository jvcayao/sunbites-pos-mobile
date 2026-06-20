import { render, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { DuplicateWarningSheet } from "../DuplicateWarningSheet";

jest.mock("@/lib/formatters", () => ({
  formatDate: (s: string) => s,
  formatCurrency: (n: number) => `₱${n}`,
}));

const alreadySentParents = [
  { id: 1, full_name: "Maria Santos", last_sent_at: "2026-06-10T08:00:00Z" },
  { id: 2, full_name: "Juan dela Cruz", last_sent_at: "2026-06-11T09:00:00Z" },
];

function wrap(element: React.ReactElement): React.ReactElement {
  return <PaperProvider>{element}</PaperProvider>;
}

beforeEach(() => jest.clearAllMocks());

describe("DuplicateWarningSheet", () => {
  it("is not visible when visible=false", () => {
    render(
      wrap(
        <DuplicateWarningSheet
          visible={false}
          alreadySentParents={alreadySentParents}
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
        />,
      ),
    );
    expect(screen.queryByTestId("duplicate-sheet")).toBeNull();
  });

  it("lists already-sent parent names when visible", () => {
    render(
      wrap(
        <DuplicateWarningSheet
          visible
          alreadySentParents={alreadySentParents}
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
        />,
      ),
    );
    expect(screen.getByText("Maria Santos")).toBeTruthy();
    expect(screen.getByText("Juan dela Cruz")).toBeTruthy();
  });

  it("calls onConfirm when confirm button is pressed", () => {
    const onConfirm = jest.fn();
    render(
      wrap(
        <DuplicateWarningSheet
          visible
          alreadySentParents={alreadySentParents}
          onConfirm={onConfirm}
          onDismiss={jest.fn()}
        />,
      ),
    );
    fireEvent.press(screen.getByTestId("duplicate-confirm-btn"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onDismiss when cancel button is pressed", () => {
    const onDismiss = jest.fn();
    render(
      wrap(
        <DuplicateWarningSheet
          visible
          alreadySentParents={alreadySentParents}
          onConfirm={jest.fn()}
          onDismiss={onDismiss}
        />,
      ),
    );
    fireEvent.press(screen.getByTestId("duplicate-cancel-btn"));
    expect(onDismiss).toHaveBeenCalled();
  });
});
