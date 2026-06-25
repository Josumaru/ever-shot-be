import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { images } from "@/infrastructure/db/schema/images";
import {
  ACCEPTED_IMAGE_TYPES,
  BUCKETS,
  FILE_SIZE_LIMIT,
} from "@/infrastructure/storage/bucket-config";
import {
  downloadFile,
  getPublicUrl,
  uploadFile,
} from "@/infrastructure/storage/upload-helpers";
import {
  apiBadRequest,
  apiError,
  apiNotFound,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api-response";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;
    const folder = formData.get("folder") as string | null;

    if (!file) return apiBadRequest("File is required");

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return apiBadRequest(
        `Invalid file type. Accepted: ${ACCEPTED_IMAGE_TYPES.join(", ")}`,
      );
    }

    if (file.size > FILE_SIZE_LIMIT) {
      return apiBadRequest(
        `File exceeds the ${FILE_SIZE_LIMIT / 1024 / 1024}MB size limit`,
      );
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath =
      path || `${folder || session.user.id}/${crypto.randomUUID()}.${ext}`;

    await uploadFile(BUCKETS.IMAGES, storagePath, file);
    const publicUrl = await getPublicUrl(BUCKETS.IMAGES, storagePath);

    return apiSuccess(
      { path: storagePath, url: publicUrl },
      "File uploaded successfully",
    );
  } catch (error) {
    console.error("[POST /api/v1/storage]", error);
    return apiError(error instanceof Error ? error.message : "Upload failed");
  }
}

export async function GET(req: NextRequest) {
  try {
    const file = req.nextUrl.searchParams.get("file");
    const slug = req.nextUrl.searchParams.get("slug");

    let filename: string;
    let contentType: string;

    if (file) {
      filename = file;
      contentType = "application/octet-stream";
    } else if (slug) {
      const [image] = await db
        .select()
        .from(images)
        .where(eq(images.slug, slug))
        .limit(1);
      if (!image) return apiNotFound("Image not found");
      filename = image.filename;
      contentType = image.mimeType;
    } else {
      return apiBadRequest("file or slug is required");
    }

    const result = await downloadFile(BUCKETS.IMAGES, filename);
    if (!result) return apiNotFound("File not found");

    return new Response(result.data, {
      status: 200,
      headers: {
        "Content-Type": result.contentType || contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to retrieve file",
    );
  }
}
