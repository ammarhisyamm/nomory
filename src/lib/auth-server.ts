// Server-only auth helpers: signed-cookie sessions + Google OAuth (PRD §7.1).
// Only import this from inside createServerFn handlers.
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  picture: string;
};

const SESSION_COOKIE = "morsel.session";
const STATE_COOKIE = "morsel.oauth_state";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function googleConfig() {
  const clientId = process.env["GOOGLE_CLIENT_ID"] || "";
  const clientSecret = process.env["GOOGLE_CLIENT_SECRET"] || "";
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

function sessionSecret() {
  return process.env["SESSION_SECRET"] || process.env["GOOGLE_CLIENT_SECRET"] || "morsel-dev-secret";
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

export async function createSessionToken(user: SessionUser) {
  const payload = encodeB64url(
    JSON.stringify({ ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 }),
  );
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, await hmac(payload))) return null;
  try {
    const data = JSON.parse(decodeB64url(payload)) as SessionUser & { exp: number };
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
    if (!data.id || !data.email) return null;
    return { id: data.id, name: data.name ?? "", email: data.email, picture: data.picture ?? "" };
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: import.meta.env.PROD,
    maxAge,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return verifySessionToken(getCookie(SESSION_COOKIE));
}

export async function setSessionCookie(user: SessionUser) {
  setCookie(SESSION_COOKIE, await createSessionToken(user), cookieOptions(SESSION_MAX_AGE));
}

export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export async function beginOAuthState() {
  const state = crypto.randomUUID();
  setCookie(STATE_COOKIE, state, cookieOptions(600));
  return state;
}

export function consumeOAuthState(state: string) {
  const expected = getCookie(STATE_COOKIE);
  deleteCookie(STATE_COOKIE, { path: "/" });
  return Boolean(state && expected) && state === expected;
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
  };
  if (!profile.sub || !profile.email) throw new Error("incomplete_profile");
  return {
    id: profile.sub,
    name: profile.name || profile.email,
    email: profile.email,
    picture: profile.picture || "",
  };
}
