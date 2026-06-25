import { z } from "zod";

const privateSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string().min(32),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string(),
  BASE_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url(),
});

function validatePrivate() {
  const result = privateSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join("."));
    throw new Error(
      `Missing/invalid environment variables: ${missing.join(", ")}`,
    );
  }
  return result.data;
}

function validatePublic() {
  const result = publicSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join("."));
    if (typeof window === "undefined") {
      throw new Error(`Missing/invalid public env vars: ${missing.join(", ")}`);
    }
    return {} as z.infer<typeof publicSchema>;
  }
  return result.data;
}

export const PRIVATE_ENV =
  typeof window === "undefined"
    ? validatePrivate()
    : ({} as z.infer<typeof privateSchema>);
export const PUBLIC_ENV = validatePublic();
