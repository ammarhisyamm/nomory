// Username + password auth — TanStack Start server functions (D1-backed).
// Sessions reuse the same signed-cookie mechanism as Google sign-in, so
// cloud meal sync works identically for both account types.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCloudEnv } from "./cloud-env";
import {
  clearSessionCookie,
  getSessionUser,
  passwordPepper,
  setSessionCookie,
  type SessionUser,
} from "./auth-server";
import { hashPassword, needsRehash, verifyPassword } from "./password-crypto";
import { enforceRateLimit } from "./rate-limit";
import {
  LOCKOUT_MS,
  countUsers,
  createUser,
  displayNameSchema,
  findUserById,
  findUserByUsername,
  isLocked,
  normalizeUsername,
  passwordSchema,
  recordFailedLogin,
  resetLoginAttempts,
  updatePasswordHash,
  bumpSessionVersion,
  updateUserName,
  usernameSchema,
} from "./password-users";

const NO_DB_ERROR =
  "Login username belum tersedia — database cloud belum disiapkan di deployment ini.";

const WRONG_CREDENTIALS = "Username atau password salah.";

/**
 * Optional first-run account, configured via env (SEED_USERNAME +
 * SEED_PASSWORD). Never hardcoded — a fresh deployment without these
 * vars simply starts with no seeded account.
 */
function seedCredentials() {
  const username = process.env["SEED_USERNAME"] || "";
  const password = process.env["SEED_PASSWORD"] || "";
  return username && password ? { username, password } : null;
}

/**
 * Creates the configured seed account exactly once: only when the users
 * table is completely empty (fresh database). Safe to call from any
 * handler — concurrent calls collapse via the UNIQUE constraint.
 */
async function ensureSeedAdmin(db: NonNullable<ReturnType<typeof getCloudEnv>["DB"]>) {
  const seed = seedCredentials();
  if (!seed) return;
  if ((await countUsers(db)) > 0) return;
  const now = Date.now();
  try {
    await createUser(db, {
      id: crypto.randomUUID(),
      username: seed.username,
      name: seed.username,
      passwordHash: await hashPassword(seed.password, passwordPepper()),
      now,
    });
  } catch {
    // Another request seeded first — nothing to do.
  }
}

function signupDisabled() {
  return process.env["SIGNUP_DISABLED"] === "1";
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getPasswordAuthStatus = createServerFn().handler(
  async (): Promise<{ available: boolean; signupOpen: boolean }> => ({
    available: Boolean(getCloudEnv().DB),
    signupOpen: !signupDisabled(),
  }),
);

export const signUpWithPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: usernameSchema,
      password: passwordSchema,
      name: displayNameSchema,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    if (signupDisabled()) return { ok: false, error: "Pendaftaran akun baru sedang ditutup." };
    const db = getCloudEnv().DB;
    if (!db) return { ok: false, error: NO_DB_ERROR };
    if (!(await enforceRateLimit(db, "signup", data.username, 5, 60 * 60_000)).allowed) {
      return { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." };
    }
    await ensureSeedAdmin(db);
    const username = normalizeUsername(data.username);
    const existing = await findUserByUsername(db, username);
    if (existing) return { ok: false, error: "Username sudah dipakai. Coba yang lain." };

    const now = Date.now();
    const id = crypto.randomUUID();
    const name = data.name.trim() || username;
    await createUser(db, {
      id,
      username,
      name: name.slice(0, 40),
      passwordHash: await hashPassword(data.password, passwordPepper()),
      now,
    });

    const user: SessionUser = { id, name, email: "", picture: "", username, provider: "password" };
    await setSessionCookie(user);
    return { ok: true };
  });

export const signInWithPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: z.string().trim().toLowerCase().min(1).max(20),
      password: z.string().min(1).max(128),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const db = getCloudEnv().DB;
    if (!db) return { ok: false, error: NO_DB_ERROR };
    if (!(await enforceRateLimit(db, "login", data.username, 15, 15 * 60_000)).allowed) {
      return { ok: false, error: WRONG_CREDENTIALS };
    }
    await ensureSeedAdmin(db);
    const username = normalizeUsername(data.username);
    const now = Date.now();

    const user = await findUserByUsername(db, username);
    if (!user) {
      // Same message + delay as a wrong password: don't reveal which
      // usernames exist.
      await delay(400);
      return { ok: false, error: WRONG_CREDENTIALS };
    }
    if (isLocked(user, now)) {
      const minutes = Math.max(1, Math.ceil((user.locked_until - now) / 60_000));
      return {
        ok: false,
        error: `Akun terkunci karena terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`,
      };
    }

    const correct = await verifyPassword(data.password, user.password_hash, passwordPepper());
    if (!correct) {
      const { locked } = await recordFailedLogin(db, user, now);
      await delay(400);
      if (locked) {
        return {
          ok: false,
          error: `Terlalu banyak percobaan salah. Akun dikunci ${Math.round(LOCKOUT_MS / 60_000)} menit.`,
        };
      }
      return { ok: false, error: WRONG_CREDENTIALS };
    }

    await resetLoginAttempts(db, user.id);
    if (needsRehash(user.password_hash)) {
      await updatePasswordHash(
        db,
        user.id,
        await hashPassword(data.password, passwordPepper()),
        now,
      );
    }
    const session: SessionUser = {
      id: user.id,
      name: user.name || user.username,
      email: "",
      picture: "",
      username: user.username,
      provider: "password",
    };
    await setSessionCookie(session);
    return { ok: true };
  });

/** Generic sign-out (works for Google and username sessions). */
export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  clearSessionCookie();
  return { ok: true as const };
});

export const updateProfileName = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: displayNameSchema.refine(
        (value) => value.trim().length >= 2,
        "Nama minimal 2 karakter.",
      ),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const db = getCloudEnv().DB;
    const session = await getSessionUser();
    if (!db || !session?.username) return { ok: false, error: "Akun username belum siap diubah." };
    const user = await findUserById(db, session.id);
    if (!user) return { ok: false, error: "Akun tidak ditemukan." };
    const name = data.name.trim().slice(0, 40);
    await updateUserName(db, user.id, name, Date.now());
    await setSessionCookie({ ...session, name });
    return { ok: true };
  });

export const changePassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      current: z.string().min(1).max(128),
      next: passwordSchema,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const db = getCloudEnv().DB;
    const session = await getSessionUser();
    if (!db || !session) return { ok: false, error: "Kamu belum login." };
    if (!session.username) {
      return { ok: false, error: "Akun Google tidak punya password lokal." };
    }
    if (data.current === data.next) {
      return { ok: false, error: "Password baru harus berbeda dari yang lama." };
    }
    const user = await findUserById(db, session.id);
    if (!user) return { ok: false, error: "Akun tidak ditemukan." };
    const now = Date.now();
    if (isLocked(user, now)) {
      return { ok: false, error: "Akun sedang dikunci. Coba lagi nanti." };
    }
    const correct = await verifyPassword(data.current, user.password_hash, passwordPepper());
    if (!correct) {
      await recordFailedLogin(db, user, now);
      return { ok: false, error: "Password lama salah." };
    }
    await updatePasswordHash(db, user.id, await hashPassword(data.next, passwordPepper()), now);
    await resetLoginAttempts(db, user.id);
    await bumpSessionVersion(db, user.id);
    clearSessionCookie();
    return { ok: true };
  });
