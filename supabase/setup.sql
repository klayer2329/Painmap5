-- HoopFoot / Painmap5 anonymous screening storage
-- Run this entire file in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.screening_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  completed_at timestamptz not null,
  participant_id uuid not null,
  session_id uuid not null unique,
  consent_version text not null,
  app_version text not null,
  outcome text not null check (outcome in ('completed', 'no_candidate', 'emergency_stop')),
  mode text check (mode in ('acute', 'chronic') or mode is null),
  primary_location text,
  secondary_location text,
  answers jsonb not null default '{}'::jsonb,
  special_tests jsonb not null default '{}'::jsonb,
  base_scores jsonb not null default '{}'::jsonb,
  final_scores jsonb not null default '{}'::jsonb,
  ranking jsonb not null default '[]'::jsonb,
  emergency boolean not null default false,
  constraint answers_must_be_object check (jsonb_typeof(answers) = 'object'),
  constraint tests_must_be_object check (jsonb_typeof(special_tests) = 'object'),
  constraint base_scores_must_be_object check (jsonb_typeof(base_scores) = 'object'),
  constraint final_scores_must_be_object check (jsonb_typeof(final_scores) = 'object'),
  constraint ranking_must_be_array check (jsonb_typeof(ranking) = 'array'),
  constraint answers_size_limit check (octet_length(answers::text) <= 50000),
  constraint tests_size_limit check (octet_length(special_tests::text) <= 30000)
);

create index if not exists screening_submissions_created_at_idx
  on public.screening_submissions (created_at desc);
create index if not exists screening_submissions_mode_idx
  on public.screening_submissions (mode);
create index if not exists screening_submissions_location_idx
  on public.screening_submissions (primary_location, secondary_location);

alter table public.screening_submissions enable row level security;

revoke all on table public.screening_submissions from anon, authenticated;
grant insert on table public.screening_submissions to anon;
grant select on table public.screening_submissions to authenticated;

drop policy if exists "anonymous screening insert" on public.screening_submissions;
create policy "anonymous screening insert"
  on public.screening_submissions
  for insert
  to anon
  with check (
    consent_version = '2026-07-14'
    and completed_at <= now() + interval '10 minutes'
    and completed_at >= now() - interval '24 hours'
  );

drop policy if exists "screening admins can read" on public.screening_submissions;
create policy "screening admins can read"
  on public.screening_submissions
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'screening_admin');

-- After creating your administrator in Authentication -> Users, replace the
-- email below and run this statement. Then sign out and back in so the JWT is refreshed.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--   || '{"role":"screening_admin"}'::jsonb
-- where email = 'YOUR_ADMIN_EMAIL@example.com';
