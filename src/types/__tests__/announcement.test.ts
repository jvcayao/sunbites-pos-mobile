import type {
  AnnouncementListItem,
  AnnouncementDetail,
  AnnouncementRecipient,
  CreateAnnouncementDto,
  RecipientType,
} from "../announcement";

describe("announcement types shape", () => {
  it("AnnouncementListItem accepts valid object", () => {
    const item: AnnouncementListItem = {
      id: 1,
      title: "School Closure",
      message_preview: "The canteen will be closed tomorrow.",
      sender_name: "Admin User",
      recipient_type: "parents",
      recipient_count: 12,
      read_count: 8,
      created_at: "2026-06-20T08:00:00Z",
    };
    expect(item.id).toBe(1);
    expect(item.recipient_type).toBe("parents");
  });

  it("AnnouncementListItem allows null title", () => {
    const item: AnnouncementListItem = {
      id: 2,
      title: null,
      message_preview: "No title announcement",
      sender_name: "Manager",
      recipient_type: "staff",
      recipient_count: 5,
      read_count: 5,
      created_at: "2026-06-20T08:00:00Z",
    };
    expect(item.title).toBeNull();
  });

  it("AnnouncementRecipient accepts valid object", () => {
    const recipient: AnnouncementRecipient = {
      id: 100,
      full_name: "Maria Santos",
      read_at: "2026-06-20T10:00:00Z",
    };
    expect(recipient.full_name).toBe("Maria Santos");
  });

  it("AnnouncementRecipient allows null read_at", () => {
    const recipient: AnnouncementRecipient = {
      id: 101,
      full_name: "Ana Reyes",
      read_at: null,
    };
    expect(recipient.read_at).toBeNull();
  });

  it("AnnouncementDetail extends AnnouncementListItem with message and recipients", () => {
    const detail: AnnouncementDetail = {
      id: 1,
      title: "Holiday Notice",
      message_preview: "The canteen will be closed...",
      sender_name: "Admin",
      recipient_type: "parents",
      recipient_count: 3,
      read_count: 1,
      created_at: "2026-06-20T08:00:00Z",
      message:
        "The canteen will be closed on Monday due to a national holiday.",
      recipients: [
        { id: 1, full_name: "Parent A", read_at: "2026-06-20T09:00:00Z" },
        { id: 2, full_name: "Parent B", read_at: null },
      ],
    };
    expect(detail.message).toBeTruthy();
    expect(detail.recipients).toHaveLength(2);
  });

  it("CreateAnnouncementDto accepts valid payload", () => {
    const dto: CreateAnnouncementDto = {
      message: "Reminder: canteen closed.",
      recipient_type: "staff",
      recipient_ids: [1, 2, 3],
    };
    expect(dto.recipient_ids).toHaveLength(3);
  });

  it("CreateAnnouncementDto allows optional title", () => {
    const dto: CreateAnnouncementDto = {
      title: "Optional Title",
      message: "With a title this time.",
      recipient_type: "parents",
      recipient_ids: [10],
    };
    expect(dto.title).toBe("Optional Title");
  });

  it("RecipientType is parents or staff", () => {
    const r1: RecipientType = "parents";
    const r2: RecipientType = "staff";
    expect(["parents", "staff"]).toContain(r1);
    expect(["parents", "staff"]).toContain(r2);
  });
});
