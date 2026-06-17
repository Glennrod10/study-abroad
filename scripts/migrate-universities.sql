-- =============================================================================
-- Migration: Add missing columns to universities table
-- Run this in Supabase SQL Editor if you already seeded data without these columns.
-- Safe to re-run (uses IF NOT EXISTS / IF NOT NULL checks).
-- =============================================================================

alter table universities add column if not exists country        text;
alter table universities add column if not exists city           text;
alter table universities add column if not exists ranking        integer;
alter table universities add column if not exists logo_url       text;
alter table universities add column if not exists banner_url     text;
alter table universities add column if not exists intake_periods text[];
alter table universities add column if not exists program_levels text[];

-- Add index on country for the filter query
create index if not exists idx_universities_country on universities(country);
create index if not exists idx_universities_ranking on universities(ranking);
