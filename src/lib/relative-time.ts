import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  parseISO,
  format,
} from "date-fns";

export function relativeTime(isoString: string): string {
  const date = parseISO(isoString);
  const now = new Date();
  const minutes = differenceInMinutes(now, date);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`;

  const days = differenceInDays(now, date);
  if (days === 1) return "Yesterday";

  return format(date, "MMM d");
}
