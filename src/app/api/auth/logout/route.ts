import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { getPublicRedirectUrl } from "@/lib/request";

export async function POST(request: Request) {
  const response = NextResponse.redirect(getPublicRedirectUrl(request, "/login"), 303);

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
