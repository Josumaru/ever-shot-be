import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  account,
  session,
  user,
  verification,
} from "@/infrastructure/db/schema/auth";
import { apiKeys } from "@/infrastructure/db/schema/api-keys";
import { images } from "@/infrastructure/db/schema/images";
import { PRIVATE_ENV } from "@/shared/constants/env";

const pool = new Pool({
  connectionString: PRIVATE_ENV.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, {
  schema: {
    user,
    session,
    account,
    verification,
    images,
    apiKeys,
  },
});
