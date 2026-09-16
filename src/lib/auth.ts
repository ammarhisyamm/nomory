import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  beginOAuthState,
  clearSessionCookie,
  consumeOAuthState,
  exchangeCodeForUser,
  getSessionUser,
  googleAuthUrl,
  googleConfig,
  setSessionCookie,
  type SessionUser,
} from "./auth-server";
import { getCloudEnv } from "./cloud-env";
import {
  getGoogleAccount,
  getGoogleAccountByUsername,
  setGoogleUsername,
  upsertGoogleAccount,
} from "./google-accounts";
import {
  findUserById,
  findUserByUsername,
  normalizeUsername,
  usernameSchema,
} from "./password-users";

export type AuthStatus = {
  googleConfigured: boolean;
  user: SessionUser | null;
};

export const getAuthStatus = createServerFn().handler(async (): Promise<AuthStatus> => {
  const session = await getSessionUser();
  const db = getCloudEnv().DB;
  if (session?.provider === "password" && db) {
    const storedUser = await findUserById(db, session.id);
    if (
      storedUser &&
      (storedUser.username !== session.username || storedUser.name !== session.name)
    ) {
      const syncedUser = { ...session, username: storedUser.username, name: storedUser.name };
      await setSessionCookie(syncedUser);
      return { googleConfigured: Boolean(googleConfig()), user: syncedUser };
    }
  }
  return { googleConfigured: Boolean(googleConfig()), user: session };
});

export const startGoogleSignIn = createServerFn({ method: "POST" })
  .validator(z.object({ origin: z.string().url() }))
  .handler(async ({ data }): Promise<{ url: string | null }> => {
    const cfg = googleConfig();
    if (!cfg) return { url: null };
    const state = await beginOAuthState();
    return {
      url: googleAuthUrl(cfg.clientId, `${data.origin}/auth/google/callback`, state),
    };
  });

export const completeGoogleSignIn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().min(1),
      redirectUri: z.string().url(),
      state: z.string().min(1),
    }),
  )
  .handler(
    async ({ data }) => finishGoogleSignIn(data),
  );

export async function finishGoogleSignIn(data: {
  code: string;
  redirectUri: string;
  state: string;
}): Promise<{ ok: boolean; needsOnboarding?: boolean; error?: string }> {
  const cfg = googleConfig();
  if (!cfg) return { ok: false, error: "Google sign-in isn't set up yet." };
  if (!consumeOAuthState(data.state)) {
    console.error("google_oauth_state_invalid");
    return { ok: false, error: "This sign-in attempt expired. Try again." };
  }
  try {
    const signedInUser = await exchangeCodeForUser(
      cfg.clientId,
      cfg.clientSecret,
      data.code,
      data.redirectUri,
    );
    const db = getCloudEnv().DB;
    let user = signedInUser;
    if (db) {
      const account = await upsertGoogleAccount(db, {
        googleId: signedInUser.id,
        email: signedInUser.email,
        name: signedInUser.name,
        picture: signedInUser.picture,
        now: Date.now(),
      });
      user = { ...signedInUser, ...(account.username ? { username: account.username } : {}) };
    }
    await setSessionCookie(user);
    return { ok: true, needsOnboarding: !user.username };
  } catch (error) {
    console.error(
      "google_sign_in_failed",
      error instanceof Error ? error.message : String(error),
    );
    return { ok: false, error: "Couldn't complete Google sign-in. Try again." };
  }
}

export const completeGoogleUsername = createServerFn({ method: "POST" })
  .validator(z.object({ username: usernameSchema }))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const user = await getSessionUser();
    const db = getCloudEnv().DB;
    if (!db || !user || user.provider !== "google") {
      return { ok: false, error: "Google sign-in belum siap. Coba masuk lagi." };
    }
    const username = normalizeUsername(data.username);
    const account = await getGoogleAccount(db, user.id);
    if (!account) return { ok: false, error: "Sesi Google ini sudah berakhir. Coba masuk lagi." };
    if (account.username) {
      await setSessionCookie({ ...user, username: account.username });
      return { ok: true };
    }
    if (await findUserByUsername(db, username)) {
      return { ok: false, error: "Username sudah dipakai. Coba yang lain." };
    }
    const otherGoogleAccount = await getGoogleAccountByUsername(db, username);
    if (otherGoogleAccount && otherGoogleAccount.google_id !== user.id) {
      return { ok: false, error: "Username sudah dipakai. Coba yang lain." };
    }
    try {
      await setGoogleUsername(db, { googleId: user.id, username, now: Date.now() });
    } catch {
      return { ok: false, error: "Username sudah dipakai. Coba yang lain." };
    }
    await setSessionCookie({ ...user, username });
    return { ok: true };
  });

export const signOutFromGoogle = createServerFn({ method: "POST" }).handler(async () => {
  clearSessionCookie();
  return { ok: true as const };
});
