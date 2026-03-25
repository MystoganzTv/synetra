const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const weekdayDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not set";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "Not scheduled";
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) return "Not set";
  return timeFormatter.format(new Date(value));
}

export function formatWeekdayDate(value: string | Date | null | undefined) {
  if (!value) return "Not set";
  return weekdayDateFormatter.format(new Date(value));
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function calculateAge(dateOfBirth: string | Date) {
  const birthDate = new Date(dateOfBirth);
  const today = getNow();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}
import { getNow } from "@/lib/time";
