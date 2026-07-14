import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toLicenseItem } from "@/lib/mappers";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const licenses = await db.license.findMany({
      where: { userId: session.id, status: { in: ["ACTIVE", "SUSPENDED"] } },
      include: {
        ebook: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            coverColor: true,
            pageCount: true,
            creator: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items: licenses.map(toLicenseItem) });
  } catch (err) {
    console.error("[library]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}
