import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { AnnouncementRow } from "../AnnouncementRow";
import type { AnnouncementListItem } from "@/types/announcement";

const parentsAnnouncement: AnnouncementListItem = {
  id: 1,
  title: "Holiday Notice",
  message_preview: "Canteen will be closed on Monday.",
  sender_name: "Admin User",
  recipient_type: "parents",
  recipient_count: 12,
  read_count: 8,
  created_at: "2026-06-20T08:00:00Z",
};

const staffAnnouncement: AnnouncementListItem = {
  id: 2,
  title: null,
  message_preview: "Please complete your timesheets.",
  sender_name: "Manager",
  recipient_type: "staff",
  recipient_count: 5,
  read_count: 5,
  created_at: "2026-06-19T08:00:00Z",
};

describe("AnnouncementRow", () => {
  it("displays sender name", () => {
    render(
      <AnnouncementRow
        announcement={parentsAnnouncement}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Admin User")).toBeTruthy();
  });

  it("displays message preview", () => {
    render(
      <AnnouncementRow
        announcement={parentsAnnouncement}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Canteen will be closed on Monday.")).toBeTruthy();
  });

  it("displays recipient count", () => {
    render(
      <AnnouncementRow
        announcement={parentsAnnouncement}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("12 recipients")).toBeTruthy();
  });

  it("displays read summary", () => {
    render(
      <AnnouncementRow
        announcement={parentsAnnouncement}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("8/12 read")).toBeTruthy();
  });

  it("shows Parents badge for parents recipient type", () => {
    render(
      <AnnouncementRow
        announcement={parentsAnnouncement}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Parents")).toBeTruthy();
  });

  it("shows Staff badge for staff recipient type", () => {
    render(
      <AnnouncementRow announcement={staffAnnouncement} onPress={jest.fn()} />,
    );
    expect(screen.getByText("Staff")).toBeTruthy();
  });

  it("calls onPress when row is tapped", () => {
    const onPress = jest.fn();
    render(
      <AnnouncementRow announcement={parentsAnnouncement} onPress={onPress} />,
    );
    fireEvent.press(screen.getByTestId("announcement-row"));
    expect(onPress).toHaveBeenCalledWith(1);
  });

  it("shows title when present", () => {
    render(
      <AnnouncementRow
        announcement={parentsAnnouncement}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Holiday Notice")).toBeTruthy();
  });
});
