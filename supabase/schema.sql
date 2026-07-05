-- Supabase schema for the wedding site (PLAN 6.1).
-- Run in the Supabase SQL editor. RLS is the security boundary: the anon key
-- is public (bundled in the frontend), so anon may ONLY INSERT — never SELECT,
-- UPDATE or DELETE (TIPS #29). You read rows from the Supabase dashboard.

-- ─────────────────────────────────────────────────────────────
-- messages: guest messages left with a gift
-- ─────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  guest_name  text not null,
  message     text,
  gift_id     text,
  amount      numeric,
  method      text check (method in ('pix', 'card'))
);

alter table public.messages enable row level security;

-- Anon may INSERT only. No SELECT/UPDATE/DELETE policy => those are denied.
drop policy if exists "anon insert messages" on public.messages;
create policy "anon insert messages"
  on public.messages
  for insert
  to anon
  with check (
    char_length(coalesce(guest_name, '')) between 1 and 80
    and char_length(coalesce(message, '')) <= 500
  );

-- ─────────────────────────────────────────────────────────────
-- rsvps: on-site RSVP confirmations (optional — you may prefer WhatsApp)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  guest_name  text not null,
  guests      int not null default 1,
  attending   boolean not null default true,
  note        text
);

alter table public.rsvps enable row level security;

drop policy if exists "anon insert rsvps" on public.rsvps;
create policy "anon insert rsvps"
  on public.rsvps
  for insert
  to anon
  with check (
    char_length(coalesce(guest_name, '')) between 1 and 80
    and guests between 1 and 20
    and char_length(coalesce(note, '')) <= 500
  );
