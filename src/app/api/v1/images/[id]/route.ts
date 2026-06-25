import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { images } from "@/infrastructure/db/schema/images";
import { BUCKETS } from "@/infrastructure/storage/bucket-config";
import {
  deleteFile,
  getProxyUrl,
} from "@/infrastructure/storage/upload-helpers";
import {
  apiBadRequest,
  apiError,
  apiNotFound,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api-response";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const [image] = await db
      .select()
      .from(images)
      .where(and(eq(images.id, id), eq(images.userId, session.user.id)))
      .limit(1);

    if (!image) return apiNotFound("Image not found");

    return apiSuccess({ ...image, url: getProxyUrl(image.filename) });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch image",
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return apiBadRequest("Title is required and must be a string");
    }

    const [existing] = await db
      .select()
      .from(images)
      .where(and(eq(images.id, id), eq(images.userId, session.user.id)))
      .limit(1);

    if (!existing) return apiNotFound("Image not found");

    const [updated] = await db
      .update(images)
      .set({ title })
      .where(eq(images.id, id))
      .returning();

    return apiSuccess(updated, "Image updated");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update image",
    );
  }
}

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
      .from(images)
      .where(and(eq(images.id, id), eq(images.userId, session.user.id)))
      .limit(1);

    if (!existing) return apiNotFound("Image not found");

    await deleteFile(BUCKETS.IMAGES, existing.filename);

    await db.delete(images).where(eq(images.id, id));

    return apiSuccess(null, "Image deleted");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to delete image",
    );
  }
}
