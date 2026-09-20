import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getCloudEnv, setCloudEnv } from "./lib/cloud-env";
import { getSessionUserFromRequest } from "./lib/auth-server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

function withSecurityHeaders(response: Response, request: Request) {
  const headers = new Headers(response.headers);
  headers.set(
    "content-security-policy",
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://accounts.google.com; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com; font-src 'self' https://fonts.gstatic.com https://api.fontshare.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://openidconnect.googleapis.com;",
  );
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  if (new URL(request.url).protocol === "https:")
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Make D1/R2 bindings reachable from server functions.
      setCloudEnv(env);
      const mediaResponse = await serveMedia(request);
      if (mediaResponse) return withSecurityHeaders(mediaResponse, request);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response), request);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        request,
      );
    }
  },
};

async function serveMedia(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/media/")) return null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const user = await getSessionUserFromRequest(request);

  const key = decodeURIComponent(url.pathname.slice("/media/".length));
  if (
    !/^meals\/[a-f0-9-]+\/[a-f0-9-]+-(original|processed|thumbnail)(?:-[a-f0-9-]+)?\.(jpg|png|webp)$/.test(
      key,
    )
  ) {
    return new Response("Not found", { status: 404 });
  }
  const ownerId = key.split("/")[1];
  if (!user || !ownerId || user.id !== ownerId) return new Response("Not found", { status: 404 });
  const bucket = getCloudEnv().IMAGES;
  let object = await bucket?.get(key);
  // Older records referenced the pre-versioned filename. If that exact
  // object was replaced by a versioned upload, resolve the latest matching
  // object instead of returning a broken image on another device.
  if (!object && bucket && /-(original|processed|thumbnail)\.(jpg|png|webp)$/.test(key)) {
    const listed = await bucket.list({ prefix: key.replace(/\.(jpg|png|webp)$/, ""), limit: 100 });
    const match = listed.objects
      .filter((item) =>
        /-(original|processed|thumbnail)-[a-f0-9-]+\.(jpg|png|webp)$/.test(item.key),
      )
      .sort((a, b) => (b.uploaded?.getTime() ?? 0) - (a.uploaded?.getTime() ?? 0))[0];
    if (match) object = await bucket.get(match.key);
  }
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(request.method === "HEAD" ? null : object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "image/jpeg",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
