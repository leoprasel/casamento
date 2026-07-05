# Tips & Pitfalls

Things that will bite you if you don't think about them early. Grouped by area.

---

## A. Payments — Pix

1. **Test the BR Code against multiple banks.** The EMV payload has strict field rules (merchant name ≤ 25 chars, city ≤ 15, ASCII only — no accents, txid ≤ 25 alphanumeric). Nubank might accept a slightly malformed code that Itaú rejects. Test R$1 payments from at least 3 different bank apps before launch.
2. **Use a chave aleatória, not your CPF/phone/email.** The Pix key is embedded in every QR you publish. A random key gives guests the same experience without broadcasting your personal data to the whole guest list (and anyone they forward the link to).
3. **Static QR = guest can edit the amount** in some bank apps, and can pay the same QR twice. That's fine (it's a gift, honor system), but be aware: reconciliation is by statement, not by "order status". There is no automatic "paid" signal for static Pix.
4. **Txid discipline is your reconciliation.** If the txid convention is sloppy or too long (>25 chars it breaks), you'll be squinting at your statement matching R$250 entries to gifts. Keep the convention short and always display it to the guest.
5. **Receiving-account limits.** Banks sometimes flag unusual inbound volume on personal accounts. Dozens of Pix from strangers in a weekend is normal for weddings, but if your bank calls, the answer "wedding gifts" is legitimate — just don't be surprised.
6. **Don't route Pix through Asaas by default.** Asaas PF gives ~30 free Pix/month, then charges. Static BR Code direct to your bank is free at any volume and money is instantly yours (no D+N settlement, no R$5.000/day withdrawal ceiling to escape). Use Asaas only for cards.

## B. Payments — Asaas / credit card

7. **Never ship the API key to the frontend.** Anything prefixed `VITE_` is bundled into public JS. The Asaas key goes only in serverless env vars. If it ever leaks, rotate it immediately in the dashboard.
8. **Validate price server-side.** The function must look up the gift price from its own copy of gifts.json. If you trust `amount` from the browser, anyone can "buy" the R$1000 gift for R$0.01 (mostly harmless here, but messy) — or worse, probe your endpoint.
9. **Confirm the promo rate window.** The 1,99% + R$0,49 rate was promotional; check what applies to *your* account *now* and what it reverts to. Also confirm settlement timing for cards (typically D+30ish for credit unless anticipated — anticipation costs extra; decide if you care).
10. **Installment math: who pays the juros?** If a guest pays R$300 in 6x and you configured you-absorb, you'll receive noticeably less than R$300. Options: absorb it (simpler, generous), or limit installments (e.g., max 3x), or gross-up prices for card. Decide before building the UI copy.
11. **Asaas customer creation may require a CPF for the payer.** Check current API requirements; if a CPF is required at customer creation, you'll need to ask the guest for it in the card form (Brazilians are used to this) — plan the form field now, not after the API rejects you.
12. **Webhook is optional but validate it if you build it.** Anyone can POST to a public URL. Use the webhook auth token feature and check it, or an attacker could fake "payment confirmed" rows.
13. **Sandbox ≠ production behavior.** Sandbox approves fake cards liberally. Do one real small production charge before launch.
14. **Chargebacks exist on cards.** Rare for wedding gifts, but a guest's card being stolen → contested charge → Asaas claws it back. Another quiet argument for pushing Pix first.

## C. Fiscal / legal / business

15. **Keep the CNPJ completely out of it.** Money in the company account = presumed company revenue = taxed, and mismatched with your consulting CNAE. The fee difference is not worth it. Everything on CPF.
16. **ITCMD (state gift/donation tax).** Wedding gifts are donations to a pessoa física. Many states have annual exemption thresholds; rules and rates vary by state. This is the one question that genuinely needs your accountant — ask early, in writing (email), and keep the answer.
17. **Keep records anyway.** Export your bank statement for the gift period + the Asaas report + your reconciliation spreadsheet. If total gifts are large, your accountant may want to declare them (donations received) on your IRPF even when exempt — declared-and-exempt is far better than unexplained deposits.
18. **Frame gifts as symbolic contributions.** Site copy should say things like "nos presenteie com..." — you are receiving gifts, not selling products/services. No "comprar", no cart/checkout language, no promise of delivering goods. This keeps the donation framing clean.
19. **Terms in plain sight, lightly.** A one-line footer ("Os presentes são contribuições simbólicas ao casal ❤️") plus contact info covers the consumer-expectation angle without turning the site into a contract.

