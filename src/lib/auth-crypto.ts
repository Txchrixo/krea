// Krea : Pure crypto helpers (no Next.js deps, safe to import from scripts)
import crypto from "crypto";

const ALG = "sha256";
const SECRET =
  process.env.KREA_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "krea-dev-secret";

// ── Password hashing (scrypt, no extra deps) ─────────────────────────
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  if (!stored || !stored.startsWith("scrypt$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const salt = parts[1];
  const hash = parts[2];
  const test = crypto.scryptSync(pw, salt, 64).toString("hex");
  return (
    hash.length === test.length &&
    crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"))
  );
}

// ── Token (HMAC-signed base64url payload) ────────────────────────────
function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

export function signToken(payload: Record<string, unknown>): string {
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac(ALG, SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string | undefined | null):
  | { userId: string; role: string }
  | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto
    .createHmac(ALG, SECRET)
    .update(body)
    .digest("base64url");
  try {
    if (
      expected.length !== sig.length &&
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      return null;
    }
    if (expected !== sig) return null;
    const json = JSON.parse(fromB64url(body).toString("utf8"));
    if (typeof json.userId !== "string") return null;
    return { userId: json.userId, role: json.role };
  } catch {
    return null;
  }
}
