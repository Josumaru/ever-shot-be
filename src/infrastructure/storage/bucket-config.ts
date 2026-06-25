export const BUCKETS = {
  IMAGES: "evershot",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
