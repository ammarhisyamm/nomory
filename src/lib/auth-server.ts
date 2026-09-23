// Server-only auth helpers: signed-cookie sessions + Google OAuth (PRD §7.1).
// Only import this from inside createServerFn handlers.
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { getCloudEnv } from "./cloud-env";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  picture: string;
  /** Set for username/password accounts, absent for Google accounts. */
  username?: string;
  provider?: "google" | "password";
};

const SESSION_COOKIE = import.meta.env.PROD ? "__Host-nomory.session" : "nomory.session";
const STATE_COOKIE = "nomory.oauth_state";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function googleConfig() {
  const clientId = process.env["GOOGLE_CLIENT_ID"] || "";
  const clientSecret = process.env["GOOGLE_CLIENT_SECRET"] || "";
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

function sessionSecret() {
  const value = process.env["SESSION_SECRET"];
  if (value) return value;
  if (import.meta.env.PROD) {
    throw new Error("SESSION_SECRET must be configured in production");
  }
  return process.env["GOOGLE_CLIENT_SECRET"] || "nomory-dev-secret";
}

/** Server-side pepper mixed into password hashes (never sent to clients). */
export function passwordPepper() {
  return sessionSecret();
}

function bytesToB64url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(value: string) {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function encodeB64url(value: string) {
  return bytesToB64url(new TextEncoder().encode(value));
}

function decodeB64url(value: string) {
  return new TextDecoder().decode(b64urlToBytes(value));
}

async function hmac(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToB64url(new Uint8Array(sig));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(user: SessionUser, sessionVersion = 0) {
  const payload = encodeB64url(
    JSON.stringify({ ...user, sv: sessionVersion, exp: Date.now() + SESSION_MAX_AGE * 1000 }),
  );
  return `${payload}.${await hmac(payload)}`;
}

type SessionClaims = { user: SessionUser; sessionVersion: number };

async function decodeSessionToken(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, await hmac(payload))) return null;
  try {
    const data = JSON.parse(decodeB64url(payload)) as SessionUser & { exp: number; sv?: number };
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
    if (!data.id) return null;
    if (!Number.isInteger(data.sv) || data.sv! < 0) return null;
    return {
      user: {
        id: data.id,
        name: data.name ?? "",
        email: data.email ?? "",
        picture: data.picture ?? "",
        ...(typeof data.username === "string" && data.username ? { username: data.username } : {}),
        ...(data.provider === "google" || data.provider === "password"
          ? { provider: data.provider }
          : {}),
      },
      sessionVersion: data.sv!,
    };
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  return (await decodeSessionToken(token))?.user ?? null;
}

function cookieOptions(maxAge: number, sameSite: "lax" | "strict" = "strict") {
  return {
    path: "/",
    httpOnly: true,
    sameSite,
    secure: import.meta.env.PROD,
    maxAge,
  };
}

async function currentSessionVersion(user: SessionUser) {
  const db = getCloudEnv().DB;
  if (!db || !user.provider) return 0;
  const table = user.provider === "google" ? "google_accounts" : "users";
  const key = user.provider === "google" ? "google_id" : "id";
  const row = await db
    .prepare(`SELECT session_version FROM ${table} WHERE ${key} = ? LIMIT 1`)
    .bind(user.id)
    .first<{ session_version: number }>();
  return row && Number.isInteger(row.session_version) ? row.session_version : null;
}

async function sessionFromToken(token: string | undefined): Promise<SessionUser | null> {
  const claims = await decodeSessionToken(token);
  if (!claims) return null;
  const version = await currentSessionVersion(claims.user);
  if (version === null || version !== claims.sessionVersion) return null;
  return claims.user;
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  for (const part of cookies.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return sessionFromToken(getCookie(SESSION_COOKIE));
}

export async function getSessionUserFromRequest(request: Request): Promise<SessionUser | null> {
  return sessionFromToken(readCookie(request, SESSION_COOKIE));
}

export async function setSessionCookie(user: SessionUser, version?: number) {
  const sessionVersion = version ?? (await currentSessionVersion(user)) ?? 0;
  setCookie(
    SESSION_COOKIE,
    await createSessionToken(user, sessionVersion),
    cookieOptions(SESSION_MAX_AGE),
  );
}

export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export async function beginOAuthState() {
  const state = crypto.randomUUID();
  const existing = getCookie(STATE_COOKIE);
  let states: string[] = [];
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      states = Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [existing];
    } catch {
      states = [existing];
    }
  }
  setCookie(STATE_COOKIE, JSON.stringify([...states.slice(-4), state]), cookieOptions(600, "lax"));
  return state;
}

export function consumeOAuthState(state: string) {
  const raw = getCookie(STATE_COOKIE);
  deleteCookie(STATE_COOKIE, { path: "/" });
  if (!state || !raw) return false;
  try {
    const parsed = JSON.parse(raw);
    const states = Array.isArray(parsed) ? parsed : [raw];
    return states.includes(state);
  } catch {
    return raw === state;
  }
}

export function googleAuthUrl(clientId: string, redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForUser(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string,
): Promise<SessionUser> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new Error("token_exchange_failed");
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("missing_access_token");

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) throw new Error("userinfo_failed");
  const profile = (await infoRes.json()) as {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    email_verified?: boolean;
  };
  if (!profile.sub || !profile.email || profile.email_verified === false)
    throw new Error("incomplete_profile");
  return {
    id: profile.sub,
    name: profile.name || profile.email,
    email: profile.email,
    picture: profile.picture || "",
    provider: "google",
  };
}
