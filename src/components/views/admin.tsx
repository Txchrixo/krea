"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  BookOpen,
  Wallet,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";
import { formatFCFA, formatNumber, formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserCog } from "lucide-react";

interface AdminStats {
  totalRevenue: number;
  totalPayouts: number;
  totalCreators: number;
  totalEbooks: number;
  totalReaders: number;
  pendingPayouts: number;
  pendingEbooks: number;
  monthlyData?: { month: string; revenue: number; sales: number }[];
  topCreators?: { id: string; displayName: string; slug: string; totalSales: number; totalRevenue: number; plan: string }[];
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  banned: boolean;
  bannedReason: string | null;
  banning?: boolean;
  country: string | null;
  phone: string | null;
  createdAt: string;
  creator: {
    slug: string;
    displayName: string;
    plan: string;
    totalSales: number;
    totalRevenue: number;
    walletBalance: number;
    verified: boolean;
  } | null;
  _count: { orders: number; licenses: number; reviews: number };
}

interface AdminEbook {
  id: string;
  title: string;
  status: string;
  featured: boolean;
  isBestseller: boolean;
  price: number;
  salesCount: number;
  creator: { displayName: string };
}

interface AdminPayout {
  id: string;
  ref: string;
  amount: number;
  fee: number;
  method: string;
  status: string;
  createdAt: string;
  creator: { displayName: string };
}

