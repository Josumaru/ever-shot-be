import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { apiKeys } from "@/infrastructure/db/schema/api-keys";
import { auth } from "@/lib/auth";

export async function getAuthedUser(req: NextRequest) {
  const apiKeyHeader = req.headers.get("x-api-key");

  if (apiKeyHeader) {
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, apiKeyHeader))
      .limit(1);

    if (key) {
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, key.id));

      return { id: key.userId, name: "", email: "", image: null };
    }

    return null;
  }

  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}
