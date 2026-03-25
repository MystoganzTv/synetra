export function getPublicOrigin(request: Request) {
  const originHeader = request.headers.get("origin");

  if (originHeader) {
    return originHeader;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export function getPublicRedirectUrl(request: Request, path: string) {
  return new URL(path, getPublicOrigin(request));
}
