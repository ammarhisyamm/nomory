import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENT_ITERATIONS,
  hashPassword,
  needsRehash,
  verifyPassword,
} from "../src/lib/password-crypto.ts";

test("password hashes round-trip at the Cloudflare-compatible iteration count", async () => {
  const pepper = "test-only-pepper";
  const stored = await hashPassword("correct horse battery staple", pepper);
  assert.equal(CURRENT_ITERATIONS, 100_000);
  assert.ok(stored.startsWith("pbkdf2-sha256$100000$"));
  assert.equal(await verifyPassword("correct horse battery staple", stored, pepper), true);
  assert.equal(await verifyPassword("wrong password", stored, pepper), false);
  assert.equal(needsRehash(stored), false);
});
