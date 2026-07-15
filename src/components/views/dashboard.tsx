"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
  BookOpen,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  PenLine,
  DollarSign,
  Users,
  Eye,
  Loader2,
  ChevronRight,
  Download,
  PiggyBank,
  Sparkles,
  Globe,
  Smartphone,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { DashboardStats, PayoutItem, EbookCard } from "@/lib/types";
import { formatFCFA, formatNumber, formatDate, timeAgo } from "@/lib/format";
import { EbookCover } from "@/components/ebook-cover";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DashboardView() {
  const { view, setView, user } = useApp();
  const initialTab =
    view.name === "dashboard-ebooks" ? "ebooks"
    : view.name === "dashboard-sales" ? "sales"
    : view.name === "dashboard-payouts" ? "payouts"
    : view.name === "dashboard-analytics" ? "analytics"
    : "overview";

  const [tab, setTab] = useState(initialTab);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [ebooks, setEbooks] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/creator/stats").then((r) => r.json()),
      fetch("/api/creator/payouts").then((r) => r.json()),
      fetch("/api/creator/ebooks").then((r) => r.json()),
    ])
      .then(([s, p, e]) => {
        setStats(s);
        setPayouts(p.items || []);
        setEbooks(e.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats || (stats as any).error) return null;

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Bonjour 👋</p>
              <h1 className="font-heading text-2xl font-600 text-foreground sm:text-3xl">
                {user?.name ?? "Créateur"}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge className="bg-primary/15 text-foreground hover:bg-primary/15">
                  <Sparkles className="mr-1 h-3 w-3 text-primary" /> Plan {user?.creatorPlan ?? "FREE"}
                </Badge>
                {user?.creatorSlug && (
                  <Badge variant="outline" className="text-muted-foreground">
                    krea.com/{user.creatorSlug}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView({ name: "dashboard-site" })}>
                <Globe className="mr-1.5 h-4 w-4" /> Mon site
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setView({ name: "editor" })}>
                <Plus className="mr-1 h-4 w-4" /> Nouvel ebook
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="ebooks">Mes ebooks</TabsTrigger>
            <TabsTrigger value="sales">Ventes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Lecteurs</TabsTrigger>
            <TabsTrigger value="payouts">Retraits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab stats={stats} />
          </TabsContent>

          <TabsContent value="ebooks" className="mt-6">
            <EbooksTab ebooks={ebooks} />
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <SalesTab stats={stats} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab stats={stats} />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <InsightsTab />
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <PayoutsTab payouts={payouts} walletBalance={stats.walletBalance} onChanged={() => {
              Promise.all([
                fetch("/api/creator/stats").then((r) => r.json()),
                fetch("/api/creator/payouts").then((r) => r.json()),
              ]).then(([s, p]) => { setStats(s); setPayouts(p.items || []); });
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ─── OVERVIEW ─── */
function OverviewTab({ stats }: { stats: DashboardStats }) {
  const { setView } = useApp();
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={DollarSign} label="Revenu total" value={formatFCFA(stats.totalRevenue)} trend="+12.4%" up />
        <KpiCard icon={Wallet} label="Solde wallet" value={formatFCFA(stats.walletBalance)} trend="Disponible" up />
        <KpiCard icon={BookOpen} label="Ventes" value={formatNumber(stats.totalSales)} trend="+8 cette semaine" up />
        <KpiCard icon={Star} label="Note moyenne" value={`${(stats.ratingAvg ?? 0).toFixed(1)} / 5`} trend={`${stats.publishedEbooks ?? 0} ebooks publiés`} />
      </div>

      {/* Revenue chart */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-600">Évolution du revenu</h3>
            <p className="text-xs text-muted-foreground">6 derniers mois</p>
          </div>
          <Badge className="bg-primary/15 text-foreground hover:bg-primary/15">
            <TrendingUp className="mr-1 h-3 w-3 text-primary" /> +38%
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={stats.monthlyData ?? []}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
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
            <Area type="monotone" dataKey="revenue" stroke="#5DBE8A" strokeWidth={2.5} fill="url(#rev)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Top ebooks + recent orders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-600">Top ebooks</h3>
            <Button variant="ghost" size="sm" onClick={() => setView({ name: "dashboard-ebooks" })}>
              Voir tout <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {(stats.topEbooks ?? []).slice(0, 4).map((eb, i) => (
              <div key={eb.id} className="flex items-center gap-3">
                <span className="font-heading text-sm font-600 text-muted-foreground">#{i + 1}</span>
                <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded">
                  <EbookCover title={eb.title} coverUrl={eb.coverUrl} coverColor={eb.coverColor} size="sm" showCreator={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-600 text-foreground">{eb.title}</p>
                  <p className="text-xs text-muted-foreground">{eb.sales} ventes · ⭐ {eb.rating.toFixed(1)}</p>
                </div>
                <span className="font-heading text-sm font-600 text-primary">{formatFCFA(eb.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-600">Ventes récentes</h3>
            <Button variant="ghost" size="sm" onClick={() => setView({ name: "dashboard-sales" })}>
              Voir tout <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {(stats.recentOrders ?? []).slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-lg bg-background/60 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-600 text-primary">
                  {o.buyerName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-500 text-foreground">{o.buyerName}</p>
                  <p className="text-[11px] text-muted-foreground">{o.ebookTitle} · {o.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm font-600 text-primary">+{formatFCFA(o.creatorEarning)}</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(o.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, trend, up }: { icon: any; label: string; value: string; trend?: string; up?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-500 ${up ? "text-primary" : "text-muted-foreground"}`}>
            {up && <ArrowUpRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-heading text-2xl font-600 text-foreground">{value}</p>
    </Card>
  );
}

/* ─── EBOOKS ─── */
function EbooksTab({ ebooks }: { ebooks: EbookCard[] }) {
  const { setView } = useApp();
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-600">Mes ebooks ({ebooks.length})</h3>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setView({ name: "editor" })}>
          <Plus className="mr-1 h-4 w-4" /> Créer
        </Button>
      </div>
      <div className="overflow-x-auto scroll-krea">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-3 font-500">Ebook</th>
              <th className="pb-2 px-3 font-500">Statut</th>
              <th className="pb-2 px-3 font-500">Prix</th>
              <th className="pb-2 px-3 font-500">Ventes</th>
              <th className="pb-2 px-3 font-500">Note</th>
              <th className="pb-2 pl-3"></th>
            </tr>
          </thead>
          <tbody>
            {ebooks.map((eb) => (
              <tr key={eb.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-7 flex-shrink-0 overflow-hidden rounded">
                      <EbookCover title={eb.title} coverUrl={eb.coverUrl} coverColor={eb.coverColor} size="sm" showCreator={false} />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-600 text-foreground">{eb.title}</p>
                      <p className="text-xs text-muted-foreground">{eb.pageCount} pages</p>
                    </div>
                  </div>
                </td>
                <td className="px-3">
                  <Badge variant="outline" className={eb.salesCount > 5 ? "border-primary/30 text-primary" : "text-muted-foreground"}>
                    {(eb as any).status === "PUBLISHED" ? "Publié" : "Brouillon"}
                  </Badge>
                </td>
                <td className="px-3 font-500">{formatFCFA(eb.price)}</td>
                <td className="px-3">{eb.salesCount}</td>
                <td className="px-3">⭐ {(eb.ratingAvg ?? 0).toFixed(1)}</td>
                <td className="pl-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setView({ name: "editor", ebookId: eb.slug })}>
                    <PenLine className="h-3.5 w-3.5" /> Éditer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─── SALES ─── */
function SalesTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-600">Ventes par mois</h3>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/creator/export" download>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Exporter CSV
            </a>
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.monthlyData ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBD8CE" strokeOpacity={0.4} />
            <XAxis dataKey="month" stroke="#697E6E" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#697E6E" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#FFFCF1", border: "1px solid #CBD8CE", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="sales" fill="#5DBE8A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 font-heading text-lg font-600">Toutes les ventes</h3>
        <div className="overflow-x-auto scroll-krea">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-500">Réf</th>
                <th className="pb-2 px-3 font-500">Client</th>
                <th className="pb-2 px-3 font-500">Ebook</th>
                <th className="pb-2 px-3 font-500">Montant</th>
                <th className="pb-2 px-3 font-500">Votre part</th>
                <th className="pb-2 px-3 font-500">Méthode</th>
                <th className="pb-2 pl-3 font-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentOrders ?? []).map((o) => (
                <tr key={o.id} className="border-b border-border/50">
                  <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{o.ref}</td>
                  <td className="px-3 font-500">{o.buyerName}</td>
                  <td className="px-3 text-muted-foreground">{o.ebookTitle}</td>
                  <td className="px-3 font-500">{formatFCFA(o.amount)}</td>
                  <td className="px-3 font-600 text-primary">{formatFCFA(o.creatorEarning)}</td>
                  <td className="px-3">
                    <Badge variant="outline" className="text-muted-foreground">{o.paymentMethod}</Badge>
                  </td>
                  <td className="pl-3 text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─── ANALYTICS ─── */
function AnalyticsTab({ stats }: { stats: DashboardStats }) {
  const insights = [
    { label: "Taux de conversion", value: `${(stats.conversionRate ?? 0).toFixed(1)}%`, icon: TrendingUp, desc: "Visiteurs → acheteurs" },
    { label: "Panier moyen", value: stats.totalSales > 0 ? formatFCFA(Math.round((stats.totalRevenue ?? 0) / stats.totalSales)) : " - ", icon: DollarSign, desc: "Par commande" },
    { label: "Ebooks publiés", value: String(stats.publishedEbooks), icon: BookOpen, desc: `sur ${stats.totalEbooks} créés` },
    { label: "Note moyenne", value: `${(stats.ratingAvg ?? 0).toFixed(1)} / 5`, icon: Star, desc: "Tous ebooks confondus" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((i) => (
          <Card key={i.label} className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
              <i.icon className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{i.label}</p>
            <p className="font-heading text-xl font-600 text-foreground">{i.value}</p>
            <p className="text-[11px] text-muted-foreground">{i.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-4 font-heading text-lg font-600">Performance par ebook</h3>
        <div className="space-y-3">
          {(stats.topEbooks ?? []).map((eb, i) => {
            const max = stats.topEbooks?.[0]?.sales || 1;
            const pct = (eb.sales / max) * 100;
            return (
              <div key={eb.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="line-clamp-1 font-500 text-foreground">{eb.title}</span>
                  <span className="text-muted-foreground">{eb.sales} ventes · {formatFCFA(eb.revenue)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: i === 0 ? "#5DBE8A" : i === 1 ? "#FFD86B" : "#697E6E" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Geographic distribution + Payment methods */}
      <div className="grid gap-4 lg:grid-cols-2">
        {stats.geographicData && stats.geographicData.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600">
              <Globe className="h-5 w-5 text-primary" /> Origine géographique
            </h3>
            <div className="space-y-3">
              {stats.geographicData.slice(0, 6).map((g, i) => {
                const max = stats.geographicData![0]?.count || 1;
                const pct = (g.count / max) * 100;
                return (
                  <div key={g.code}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-500 text-foreground">
                        <span className="flex h-6 w-8 items-center justify-center rounded bg-primary/10 text-[10px] font-600 text-primary">{g.code}</span>
                        {g.label}
                      </span>
                      <span className="text-muted-foreground">{g.count} vente{g.count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {stats.paymentMethodData && stats.paymentMethodData.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600">
              <Smartphone className="h-5 w-5 text-primary" /> Moyens de paiement
            </h3>
            <div className="space-y-3">
              {stats.paymentMethodData.map((m, i) => {
                const total = stats.paymentMethodData!.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? (m.count / total) * 100 : 0;
                const colors: Record<string, string> = { MTN: "#FFCC00", ORANGE: "#FF7900", WAVE: "#1DC8FF", CARD: "#1F4A2E" };
                return (
                  <div key={m.method}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-500 text-foreground">
                        <span className="h-3 w-3 rounded-full" style={{ background: colors[m.method] || "#5DBE8A" }} />
                        {m.method === "MTN" ? "MTN Mobile Money" : m.method === "ORANGE" ? "Orange Money" : m.method === "WAVE" ? "Wave" : m.method === "CARD" ? "Carte bancaire" : m.method}
                      </span>
                      <span className="text-muted-foreground">{m.count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: colors[m.method] || "#5DBE8A" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ─── INSIGHTS (Reader engagement) ─── */
function InsightsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/insights")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Lecteurs uniques</p>
          <p className="font-heading text-2xl font-600 text-foreground">{data.totalReaders}</p>
        </Card>
        <Card className="p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
            <Clock className="h-5 w-5 text-accent" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Temps de lecture total</p>
          <p className="font-heading text-2xl font-600 text-foreground">{data.totalReadingMinutes} min</p>
        </Card>
        <Card className="p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Taux de completion moyen</p>
          <p className="font-heading text-2xl font-600 text-foreground">{data.avgCompletionRate}%</p>
        </Card>
      </div>

      {/* Reader engagement chart */}
      {data.readerEngagement && data.readerEngagement.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 font-heading text-lg font-600">Engagement des lecteurs (14 jours)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.readerEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD8CE" strokeOpacity={0.4} />
              <XAxis dataKey="date" stroke="#697E6E" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#697E6E" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#FFFCF1", border: "1px solid #CBD8CE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="readers" name="Lecteurs" fill="#5DBE8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top ebooks by reading sessions */}
        {data.topChapters && data.topChapters.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-4 font-heading text-lg font-600">Ebooks les plus lus</h3>
            <div className="space-y-3">
              {data.topChapters.map((eb: any, i: number) => {
                const max = data.topChapters[0]?.count || 1;
                const pct = (eb.count / max) * 100;
                return (
                  <div key={eb.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="line-clamp-1 font-500 text-foreground">{eb.title}</span>
                      <span className="text-muted-foreground">{eb.count} sessions · {eb.minutes} min</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? "#5DBE8A" : i === 1 ? "#FFD86B" : "#697E6E" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent readers */}
        {data.recentReaders && data.recentReaders.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-4 font-heading text-lg font-600">Lecteurs récents</h3>
            <div className="space-y-2">
              {data.recentReaders.map((r: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 rounded-lg bg-background/60 px-3 py-2"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-600 text-primary">
                    {r.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-500 text-foreground">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.ebookTitle} · {r.country}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ─── PAYOUTS ─── */
function PayoutsTab({ payouts, walletBalance, onChanged }: { payouts: PayoutItem[]; walletBalance: number; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("MTN");
  const [loading, setLoading] = useState(false);

  const minPayout = 10000;
  const amt = parseInt(amount || "0", 10);

  async function requestPayout() {
    if (amt < minPayout) {
      toast.error(`Montant minimum : ${formatFCFA(minPayout)}`);
      return;
    }
    if (amt > walletBalance) {
      toast.error("Solde insuffisant");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/creator/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Demande de retrait envoyée 💸");
      setAmount("");
      setOpen(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  }

  const fee = Math.max(200, Math.round(amt * 0.02));

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-[#1F4A2E] to-[#2a5a3d] p-6" style={{ color: "#FBF5E3" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Solde disponible</p>
              <p className="font-heading text-4xl font-600">{formatFCFA(walletBalance)}</p>
              <p className="mt-1 text-xs opacity-70">Retrait min. {formatFCFA(minPayout)} · frais 2% (min 200 F)</p>
            </div>
            <PiggyBank className="h-12 w-12 opacity-50" />
          </div>
          <Button
            className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={walletBalance < minPayout}
            onClick={() => setOpen(true)}
          >
            <Download className="mr-1.5 h-4 w-4" /> Retirer mes gains
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 font-heading text-lg font-600">Historique des retraits</h3>
        {payouts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <Wallet className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">Aucun retrait pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scroll-krea">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-500">Réf</th>
                  <th className="pb-2 px-3 font-500">Montant</th>
                  <th className="pb-2 px-3 font-500">Frais</th>
                  <th className="pb-2 px-3 font-500">Net reçu</th>
                  <th className="pb-2 px-3 font-500">Méthode</th>
                  <th className="pb-2 px-3 font-500">Statut</th>
                  <th className="pb-2 pl-3 font-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{p.ref}</td>
                    <td className="px-3 font-500">{formatFCFA(p.amount)}</td>
                    <td className="px-3 text-muted-foreground">-{formatFCFA(p.fee)}</td>
                    <td className="px-3 font-600 text-primary">{formatFCFA(p.amount - p.fee)}</td>
                    <td className="px-3">
                      <Badge variant="outline" className="text-muted-foreground">{p.method}</Badge>
                    </td>
                    <td className="px-3">
                      <Badge className={p.status === "PAID" ? "bg-primary/15 text-foreground" : "bg-accent/30 text-foreground"}>
                        {p.status === "PAID" ? "Payé" : "En cours"}
                      </Badge>
                    </td>
                    <td className="pl-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payout dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              <Wallet className="h-5 w-5 text-primary" /> Retrait de gains
            </DialogTitle>
            <DialogDescription>Les fonds seront envoyés sous 24h sur votre compte Mobile Money.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/5 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Solde disponible</span>
                <span className="font-600 text-foreground">{formatFCFA(walletBalance)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Montant à retirer (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex gap-2">
                {[10000, 25000, 50000, walletBalance].filter((v) => v >= minPayout && v <= walletBalance).map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="rounded-md border border-border px-2 py-1 text-xs hover:border-primary"
                  >
                    {v === walletBalance ? "Tout" : formatFCFA(v).replace(" F", "")}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Méthode de retrait</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                  <SelectItem value="ORANGE">Orange Money</SelectItem>
                  <SelectItem value="WAVE">Wave</SelectItem>
                  <SelectItem value="BANK">Virement bancaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {amt > 0 && (
              <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Montant</span><span>{formatFCFA(amt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Frais (2%)</span><span className="text-destructive">-{formatFCFA(fee)}</span></div>
                <div className="flex justify-between border-t border-border pt-1 font-600"><span>Net reçu</span><span className="text-primary">{formatFCFA(amt - fee)}</span></div>
              </div>
            )}
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading} onClick={requestPayout}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le retrait
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
