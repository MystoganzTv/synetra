import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  clientStatusOptions,
  createClientExternalId,
  createEntityId,
  getEnumField,
  getOptionalStringField,
  getStringField,
  parseDateInput,
  riskLevelOptions,
} from "@/lib/ops-create";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(new URL("/clients/new?error=unavailable", request.url), 303);
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
  const status = getEnumField(formData, "status", clientStatusOptions, "INTAKE");
  const riskLevel = getEnumField(formData, "riskLevel", riskLevelOptions, "LOW");

  if (!firstName || !lastName || !dateOfBirth) {
    return NextResponse.redirect(new URL("/clients/new?error=invalid", request.url), 303);
  }

  const clientId = createEntityId("client");

  try {
    await prisma.client.create({
      data: {
        id: clientId,
        externalId: createClientExternalId(),
        firstName,
        lastName,
        preferredName,
        dateOfBirth,
        email,
        phone,
        city,
        state,
        timezone: "America/New_York",
        status,
        riskLevel,
        primaryDiagnosisCode,
        payerSegment,
        referralSource,
      },
    });
  } catch (error) {
    console.error("[clients] Failed to create client", error);
    return NextResponse.redirect(new URL("/clients/new?error=unavailable", request.url), 303);
  }

  return NextResponse.redirect(new URL(`/clients/${clientId}?created=client`, request.url), 303);
}
