# Casamento — Wedding Invitation & Gift Registry

A single-page, scroll-driven animated wedding invitation with an integrated
gift registry ("lista de presentes"), built to run at near-zero infrastructure
cost and to minimize payment fees by routing gifts through **Pix (free)** as the
primary method and **Asaas credit-card links** (with parcelamento) as the
secondary method.

> Full concept, architecture, data model and payment flows live in
> [`docs/README.md`](docs/README.md). Build phases are in
> [`docs/PLAN.md`](docs/PLAN.md). Gotchas in
> [`docs/TIPS_AND_PITFALLS.md`](docs/TIPS_AND_PITFALLS.md). Remaining work is
> tracked in [`docs/TODO.md`](docs/TODO.md).

## Status

Phases 1, 2, 4, 5 and 6 are implemented on `main`. What's left (accounts,
design assets, real-payment tests, launch polish) is in
[`docs/TODO.md`](docs/TODO.md).

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · Framer Motion · `pix-utils` +
`qrcode` · Vercel (static + serverless) · Asaas API (CPF) · Supabase (messages).

## Getting started

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # http://localhost:5173
```

Build & preview the production output:

```bash
npm run build
npm run preview
```

## Project layout

```
docs/                 # concept, plan, tips (the source-of-truth briefs)
public/               # static assets (favicon, gift images, scene layers)
src/
  config/site.ts      # couple names, date, venues, schedule (edit copy here)
  data/gifts.json     # gift catalog (static)
  lib/gifts.ts        # zod-validated typed loader (reused server-side)
  scenes/             # scroll-animation scenes (Phase 2)
  components/         # GiftCard, CheckoutModal, PixQr, Countdown, ...
api/                  # Vercel serverless functions (card checkout — Phase 5)
```

## Environment variables

See [`.env.example`](.env.example). Never `VITE_`-prefix a secret — anything
prefixed `VITE_` is bundled into public JS. The Asaas key lives only in
serverless env vars.

## Git workflow

`main` is the integration branch. Each feature is built on a `feat/*` branch and
merged back into `main` when done.
