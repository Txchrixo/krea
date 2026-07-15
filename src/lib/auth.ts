// Krea : Auth helpers (cookie-based session via HMAC)
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/types";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
} from "@/lib/auth-crypto";

export { hashPassword, verifyPassword, signToken, verifyToken };

const COOKIE_NAME = "krea_session";

// ── Cookie helpers ───────────────────────────────────────────────────
export function setSessionCookie(token: string, res?: Response): void {
  const cookie = `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
  if (res) {
    res.headers.set("Set-Cookie", cookie);
  } else {
    void (async () => {
      (await cookies()).set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
      });
    })();
  }
}

export function clearSessionCookie(res?: Response): void {
  const cookie = `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
  if (res) {
    res.headers.set("Set-Cookie", cookie);
  } else {
    void (async () => {
      (await cookies()).delete(COOKIE_NAME);
    })();
  }
}

export async function readSessionToken(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value;
}

// ── Session user fetching ────────────────────────────────────────────
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await readSessionToken();
  const claims = verifyToken(token);
  if (!claims) return null;
  const user = await db.user.findUnique({
    where: { id: claims.userId },
    include: { creator: true },
  });
  if (!user) return null;
  if (user.banned) return null; // banned users can't access anything
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser["role"],
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    country: user.country,
    creatorSlug: user.creator?.slug ?? null,
    creatorPlan: user.creator?.plan ?? null,
    walletBalance: user.creator?.walletBalance ?? 0,
  };
}

// ── Auth guards for route handlers ───────────────────────────────────
export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function requireCreator(): Promise<SessionUser | null> {
  const u = await getSessionUser();
  if (!u) return null;
  if (u.role !== "CREATOR" && u.role !== "ADMIN") return null;
  return u;
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") return null;
  return u;
}

// Helper for routes to fetch the creator record (with id) for a session user
export async function getCreatorFromSession(
  user: SessionUser
): Promise<{ id: string } | null> {
  if (!user.creatorSlug) return null;
  const c = await db.creator.findUnique({
    where: { slug: user.creatorSlug },
    select: { id: true },
  });
  return c;
}
