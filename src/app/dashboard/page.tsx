"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Camera,
  Copy,
  Clock,
  Eye,
  ExternalLink,
  ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { I18N } from "@/shared/constants/i18n-keys";
import { useDebounce } from "@/shared/hooks/use-debounce";
import {
  useImages,
  useDeleteImage,
  useUploadImage,
} from "@/modules/images/queries/use-images";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, isPending: sessionLoading } = useSession();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: imagesRes, isLoading: imagesLoading } = useImages({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  });
  const loading = sessionLoading || imagesLoading;

  const images = imagesRes?.data ?? [];
  const meta = imagesRes?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const deleteImage = useDeleteImage();
  const uploadImage = useUploadImage();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/auth/login");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

      await uploadImage.mutateAsync(formData);
      toast.success(t(I18N.DASHBOARD.TOAST_UPLOAD_SUCCESS));
    } catch {
      toast.error(t(I18N.DASHBOARD.TOAST_UPLOAD_ERROR));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteImage.mutateAsync(id);
      toast.success(t(I18N.DASHBOARD.TOAST_DELETE_SUCCESS));
    } catch {
      toast.error(t(I18N.DASHBOARD.TOAST_DELETE_ERROR));
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success(t(I18N.DASHBOARD.TOAST_LINK_COPIED));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t(I18N.DASHBOARD.TITLE)}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t(I18N.DASHBOARD.DESCRIPTION)}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 transition-opacity duration-200",
          loading && "pointer-events-none opacity-40",
        )}
      >
        <Input
          placeholder={t(I18N.DASHBOARD.SEARCH)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-56"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadImage.isPending}
          className="gap-2 shrink-0"
        >
          {uploadImage.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {t(I18N.DASHBOARD.UPLOAD)}
        </Button>
      </div>

      {images.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-muted mb-5">
            <Camera className="size-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {t(I18N.DASHBOARD.EMPTY_TITLE)}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t(I18N.DASHBOARD.EMPTY_DESCRIPTION)}
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImage.isPending}
            className="gap-2"
          >
            <Plus className="size-4" />
            {t(I18N.DASHBOARD.UPLOAD_IMAGE)}
          </Button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-opacity duration-200",
              loading && "pointer-events-none opacity-40",
            )}
          >
            {images.map((image) => (
              <div
                key={image.id}
                className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyLink(image.slug)}
                        className="flex-1 h-8 text-xs gap-1.5 bg-white/90 hover:bg-white text-black"
                      >
                        <Copy className="size-3" />
                        {t(I18N.DASHBOARD.COPY_LINK)}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        disabled={deleteImage.isPending}
                        className="h-8 w-8 p-0"
                      >
                        {deleteImage.isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                      </Button>
                      <a
                        href={`/s/${image.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-black"
                        >
                          <ExternalLink className="size-3" />
                        </Button>
                      </a>
                    </div>
                  </div>
                  {image.width && image.height && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 text-[10px] text-white/80 font-medium">
                      {image.width}×{image.height}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {image.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {image.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(image.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t(I18N.DASHBOARD.PREVIOUS)}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t(I18N.DASHBOARD.PAGE_OF, {
                  page: String(page),
                  total: String(totalPages),
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t(I18N.DASHBOARD.NEXT)}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
