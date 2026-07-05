# Build Plan — Wedding Invitation & Gift Registry

Ordered phases with substeps. Each phase ends with a checkpoint you can verify before moving on. Designed for execution with Claude Code.

**Stack (decided):** Vite + React + TypeScript · Tailwind CSS · Framer Motion · `pix-utils` + `qrcode` · Vercel (static + serverless) · Asaas API (CPF account) · Supabase free tier (messages/RSVP).

---

## Phase 0 — Accounts & prerequisites (no code)

- [ ] **0.1 Asaas account (Pessoa Física).** Sign up with CPF, upload RG/CNH, wait for approval. Then:
  - [ ] 0.1.1 Enable **Sandbox** environment and generate a sandbox API key.
  - [ ] 0.1.2 Generate the **production** API key (store in a password manager, never in the repo).
  - [ ] 0.1.3 Confirm in the dashboard/docs: current card rates, whether promo rate applies to you, max `installmentCount` allowed, and how installment interest is split (you-absorb vs guest-pays).
- [ ] **0.2 Pix key.** Pick the key you'll expose on QR codes. Prefer a **random key (chave aleatória)** at your bank — it works exactly the same and doesn't leak your CPF/phone/email to every guest.
- [ ] **0.3 Vercel account** (free Hobby), linked to your GitHub.
- [ ] **0.4 Supabase project** (free tier). Note the URL + anon key.
- [ ] **0.5 Content inventory.** Write the actual copy: names, date, venue(s), schedule, dress code, RSVP deadline.
- [ ] **0.5b Gift catalog (the fun spreadsheet).** In a sheet: `id | title | playful description | price | category | image idea`. Aim for 15–30 symbolic gifts across a price ladder (several R$50–100, a middle band R$150–300, a few R$400–800, 2–3 big "cotas" R$1000+, plus one "valor livre" card). Playful names > product names ("Cota da lua de mel", "Taxa do buquê garantido"). This sheet becomes `gifts.json` almost 1:1.
- [ ] **0.5c Gift images.** Pick ONE style for all cards (cohesion is what makes it elegant): AI-generated illustrations matching the invitation's blush/engraved-floral art (recommended), or stock photos with a unifying blush-duotone treatment, or line-art icons on paper texture. Export all at 800×600 (4:3) WebP with consistent framing/lighting. See README "Gift card anatomy" for the card + price-tag design spec.
- [ ] **0.6 Design assets** (from Claude design, exported as layers):
  - Envelope closed (front, textured) — separate layers: envelope body, flap, wax seal.
  - Envelope interior / floral reveal.
  - Gate/archway — separate layers: left panel, right panel, ribbon (or ribbon as its own 2–3 layers for the untie).
  - Invitation background, florals, column/arch frame for countdown.
  - Export as **WebP** (photographic) / **SVG** (line florals), 2x resolution, mobile-portrait-first (~1170px wide masters).
- [ ] **0.7 Ask your accountant** the ITCMD question for your state (can run in parallel with everything).

**Checkpoint:** you can log into Asaas sandbox, you have a Pix key, and a folder of layered assets.

---

## Phase 1 — Project skeleton

- [ ] 1.1 `npm create vite@latest` (react-ts). Add Tailwind, Framer Motion, `pix-utils`, `qrcode`, `date-fns`, `@supabase/supabase-js`, `@fontsource/<display>` + `@fontsource/<body>`.
- [ ] 1.2 Set up design tokens in Tailwind config: palette (blush, champagne, ivory, ink), type scale, and the two font families.
- [ ] 1.3 Create `src/data/gifts.json` + typed loader (`zod` schema optional but nice — the serverless function will reuse it).
- [ ] 1.4 Create `.env.example` with all vars from the README; add `.env` to `.gitignore`.
- [ ] 1.5 Git repo → push to GitHub → import to Vercel → confirm the empty app deploys to `something.vercel.app`.

