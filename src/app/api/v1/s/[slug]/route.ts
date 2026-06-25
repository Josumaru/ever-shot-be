import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { images } from "@/infrastructure/db/schema/images";
import { BUCKETS } from "@/infrastructure/storage/bucket-config";
import { getPublicUrl } from "@/infrastructure/storage/upload-helpers";
import { apiError, apiNotFound, apiSuccess } from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.slug, slug))
      .limit(1);

    if (!image) return apiNotFound("Image not found");

    const publicUrl = await getPublicUrl(BUCKETS.IMAGES, image.filename);

    return apiSuccess({
      id: image.id,
      title: image.title,
      slug: image.slug,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
      views: image.views,
      url: publicUrl,
      createdAt: image.createdAt,
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch image",
    );
  }
}
