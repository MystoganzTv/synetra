import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getCase, getClient } from "@/lib/data";
import { prisma } from "@/lib/db";
import {
  createEntityId,
  documentCategoryOptions,
  documentStatusOptions,
  getEnumField,
  getOptionalStringField,
  getStringField,
  parseDateInput,
} from "@/lib/ops-create";
import { getPublicRedirectUrl } from "@/lib/request";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, "/documents/new?error=unavailable"),
      303,
    );
  }

  const formData = await request.formData();
  const clientId = getStringField(formData, "clientId", 120);
  const caseId = getOptionalStringField(formData, "caseId", 120);
  const returnTo = getOptionalStringField(formData, "returnTo", 240) ?? "/documents";
  const title = getStringField(formData, "title", 160);
  const category = getEnumField(formData, "category", documentCategoryOptions, "CLINICAL");
  const status = getEnumField(formData, "status", documentStatusOptions, "CURRENT");
  const effectiveDate = parseDateInput(getStringField(formData, "effectiveDate", 20));
  const expiresAt = parseDateInput(getStringField(formData, "expiresAt", 20));
  const source = getStringField(formData, "source", 120) || "Client upload";
  const requiresSignature = formData.get("requiresSignature") === "on";
  const tagsValue = getOptionalStringField(formData, "tags", 240) ?? "";
  const file = formData.get("file");

  if (!clientId || !title || !(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/documents/new?clientId=${clientId}&error=invalid`),
      303,
    );
  }

  const client = await getClient(clientId);
  if (!client) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, "/documents?error=forbidden"),
      303,
    );
  }

  if (caseId) {
    const caseContext = await getCase(caseId);
    if (!caseContext || caseContext.client.id !== clientId) {
      return NextResponse.redirect(
        getPublicRedirectUrl(request, "/documents?error=forbidden"),
        303,
      );
    }
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/documents/new?clientId=${clientId}&error=file_too_large`),
      303,
    );
  }

  const fileMimeType = file.type || "application/octet-stream";
  if (!allowedMimeTypes.has(fileMimeType)) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/documents/new?clientId=${clientId}&error=file_type`),
      303,
    );
  }

  const tags = tagsValue
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 10);

  try {
    const fileData = Buffer.from(await file.arrayBuffer());

    await prisma.document.create({
      data: {
        id: createEntityId("document"),
        clientId,
        caseId,
        title,
        fileName: file.name.slice(0, 180),
        fileMimeType,
        fileSizeBytes: file.size,
        fileData,
        category,
        status,
        owner: session.name,
        effectiveDate,
        expiresAt,
        source,
        requiresSignature,
        signedAt: null,
        tags,
      },
    });
  } catch (error) {
    console.error("[documents] Failed to upload document", error);
    return NextResponse.redirect(
      getPublicRedirectUrl(request, `/documents/new?clientId=${clientId}&error=unavailable`),
      303,
    );
  }

  const successTarget = returnTo.startsWith("/") ? returnTo : "/documents";
  const separator = successTarget.includes("?") ? "&" : "?";

  return NextResponse.redirect(
    getPublicRedirectUrl(request, `${successTarget}${separator}created=document`),
    303,
  );
}
