import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/infrastructure/db";
import { PRIVATE_ENV, PUBLIC_ENV } from "@/shared/constants/env";

export const auth = betterAuth({
  baseURL: PUBLIC_ENV.NEXT_PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  trustedOrigins: PRIVATE_ENV.ALLOWED_ORIGINS?.split(",").map(v => v.trim()) ?? [],
});

export type Session = typeof auth.$Infer.Session;
