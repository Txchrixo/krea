"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Globe } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check as CheckIcon, ChevronsUpDown } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "MTN", label: "MTN MoMo", logo: "", color: "#FFCC00" },
  { id: "ORANGE", label: "Orange Money", logo: "", color: "#FF7900" },
  { id: "WAVE", label: "Wave", logo: "", color: "#1DC8FF" },
  { id: "CARD", label: "Carte bancaire", logo: "", color: "#1F4A2E" },
];

const COUNTRIES = [
  { id: "ALL", label: "Tous les pays", labelEn: "All countries", flag: "" },
  { id: "CM", label: "Cameroun", labelEn: "Cameroon", flag: "https://flagcdn.com/w40/cm.png" },
  { id: "SN", label: "Sénégal", labelEn: "Senegal", flag: "https://flagcdn.com/w40/sn.png" },
  { id: "CI", label: "Côte d'Ivoire", labelEn: "Ivory Coast", flag: "https://flagcdn.com/w40/ci.png" },
  { id: "NG", label: "Nigeria", labelEn: "Nigeria", flag: "https://flagcdn.com/w40/ng.png" },
  { id: "ML", label: "Mali", labelEn: "Mali", flag: "https://flagcdn.com/w40/ml.png" },
  { id: "BF", label: "Burkina Faso", labelEn: "Burkina Faso", flag: "https://flagcdn.com/w40/bf.png" },
  { id: "FR", label: "France", labelEn: "France", flag: "https://flagcdn.com/w40/fr.png" },
];

/* ───────────────────────── WALLET / PAYMENT ───────────────────────── */
interface Tx {
  buyer: TranslationKey;
  title: TranslationKey;
  amount: number;
  methodId: string;
  country: string;
}

