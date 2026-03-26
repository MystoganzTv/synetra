import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks?error=unavailable"), 303);
  }

  const { taskId } = await params;
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "complete");

  const task = await prisma.tcmTask.findUnique({
    where: { id: taskId },
    select: { id: true, ownerEmail: true },
  });

  if (!task) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks?error=missing"), 303);
  }

  const isElevated =
    session.role === "Platform Admin" || session.role === "Revenue Operations";

  if (!isElevated && task.ownerEmail.toLowerCase() !== session.email.toLowerCase()) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks?error=forbidden"), 303);
  }

  try {
    await prisma.tcmTask.update({
      where: { id: taskId },
      data:
        intent === "reopen"
          ? { status: "OPEN", completedAt: null }
          : { status: "DONE", completedAt: new Date() },
    });
  } catch (error) {
    console.error("[tasks] Failed to update task", error);
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks?error=unavailable"), 303);
  }

  return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks?updated=task"), 303);
}
