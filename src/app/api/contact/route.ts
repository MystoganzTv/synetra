import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function getStringField(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const fullName = getStringField(formData, "fullName", 120);
  const workEmail = getStringField(formData, "workEmail", 160).toLowerCase();
  const organization = getStringField(formData, "organization", 160);
  const role = getStringField(formData, "role", 120);
  const phone = getStringField(formData, "phone", 40);
  const teamSize = getStringField(formData, "teamSize", 60);
  const message = getStringField(formData, "message", 3000);

  if (!fullName || !workEmail || !organization || !message || !EMAIL_REGEX.test(workEmail)) {
    return NextResponse.redirect(new URL("/contacto?error=invalid", request.url), 303);
  }

  if (!process.env.DATABASE_URL) {
    console.error("[contact] DATABASE_URL is required to persist incoming leads.");
    return NextResponse.redirect(new URL("/contacto?error=unavailable", request.url), 303);
  }

  try {
    await prisma.contactLead.create({
      data: {
        fullName,
        workEmail,
        organization,
        role: role || null,
        phone: phone || null,
        teamSize: teamSize || null,
        message,
      },
    });
  } catch (error) {
    console.error("[contact] Failed to persist contact lead", error);
    return NextResponse.redirect(new URL("/contacto?error=unavailable", request.url), 303);
  }

  return NextResponse.redirect(new URL("/contacto?submitted=1", request.url), 303);
}
