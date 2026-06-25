import sharp from "sharp";

const COMPRESSION_THRESHOLD = 5 * 1024 * 1024;

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  size: number;
};

export async function processImage(file: File): Promise<ProcessedImage> {
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  let pipeline = sharp(inputBuffer);
  const metadata = await pipeline.metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (inputBuffer.length <= COMPRESSION_THRESHOLD) {
    const buffer = await pipeline.toBuffer();
    return {
      buffer,
      mimeType: file.type,
      width,
      height,
      size: buffer.length,
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

  switch (ext) {
    case "jpg":
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality: 80 });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality: 70 });
      break;
    default:
      break;
  }

  const buffer = await pipeline.toBuffer();

  let outputMimeType = file.type;
  if (outputMimeType === "image/jpg") outputMimeType = "image/jpeg";

  return {
    buffer,
    mimeType: outputMimeType,
    width,
    height,
    size: buffer.length,
  };
}
