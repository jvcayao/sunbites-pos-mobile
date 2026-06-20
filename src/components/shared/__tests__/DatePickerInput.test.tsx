import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { DatePickerInput } from "../DatePickerInput";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>;
}

function renderPicker(
  props: Partial<Parameters<typeof DatePickerInput>[0]> = {},
) {
  return render(
    <DatePickerInput
      label="Birthday *"
      value={props.value ?? ""}
      onChange={props.onChange ?? jest.fn()}
      {...props}
    />,
    { wrapper: Wrapper },
  );
}

describe("DatePickerInput — display", () => {
  it("shows placeholder when value is empty", () => {
    renderPicker({ value: "" });
    expect(screen.getByText("Select Birthday *")).toBeTruthy();
  });

  it("shows formatted date MMM DD, YYYY when value is YYYY-MM-DD", () => {
    renderPicker({ value: "2010-03-15" });
    expect(screen.getByText("Mar 15, 2010")).toBeTruthy();
  });
});

describe("DatePickerInput — interaction", () => {
  it("opens date picker modal when field is pressed", () => {
    renderPicker({ value: "" });
    fireEvent.press(screen.getByTestId("date-picker-trigger"));
    expect(screen.getByTestId("date-picker-modal")).toBeTruthy();
  });

  it("calls onChange with YYYY-MM-DD string when date is confirmed", () => {
    const onChange = jest.fn();
    renderPicker({ value: "2010-03-15", onChange });
    fireEvent.press(screen.getByTestId("date-picker-trigger"));
    fireEvent.press(screen.getByTestId("date-picker-confirm"));
    expect(onChange).toHaveBeenCalledWith("2010-03-15");
  });
});
