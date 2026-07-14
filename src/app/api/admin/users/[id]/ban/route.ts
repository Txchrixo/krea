import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason, action } = body as { reason?: string; action?: "ban" | "unban" };

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Impossible de bannir un admin." }, { status: 400 });
    }

    const banned = action === "ban";
    await db.user.update({
      where: { id },
      data: {
        banned,
        bannedReason: banned ? (reason || "Violation des conditions d'utilisation") : null,
      },
    });

    return NextResponse.json({
      ok: true,
      banned,
      bannedReason: banned ? (reason || "Violation des conditions d'utilisation") : null,
    });
  } catch (err) {
    console.error("[admin.ban]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
