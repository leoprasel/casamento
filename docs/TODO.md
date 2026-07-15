# TODO

Running list of what's left to take this from "works in a container" to
"sent to guests." Grouped by the type of work. Checked items are already done
in the code; unchecked items are yours to finish (mostly accounts, assets and
real-money tests that can't be done from code).

Cross-references: [`PLAN.md`](PLAN.md) for the full phase breakdown,
[`TIPS_AND_PITFALLS.md`](TIPS_AND_PITFALLS.md) for the gotchas each item guards
against.

---

## ✅ Done (in the codebase)

- [x] **Design handoff implemented** — the site now matches the Leonardo & Isabela
  design: olive/botanical cream-paper theme, Pinyon Script / Cormorant Garamond /
  JetBrains Mono, 440px phone column, intro video (freeze-on-last-frame + skip/mute
  + `localStorage` seen flag).
- [x] **Routes** — `/` Convite (intro + 5 cards), `/confirmar` RSVP (dynamic guest
  rows), `/presentes` registry, `/pagamento` checkout. react-router + SPA rewrite.
- [x] **Payments** — Pix tab wired to the real EMV BR Code + dark-on-white QR +
  copia-e-cola; card tab collects name/CPF/installments and redirects to Asaas
  hosted checkout (no raw card data on the site).
- [x] **Serverless** — `api/card-checkout.ts` (server-side pricing, zod validation,
  CPF, installments, CORS lock, IP throttle) + optional token-validated webhook.
- [x] **Data** — Supabase `messages` + `rsvps` with RLS INSERT-only
  (`supabase/schema.sql`); RSVP writes one row per confirmation.

---

## 🔑 Phase 0 — Accounts & secrets (no code, blocks launch)

- [ ] **Asaas (Pessoa Física / CPF)** — sign up, upload RG/CNH, wait for approval.
  - [ ] Generate a **sandbox** API key; test with Asaas test cards.
  - [ ] Generate the **production** API key (store in a password manager only).
  - [ ] Confirm current card rate, promo eligibility, max `installmentCount`, and
        settlement timing (D+N). Decide juros policy (currently **you-absorb** via
        `totalValue` in `api/_lib/asaas.ts`).
- [ ] **Pix key** — create a **chave aleatória** at your bank (don't use CPF/phone/email).
- [ ] **Supabase project** (free tier) — note URL + anon key; run `supabase/schema.sql`.
- [ ] **Vercel account** — import the repo, set env vars (below).
- [ ] **Accountant** — ask the ITCMD (state gift-tax) question in writing, early.

### Environment variables to set in Vercel

Frontend (safe to be public — bundled into JS):
- [ ] `VITE_PIX_KEY`
- [ ] `VITE_PIX_MERCHANT_NAME` (≤ 25 chars, ASCII), `VITE_PIX_MERCHANT_CITY` (≤ 15)
- [ ] `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Serverless only (**never** `VITE_`-prefixed):
- [ ] `ASAAS_API_KEY`, `ASAAS_BASE_URL` (sandbox vs prod)
- [ ] `ASAAS_WEBHOOK_TOKEN` (if using the webhook)
- [ ] `ALLOWED_ORIGIN` (your deployed URL, for the CORS lock)
- [ ] `MAX_INSTALLMENTS` (optional; defaults to 6)

---

## ✍️ Content (placeholders from the design await real values)

- [x] Real **venue address + CEP** and Google Maps link (Chácara Llar).
- [x] **WhatsApp number** wired (RSVP has a WhatsApp fallback + the number in config).
- [ ] `src/config/site.ts`: **dress-code palette** note (still "[ ... ]"). Confirm the
      ceremony **time** (countdown targets 16:00 BRT on 2027-09-11).
- [x] Real gift catalog (16 items) with the couple's product photos wired in.
      Open: confirm the list is complete; decide on **cotas** for the big-ticket
      items (cama/sofá/mesa); pick the cookware photo (cream vs the black alt).
- [ ] Set the real **Pix key** via `VITE_PIX_KEY` (a chave aleatória).

---

## 🎨 Art & assets

The design cut-outs (arch, pillars, greenhouse, venue, couple) are already in
`public/assets/` and wired in. Remaining:

- [x] **Gift photos** — all 16 gifts have real product photos (normalized to
      uniform WebP cards). A "foto do presente" hatch placeholder still auto-shows
      for any gift missing an image.
- [x] **Optimize images** — the six PNG cut-outs are now WebP (8.9 MB → 0.34 MB);
      the 17 gift photos are ~119 KB total.
- [ ] **Compress the intro video** — `intro.mp4` is still ~5.8 MB. Run
      `./scripts/compress-intro.sh` locally (needs ffmpeg) to re-encode it small +
      produce a WebM; then optionally add the WebM `<source>` (TIPS #22).
- [x] **OG image** — `public/og-image.jpg` (1200×630, on-brand) generated and wired
      in `index.html`. ⚠️ After deploying, change `og:image` to the **absolute**
      URL (`https://<domain>/og-image.jpg`) — WhatsApp needs an absolute URL (TIPS #25).

---

## 🧪 Payment validation (do before sending the link)

- [ ] **Pix**: pay a real **R$1** from 2–3 different bank apps (Nubank, Itaú, …) —
      some banks reject BR Codes others accept (TIPS #1).
- [ ] **Card sandbox**: full end-to-end with Asaas test cards, including a 3x
      installment charge.
- [ ] **Card production**: one real small charge (~R$5), confirm net amount +
      settlement in the Asaas dashboard, then refund/keep. Switch env to prod keys
      only after sandbox passes.
- [ ] Confirm the card→Pix fallback message shows if the function errors (TIPS #32).

---

## 🚀 Phase 7 — Launch polish

- [x] **Accessibility basics** — keyboard focus-visible outlines, aria-labels on
      form fields, alt text on imagery, reduced-motion handling.
- [ ] **Lighthouse** — full mobile performance + a11y pass on the deployed site;
      double-check color contrast on the small olive-on-cream eyebrow labels.
- [ ] **Cross-device matrix** — iOS Safari (the boss fight, TIPS #20), Android
      Chrome, one desktop. Watch for `100vh`/URL-bar jumps (we use `dvh`).
- [ ] **Fonts** — verify the script display font is preloaded so the headline
      doesn't flash as Times on scene 1 (TIPS #24).
- [ ] **Dry run** — 3–5 friends use the live link; one sends a Pix, one does a
      small card charge.
- [ ] (Optional) Register a `.com.br` domain at Registro.br, point to Vercel.

---

## 🔁 During the live period

- [ ] Visit the Supabase dashboard weekly — the free tier pauses after ~1 week of
      inactivity and the message form would silently fail (TIPS #31).
- [ ] Reconcile weekly: bank statement (Pix) ↔ Supabase messages ↔ Asaas payments.
- [ ] Mark claimed gifts by flipping `"claimed": true` in `gifts.json` + redeploy
      (~1 min on Vercel) — don't delete gifts (TIPS #33).
- [ ] After the wedding: export the Supabase `messages` table to CSV — those are
      the keepsake (TIPS #34).

---

## 💡 Optional / nice-to-have (skip unless you have time — TIPS #36)

- [ ] i18n PT/EN toggle for foreign guests.
- [ ] Muted-by-default background-music toggle.
- [ ] Tiny password-gated `/admin` page (the Supabase + Asaas dashboards already
      cover this).
