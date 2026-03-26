import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCase } from "@/lib/data";
import {
  caseStatusOptions,
  getEnumField,
  getOptionalStringField,
  getStringField,
  parseDateInput,
} from "@/lib/ops-create";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/cases?error=unavailable"), 303);
  }

  const { caseId } = await params;
  const existingCase = await getCase(caseId);

  if (!existingCase) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/cases?error=forbidden"), 303);
  }

  const formData = await request.formData();
  const programName = getStringField(formData, "programName", 160);
  const payerName = getStringField(formData, "payerName", 160);
  const clinicalLead = getStringField(formData, "clinicalLead", 120);
  const renderingProvider = getOptionalStringField(formData, "renderingProvider", 120);
  const location = getStringField(formData, "location", 120);
  const status = getEnumField(formData, "status", caseStatusOptions, existingCase.caseRecord.status);
  const startDate = parseDateInput(getStringField(formData, "startDate", 20));
  const endDateInput = getStringField(formData, "endDate", 20);
  const endDate = parseDateInput(endDateInput);
  const acuityLevel = getStringField(formData, "acuityLevel", 80);
  const carePlanSummary = getOptionalStringField(formData, "carePlanSummary", 1500);
  const transferOwnerEmail = getOptionalStringField(formData, "transferOwnerEmail", 160)?.toLowerCase() ?? null;

  if (!programName || !payerName || !clinicalLead || !location || !startDate) {
    return NextResponse.redirect(getPublicRedirectUrl(request, `/cases/${caseId}/edit?error=invalid`), 303);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.case.update({
        where: { id: caseId },
        data: {
          programName,
          payerName,
          clinicalLead,
          renderingProvider,
          location,
          status,
          startDate,
          endDate: status === "CLOSED" ? endDate ?? new Date() : endDate,
          acuityLevel,
          carePlanSummary,
        },
      });

      if (transferOwnerEmail) {
        await tx.client.update({
          where: { id: existingCase.client.id },
          data: { ownerEmail: transferOwnerEmail },
        });
      }
    });
  } catch (error) {
    console.error("[cases] Failed to update case", error);
    return NextResponse.redirect(getPublicRedirectUrl(request, `/cases/${caseId}/edit?error=unavailable`), 303);
  }

  return NextResponse.redirect(getPublicRedirectUrl(request, `/cases/${caseId}?updated=case`), 303);
}
