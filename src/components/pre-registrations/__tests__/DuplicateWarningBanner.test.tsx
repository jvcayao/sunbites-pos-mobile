import { render, screen } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { DuplicateWarningBanner } from "../DuplicateWarningBanner";

function wrap(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <PaperProvider>{children}</PaperProvider>,
  });
}

describe("DuplicateWarningBanner", () => {
  it("renders warning message with existing student name", () => {
    wrap(
      <DuplicateWarningBanner
        duplicateWarning={true}
        existingStudentName="Ana Santos"
      />,
    );
    expect(screen.getByTestId("duplicate-warning-banner")).toBeTruthy();
    expect(screen.getByText(/Ana Santos/)).toBeTruthy();
  });

  it("is not rendered when duplicateWarning is false", () => {
    wrap(
      <DuplicateWarningBanner
        duplicateWarning={false}
        existingStudentName={null}
      />,
    );
    expect(screen.queryByTestId("duplicate-warning-banner")).toBeNull();
  });

  it("is not rendered when existingStudentName is null", () => {
    wrap(
      <DuplicateWarningBanner
        duplicateWarning={true}
        existingStudentName={null}
      />,
    );
    expect(screen.queryByTestId("duplicate-warning-banner")).toBeNull();
  });

  it("shows resolve instruction in banner text", () => {
    wrap(
      <DuplicateWarningBanner
        duplicateWarning={true}
        existingStudentName="Juan Cruz"
      />,
    );
    expect(screen.getByText(/Resolve before approving/i)).toBeTruthy();
  });
});
