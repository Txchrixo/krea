import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword,
  signToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }
    const user = await db.user.findUnique({
      where: { email },
      include: { creator: true },
    });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 }
      );
    }
    if (user.banned) {
      return NextResponse.json(
        { error: `Votre compte a été suspendu. Raison: ${user.bannedReason || "Violation des conditions d'utilisation"}.` },
        { status: 403 }
      );
    }
    const token = signToken({ userId: user.id, role: user.role });
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        country: user.country,
        creatorSlug: user.creator?.slug ?? null,
        creatorPlan: user.creator?.plan ?? null,
        walletBalance: user.creator?.walletBalance ?? 0,
      },
    });
    setSessionCookie(token, res);
    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { error: "Erreur lors de la connexion." },
      { status: 500 }
    );
  }
}
