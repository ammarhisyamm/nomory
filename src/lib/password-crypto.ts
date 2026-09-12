// Password hashing for Nomory username accounts.
// PBKDF2-SHA256 via WebCrypto — runs on Cloudflare Workers, Node, and
// browsers with no extra dependencies. A server-side pepper (session
// secret) is mixed in so a leaked database alone isn't enough to crack
// passwords offline.
//
// Stored format: pbkdf2-sha256$<iterations>$<salt-b64>$<hash-b64>

const ALGO = "PBKDF2";
const HASH = "SHA-256";
const ITERATIONS = 100_000;
const SALT_LEN = 16;
const HASH_LEN = 32;

function b64encode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function b64decode(value: string): Uint8Array {
  const bin = atob(value);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Constant-time comparison so verification doesn't leak hash prefixes. */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    ALGO,
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: ALGO, hash: HASH, salt: salt as BufferSource, iterations },
    key,
    HASH_LEN * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, pepper: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const hash = await derive(`${pepper}${password}`, salt, ITERATIONS);
  return `pbkdf2-sha256$${ITERATIONS}$${b64encode(salt)}$${b64encode(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
  pepper: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 10_000 || iterations > 2_000_000) return false;
  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = b64decode(parts[2]!);
    expected = b64decode(parts[3]!);
  } catch {
    return false;
  }
  if (salt.length !== SALT_LEN || expected.length !== HASH_LEN) return false;
  const actual = await derive(`${pepper}${password}`, salt, iterations);
  return timingSafeEqual(actual, expected);
}
