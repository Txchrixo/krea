import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    if (session.role === "ADMIN" && !session.creatorSlug) {
      return NextResponse.json({ error: "Admin sans profil créateur." }, { status: 403 });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
    });
    if (!creator) {
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }

    const ebooks = await db.ebook.findMany({
      where: { creatorId: creator.id },
      select: { id: true, title: true, price: true, salesCount: true },
    });
    const ebookIds = ebooks.map((e) => e.id);

    const orders = await db.order.findMany({
      where: { ebookId: { in: ebookIds }, paymentStatus: "PAID" },
      include: {
        buyer: { select: { name: true, email: true, country: true } },
        ebook: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = [
      "Reference",
      "Date",
      "Ebook",
      "Client",
      "Email",
      "Pays",
      "Montant (FCFA)",
      "Commission plateforme (FCFA)",
      "Votre revenu (FCFA)",
      "Moyen de paiement",
      "Statut",
    ];
    const rows = orders.map((o) => [
      o.ref,
      o.createdAt.toISOString().slice(0, 10),
      o.ebook.title,
      o.buyer.name || "Client",
      o.buyer.email,
      o.buyer.country || " - ",
      o.amount,
      o.platformFee,
      o.creatorEarning,
      o.paymentMethod,
      o.paymentStatus,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    // Add summary at the end
    const totalRevenue = orders.reduce((s, o) => s + o.creatorEarning, 0);
    const totalSales = orders.length;
    const csvWithSummary = csv + `\n\nRésumé\nTotal ventes,${totalSales}\nRevenu net,${totalRevenue} FCFA\nGénéré le,${new Date().toISOString().slice(0, 10)}`;

    const filename = `krea-ventes-${creator.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csvWithSummary, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[creator.export]", err);
    return NextResponse.json({ error: "Erreur lors de l'export." }, { status: 500 });
  }
}
