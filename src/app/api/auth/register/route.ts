import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  signToken,
  setSessionCookie,
} from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password, phone, country, role } = body as {
      email?: string;
      name?: string;
      password?: string;
      phone?: string;
      country?: string;
      role?: "BUYER" | "CREATOR";
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, nom et mot de passe sont requis." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }
    const finalRole = role === "CREATOR" ? "CREATOR" : "BUYER";
    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        country,
        role: finalRole,
        passwordHash: hashPassword(password),
      },
      include: { creator: true },
    });

    if (finalRole === "CREATOR") {
      let slug = slugify(name);
      // ensure uniqueness with random suffix
      if (await db.creator.findUnique({ where: { slug } })) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        while (await db.creator.findUnique({ where: { slug } })) {
          slug = `${slugify(name)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
      }
      await db.creator.create({
        data: {
          userId: user.id,
          slug,
          displayName: name,
          phone,
          country,
          plan: "FREE",
          commissionRate: 25,
          verified: false,
        },
      });
    }

    // reload to include creator
    const fresh = await db.user.findUnique({
      where: { id: user.id },
      include: { creator: true },
    });

    const token = signToken({ userId: user.id, role: finalRole });
    const res = NextResponse.json({
      user: {
        id: fresh!.id,
        email: fresh!.email,
        name: fresh!.name,
        role: fresh!.role,
        avatarUrl: fresh!.avatarUrl,
        phone: fresh!.phone,
        country: fresh!.country,
        creatorSlug: fresh!.creator?.slug ?? null,
        creatorPlan: fresh!.creator?.plan ?? null,
        walletBalance: fresh!.creator?.walletBalance ?? 0,
      },
    });
    setSessionCookie(token, res);
    return res;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