export function AdminView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ebooks, setEbooks] = useState<AdminEbook[]>([]);
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/ebooks").then((r) => r.json()),
      fetch("/api/admin/payouts").then((r) => r.json()),
    ]).then(([s, e, p]) => {
      setStats(s);
      setEbooks(e.items || []);
      setPayouts(p.items || []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function toggleFeatured(eb: AdminEbook, key: "featured" | "isBestseller") {
    await fetch(`/api/admin/ebooks/${eb.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: !eb[key] }),
    });
    toast.success(`${key === "featured" ? "Mise en avant" : "Best-seller"} ${eb[key] ? "retiré" : "activé"}`);
    load();
  }

  async function approvePayout(id: string) {
    await fetch(`/api/admin/payouts/${id}/approve`, { method: "POST" });
    toast.success("Retrait approuvé ✅");
    load();
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Badge className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/10">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-primary" /> Panel administrateur
          </Badge>
          <h1 className="mt-2 font-heading text-2xl font-600 text-foreground sm:text-3xl">Vue d'ensemble de la plateforme</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* KPIs */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminKpi icon={DollarSign} label="Revenu plateforme" value={formatFCFA(stats.totalRevenue)} color="#5DBE8A" />
            <AdminKpi icon={Users} label="Créateurs" value={formatNumber(stats.totalCreators)} color="#FFD86B" />
            <AdminKpi icon={BookOpen} label="Ebooks" value={formatNumber(stats.totalEbooks)} color="#C8553D" />
            <AdminKpi icon={Wallet} label="Lecteurs" value={formatNumber(stats.totalReaders)} color="#697E6E" />
            <AdminKpi icon={Wallet} label="Retraits en attente" value={String(stats.pendingPayouts)} color="#FFD86B" />
            <AdminKpi icon={Clock} label="Brouillons" value={String(stats.pendingEbooks)} color="#697E6E" />
            <AdminKpi icon={TrendingUp} label="Retraits payés" value={formatFCFA(stats.totalPayouts)} color="#5DBE8A" />
          </div>
        )}

        {/* Activity feed */}
        <AdminActivityFeed />

        {/* Revenue chart + Top creators */}
        {stats?.monthlyData && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-600">Revenu de la plateforme</h3>
                  <p className="text-xs text-muted-foreground">6 derniers mois</p>
                </div>
                <Badge className="bg-primary/15 text-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-primary" /> {formatFCFA(stats.totalRevenue)}
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={stats.monthlyData}>
                  <defs>
                    <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5DBE8A" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#5DBE8A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD8CE" strokeOpacity={0.4} />
                  <XAxis dataKey="month" stroke="#697E6E" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#697E6E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#FFFCF1", border: "1px solid #CBD8CE", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [formatFCFA(v), "Revenu"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#5DBE8A" strokeWidth={2.5} fill="url(#adminRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Top creators */}
            {stats.topCreators && stats.topCreators.length > 0 && (
              <Card className="p-5">
                <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600">
                  <Star className="h-5 w-5 text-accent" /> Top créateurs
                </h3>
                <div className="space-y-3">
                  {stats.topCreators.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-600 ${i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-600 text-foreground">{c.displayName}</p>
                        <p className="text-[11px] text-muted-foreground">{c.totalSales} ventes · Plan {c.plan}</p>
                      </div>
                      <span className="font-heading text-sm font-600 text-primary">{formatFCFA(c.totalRevenue)}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Pending payouts */}
        <Card className="p-5">
          <h3 className="mb-4 font-heading text-lg font-600">Retraits en attente</h3>
          {payouts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucun retrait en attente 🎉</p>
          ) : (
            <div className="overflow-x-auto scroll-krea">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3 font-500">Réf</th>
                    <th className="pb-2 px-3 font-500">Créateur</th>
                    <th className="pb-2 px-3 font-500">Montant</th>
                    <th className="pb-2 px-3 font-500">Méthode</th>
                    <th className="pb-2 px-3 font-500">Date</th>
                    <th className="pb-2 pl-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{p.ref}</td>
                      <td className="px-3 font-500">{p.creator.displayName}</td>
                      <td className="px-3 font-600">{formatFCFA(p.amount)}</td>
                      <td className="px-3"><Badge variant="outline" className="text-muted-foreground">{p.method}</Badge></td>
                      <td className="px-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                      <td className="pl-3 text-right">
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => approvePayout(p.id)}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approuver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Ebooks moderation */}
        <Card className="p-5">
          <h3 className="mb-4 font-heading text-lg font-600">Catalogue ebooks</h3>
          <div className="overflow-x-auto scroll-krea">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-500">Ebook</th>
                  <th className="pb-2 px-3 font-500">Créateur</th>
                  <th className="pb-2 px-3 font-500">Prix</th>
                  <th className="pb-2 px-3 font-500">Ventes</th>
                  <th className="pb-2 px-3 font-500">Statut</th>
                  <th className="pb-2 px-3 font-500">À la une</th>
                  <th className="pb-2 pl-3 font-500">Best-seller</th>
                </tr>
              </thead>
              <tbody>
                {ebooks.map((eb) => (
                  <tr key={eb.id} className="border-b border-border/50">
                    <td className="py-2.5 pr-3 font-500">{eb.title}</td>
                    <td className="px-3 text-muted-foreground">{eb.creator.displayName}</td>
                    <td className="px-3">{formatFCFA(eb.price)}</td>
                    <td className="px-3">{eb.salesCount}</td>
                    <td className="px-3"><Badge variant="outline" className="text-muted-foreground">{eb.status}</Badge></td>
                    <td className="px-3">
                      <button onClick={() => toggleFeatured(eb, "featured")} className={`rounded-full px-2 py-0.5 text-xs font-500 ${eb.featured ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {eb.featured ? "Oui" : "Non"}
                      </button>
                    </td>
                    <td className="pl-3">
                      <button onClick={() => toggleFeatured(eb, "isBestseller")} className={`rounded-full px-2 py-0.5 text-xs font-500 ${eb.isBestseller ? "bg-accent/30 text-foreground" : "bg-muted text-muted-foreground"}`}>
                        {eb.isBestseller ? "Oui" : "Non"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* User management */}
        <AdminUsersSection />
      </div>
    </div>
  );
}

function AdminActivityFeed() {
  const [data, setData] = useState<{
    signups: { id: string; name: string; email: string; role: string; country: string; createdAt: string }[];
    orders: { id: string; ref: string; buyerName: string; ebookTitle: string; amount: number; paymentMethod: string; paymentStatus: string; createdAt: string }[];
    payouts: { id: string; ref: string; creatorName: string; amount: number; method: string; status: string; createdAt: string }[];
    reviews: { id: string; userName: string; ebookTitle: string; rating: number; comment: string | null; createdAt: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Recent signups */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600">
          <Users className="h-5 w-5 text-primary" /> Nouveaux inscrits
        </h3>
        <div className="space-y-2">
          {data.signups.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg bg-background/60 px-3 py-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-600 text-primary">
                {u.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-500 text-foreground">{u.name}</p>
                <p className="text-[11px] text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <Badge variant="outline" className="text-[10px] text-muted-foreground">{u.role}</Badge>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(u.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent orders */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600">
          <TrendingUp className="h-5 w-5 text-primary" /> Ventes récentes
        </h3>
        <div className="space-y-2">
          {data.orders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center gap-3 rounded-lg bg-background/60 px-3 py-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-600 text-accent-foreground">
                {o.buyerName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-500 text-foreground">{o.buyerName}</p>
                <p className="text-[11px] text-muted-foreground">{o.ebookTitle} · {o.paymentMethod}</p>
              </div>
              <span className="flex-shrink-0 font-heading text-sm font-600 text-primary">{formatFCFA(o.amount)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent reviews */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600">
          <Star className="h-5 w-5 text-accent" /> Avis récents
        </h3>
        <div className="space-y-2">
          {data.reviews.map((r) => (
            <div key={r.id} className="flex items-start gap-3 rounded-lg bg-background/60 px-3 py-2">
              <div className="flex flex-shrink-0 gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={j < r.rating ? "h-3 w-3 fill-accent text-accent" : "h-3 w-3 text-muted-foreground/30"} />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-500 text-foreground">{r.userName}</p>
                <p className="text-[11px] text-muted-foreground">{r.ebookTitle}</p>
                {r.comment && <p className="mt-0.5 line-clamp-1 text-[11px] italic text-muted-foreground">"{r.comment}"</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent payouts */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600">
          <Wallet className="h-5 w-5 text-primary" /> Retraits récents
        </h3>
        <div className="space-y-2">
          {data.payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg bg-background/60 px-3 py-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-600 text-primary">
                {p.creatorName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-500 text-foreground">{p.creatorName}</p>
                <p className="text-[11px] text-muted-foreground">{p.method} · {formatDate(p.createdAt)}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-heading text-sm font-600 text-foreground">{formatFCFA(p.amount)}</p>
                <Badge variant="outline" className={`h-4 text-[10px] ${p.status === "PAID" ? "text-primary" : "text-muted-foreground"}`}>
                  {p.status === "PAID" ? "Payé" : "En attente"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AdminKpi({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card className="p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color + "22" }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-600 text-foreground">{value}</p>
    </Card>
  );
}

function AdminUsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");

  function reload() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "all") params.set("role", role);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.items || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(reload, 250);
    return () => clearTimeout(t);
  }, [q, role]);

  async function toggleBan(u: AdminUser) {
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, banning: true } : x));
    try {
      const res = await fetch(`/api/admin/users/${u.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: u.banned ? "unban" : "ban" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(u.banned ? "Utilisateur débanni" : "Utilisateur banni");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, banning: false } : x));
    }
  }

  const roleColors: Record<string, string> = {
    ADMIN: "bg-destructive/15 text-destructive",
    CREATOR: "bg-primary/15 text-primary",
    BUYER: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 font-heading text-lg font-600">
          <UserCog className="h-5 w-5 text-primary" /> Utilisateurs ({total})
        </h3>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="CREATOR">Créateurs</SelectItem>
              <SelectItem value="BUYER">Lecteurs</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé.</p>
      ) : (
        <div className="overflow-x-auto scroll-krea">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-500">Utilisateur</th>
                <th className="pb-2 px-3 font-500">Rôle</th>
                <th className="pb-2 px-3 font-500">Pays</th>
                <th className="pb-2 px-3 font-500">Achats</th>
                <th className="pb-2 px-3 font-500">Avis</th>
                <th className="pb-2 px-3 font-500">Créateur</th>
                <th className="pb-2 px-3 font-500">Inscrit le</th>
                <th className="pb-2 pl-3 font-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={`border-b border-border/50 hover:bg-muted/30 ${u.banned ? "opacity-50" : ""}`}>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-600 ${u.banned ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                        {(u.name || u.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-500 text-foreground">
                          {u.name || "Sans nom"}
                          {u.banned && <Badge className="bg-destructive/15 text-destructive">Banni</Badge>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        {u.banned && u.bannedReason && (
                          <p className="text-[10px] text-destructive">Raison: {u.bannedReason}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    <Badge className={roleColors[u.role] || "bg-muted text-muted-foreground"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-3 text-muted-foreground">{u.country || "—"}</td>
                  <td className="px-3">{u._count.licenses}</td>
                  <td className="px-3">{u._count.reviews}</td>
                  <td className="px-3">
                    {u.creator ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-500 text-foreground">{u.creator.displayName}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="h-4 text-[10px] text-primary">{u.creator.plan}</Badge>
                          <span className="text-[10px] text-muted-foreground">{formatFCFA(u.creator.totalRevenue)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="pl-3">
                    {u.role !== "ADMIN" && (
                      <Button
                        size="sm"
                        variant={u.banned ? "outline" : "ghost"}
                        className={u.banned ? "h-7 text-xs text-primary" : "h-7 text-xs text-destructive hover:text-destructive"}
                        onClick={() => toggleBan(u)}
                      >
                        {u.banning ? <Loader2 className="h-3 w-3 animate-spin" /> : u.banned ? "Débannir" : "Bannir"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