## D. Technical — animation & frontend

20. **Scroll-jacking on iOS Safari is the boss fight.** Sticky + transform scenes generally work, but: avoid `100vh` (use `100dvh` or `svh` — the URL bar resize will jump your layout), test rubber-band overscroll, and never intercept native scrolling with JS listeners. Framer Motion's `useScroll` reads scroll passively — good; keep it that way.
21. **Animate only `transform` and `opacity`.** Animating `width/height/top/left/filter: blur()` on large layered images will melt low-end Androids. Pre-blur in the asset if you want blur.
22. **Big images are your real perf budget.** Full-screen layered scenes × 4 scenes × 2x retina adds up fast. Use WebP/AVIF, compress hard (these are soft pastel images — they compress beautifully), preload scene 1 only, lazy-load the rest. Target < 2.5MB total initial.
23. **`prefers-reduced-motion` is not optional.** Some guests (and some older relatives' phones) need the static version. Framer's `useReducedMotion` makes this a one-liner per scene.
24. **Fonts: preload the display font** or the beautiful script headline will flash as Times New Roman for the first 300ms — exactly on the most emotional screen.
25. **The WhatsApp preview is your real landing page.** 90%+ of guests arrive from a WhatsApp link. Craft the OG image and title as carefully as scene 1.
26. **Autoplay audio doesn't work.** Browsers block sound until user interaction. If you want music, it's a tasteful muted-by-default toggle button (like the reference site's speaker icon).
27. **Don't copy The Digital Yes's assets.** The envelope-open interaction pattern is fair game as inspiration; their actual illustrations, photos, copy text, and code are theirs. All art comes from your own design process.
28. **QR contrast:** render the Pix QR dark-on-white with quiet padding, even if it clashes with the blush palette. Pretty pink-on-pink QRs fail to scan in bad lighting at exactly the moment tia Maria is trying to pay.

## E. Data & operations

29. **Supabase RLS before launch, not after.** Anon key + no RLS = anyone can read/delete your guests' messages. Policy: anon can INSERT into `messages`, nothing else. Test with the anon key in a curl.
30. **Sanitize/limit message input.** Max lengths (name 80, message 500), strip HTML on render (React does this by default — don't use `dangerouslySetInnerHTML`).
31. **Supabase free tier pauses after ~1 week of inactivity.** Visit the dashboard weekly during the live period, or the message form will silently fail. (The static site and Pix keep working regardless — nice property of this architecture.)
32. **Have a degradation plan.** If Asaas is down or the function errors, the card button should show a friendly fallback ("tente novamente ou use Pix 😉") — Pix has no dependencies and always works.
33. **Version the gift list carefully after launch.** Removing a gift someone already paid for via Pix (which has no status) causes confusion. Prefer marking gifts as "presenteado 💝" manually (a `claimed: true` flag in gifts.json + redeploy takes 1 minute on Vercel).
34. **Backup of the emotional stuff.** The guest messages are the part you'll want in 10 years. Export the Supabase table to CSV after the wedding; don't let it die with a free-tier project cleanup.

## F. Scope control (the biggest pitfall)

35. **The animation will eat 70% of the time.** Budget it. Get the engine working with rectangles first (Plan Phase 2); art tuning is infinite — timebox it.
36. **Skip on purpose:** admin dashboard, automatic Pix confirmation (would require Asaas/PSP dynamic QRs = fees), user accounts, gift "reservation" locking, email sending. None of these are needed for ~100 guests and each one doubles complexity.
37. **Hard deadline reality:** the site must ship before invitations go out, not before it's perfect. A static invitation + working Pix is already a shippable v1; the gate animation and card checkout can land in v1.1 a week later.
