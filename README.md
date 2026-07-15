# Casamento — Leonardo & Isabela

A mobile-first wedding invitation site (in Brazilian Portuguese) with an
integrated gift registry ("lista de presentes"), built to run at near-zero
infrastructure cost and to minimize payment fees by routing gifts through
**Pix (free)** as the primary method and **Asaas credit-card checkout** (with
parcelamento) as the secondary method.

The UI follows the delivered design handoff: an olive/botanical, cream-paper
editorial invitation that opens with an intro video freezing into a vertical
scroll of cards, then routes to RSVP, registry, and checkout screens.

> The original concept/architecture briefs live in
> [`docs/README.md`](docs/README.md), [`docs/PLAN.md`](docs/PLAN.md) and
> [`docs/TIPS_AND_PITFALLS.md`](docs/TIPS_AND_PITFALLS.md) (some visual details
> there predate the design handoff — payments/architecture still apply).
> Remaining work is tracked in [`docs/TODO.md`](docs/TODO.md).

## Status

The full site is implemented on `main` per the design handoff (invitation,
RSVP, registry, secure Pix + Asaas checkout). What's left (accounts, real
content, gift photos, real-payment tests, launch polish) is in
[`docs/TODO.md`](docs/TODO.md).

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · react-router · Framer Motion ·
`pix-utils` + `qrcode` · Vercel (static + serverless) · Asaas API (CPF) ·
Supabase (messages/RSVP).

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
docs/                 # original concept/plan/tips briefs + TODO
public/assets/        # design assets (intro.mp4, cut-outs, pillars, arch)
src/
  config/site.ts      # couple names, date, venue, dress code (edit copy here)
  data/gifts.json     # gift catalog (static)
  lib/gifts.ts        # zod-validated typed loader (reused server-side)
  lib/pix.ts          # client-side Pix BR Code builder
  pages/              # Convite, Confirmar, Presentes, Pagamento (routes)
  components/         # IntroVideo, Ornament
  hooks/useCountdown  # countdown to the wedding datetime
api/                  # Vercel serverless functions (card checkout)
```

## Environment variables

See [`.env.example`](.env.example). Never `VITE_`-prefix a secret — anything
prefixed `VITE_` is bundled into public JS. The Asaas key lives only in
serverless env vars.

## Git workflow

`main` is the integration branch. Each feature is built on a `feat/*` branch and
merged back into `main` when done.
