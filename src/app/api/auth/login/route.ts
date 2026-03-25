import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, createSessionForUser, validateCredentials } from "@/lib/auth";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await validateCredentials(email, password);

  if (!user) {
    return NextResponse.redirect(
      getPublicRedirectUrl(request, "/login?error=invalid_credentials"),
      303,
    );
  }

  const response = NextResponse.redirect(getPublicRedirectUrl(request, "/dashboard"), 303);
  const cookieStore = await cookies();
  const token = createSessionForUser({
    email: user.email,
    name: user.name,
    role: user.role,
  });

  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10,
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10,
  });

  return response;
}
