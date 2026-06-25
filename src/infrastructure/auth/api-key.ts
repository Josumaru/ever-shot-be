import crypto from "node:crypto";

export type ApiKeyPrefix = "es";

const API_KEY_PREFIX: ApiKeyPrefix = "es";

export function generateApiKey(): string {
  const raw = crypto.randomBytes(32).toString("hex");
  return `${API_KEY_PREFIX}_${raw}`;
}

export function validateApiKeyFormat(key: string): boolean {
  return /^es_[a-f0-9]{64}$/.test(key);
}
