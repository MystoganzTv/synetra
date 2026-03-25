import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE_NAME = "synetra_session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 10;

const demoUsers = [
  {
    email: "admin@synetra.app",
    password: "SynetraDemo!",
    name: "Avery Chen",
    role: "Platform Admin",
  },
  {
    email: "ops@synetra.app",
    password: "SynetraOps!",
    name: "Morgan Lee",
    role: "Revenue Operations",
  },
];

export type AuthRole = (typeof demoUsers)[number]["role"];

export interface AuthSession {
  email: string;
  name: string;
  role: AuthRole;
  expiresAt: string;
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || "synetra-local-dev-secret";
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
  return demoUsers.map(({ email, name, role }) => ({ email, name, role }));
}

export function validateCredentials(email: string, password: string) {
  return (
    demoUsers.find(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password,
    ) ?? null
  );
}

export function createSessionForUser(user: Omit<(typeof demoUsers)[number], "password">) {
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
