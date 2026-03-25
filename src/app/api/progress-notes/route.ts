import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createEntityId,
  getEnumField,
  getStringField,
  noteStatusOptions,
} from "@/lib/ops-create";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(new URL("/progress-notes?error=unavailable", request.url), 303);
  }

  const formData = await request.formData();
  const sessionId = getStringField(formData, "sessionId", 120);
  const authorName = getStringField(formData, "authorName", 120) || session.name;
  const status = getEnumField(formData, "status", noteStatusOptions, "DRAFT");
  const subjective = getStringField(formData, "subjective", 2000);
  const objective = getStringField(formData, "objective", 2000);
  const assessment = getStringField(formData, "assessment", 2000);
  const plan = getStringField(formData, "plan", 2000);
  const incidentReported = formData.get("incidentReported") === "on";

  if (!sessionId || !subjective || !objective || !assessment || !plan) {
    return NextResponse.redirect(
      new URL(`/sessions/${sessionId}/notes/new?error=invalid`, request.url),
      303,
    );
  }

  try {
    const existing = await prisma.progressNote.findFirst({
      where: { sessionId },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.redirect(
        new URL(`/sessions/${sessionId}?error=note_exists`, request.url),
        303,
      );
    }

    const submittedAt = status === "DRAFT" ? null : new Date();
    const signedAt = status === "SIGNED" ? new Date() : null;

    await prisma.$transaction(async (tx) => {
      await tx.progressNote.create({
        data: {
          id: createEntityId("note"),
          sessionId,
          authorName,
          status,
          submittedAt,
          signedAt,
          subjective,
          objective,
          assessment,
          plan,
          incidentReported,
        },
      });

      await tx.session.update({
        where: { id: sessionId },
        data: {
          noteStatus: status,
          billingStatus: status === "SIGNED" ? "READY" : "HOLD",
        },
      });
    });
  } catch (error) {
    console.error("[progress-notes] Failed to create note", error);
    return NextResponse.redirect(
      new URL(`/sessions/${sessionId}/notes/new?error=unavailable`, request.url),
      303,
    );
  }

  return NextResponse.redirect(new URL(`/sessions/${sessionId}?created=note`, request.url), 303);
}
