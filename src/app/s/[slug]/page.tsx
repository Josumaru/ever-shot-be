import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ViewTracker } from "@/components/view-tracker";
import { db } from "@/infrastructure/db";
import { images } from "@/infrastructure/db/schema/images";
import { getProxyUrl } from "@/infrastructure/storage/upload-helpers";
import { tServer } from "@/lib/i18n";
import { LOCALE_COOKIE_NAME } from "@/shared/stores/locale-store";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const [image] = await db
    .select()
    .from(images)
    .where(eq(images.slug, slug))
    .limit(1);

  if (!image) return { title: "Not Found" };

  return {
    title: `${image.title} - EVERSHOT`,
    description: `View ${image.title} on EVERSHOT`,
    openGraph: {
      title: image.title,
      images: [{ url: image.slug }],
    },
  };
}

export default async function SharedImagePage({ params }: PageProps) {
  const { slug } = await params;

  const [image] = await db
    .select()
    .from(images)
    .where(eq(images.slug, slug))
    .limit(1);

  if (!image) notFound();

  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? "id";
  const proxyUrl = getProxyUrl(image.filename);

  const isPortrait = image.width && image.height && image.height > image.width;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-4">
        <SiteHeader />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-5xl w-full space-y-6">
          <div
            className={`flex justify-center rounded-2xl p-2 sm:p-4 ${
              isPortrait ? "max-w-2xl mx-auto" : ""
            }`}
          >
            <Image
              src={proxyUrl}
              alt={image.title}
              width={image.width ?? 1200}
              height={image.height ?? 800}
              unoptimized
              className="max-w-full max-h-[75vh] w-auto h-auto rounded-xl shadow-2xl"
            />
          </div>

          <div className="max-w-2xl mx-auto text-center space-y-2">
            <h1 className="text-xl font-semibold ">{image.title}</h1>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span>
                {tServer(locale, "shared.views", {
                  count: String(image.views),
                })}
              </span>
              <span className="size-1 rounded-full bg-zinc-700" />
              <span>
                {image.size >= 1024 * 1024
                  ? `${(image.size / 1024 / 1024).toFixed(2)} MB`
                  : `${(image.size / 1024).toFixed(1)} KB`}
              </span>
              {image.width && image.height && (
                <>
                  <span className="size-1 rounded-full bg-zinc-700" />
                  <span>
                    {tServer(locale, "shared.dimensions", {
                      width: String(image.width),
                      height: String(image.height),
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <ViewTracker slug={slug} />
    </div>
  );
}
