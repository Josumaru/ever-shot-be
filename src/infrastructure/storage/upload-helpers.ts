import { createClient } from "@supabase/supabase-js";
import { PRIVATE_ENV } from "@/shared/constants/env";

let supabaseStorage: ReturnType<typeof createClient> | undefined;

function getClient() {
  if (!supabaseStorage) {
    supabaseStorage = createClient(
      PRIVATE_ENV.SUPABASE_URL,
      PRIVATE_ENV.SUPABASE_SECRET_KEY,
    );
  }
  return supabaseStorage;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
): Promise<string> {
  const client = getClient();
  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) {
    console.error(
      `[uploadFile] bucket=${bucket} path=${path} status=${error.statusCode}`,
      error,
    );
    throw new Error(`Upload failed: ${error.message}`);
  }
  return data.path;
}

export async function uploadBuffer(
  bucket: string,
  path: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const uint8 = new Uint8Array(buffer);
  const blob = new Blob([uint8], { type: mimeType });
  const file = new File([blob], path.split("/").pop() ?? "file", {
    type: mimeType,
  });
  return uploadFile(bucket, path, file);
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const client = getClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function getPublicUrl(
  bucket: string,
  path: string,
): Promise<string> {
  const client = getClient();
  const {
    data: { publicUrl },
  } = client.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

export async function downloadFile(
  bucket: string,
  path: string,
): Promise<{ data: Blob; contentType: string } | null> {
  const client = getClient();
  const { data, error } = await client.storage.from(bucket).download(path);
  if (error || !data) return null;
  return { data, contentType: data.type || "application/octet-stream" };
}

export function getProxyUrl(filename: string): string {
  return `/api/v1/storage?file=${encodeURIComponent(filename)}`;
}
