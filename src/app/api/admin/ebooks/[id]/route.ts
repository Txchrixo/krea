import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.status === "string") {
      data.status = body.status;
      if (body.status === "PUBLISHED") data.publishedAt = new Date();
    }
    if (typeof body.featured === "boolean") data.featured = body.featured;
    if (typeof body.isBestseller === "boolean")
      data.isBestseller = body.isBestseller;
    const updated = await db.ebook.update({ where: { id }, data });
    return NextResponse.json({ id: updated.id });
  } catch (err) {
    console.error("[admin.ebooks.update]", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
