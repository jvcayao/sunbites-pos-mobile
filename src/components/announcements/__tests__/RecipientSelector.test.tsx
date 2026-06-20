import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { RecipientSelector } from "../RecipientSelector";

const recipients = [
  { id: 1, full_name: "Maria Santos" },
  { id: 2, full_name: "Ana Reyes" },
  { id: 3, full_name: "Juan dela Cruz" },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>;
}

describe("RecipientSelector", () => {
  it("renders all recipient names", () => {
    render(
      <RecipientSelector
        recipients={recipients}
        selectedIds={[]}
        onToggle={jest.fn()}
        onSelectAll={jest.fn()}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText("Maria Santos")).toBeTruthy();
    expect(screen.getByText("Ana Reyes")).toBeTruthy();
    expect(screen.getByText("Juan dela Cruz")).toBeTruthy();
  });

  it("calls onToggle with id when a recipient is pressed", () => {
    const onToggle = jest.fn();
    render(
      <RecipientSelector
        recipients={recipients}
        selectedIds={[]}
        onToggle={onToggle}
        onSelectAll={jest.fn()}
      />,
      { wrapper: Wrapper },
    );
    fireEvent.press(screen.getByTestId("recipient-row-1"));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it("shows checkmark for selected recipients", () => {
    render(
      <RecipientSelector
        recipients={recipients}
        selectedIds={[1, 3]}
        onToggle={jest.fn()}
        onSelectAll={jest.fn()}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("check-icon-1")).toBeTruthy();
    expect(screen.getByTestId("check-icon-3")).toBeTruthy();
    expect(screen.queryByTestId("check-icon-2")).toBeNull();
  });

  it("calls onSelectAll when Select All is pressed", () => {
    const onSelectAll = jest.fn();
    render(
      <RecipientSelector
        recipients={recipients}
        selectedIds={[]}
        onToggle={jest.fn()}
        onSelectAll={onSelectAll}
      />,
      { wrapper: Wrapper },
    );
    fireEvent.press(screen.getByTestId("select-all-row"));
    expect(onSelectAll).toHaveBeenCalled();
  });

  it("filters recipients based on search query", () => {
    render(
      <RecipientSelector
        recipients={recipients}
        selectedIds={[]}
        onToggle={jest.fn()}
        onSelectAll={jest.fn()}
      />,
      { wrapper: Wrapper },
    );
    fireEvent.changeText(screen.getByTestId("recipient-search"), "Maria");
    expect(screen.getByText("Maria Santos")).toBeTruthy();
    expect(screen.queryByText("Ana Reyes")).toBeNull();
    expect(screen.queryByText("Juan dela Cruz")).toBeNull();
  });

  it("shows empty state when search finds no results", () => {
    render(
      <RecipientSelector
        recipients={recipients}
        selectedIds={[]}
        onToggle={jest.fn()}
        onSelectAll={jest.fn()}
      />,
      { wrapper: Wrapper },
    );
    fireEvent.changeText(screen.getByTestId("recipient-search"), "zzzxxx");
    expect(screen.getByText("No recipients found")).toBeTruthy();
  });

  it("shows loading indicator when isLoading is true", () => {
    render(
      <RecipientSelector
        recipients={[]}
        selectedIds={[]}
        onToggle={jest.fn()}
        onSelectAll={jest.fn()}
        isLoading
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("recipients-loading")).toBeTruthy();
  });
});
