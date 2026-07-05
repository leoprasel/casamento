# Wedding Invitation & Gift Registry Site

A single-page, animated wedding invitation website with an integrated gift registry ("lista de presentes"), built to run at **zero (or near-zero) infrastructure cost** and to **minimize payment fees** by routing gifts through Pix (free) as the primary method and Asaas credit-card payment links (with installments / parcelamento) as the secondary method.

---

## 1. Concept

The site reproduces the experience of receiving a physical wedding invitation, as a scroll-driven narrative:

1. **Scene 1 — The sealed envelope.** A textured, blush-pink envelope with an embossed floral pattern and a wax seal (couple's monogram). Tagline: "Requests the pleasure of your company" / Portuguese equivalent.
2. **Scene 2 — The envelope opens.** As the guest scrolls, the wax seal lifts and the envelope flap opens, revealing a floral scene behind it.
3. **Scene 3 — The gate & ribbon.** A garden gate / floral archway tied with a large satin ribbon. Continued scrolling unties the ribbon and the two gate panels swing open (curtain-reveal effect).
4. **Scene 4 — The invitation.** The invitation proper: couple's names, "We are getting married", date, countdown timer, venue(s), dress code, schedule of celebrations.
5. **Scene 5 — RSVP** (optional, can be a simple form or WhatsApp link).
6. **Scene 6 — Gift registry.** Grid of symbolic gifts (each with a name, playful description, image, and price). Selecting a gift opens a checkout modal:
   - **Pix (primary, visually dominant button):** renders a static BR Code QR + "Pix copia e cola" string for the exact amount. Zero fees, no gateway.
   - **Credit card (secondary):** creates an Asaas charge/payment link with installment support (parcelamento) via a serverless function, then redirects the guest to Asaas's hosted checkout.
7. **Guestbook messages:** guests can leave a message with their gift (stored in a free-tier database, or embedded into the Pix txid/Asaas description — see §5).

Visual language: blush pink / champagne palette, engraved-illustration florals, script serif display type, paper-texture backgrounds. All screens will be designed separately (Claude design); this repo consumes exported assets as layered images.

> Note: the reference site ("The Digital Yes") is inspiration for the *interaction pattern* (envelope → seal → reveal), which is a common motif. Do not copy their actual artwork, code, fonts-as-files, or copy text.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────┐
│  Static frontend (Vite + React + TS)                 │
│  Hosted on Vercel (free Hobby tier)                  │
│  - Scroll-driven animation scenes (Framer Motion)    │
│  - Gift catalog (static JSON, no CMS)                │
│  - Pix BR Code generated CLIENT-SIDE (no backend)    │
└───────────────┬──────────────────────────────────────┘
                │ only for credit card
                ▼
┌──────────────────────────────────────────────────────┐
│  Serverless functions (Vercel /api, free tier)       │
│  - POST /api/card-checkout                           │
│      → Asaas API: create customer + charge (CC,      │
│        installments) → returns invoiceUrl            │
│  - POST /api/asaas-webhook (optional)                │
│      → payment confirmations → store/notify          │
│  Secrets (ASAAS_API_KEY) live ONLY here (env vars)   │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│  Asaas (conta Pessoa Física / CPF)                   │
│  - Credit card w/ parcelamento (~1.99% + R$0.49      │
│    promo; confirm current rates)                     │
│  - Hosted checkout page (guest enters card there —   │
│    site never touches card data, no PCI scope)       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Pix path (NO gateway, R$ 0.00 fees)                 │
│  - Static BR Code payload built in the browser from  │
│    your personal Pix key + fixed amount + txid       │
│  - Guest pays in their bank app; money lands         │
│    directly in your personal account                 │
│  - Reconciliation: txid convention + bank statement  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Guest messages / RSVP (pick ONE, all free):         │
│  a) Supabase free tier (Postgres + REST)  ← default  │
│  b) Google Sheets via Apps Script webhook            │
│  c) WhatsApp deep-link (zero storage)                │
└──────────────────────────────────────────────────────┘
```

### Why this shape

- **Pix requires no backend at all.** The BR Code (EMV® MPM payload) is a deterministic string built from public data: your Pix key, amount, merchant name/city, and a txid. Libraries like `pix-utils` generate it; `qrcode` renders it. Nothing secret is involved, so it can live 100% in the static frontend.
- **Credit card requires a backend** because the Asaas API key must never ship to the browser. Vercel serverless functions (or Netlify Functions / Cloudflare Workers) provide this for free at wedding-scale traffic.
- **No card data ever touches your code.** The serverless function only creates a charge and returns Asaas's `invoiceUrl`; the guest types the card on Asaas's hosted page. This keeps you fully out of PCI-DSS scope.

---

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18 + Vite + TypeScript** | Fast dev, static build output, first-class Framer Motion support |
| Animation | **Framer Motion (`motion`)** — `useScroll`, `useTransform`, sticky scenes | Purpose-built for scroll-linked animation; GPU-friendly transforms; `useReducedMotion` built in |
| Styling | **Tailwind CSS** + a small set of design tokens (colors, type scale) | Fast iteration; tokens keep the blush/champagne palette consistent |
| Fonts | Google Fonts (a script/serif display + a quiet body serif), self-hosted via `@fontsource` | Free, no FOUT with preload |
| Pix payload | **`pix-utils`** (npm) or a ~60-line hand-rolled EMV builder + **`qrcode`** for the QR image | Zero-cost Pix |
| Card checkout | **Asaas REST API v3** (`/v3/customers`, `/v3/payments` with `billingType: CREDIT_CARD`, `installmentCount`) | CPF-compatible, promo card rates, hosted invoice page |
| Serverless | **Vercel Functions** (`/api/*.ts`) | Same repo, free Hobby tier, env-var secrets |
| Messages/RSVP | **Supabase** free tier (table `messages`, `rsvps`) with Row Level Security: `INSERT`-only anon policy | Free, no server to maintain |
| Hosting | **Vercel** (free) — or Netlify/Cloudflare Pages equivalently | Free SSL, CDN, `*.vercel.app` subdomain or custom domain |
| Countdown | Client-side, `date-fns` | Trivial |
| i18n (optional) | Simple `pt`/`en` toggle with a JSON dictionary | Matches reference site's EN/DE switch |

**Total mandatory cost: R$ 0.** Optional: custom domain (`.com.br` via Registro.br ≈ R$40/year).

---

## 4. Data model

### `gifts.json` (static, in repo)
```json
[
  {
    "id": "lua-de-mel-jantar",
    "title": "Jantar romântico na lua de mel",
    "description": "Um brinde por nós em algum lugar bonito 🍷",
    "price": 250.00,
    "image": "/gifts/jantar.webp"
  }
]
```

### Gift catalog content strategy

The gifts are **symbolic** — no product is delivered, the photo is pure storytelling. That changes how you source and present them:

- **Image sourcing (pick one for visual cohesion, don't mix):**
  1. **AI-generated illustrations** in the same engraved-floral / blush watercolor style as the invitation art (best option — the catalog looks like part of the stationery, not a store). Generate the whole set in one style pass so lighting/palette match.
  2. Free stock photos (Unsplash/Pexels license) — fine, but 20 photos from 20 photographers will look like a marketplace; if using stock, apply a unifying treatment (same duotone/blush overlay + grain in the build pipeline).
  3. Simple line-art icons on textured paper cards — cheapest, very elegant, zero licensing thought.
- **Naming tone:** playful/symbolic, not commercial — "Taxa de buquê garantido", "Cota da lua de mel", "Jantar à luz de velas em Paris", "Kit paciência para a sogra". This reinforces the donation framing (§6) and makes browsing the list part of the fun.
- **Price ladder:** ~15–30 items spread across tiers (e.g., 5 items R$50–100, 10 items R$150–300, 5 items R$400–800, 2–3 "cotas grandes" R$1000+, plus one "valor livre" card). Guests self-select by budget; the ladder matters more than the objects.

### Gift card anatomy (UI spec)

```
┌─────────────────────────────┐
│  [illustration, 4:3,        │   ← soft rounded frame, paper texture bg,
│   blush duotone]        ┌──┐│     subtle inner shadow like a mounted print
│                         │R$ ││  ← "price tag": small hanging-tag element
│                         │250││     (tag shape or ribbon corner), serif nums
│                         └──┘│
│  Jantar à luz de velas      │   ← title: display serif, ink color
│  Um brinde por nós em       │   ← 1-line playful description, muted
│  algum lugar bonito 🍷      │
│                             │
│  [   Presentear  🎁   ]     │   ← full-width soft button
└─────────────────────────────┘
```

- Hover/press: gentle lift (`translateY(-4px)` + shadow), 150ms.
- **Claimed state:** wax-seal badge overlay ("Presenteado 💝"), image slightly desaturated, button disabled — driven by a `claimed: true` flag in gifts.json (manual flip + redeploy).
- Grid: 2 columns mobile, 3–4 desktop; optional category filter chips (Lua de mel / Casa nova / Experiências) via a `category` field.

Extended `gifts.json` entry:
```json
{
  "id": "jantar-luz-velas",
  "title": "Jantar à luz de velas",
  "description": "Um brinde por nós em algum lugar bonito 🍷",
  "price": 250.00,
  "image": "/gifts/jantar.webp",
  "category": "lua-de-mel",
  "claimed": false,
  "featured": false
}
```

### Supabase `messages` table
| column | type | notes |
|---|---|---|
| id | uuid pk | default gen |
| created_at | timestamptz | default now() |
| guest_name | text | |
| message | text | |
| gift_id | text | nullable |
| amount | numeric | nullable |
| method | text | 'pix' \| 'card' |

RLS: anon role may `INSERT` only. Reading is done by you via the Supabase dashboard (no public SELECT).

### Pix txid convention
`txid` is limited to **25 alphanumeric chars** for static BR Codes. Convention:
`G<giftIndex><initials><ddmm>` → e.g. `G07MS0507`. Shown to the guest as "identificador" and used to match bank statement entries to gifts.

---

## 5. Payment flows

### Pix (primary)
1. Guest picks a gift → modal opens with amount pre-filled (editable "contribute another amount" optional).
2. Frontend builds BR Code payload → renders QR + copia-e-cola button.
3. Guest pays in their bank app. Money arrives instantly in your personal account. **Fee: R$ 0.**
4. Guest optionally submits name + message → `INSERT` into Supabase.
5. You reconcile via bank statement (txid / amount / timestamp) — manual, but at wedding scale (dozens of gifts) this is minutes of work.

### Credit card via Asaas (secondary)
1. Guest picks "Cartão de crédito (parcelado)" → chooses installments (e.g., 1–6x).
2. Frontend `POST /api/card-checkout { giftId, installments, guestName, message }`.
3. Function validates the gift/price **server-side against gifts.json** (never trust client price), creates/uses an Asaas customer, creates a payment with `billingType: "CREDIT_CARD"`, `installmentCount`, `dueDate`, `description: "Presente: <gift> — <guestName>"`.
4. Function returns `invoiceUrl`; frontend redirects.
5. (Optional) Asaas webhook → `/api/asaas-webhook` → mark payment confirmed / notify you.

Installments note: Asaas supports parceled charges; **who absorbs the installment interest is your choice** — either you receive the net amount (you absorb) or you gross-up the price per installment tier. Decide and encode it in the function.

### Fee strategy (the whole point)
- Pix button is **visually larger, listed first, labeled "sem taxas ❤️"** (or subtler wording).
- Card is present but framed as "para quem prefere parcelar".
- Expected outcome: majority Pix at 0%, minority card at ~2% — versus ~4% on everything at mainstream registry sites.

---

## 6. Legal / fiscal context (from prior research — confirm with your accountant)

- Asaas account opened as **Pessoa Física (CPF)** — supported; needs RG/CNH. PF limitation: Pix transfer-out limit R$ 5.000/day (fine, just withdraw over a few days).
- **Do NOT route gifts through your IT-consulting CNPJ**: money entering the company account tends to be treated as taxable company revenue mismatched with your CNAE. Keep gifts in the personal sphere.
- Wedding gifts are legally **donations to you as an individual**; depending on state and total value, **ITCMD** may apply. Ask your accountant (state-level rules; some states have exemption thresholds).
- Frame gifts on the site as **symbolic contributions**, not sales of physical products (you are not selling goods; you are receiving gifts).

---

## 7. Repository layout (proposed)

```
/
├── public/
│   ├── gifts/            # gift images (webp)
│   └── scenes/           # layered animation assets (webp/avif + fallbacks)
├── src/
│   ├── scenes/           # Envelope.tsx, Gate.tsx, Invitation.tsx, ...
│   ├── components/       # GiftCard, CheckoutModal, PixQr, Countdown, ...
│   ├── lib/pix.ts        # BR Code payload builder
│   ├── lib/gifts.ts      # typed loader for gifts.json
│   ├── data/gifts.json
│   └── i18n/
├── api/
│   ├── card-checkout.ts  # Vercel serverless
│   └── asaas-webhook.ts  # optional
├── .env.example          # ASAAS_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, PIX_KEY...
└── vercel.json
```

## 8. Environment variables

| var | scope | notes |
|---|---|---|
| `ASAAS_API_KEY` | serverless only | **never** `VITE_`-prefixed |
| `ASAAS_BASE_URL` | serverless | sandbox vs prod switch |
| `VITE_PIX_KEY` | frontend | your Pix key (public by nature — it's on every QR) |
| `VITE_PIX_MERCHANT_NAME` / `VITE_PIX_MERCHANT_CITY` | frontend | required BR Code fields (ASCII, length limits) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | frontend | anon key is public-safe with RLS insert-only |
| `ASAAS_WEBHOOK_TOKEN` | serverless | validate webhook authenticity |
