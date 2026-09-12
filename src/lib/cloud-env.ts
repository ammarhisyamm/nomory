// Cloudflare runtime bindings for Nomory.
// `src/server.ts` stashes the worker `env` on globalThis per request
// (bindings are identical for every request in the same deployment,
// so a deployment-constant stash is safe). In `vite dev` / Lovable
// preview there are no bindings — every helper below degrades to
// "cloud unavailable" and the app falls back to on-device IndexedDB.

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<{ success: boolean; meta?: unknown }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<unknown>;
}

export interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> },
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
}

export type CloudflareEnv = {
  DB?: D1Database;
  IMAGES?: R2Bucket;
  R2_PUBLIC_URL?: string;
};

const GLOBAL_KEY = "__NOMORY_ENV";

export function setCloudEnv(env: unknown) {
  (globalThis as Record<string, unknown>)[GLOBAL_KEY] = env;
}

export function getCloudEnv(): CloudflareEnv {
  const env = (globalThis as Record<string, unknown>)[GLOBAL_KEY] as CloudflareEnv | undefined;
  if (env?.DB) return env;
  // `wrangler dev` / Node fallback: process.env can't hold bindings,
  // so cloud is simply unavailable there.
  return {};
}

export function hasCloudDb(): boolean {
  return Boolean(getCloudEnv().DB);
}
