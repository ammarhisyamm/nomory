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

export type AuthStatus = {
  googleConfigured: boolean;
  user: SessionUser | null;
};

export const getAuthStatus = createServerFn().handler(async (): Promise<AuthStatus> => ({
  googleConfigured: Boolean(googleConfig()),
  user: await getSessionUser(),
}));

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
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const cfg = googleConfig();
    if (!cfg) return { ok: false, error: "Google sign-in isn't set up yet." };
    if (!consumeOAuthState(data.state)) {
      return { ok: false, error: "This sign-in attempt expired. Try again." };
    }
    try {
      const user = await exchangeCodeForUser(
        cfg.clientId,
        cfg.clientSecret,
        data.code,
        data.redirectUri,
      );
      await setSessionCookie(user);
      return { ok: true };
    } catch {
      return { ok: false, error: "Couldn't complete Google sign-in. Try again." };
    }
  });

export const signOutFromGoogle = createServerFn({ method: "POST" }).handler(async () => {
  clearSessionCookie();
  return { ok: true as const };
});
