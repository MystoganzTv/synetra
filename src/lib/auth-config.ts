import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type AuthRole = "Platform Admin" | "Revenue Operations" | "TCM";

export type AuthProfile = {
  email: string;
  password: string;
  name: string;
  role: AuthRole;
};

export const defaultAuthProfiles: AuthProfile[] = [
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
  {
    email: "enrique@synetra.app",
    password: "SynetraTCM!",
    name: "Enrique Padron",
    role: "TCM",
  },
];

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const candidateHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  return (
    candidateHash.length === expectedBuffer.length &&
    timingSafeEqual(candidateHash, expectedBuffer)
  );
}
