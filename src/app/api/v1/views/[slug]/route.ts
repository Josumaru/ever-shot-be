import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/infrastructure/db";
import { images } from "@/infrastructure/db/schema/images";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const viewedCookie = _request.cookies.get(`viewed_${slug}`);
  if (viewedCookie) {
    return NextResponse.json({ counted: false });
  }

  const [image] = await db
    .select()
    .from(images)
    .where(eq(images.slug, slug))
    .limit(1);

  if (!image) {
    return NextResponse.json({ counted: false });
  }

  await db
    .update(images)
    .set({ views: image.views + 1 })
    .where(eq(images.id, image.id));

  const response = NextResponse.json({ counted: true });
  response.cookies.set(`viewed_${slug}`, "1", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
