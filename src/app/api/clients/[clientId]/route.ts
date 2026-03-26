import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClient } from "@/lib/data";
import {
  clientStatusOptions,
  getEnumField,
  getOptionalStringField,
  getStringField,
  parseDateInput,
  riskLevelOptions,
} from "@/lib/ops-create";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/clients?error=unavailable"), 303);
  }

  const { clientId } = await params;
  const existingClient = await getClient(clientId);

  if (!existingClient) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/clients?error=forbidden"), 303);
  }

  const formData = await request.formData();
  const firstName = getStringField(formData, "firstName", 80);
  const lastName = getStringField(formData, "lastName", 80);
  const preferredName = getOptionalStringField(formData, "preferredName", 80);
  const dateOfBirth = parseDateInput(getStringField(formData, "dateOfBirth", 20));
  const email = getOptionalStringField(formData, "email", 160)?.toLowerCase() ?? null;
  const phone = getOptionalStringField(formData, "phone", 40);
  const city = getOptionalStringField(formData, "city", 80);
  const state = getOptionalStringField(formData, "state", 40);
  const primaryDiagnosisCode = getOptionalStringField(formData, "primaryDiagnosisCode", 40);
  const payerSegment = getOptionalStringField(formData, "payerSegment", 80);
  const referralSource = getOptionalStringField(formData, "referralSource", 120);
  const status = getEnumField(formData, "status", clientStatusOptions, existingClient.status);
  const riskLevel = getEnumField(formData, "riskLevel", riskLevelOptions, existingClient.riskLevel);

  if (!firstName || !lastName || !dateOfBirth) {
    return NextResponse.redirect(getPublicRedirectUrl(request, `/clients/${clientId}/edit?error=invalid`), 303);
  }

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        firstName,
        lastName,
        preferredName,
        dateOfBirth,
        email,
        phone,
        city,
        state,
        status,
        riskLevel,
        primaryDiagnosisCode,
        payerSegment,
        referralSource,
      },
    });
  } catch (error) {
    console.error("[clients] Failed to update client", error);
    return NextResponse.redirect(getPublicRedirectUrl(request, `/clients/${clientId}/edit?error=unavailable`), 303);
  }

  return NextResponse.redirect(getPublicRedirectUrl(request, `/clients/${clientId}?updated=client`), 303);
}
