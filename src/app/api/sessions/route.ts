import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  addDays,
  addHours,
  createEntityId,
  getEnumField,
  getIntegerField,
  getOptionalStringField,
  getStringField,
  parseDateTimeInput,
  sessionStatusOptions,
} from "@/lib/ops-create";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, "/cases?error=unavailable"),
      303,
    );
  }

  const formData = await request.formData();
  const clientId = getStringField(formData, "clientId", 120);
  const caseId = getStringField(formData, "caseId", 120);
  const serviceId = getStringField(formData, "serviceId", 120);
  const authorizationId = getOptionalStringField(formData, "authorizationId", 120);
  const employeeId = getOptionalStringField(formData, "employeeId", 120);
  const scheduledStart = parseDateTimeInput(getStringField(formData, "scheduledStart", 40));
  const scheduledEnd =
    parseDateTimeInput(getStringField(formData, "scheduledEnd", 40)) ??
    (scheduledStart ? addHours(scheduledStart, 1) : null);
  const documentationDueAt =
    parseDateTimeInput(getStringField(formData, "documentationDueAt", 40)) ??
    (scheduledEnd ? addDays(scheduledEnd, 1) : null);
  const location = getStringField(formData, "location", 120) || "Virtual";
  const sessionType = getStringField(formData, "sessionType", 120) || "Seguimiento TCM";
  const attendanceStatus = getEnumField(
    formData,
    "attendanceStatus",
    sessionStatusOptions,
    "COMPLETED",
  );
  const unitsRendered = getIntegerField(formData, "unitsRendered", 1);

  if (!clientId || !caseId || !serviceId || !scheduledStart || !scheduledEnd) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/cases/${caseId}/sessions/new?error=invalid`),
      303,
    );
  }

  const sessionId = createEntityId("session");

  try {
    await prisma.session.create({
      data: {
        id: sessionId,
        clientId,
        caseId,
        serviceId,
        authorizationId,
        employeeId,
        scheduledStart,
        scheduledEnd,
        location,
        sessionType,
        attendanceStatus,
        unitsRendered: Math.max(unitsRendered, 1),
        noteStatus: "DRAFT",
        billingStatus: "HOLD",
        documentationDueAt,
      },
    });
  } catch (error) {
    console.error("[sessions] Failed to create session", error);
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/cases/${caseId}/sessions/new?error=unavailable`),
      303,
    );
  }

  return NextResponse.redirect(
    getPublicRedirectUrl(request, `/sessions/${sessionId}?created=session`),
    303,
  );
}
