import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { apiKeys } from "@/infrastructure/db/schema/api-keys";
import { generateApiKey } from "@/infrastructure/auth/api-key";
import { auth } from "@/lib/auth";
import {
  apiCreated,
  apiError,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.user.id))
      .orderBy(desc(apiKeys.createdAt));

    const masked = keys.map((k) => ({
      ...k,
      key: `${k.key.slice(0, 7)}...${k.key.slice(-4)}`,
    }));

    return apiSuccess(masked);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch API keys",
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const body = (await req.json().catch(() => ({}))) as { name?: string };
    const name = body.name || "New Key";

    const id = crypto.randomUUID();
    const rawKey = generateApiKey();

    await db.insert(apiKeys).values({
      id,
      userId: session.user.id,
      name,
      key: rawKey,
    });

    return apiCreated({ id, name, key: rawKey }, "API key created");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to create API key",
    );
  }
}
