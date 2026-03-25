import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { defaultAuthProfiles, type AuthRole, verifyPassword } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { isDemoModeEnabled } from "@/lib/data-source";

export const AUTH_COOKIE_NAME = "synetra_session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 10;

export interface AuthSession {
  email: string;
  name: string;
  role: AuthRole;
  expiresAt: string;
}

function getAuthSecret() {
  const configuredSecret = process.env.AUTH_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("[auth] AUTH_SECRET is required in production.");
  }

  return "synetra-local-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function encodeSession(session: AuthSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function decodeSession(token: string): AuthSession | null {
  const [payload, providedSignature] = token.split(".");

  if (!payload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(payload);

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthSession;

    if (!parsed.email || !parsed.name || !parsed.role || !parsed.expiresAt) {
      return null;
    }

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getDemoUsers() {
  return defaultAuthProfiles.map(({ email, name, role }) => ({ email, name, role }));
}

export async function validateCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (process.env.DATABASE_URL) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          email: true,
          name: true,
          role: true,
          status: true,
          passwordHash: true,
        },
      });

      if (user?.status === "ACTIVE" && verifyPassword(password, user.passwordHash)) {
        return {
          email: user.email,
          name: user.name,
          role: user.role as AuthRole,
        };
      }
    } catch (error) {
      console.error("[auth] Database-backed login check failed", error);
    }
  }

  if (!isDemoModeEnabled()) {
    return null;
  }

  return (
    defaultAuthProfiles.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password,
    ) ?? null
  );
}

export function createSessionForUser(user: {
  email: string;
  name: string;
  role: AuthRole;
}) {
  return encodeSession({
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  });
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return decodeSession(token);
}

export async function requireAuthSession() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
