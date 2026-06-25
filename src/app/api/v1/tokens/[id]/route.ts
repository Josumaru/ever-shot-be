import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { apiKeys } from "@/infrastructure/db/schema/api-keys";
import { auth } from "@/lib/auth";
import {
  apiError,
  apiNotFound,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api-response";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const [existing] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
      .limit(1);

    if (!existing) return apiNotFound("API key not found");

    await db.delete(apiKeys).where(eq(apiKeys.id, id));

    return apiSuccess(null, "API key deleted");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to delete API key",
    );
  }
}