**Checkpoint:** blank styled page live on a public URL. (Deploy from day one — you'll catch hosting quirks early.)

---

## Phase 2 — Scroll animation engine

Do this **before** dropping in final art; use placeholder colored rectangles.

- [ ] 2.1 Build a `<Scene>` wrapper: a tall container (e.g., `h-[300vh]`) with a `sticky top-0 h-screen` inner stage. Scroll progress within the container drives the animation (`useScroll({ target, offset })` → `useTransform`).
- [ ] 2.2 **Scene 1–2, Envelope:**
  - 2.2.1 Layers stacked absolutely: interior art (bottom), flap, seal (top).
  - 2.2.2 Progress 0→0.3: seal scales/fades/lifts. 0.3→0.7: flap rotates open (`rotateX` with `transform-origin: top`, add `perspective`). 0.7→1: envelope translates down/away revealing interior.
- [ ] 2.3 **Scene 3, Gate + ribbon:**
  - 2.3.1 Ribbon layer: bow scales down + tails slide apart (0→0.4).
  - 2.3.2 Gate panels: left panel `x: 0 → -60%`, right `x: 0 → 60%` (or `rotateY` for door effect) (0.4→1), invitation content fades in behind.
- [ ] 2.4 **Scene 4, Invitation:** normal-flow content (names, date, countdown, venue, schedule) with gentle `whileInView` fade-ups. Countdown component ticking to the wedding datetime.
- [ ] 2.5 Motion hygiene:
  - 2.5.1 Only animate `transform`/`opacity` (GPU). No layout-affecting properties.
  - 2.5.2 `useReducedMotion()` → skip scroll theatrics, show scenes statically.
  - 2.5.3 Add a subtle "scroll" hint indicator on scene 1.
- [ ] 2.6 Test on a real phone (iOS Safari especially) via the Vercel preview URL.

**Checkpoint:** full scroll journey works smoothly at 60fps on your phone with placeholder art.

---

## Phase 3 — Art integration & polish

- [ ] 3.1 Replace placeholders with exported layers. Tune transform origins, easings (`cubicBezier`), and scene lengths until it *feels* like paper.
- [ ] 3.2 Optimize assets: WebP/AVIF, `srcset` where relevant, preload scene-1 layers, lazy-load later scenes.
- [ ] 3.3 Optional ambience: background music toggle (muted by default — browsers block autoplay with sound; the reference site has a speaker button for this reason).
- [ ] 3.4 Optional i18n toggle (PT/EN) if you'll have foreign guests.
- [ ] 3.5 Meta/OG tags: title, description, and a beautiful OG image (this is what shows when you send the link on WhatsApp — it matters a lot).

**Checkpoint:** the invitation half of the site is send-to-your-mom ready.

---

## Phase 4 — Gift registry UI

- [ ] 4.1 Gift grid section, following the "Gift card anatomy" spec in the README:
  - 4.1.1 `<GiftCard>` component: 4:3 illustration in a soft paper-textured frame, hanging price-tag element (serif numerals) overlapping the image corner, script/serif title, one-line playful description, full-width "Presentear 🎁" button. Hover: 4px lift + soft shadow.
  - 4.1.2 Grid: 2 cols mobile / 3–4 desktop; optional category filter chips from the `category` field.
  - 4.1.3 Claimed state: wax-seal "Presenteado 💝" badge, desaturated image, disabled button — read from `claimed` flag in gifts.json (you flip it manually + redeploy, ~1 min on Vercel).
  - 4.1.4 A "valor livre" card with an amount input (validated min, e.g., R$10).
- [ ] 4.2 Checkout modal, step 1 — method choice:
  - **Pix button: large, first, highlighted** ("Pix — sem taxas").
  - Card button: secondary ("Cartão de crédito — parcele em até Nx").
- [ ] 4.3 Step 2a — **Pix screen:**
  - 4.3.1 `lib/pix.ts`: build BR Code payload (pix-utils) with key, amount, merchant name/city, txid per the convention in the README.
  - 4.3.2 Render QR (`qrcode` → dataURL) + "Pix copia e cola" with copy button + the txid shown as "identificador".
  - 4.3.3 "Já paguei 💌" → message form (name + message) → Supabase insert → thank-you state.
- [ ] 4.4 Step 2b — **Card screen:** guest name (+ optional message) + installment selector → calls the API (Phase 5) → redirect to `invoiceUrl`.
- [ ] 4.5 **Validate your Pix code with a real R$1 payment from another person's bank app** (some banks reject malformed BR Codes that others accept — test with 2–3 different banks).

**Checkpoint:** you received a real R$1 Pix through the site.

---

## Phase 5 — Serverless card checkout (Asaas)

- [ ] 5.1 `api/card-checkout.ts`:
  - 5.1.1 Accept `{ giftId, installments, guestName, message, customAmount? }`.
  - 5.1.2 Look up price **server-side** from gifts.json; reject unknown IDs; clamp/validate custom amounts (min R$5 etc.).
  - 5.1.3 Asaas: `POST /v3/customers` (name + a placeholder or collected CPF if required — check current API requirements for customer creation) → `POST /v3/payments` with `billingType: "CREDIT_CARD"`, `value`, `installmentCount`, `dueDate: today+3d`, `description`, `externalReference: giftId`.
  - 5.1.4 Return `invoiceUrl`.
  - 5.1.5 Basic rate limiting (e.g., simple in-memory/IP throttle) + CORS locked to your domain.
- [ ] 5.2 Test end-to-end in **sandbox** with Asaas test cards, including a 3x installment payment.
- [ ] 5.3 (Optional) `api/asaas-webhook.ts`: verify token header, on `PAYMENT_CONFIRMED` insert/update a Supabase row → you get automatic card reconciliation.
- [ ] 5.4 Switch env vars to production keys **only after** all sandbox tests pass. Make one real R$5 card payment yourself; confirm net amount and settlement time (D+N for cards) in the Asaas dashboard, then refund/keep.

**Checkpoint:** real card payment (parcelado) works and you can see it in Asaas.

---

## Phase 6 — Messages, RSVP, admin

- [ ] 6.1 Supabase: create `messages` (+ `rsvps` if doing RSVP on-site) with **RLS: anon INSERT-only, no SELECT**.
- [ ] 6.2 RSVP: either a simple form → Supabase, or a WhatsApp deep link (`wa.me/55...?text=...`) — zero maintenance.
- [ ] 6.3 Your "admin": the Supabase table view + Asaas dashboard + bank statement. Optionally a tiny password-gated `/admin` page later; don't build it before the wedding unless bored.

---

## Phase 7 — Launch

- [ ] 7.1 (Optional) Register domain at Registro.br, point to Vercel.
- [ ] 7.2 Lighthouse pass: performance on mobile, accessibility (focus states, alt text, contrast on blush-on-blush text).
- [ ] 7.3 Cross-device test matrix: iOS Safari, Android Chrome, one desktop.
- [ ] 7.4 Dry run with 3–5 friends: send the link on WhatsApp, watch them use it, have one send a Pix and one do a sandbox-style small card payment.
- [ ] 7.5 Freeze content, deploy, send to guests. 🎉
- [ ] 7.6 Weekly during the RSVP window: reconcile Pix statement ↔ Supabase messages ↔ Asaas payments in a simple spreadsheet.

---

## Suggested Claude Code session breakdown

1. Session 1: Phases 1 + 2 (skeleton + animation engine with placeholders).
2. Session 2: Phase 3 (art integration) — bring the exported layers.
3. Session 3: Phase 4 (registry UI + Pix).
4. Session 4: Phase 5 (Asaas serverless) — have sandbox key ready.
5. Session 5: Phases 6 + 7 (messages/RSVP + launch polish).