export function WalletSection() {
  const { t, lang } = useApp();
  const [methodOpen, setMethodOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("MTN");
  const [selectedCountry, setSelectedCountry] = useState("ALL");

  const features: TranslationKey[] = [
    "wallet.f1",
    "wallet.f2",
    "wallet.f3",
    "wallet.f4",
  ];
  const transactions: Tx[] = [
    // MTN
    { buyer: "wallet.tx.1.buyer", title: "wallet.tx.1.title", amount: 5000, methodId: "MTN", country: "CM" },
    { buyer: "wallet.tx.2.buyer", title: "wallet.tx.2.title", amount: 7500, methodId: "MTN", country: "CM" },
    { buyer: "wallet.tx.3.buyer", title: "wallet.tx.3.title", amount: 3500, methodId: "MTN", country: "NG" },
    { buyer: "wallet.tx.4.buyer", title: "wallet.tx.4.title", amount: 10000, methodId: "MTN", country: "CI" },
    // Orange
    { buyer: "wallet.tx.1.buyer", title: "wallet.tx.1.title", amount: 3500, methodId: "ORANGE", country: "SN" },
    { buyer: "wallet.tx.2.buyer", title: "wallet.tx.2.title", amount: 6000, methodId: "ORANGE", country: "ML" },
    { buyer: "wallet.tx.3.buyer", title: "wallet.tx.3.title", amount: 4500, methodId: "ORANGE", country: "SN" },
    // Wave
    { buyer: "wallet.tx.1.buyer", title: "wallet.tx.1.title", amount: 4500, methodId: "WAVE", country: "SN" },
    { buyer: "wallet.tx.2.buyer", title: "wallet.tx.2.title", amount: 8000, methodId: "WAVE", country: "SN" },
    { buyer: "wallet.tx.4.buyer", title: "wallet.tx.4.title", amount: 5500, methodId: "WAVE", country: "CI" },
    // Card
    { buyer: "wallet.tx.3.buyer", title: "wallet.tx.3.title", amount: 12000, methodId: "CARD", country: "FR" },
    { buyer: "wallet.tx.4.buyer", title: "wallet.tx.4.title", amount: 9500, methodId: "CARD", country: "BF" },
  ];

  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod) || PAYMENT_METHODS[0];
  const currentCountry = COUNTRIES.find((c) => c.id === selectedCountry) || COUNTRIES[0];
  const filteredTx = transactions.filter((tx) => {
    const methodMatch = tx.methodId === selectedMethod;
    const countryMatch = selectedCountry === "ALL" || tx.country === selectedCountry;
    return methodMatch && countryMatch;
  });

  const countryLabel = (id: string) => {
    const c = COUNTRIES.find((c) => c.id === id);
    return lang === "en" ? c?.labelEn : c?.label;
  };

  return (
    <section className="bg-accent py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="relative">
            <h2 className="font-heading text-3xl font-600 leading-tight text-accent-foreground sm:text-4xl">
              {t("wallet.title")}
            </h2>
            <p className="mt-4 text-base text-accent-foreground/70 text-pretty">{t("wallet.desc")}</p>
            <ul className="mt-6 space-y-3">
              {features.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-accent-foreground/80">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-foreground" />
                  {t(p)}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: wallet card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Callout badge : top-left, overlapping the card's rounded corner */}
            <motion.div
              className="absolute -left-3 -top-3 z-10 rounded-full border border-border bg-foreground px-3 py-1.5 text-xs font-600 text-background shadow-lg"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <Clock className="mr-1 inline h-3.5 w-3.5" />
              {t("wallet.withdrawal")}
            </motion.div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-500 text-muted-foreground">{t("wallet.balance")}</span>
                <Badge className="bg-primary/15 text-foreground hover:bg-primary/15">
                  <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-primary" /> {t("wallet.realtime")}
                </Badge>
              </div>
              <div className="mt-2 font-heading text-4xl font-600 text-foreground">
                {formatFCFA(248500)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                +{formatFCFA(18000)} {t("wallet.thisWeek")}
              </div>

              {/* Dual selectors: payment method + country */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-600 uppercase tracking-wider text-muted-foreground">
                  {t("wallet.recent")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Payment method select */}
                  <Popover open={methodOpen} onOpenChange={setMethodOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={methodOpen}
                        aria-controls="wallet-method-list"
                        className="flex h-10 w-full items-center justify-between gap-1 rounded-lg border border-border bg-background px-2.5 text-xs transition-all hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      >
                        <span className="flex items-center gap-1.5 overflow-hidden">
                          {currentMethod.logo ? (
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white">
                              <img src={currentMethod.logo} alt={currentMethod.label} className="h-full w-full object-cover" />
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: currentMethod.color }}>
                              <CreditCard className="h-3 w-3 text-white" />
                            </span>
                          )}
                          <span className="truncate text-foreground">{currentMethod.label}</span>
                        </span>
                        <ChevronsUpDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandList>
                          <CommandEmpty>No method found.</CommandEmpty>
                          <CommandGroup>
                            {PAYMENT_METHODS.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={m.label}
                                onSelect={() => { setSelectedMethod(m.id); setMethodOpen(false); }}
                                className="gap-2"
                              >
                                {m.logo ? (
                                  <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-border bg-white">
                                    <img src={m.logo} alt={m.label} className="h-full w-full object-cover" />
                                  </span>
                                ) : (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: m.color }}>
                                    <CreditCard className="h-3.5 w-3.5 text-white" />
                                  </span>
                                )}
                                <span className="flex-1">{m.label}</span>
                                {selectedMethod === m.id && <CheckIcon className="h-4 w-4 text-primary" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Country select */}
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={countryOpen}
                        aria-controls="wallet-country-list"
                        className="flex h-10 w-full items-center justify-between gap-1 rounded-lg border border-border bg-background px-2.5 text-xs transition-all hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      >
                        <span className="flex items-center gap-1.5 overflow-hidden">
                          {currentCountry.flag ? (
                            <img src={currentCountry.flag} alt="" className="h-4 w-6 flex-shrink-0 rounded-sm object-cover" />
                          ) : (
                            <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate text-foreground">{lang === "en" ? currentCountry.labelEn : currentCountry.label}</span>
                        </span>
                        <ChevronsUpDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {COUNTRIES.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={`${c.label} ${c.labelEn}`}
                                onSelect={() => { setSelectedCountry(c.id); setCountryOpen(false); }}
                                className="gap-2"
                              >
                                {c.flag ? (
                                  <img src={c.flag} alt="" className="h-4 w-6 flex-shrink-0 rounded-sm object-cover" />
                                ) : (
                                  <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                )}
                                <span className="flex-1">{lang === "en" ? c.labelEn : c.label}</span>
                                {selectedCountry === c.id && <CheckIcon className="h-4 w-4 text-primary" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Transactions for selected method + country */}
              <div className="mt-3 space-y-2">
                {filteredTx.length > 0 ? (
                  filteredTx.map((tx, i) => {
                    const buyerName = t(tx.buyer);
                    const method = PAYMENT_METHODS.find((m) => m.id === tx.methodId);
                    const country = COUNTRIES.find((c) => c.id === tx.country);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-600 text-primary">
                            {buyerName[0]}
                          </div>
                          <div>
                            <p className="flex items-center gap-1 text-xs font-500 text-foreground">
                              <span>{buyerName}</span>
                              {country?.flag && <img src={country.flag} alt="" className="h-3 w-4 rounded-sm object-cover" />}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {t(tx.title)} · {method?.label}
                            </p>
                          </div>
                        </div>
                        <span className="font-heading text-sm font-600 text-primary">
                          +{formatFCFA(tx.amount)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg bg-background/40 px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      {lang === "en" ? "No transactions found." : "Aucune transaction trouvée."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CreditCard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
