import { randomUUID } from "node:crypto";

import type {
  AuthorizationUnitType,
  CaseStatus,
  CaseType,
  ClientStatus,
  NoteStatus,
  RiskLevel,
  SessionStatus,
} from "@prisma/client";

export const clientStatusOptions = ["LEAD", "INTAKE", "ACTIVE", "HOLD"] as const satisfies readonly ClientStatus[];
export const riskLevelOptions = ["LOW", "MODERATE", "HIGH"] as const satisfies readonly RiskLevel[];
export const caseTypeOptions = [
  "CARE_COORDINATION",
  "ABA",
  "MENTAL_HEALTH",
  "SCHOOL_SUPPORT",
] as const satisfies readonly CaseType[];
export const caseStatusOptions = ["INTAKE", "ACTIVE", "ON_HOLD"] as const satisfies readonly CaseStatus[];
export const unitTypeOptions = ["UNITS", "HOURS", "VISITS"] as const satisfies readonly AuthorizationUnitType[];
export const sessionStatusOptions = [
  "SCHEDULED",
  "COMPLETED",
  "DOCUMENTATION_PENDING",
] as const satisfies readonly SessionStatus[];
export const noteStatusOptions = ["DRAFT", "PENDING_SIGNATURE", "SIGNED"] as const satisfies readonly NoteStatus[];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function randomDigits(length: number) {
  return randomUUID().replace(/[^0-9a-f]/g, "").slice(0, length).toUpperCase();
}

export function createEntityId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

export function createClientExternalId() {
  return `SYN-${randomDigits(8)}`;
}

export function createCaseNumber() {
  return `CASE-${randomDigits(8)}`;
}

export function createAuthorizationNumber() {
  return `AUTH-${randomDigits(8)}`;
}

export function getStringField(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export function getOptionalStringField(formData: FormData, key: string, maxLength: number) {
  const value = getStringField(formData, key, maxLength);
  return value || null;
}

export function getIntegerField(formData: FormData, key: string, fallback: number) {
  const value = Number.parseInt(getStringField(formData, key, 20), 10);
  return Number.isFinite(value) ? value : fallback;
}

export function getOptionalIntegerField(formData: FormData, key: string) {
  const value = getStringField(formData, key, 20);

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getEnumField<T extends string>(
  formData: FormData,
  key: string,
  values: readonly T[],
  fallback: T,
) {
  const value = getStringField(formData, key, 60) as T;
  return values.includes(value) ? value : fallback;
}

export function parseDateInput(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseDateTimeInput(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function formatDateTimeLocalInput(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatDateInput(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
