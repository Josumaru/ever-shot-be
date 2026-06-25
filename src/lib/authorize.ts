import { auth } from "@/lib/auth";
import { apiUnauthorized } from "@/lib/api-response";
import type { NextRequest } from "next/server";

export async function requireAuth(req: NextRequest): Promise<Response | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ? null : apiUnauthorized();
}

export async function requireImageOwner(
  req: NextRequest,
  imageUserId: string,
): Promise<Response | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return apiUnauthorized();
  if (session.user.id !== imageUserId) {
    return apiUnauthorized("You do not own this image");
  }
  return null;
}

export function requireApiKey(req: NextRequest): string | null {
  const apiKey = req.headers.get("x-api-key");
  return apiKey;
}

export async function getSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}
