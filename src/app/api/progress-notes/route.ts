import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/data";
import {
  createEntityId,
  getEnumField,
  getStringField,
  noteStatusOptions,
} from "@/lib/ops-create";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, "/progress-notes?error=unavailable"),
      303,
    );
  }

  const formData = await request.formData();
  const sessionId = getStringField(formData, "sessionId", 120);
  const authorName = getStringField(formData, "authorName", 120) || session.name;
  const contactType = getStringField(formData, "contactType", 120);
  const participants = getStringField(formData, "participants", 300);
  const barriers = getStringField(formData, "barriers", 1500);
  const interventions = getStringField(formData, "interventions", 1500);
  const nextStep = getStringField(formData, "nextStep", 1500);
  const followUpAtInput = getStringField(formData, "followUpAt", 40);
  const status = getEnumField(formData, "status", noteStatusOptions, "DRAFT");
  const subjective = getStringField(formData, "subjective", 2000);
  const objective = getStringField(formData, "objective", 2000);
  const assessment = getStringField(formData, "assessment", 2000);
  const plan = getStringField(formData, "plan", 2000);
  const incidentReported = formData.get("incidentReported") === "on";

  if (!sessionId || !subjective || !objective || !assessment || !plan) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/sessions/${sessionId}/notes/new?error=invalid`),
      303,
    );
  }

  try {
    const sessionContext = await getSession(sessionId);

    if (!sessionContext) {
      return NextResponse.redirect(
        getPublicRedirectUrl(request, "/progress-notes?error=forbidden"),
        303,
      );
    }

    const existing = await prisma.progressNote.findFirst({
      where: { sessionId },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.redirect(
        getPublicRedirectUrl(request, `/sessions/${sessionId}?error=note_exists`),
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
          contactType: contactType || null,
          participants: participants || null,
          barriers: barriers || null,
          interventions: interventions || null,
          nextStep: nextStep || null,
          followUpAt: followUpAtInput ? new Date(followUpAtInput) : null,
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
      getPublicRedirectUrl(request, `/sessions/${sessionId}/notes/new?error=unavailable`),
      303,
    );
  }

  return NextResponse.redirect(
    getPublicRedirectUrl(request, `/sessions/${sessionId}?created=note`),
    303,
  );
}
