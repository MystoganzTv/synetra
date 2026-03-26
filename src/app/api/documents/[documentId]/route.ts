import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getDocuments } from "@/lib/operations-data";
import { prisma } from "@/lib/db";
import { getPublicRedirectUrl } from "@/lib/request";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  const { documentId } = await params;
  const visibleDocument = (await getDocuments()).find((document) => document.id === documentId);

  if (!visibleDocument) {
    notFound();
  }

  const fileRecord = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      fileData: true,
      fileMimeType: true,
      fileName: true,
      title: true,
    },
  });

  if (!fileRecord?.fileData) {
    notFound();
  }

  return new NextResponse(fileRecord.fileData, {
    status: 200,
    headers: {
      "Content-Type": fileRecord.fileMimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileRecord.fileName || `${fileRecord.title}.bin`}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
