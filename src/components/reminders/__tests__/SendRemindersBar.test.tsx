import { render, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { SendRemindersBar } from "../SendRemindersBar";

function wrap(element: React.ReactElement): React.ReactElement {
  return <PaperProvider>{element}</PaperProvider>;
}

beforeEach(() => jest.clearAllMocks());

describe("SendRemindersBar", () => {
  it("shows selected count in button label", () => {
    render(
      wrap(
        <SendRemindersBar
          selectedCount={3}
          isWindowOpen
          isPending={false}
          onSend={jest.fn()}
        />,
      ),
    );
    expect(screen.getByText(/send \(3\)/i)).toBeTruthy();
  });

  it("button is disabled when no selection", () => {
    render(
      wrap(
        <SendRemindersBar
          selectedCount={0}
          isWindowOpen
          isPending={false}
          onSend={jest.fn()}
        />,
      ),
    );
    expect(
      screen.getByTestId("send-reminders-btn").props.accessibilityState
        ?.disabled,
    ).toBe(true);
  });

  it("button is disabled when outside reminder window", () => {
    render(
      wrap(
        <SendRemindersBar
          selectedCount={2}
          isWindowOpen={false}
          isPending={false}
          onSend={jest.fn()}
        />,
      ),
    );
    expect(
      screen.getByTestId("send-reminders-btn").props.accessibilityState
        ?.disabled,
    ).toBe(true);
  });

  it("button is disabled while pending", () => {
    render(
      wrap(
        <SendRemindersBar
          selectedCount={2}
          isWindowOpen
          isPending
          onSend={jest.fn()}
        />,
      ),
    );
    expect(
      screen.getByTestId("send-reminders-btn").props.accessibilityState
        ?.disabled,
    ).toBe(true);
  });

  it("calls onSend when button is pressed with valid selection in window", () => {
    const onSend = jest.fn();
    render(
      wrap(
        <SendRemindersBar
          selectedCount={2}
          isWindowOpen
          isPending={false}
          onSend={onSend}
        />,
      ),
    );
    fireEvent.press(screen.getByTestId("send-reminders-btn"));
    expect(onSend).toHaveBeenCalled();
  });

  it("shows window-closed note when outside reminder window", () => {
    render(
      wrap(
        <SendRemindersBar
          selectedCount={0}
          isWindowOpen={false}
          isPending={false}
          onSend={jest.fn()}
        />,
      ),
    );
    expect(screen.getByText(/outside reminder window/i)).toBeTruthy();
  });
});
