import crypto from "node:crypto";
import { and, desc, eq, like } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { db } from "@/infrastructure/db";
import { images } from "@/infrastructure/db/schema/images";
import {
  ACCEPTED_IMAGE_TYPES,
  BUCKETS,
  FILE_SIZE_LIMIT,
} from "@/infrastructure/storage/bucket-config";
import { processImage } from "@/infrastructure/storage/image-processor";
import {
  getProxyUrl,
  uploadBuffer,
} from "@/infrastructure/storage/upload-helpers";
import {
  apiBadRequest,
  apiCreated,
  apiError,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { getAuthedUser } from "@/lib/authenticate";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 20),
    );
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const where = search
      ? and(
          eq(images.userId, session.user.id),
          like(images.title, `%${search}%`),
        )
      : eq(images.userId, session.user.id);

    const [total, rows] = await Promise.all([
      db.$count(images, where),
      db
        .select()
        .from(images)
        .where(where)
        .orderBy(desc(images.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const rowsWithUrl = rows.map((row) => ({
      ...row,
      url: getProxyUrl(row.filename),
    }));

    return apiSuccess(rowsWithUrl, "Success", 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch images",
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return apiUnauthorized();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Untitled";

    if (!file) {
      return apiBadRequest("File is required");
    }

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
    const id = crypto.randomUUID();
    const slug = nanoid(10);
    const filename = `${id}.${ext}`;
    const storagePath = `${user.id}/${filename}`;

    const processed = await processImage(file);

    await uploadBuffer(
      BUCKETS.IMAGES,
      storagePath,
      processed.buffer,
      processed.mimeType,
    );

    const [image] = await db
      .insert(images)
      .values({
        id,
        userId: user.id,
        title,
        filename: storagePath,
        originalName: file.name,
        mimeType: processed.mimeType,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        slug,
      })
      .returning();

    return apiCreated(
      { ...image, url: getProxyUrl(storagePath) },
      "Image uploaded successfully",
    );
  } catch (error) {
    console.error("[POST /api/v1/images]", error);
    return apiError(error instanceof Error ? error.message : "Upload failed");
  }
}
