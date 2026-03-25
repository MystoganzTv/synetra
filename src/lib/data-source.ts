export type DataAccessErrorCode =
  | "DATA_SOURCE_NOT_CONFIGURED"
  | "PRISMA_QUERY_FAILED"
  | "PRODUCTION_DEMO_MODE_FORBIDDEN";

export class DataAccessError extends Error {
  code: DataAccessErrorCode;
  scope: string;

  constructor(code: DataAccessErrorCode, scope: string, message: string) {
    super(message);
    this.name = "DataAccessError";
    this.code = code;
    this.scope = scope;
  }
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function isDemoModeEnabled() {
  return !isProductionEnvironment() && process.env.NEXORA_ENABLE_DEMO_DATA === "true";
}

export function assertDemoModeAllowed(scope: string) {
  if (isProductionEnvironment() && process.env.NEXORA_ENABLE_DEMO_DATA === "true") {
    throw new DataAccessError(
      "PRODUCTION_DEMO_MODE_FORBIDDEN",
      scope,
      "Demo mode is not allowed in production.",
    );
  }
}

export function logQueryFailure(scope: string, error: unknown) {
  console.error(`[data:${scope}] Prisma query failed`, error);
}

export function getDataUnavailableMessage(scope: string) {
  if (isDemoModeEnabled()) {
    return `${scope} is running in explicit demo mode.`;
  }

  return `${scope} could not load live data. Check DATABASE_URL, AUTH_SECRET, and server logs.`;
}
