import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { SelectInput } from "../SelectInput";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>;
}

const OPTIONS = ["Mother", "Father", "Guardian", "Other"];

function renderSelect(props: Partial<Parameters<typeof SelectInput>[0]> = {}) {
  return render(
    <SelectInput
      label="Relationship *"
      value={props.value ?? ""}
      options={props.options ?? OPTIONS}
      onChange={props.onChange ?? jest.fn()}
      {...props}
    />,
    { wrapper: Wrapper },
  );
}

describe("SelectInput — display", () => {
  it("shows placeholder when value is empty", () => {
    renderSelect({ value: "" });
    expect(screen.getByText("Select Relationship *")).toBeTruthy();
  });

  it("shows selected value when value is provided", () => {
    renderSelect({ value: "Mother" });
    expect(screen.getByText("Mother")).toBeTruthy();
  });
});

describe("SelectInput — interaction", () => {
  it("opens options list when field is pressed", () => {
    renderSelect({ value: "" });
    fireEvent.press(screen.getByTestId("select-input-trigger"));
    expect(screen.getByText("Mother")).toBeTruthy();
    expect(screen.getByText("Father")).toBeTruthy();
    expect(screen.getByText("Guardian")).toBeTruthy();
    expect(screen.getByText("Other")).toBeTruthy();
  });

  it("calls onChange with selected value and closes modal", () => {
    const onChange = jest.fn();
    renderSelect({ value: "", onChange });
    fireEvent.press(screen.getByTestId("select-input-trigger"));
    fireEvent.press(screen.getByTestId("select-option-Mother"));
    expect(onChange).toHaveBeenCalledWith("Mother");
  });
});
