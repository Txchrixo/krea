# Task ID: refactor-landing — work record

## Summary
Split the 735-line `src/components/views/landing.tsx` into 12 small files under
`src/components/landing/`, one per section, and migrated every hardcoded French/English
string to the i18n system (`t()` from `useApp()`).

## Files written

### New (in `src/components/landing/`)
1. `section-heading.tsx` — shared `SectionHeading` component, exported.
2. `hero.tsx` — `HeroSection` + `FloatingBook`.
3. `marquee.tsx` — `MarqueeSection`.
4. `stats-bar.tsx` — `StatsBar`.
5. `pillars.tsx` — `PillarsSection`.
6. `how-it-works.tsx` — `HowItWorksSection`.
7. `featured-ebooks.tsx` — `FeaturedEbooksSection`.
8. `protection.tsx` — `ProtectionSection`.
9. `wallet.tsx` — `WalletSection`.
10. `testimonials.tsx` — `TestimonialsSection`.
11. `pricing.tsx` — `PricingSection`.
12. `final-cta.tsx` — `FinalCTA`.

### Modified
- `src/components/views/landing.tsx` → thin ~30-line composition root.
- `src/lib/i18n.ts` → added ~60 new keys to BOTH `fr` and `en` sections.

## i18n keys added (both languages)
- Hero: `hero.feature.{watermark,payments,wallet,africa}`, `hero.{secured,boughtBy,trend}`,
  `hero.alt.{cover,reader}`.
- Pillars: `pillars.{1,2,3}.point{1-4}` (12 keys).
- Featured: `featured.viewAllMarketplace`.
- Protection: `protection.quote.{pre,user,post}` (split so the highlighted span is preserved).
- Wallet: `wallet.{realtime,thisWeek,f1,f2,f3,f4}`, `wallet.tx.{1,2,3}.{buyer,title}` (6 keys).
- Testimonials: `testimonial.{1,2,3,4}.{name,role,text}` (12 keys).
- Pricing: `pricing.{free,pro,premium}.commission`, `pricing.pro.price`,
  `pricing.premium.price`, `pricing.{free,pro,premium}.feature{1-7}` (19+3 keys).

## Approach
- Read original `landing.tsx` end-to-end, then `src/lib/i18n.ts`, then `src/lib/store.ts` to
  confirm the `t(key: TranslationKey)` signature.
- For each section: built a typed `interface` so all keys are `TranslationKey` (compiler-checked),
  then mapped the data array onto JSX while preserving every className, motion prop, image src,
  inline `style` and animation variant from the original file.
- `SectionHeading` extracted first since 4 sections depend on it.
- Final composition file just imports the 11 section components and renders them in order inside
  `<div className="overflow-hidden">`.

## Verification
- `bun run lint` → exit 0, zero warnings.
- `bunx tsc --noEmit` → zero errors in any file I touched (landing/*.tsx, views/landing.tsx,
  lib/i18n.ts). Pre-existing errors in unrelated files (api routes, profile view, bundles-tab)
  remain untouched.
- Dev log shows clean recompiles: `✓ Compiled in 0ms`.

## Notes for following agents
- The new `landing/` directory is `"use client"` across all files — every component reads
  `t()` from the Zustand store, so they cannot be server components.
- If you add a new landing section, mirror the pattern: build a typed `interface` with
  `TranslationKey` fields, declare the section's data array, render via `t(...)`.
- If you add new keys to `src/lib/i18n.ts`, you MUST add them to BOTH the `fr` and `en`
  objects, otherwise the `TranslationKey` union type (derived from `translations["fr"]`) will
  not include them and the call site will fail to compile.
