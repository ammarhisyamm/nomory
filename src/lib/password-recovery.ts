import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCloudEnv } from "./cloud-env";
import { getSessionUser, passwordPepper } from "./auth-server";
import { hashPassword } from "./password-crypto";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  findUserById,
  findUserByRecoveryEmail,
  updatePasswordHash,
  updateRecoveryEmail,
} from "./password-users";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const GENERIC_MESSAGE = "Jika akun itu punya email pemulihan, link reset sudah dikirim.";
const TOKEN_TTL = 15 * 60 * 1000;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function tokenHash(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

function appOrigin() {
  return process.env["APP_ORIGIN"] || getCloudEnv().APP_ORIGIN || "https://nomory.site";
}

function emailFrom() {
  return process.env["EMAIL_FROM"] || getCloudEnv().EMAIL_FROM || "Nomory <hello@nomory.site>";
}

async function sendResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: emailFrom(),
      to: [to],
      subject: "Reset your Nomory password",
      text: `Reset your Nomory password within 15 minutes: ${resetUrl}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717"><h2>Reset your Nomory password</h2><p>This link expires in 15 minutes.</p><p><a href="${resetUrl}" style="display:inline-block;background:#ff6b2c;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">Reset password</a></p><p>If you did not request this, you can ignore this email.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend request failed: ${response.status}`);
}

export const setRecoveryEmail = createServerFn({ method: "POST" })
  .validator(z.object({ email: emailSchema }))
  .handler(async ({ data }) => {
    const db = getCloudEnv().DB;
    const session = await getSessionUser();
    if (!db || !session?.username) return { ok: false, error: "Login username diperlukan." };
    const user = await findUserById(db, session.id);
    if (!user) return { ok: false, error: "Akun tidak ditemukan." };
    await updateRecoveryEmail(db, user.id, data.email, Date.now());
    return { ok: true };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(z.object({ email: emailSchema }))
  .handler(async ({ data }): Promise<{ ok: boolean; message: string; configured: boolean }> => {
    const db = getCloudEnv().DB;
    const configured = Boolean(process.env["RESEND_API_KEY"]);
    if (!db || !configured) return { ok: true, message: GENERIC_MESSAGE, configured };
    const user = await findUserByRecoveryEmail(db, data.email);
    if (!user) return { ok: true, message: GENERIC_MESSAGE, configured };
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = bytesToHex(tokenBytes);
    const now = Date.now();
    await createPasswordResetToken(db, {
      tokenHash: await tokenHash(token),
      userId: user.id,
      expiresAt: now + TOKEN_TTL,
      createdAt: now,
    });
    const url = new URL("/reset-password", appOrigin());
    url.searchParams.set("token", token);
    try {
      await sendResetEmail(data.email, url.toString());
    } catch {
      // Never expose provider details or whether an account exists.
    }
    return { ok: true, message: GENERIC_MESSAGE, configured };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: passwordSchema }))
  .handler(async ({ data }) => {
    const db = getCloudEnv().DB;
    if (!db) return { ok: false, error: "Reset password belum tersedia." };
    const consumed = await consumePasswordResetToken(db, await tokenHash(data.token), Date.now());
    if (!consumed) return { ok: false, error: "Link reset tidak valid atau sudah kedaluwarsa." };
    await updatePasswordHash(
      db,
      consumed.userId,
      await hashPassword(data.password, passwordPepper()),
      Date.now(),
    );
    return { ok: true };
  });
