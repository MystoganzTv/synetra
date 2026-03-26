import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCase, getClient } from "@/lib/data";
import {
  createEntityId,
  getEnumField,
  getOptionalStringField,
  getStringField,
  parseDateTimeInput,
  taskPriorityOptions,
  taskStatusOptions,
  taskTypeOptions,
} from "@/lib/ops-create";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks/new?error=unavailable"), 303);
  }

  const formData = await request.formData();
  const clientId = getStringField(formData, "clientId", 120);
  const caseId = getOptionalStringField(formData, "caseId", 120);
  const title = getStringField(formData, "title", 160);
  const description = getOptionalStringField(formData, "description", 1500);
  const dueAt = parseDateTimeInput(getStringField(formData, "dueAt", 40));
  const priority = getEnumField(formData, "priority", taskPriorityOptions, "MEDIUM");
  const taskType = getEnumField(formData, "taskType", taskTypeOptions, "GENERAL");
  const status = getEnumField(formData, "status", taskStatusOptions, "OPEN");

  if (!clientId || !title || !dueAt) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks/new?error=invalid"), 303);
  }

  const [client, caseContext] = await Promise.all([
    getClient(clientId),
    caseId ? getCase(caseId) : Promise.resolve(null),
  ]);

  if (!client || (caseId && (!caseContext || caseContext.client.id !== clientId))) {
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks?error=forbidden"), 303);
  }

  try {
    await prisma.tcmTask.create({
      data: {
        id: createEntityId("task"),
        clientId,
        caseId,
        ownerEmail: session.email,
        title,
        description,
        dueAt,
        priority,
        taskType,
        status,
        completedAt: status === "DONE" ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("[tasks] Failed to create task", error);
    return NextResponse.redirect(getPublicRedirectUrl(request, "/tasks/new?error=unavailable"), 303);
  }

  return NextResponse.redirect(getPublicRedirectUrl(request, `/tasks?created=task`), 303);
}
