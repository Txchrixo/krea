import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { license: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }
    await db.order.update({
      where: { id },
      data: { paymentStatus: "REFUNDED" },
    });
    if (order.license) {
      await db.license.update({
        where: { id: order.license.id },
        data: { status: "REVOKED" },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[orders.refund]", err);
    return NextResponse.json(
      { error: "Erreur lors du remboursement." },
      { status: 500 }
    );
  }
}
