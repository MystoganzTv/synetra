export const APP_TIMEZONE = process.env.NEXORA_TIMEZONE || "America/New_York";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getNow() {
  return new Date();
}

export function getDateKey(value: string | Date, timeZone = APP_TIMEZONE) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function getTimeParts(value: string | Date, timeZone = APP_TIMEZONE) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return { hour, minute };
}

export function dateFromKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00Z`);
}

export function addDays(date: Date, offset: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + offset);
  return copy;
}

export function addDaysToDateKey(dateKey: string, offset: number) {
  const date = dateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + offset);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getWeekDateKeys(anchor: Date = getNow(), timeZone = APP_TIMEZONE, count = 7) {
  const anchorKey = getDateKey(anchor, timeZone);
  const anchorDate = dateFromKey(anchorKey);
  const weekday = anchorDate.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const weekStartKey = addDaysToDateKey(anchorKey, mondayOffset);

  return Array.from({ length: count }, (_, index) => addDaysToDateKey(weekStartKey, index));
}
