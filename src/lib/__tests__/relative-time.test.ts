import { relativeTime } from "../relative-time";

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("relativeTime", () => {
  it('returns "just now" for less than 1 minute ago', () => {
    expect(relativeTime("2026-06-20T11:59:30Z")).toBe("just now");
  });

  it('returns "Xm ago" for less than 1 hour ago', () => {
    expect(relativeTime("2026-06-20T11:45:00Z")).toBe("15m ago");
  });

  it('returns "1h ago" for 60 minutes ago', () => {
    expect(relativeTime("2026-06-20T11:00:00Z")).toBe("1h ago");
  });

  it('returns "Xh ago" for less than 24 hours ago', () => {
    expect(relativeTime("2026-06-20T09:00:00Z")).toBe("3h ago");
  });

  it('returns "Yesterday" for exactly 24 hours ago', () => {
    expect(relativeTime("2026-06-19T12:00:00Z")).toBe("Yesterday");
  });

  it('returns "Mon D" format for older dates', () => {
    expect(relativeTime("2026-06-15T12:00:00Z")).toBe("Jun 15");
  });
});
