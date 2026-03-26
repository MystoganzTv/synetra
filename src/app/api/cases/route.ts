import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClient } from "@/lib/data";
import {
  caseStatusOptions,
  caseTypeOptions,
  createAuthorizationNumber,
  createCaseNumber,
  createEntityId,
  getEnumField,
  getIntegerField,
  getOptionalIntegerField,
  getOptionalStringField,
  getStringField,
  parseDateInput,
  unitTypeOptions,
} from "@/lib/ops-create";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, "/clients?error=unavailable"),
      303,
    );
  }

  const formData = await request.formData();
  const clientId = getStringField(formData, "clientId", 120);
  const programName = getStringField(formData, "programName", 160);
  const payerName = getStringField(formData, "payerName", 160);
  const clinicalLead = getStringField(formData, "clinicalLead", 120);
  const location = getStringField(formData, "location", 120);
  const caseType = getEnumField(formData, "caseType", caseTypeOptions, "CARE_COORDINATION");
  const status = getEnumField(formData, "status", caseStatusOptions, "ACTIVE");
  const startDate = parseDateInput(getStringField(formData, "startDate", 20));
  const acuityLevel = getStringField(formData, "acuityLevel", 80) || "Routine";
  const carePlanSummary = getOptionalStringField(formData, "carePlanSummary", 1500);
  const renderingProvider = getOptionalStringField(formData, "renderingProvider", 120);
  const serviceCode = getStringField(formData, "serviceCode", 40) || "TCM-001";
  const serviceTitle = getStringField(formData, "serviceTitle", 120) || "Care coordination";
  const serviceFrequency = getStringField(formData, "serviceFrequency", 120) || "Weekly follow-up";
  const defaultUnitsPerSession = getIntegerField(formData, "defaultUnitsPerSession", 1);
  const defaultRateCents = getIntegerField(formData, "defaultRateCents", 13500);
  const unitType = getEnumField(formData, "unitType", unitTypeOptions, "HOURS");
  const authorizationNumber = getOptionalStringField(formData, "authorizationNumber", 80);
  const approvedUnits = getOptionalIntegerField(formData, "approvedUnits");
  const authorizationStartDate =
    parseDateInput(getStringField(formData, "authorizationStartDate", 20)) ?? startDate;
  const authorizationEndDate = parseDateInput(getStringField(formData, "authorizationEndDate", 20));

  if (!clientId || !programName || !payerName || !clinicalLead || !location || !startDate) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/clients/${clientId}/cases/new?error=invalid`),
      303,
    );
  }

  const caseId = createEntityId("case");
  const serviceId = createEntityId("service");
  const shouldCreateAuthorization =
    Boolean(authorizationNumber || approvedUnits || authorizationEndDate) &&
    Boolean(approvedUnits && authorizationEndDate);

  try {
    const client = await getClient(clientId);

    if (!client) {
      return NextResponse.redirect(
        getPublicRedirectUrl(request, "/clients?error=forbidden"),
        303,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.case.create({
        data: {
          id: caseId,
          caseNumber: createCaseNumber(),
          clientId,
          caseType,
          programName,
          payerName,
          clinicalLead,
          renderingProvider,
          location,
          status,
          startDate,
          endDate: null,
          acuityLevel,
          carePlanSummary,
        },
      });

      await tx.service.create({
        data: {
          id: serviceId,
          caseId,
          serviceCode,
          title: serviceTitle,
          discipline: "CARE_COORDINATION",
          unitType,
          defaultUnitsPerSession: Math.max(defaultUnitsPerSession, 1),
          defaultRateCents: Math.max(defaultRateCents, 0),
          frequency: serviceFrequency,
          status: "ACTIVE",
          isPrimary: true,
        },
      });

      if (shouldCreateAuthorization && approvedUnits && authorizationEndDate && authorizationStartDate) {
        await tx.authorization.create({
          data: {
            id: createEntityId("authorization"),
            serviceId,
            authorizationNumber: authorizationNumber || createAuthorizationNumber(),
            payerName,
            approvedUnits,
            usedUnits: 0,
            remainingUnits: approvedUnits,
            unitType,
            startDate: authorizationStartDate,
            endDate: authorizationEndDate,
            status: "ACTIVE",
            utilizationThreshold: 85,
            notes: "Initial authorization captured during case opening.",
          },
        });
      }
    });
  } catch (error) {
    console.error("[cases] Failed to create case", error);
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/clients/${clientId}/cases/new?error=unavailable`),
      303,
    );
  }

  return NextResponse.redirect(
    getPublicRedirectUrl(request, `/cases/${caseId}?created=case`),
    303,
  );
}
