# Supabase Setup (Shared Form + Dashboard Backend)

This project now supports a shared Supabase backend.

## 1) Create a Supabase project

1. Open https://supabase.com/dashboard
2. Create a new project.

## 2) Create table + policies

Open SQL Editor and run:

```sql
create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  answers jsonb not null
);

alter table public.responses enable row level security;

drop policy if exists "public_insert_responses" on public.responses;
create policy "public_insert_responses"
on public.responses
for insert
to anon
with check (true);

drop policy if exists "public_select_responses" on public.responses;
create policy "public_select_responses"
on public.responses
for select
to anon
using (true);
```

## 3) Copy project API credentials

From Project Settings -> API, copy:

1. Project URL
2. `Publishable` key (or `anon` key on older Supabase UI)

## 4) Add credentials in both apps

Update these files:

1. `typeform/js/backend-config.js`
2. `dashboard/js/backend-config.js`

Example:

```js
window.BACKEND_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLISHABLE_OR_ANON_KEY',
  responsesTable: 'responses',
};
```

## 5) Redeploy both Vercel projects

From each folder, run:

1. `npx vercel --prod --yes`

Folders:

1. `03_Custom_Typeform_and_Dashboard/typeform`
2. `03_Custom_Typeform_and_Dashboard/dashboard`

## Notes

1. If `backend-config.js` is left blank, both apps fall back to localStorage mode.
2. Current policy setup allows public read of responses (simple setup). For stricter privacy, switch dashboard reads to authenticated users only.
