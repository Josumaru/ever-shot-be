import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { apiKeys } from "@/infrastructure/db/schema/api-keys";
import { generateApiKey } from "@/infrastructure/auth/api-key";
import { auth } from "@/lib/auth";
import { apiError, apiCreated, apiUnauthorized } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", "/authorize" + req.nextUrl.search);
      return Response.redirect(loginUrl.toString());
    }

    const authorizeUrl = new URL("/authorize", req.url);
    authorizeUrl.search = req.nextUrl.search;
    return Response.redirect(authorizeUrl.toString());
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Authorization failed",
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const body = (await req.json().catch(() => ({}))) as {
      app_name?: string;
      redirect_uri?: string;
    };
    const appName = body.app_name || "Screenshot Tool";

    const id = crypto.randomUUID();
    const key = generateApiKey();

    await db.insert(apiKeys).values({
      id,
      userId: session.user.id,
      name: appName,
      key,
    });

    return apiCreated({ key }, "API key created");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Authorization failed",
    );
  }
}
