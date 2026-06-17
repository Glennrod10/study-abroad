-- =============================================================================
-- StudyAbroad CRM — Full Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- It is safe to re-run: tables are created with IF NOT EXISTS.
-- =============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Agencies ────────────────────────────────────────────────────────────────
create table if not exists agencies (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    email      text,
    phone      text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ── Users ───────────────────────────────────────────────────────────────────
create table if not exists users (
    id                uuid primary key default gen_random_uuid(),
    name              text not null,
    email             text not null unique,
    password          text not null,
    role              text not null check (role in ('superadmin','admin','counsellor')),
    agency_id         uuid references agencies(id) on delete cascade,
    avatar_url        text,
    phone             text,
    title             text,
    timezone          text,
    bio               text,
    organization_name text,
    support_email     text,
    support_phone     text,
    expertise         text,
    experience_years  integer,
    status            text not null default 'active',
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

-- ── Students ────────────────────────────────────────────────────────────────
create table if not exists students (
    id                  uuid primary key default gen_random_uuid(),
    first_name          text not null,
    last_name           text,
    email               text,
    phone               text,
    destination_country text,
    country_interest    text,
    status              text default 'new',
    assigned_staff      text,
    counsellor_id       uuid references users(id),
    agency_id           uuid references agencies(id) on delete cascade,
    avatar_url          text,
    student_code        text,
    last_activity_note  text,
    last_activity_at    timestamptz,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- ── Universities ────────────────────────────────────────────────────────────
create table if not exists universities (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    agency_id       uuid references agencies(id) on delete cascade,
    country         text,
    city            text,
    ranking         integer,
    logo_url        text,
    banner_url      text,
    intake_periods  text[],
    program_levels  text[],
    created_at      timestamptz not null default now()
);

-- ── Programs ────────────────────────────────────────────────────────────────
create table if not exists programs (
    id            uuid primary key default gen_random_uuid(),
    name          text not null,
    university_id uuid references universities(id) on delete cascade,
    tuition_fee   numeric,
    intake        text,
    agency_id     uuid references agencies(id) on delete cascade,
    created_at    timestamptz not null default now()
);

-- ── Leads ───────────────────────────────────────────────────────────────────
create table if not exists leads (
    id                  uuid primary key default gen_random_uuid(),
    student_name        text not null,
    phone               text,
    email               text,
    destination_country text,
    budget_range        text,
    intake              text,
    source              text,
    campaign            text,
    stage               text not null default 'new',
    score               integer not null default 0,
    counsellor_id       uuid references users(id),
    agency_id           uuid references agencies(id) on delete cascade,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- ── Applications ────────────────────────────────────────────────────────────
create table if not exists applications (
    id                 uuid primary key default gen_random_uuid(),
    student_id         uuid references students(id) on delete cascade,
    agency_id          uuid references agencies(id) on delete cascade,
    lead_id            uuid references leads(id),
    university_name    text,
    course_name        text,
    intake             text,
    tuition_fee        numeric,
    commission_type    text,
    commission_value   numeric,
    commission_amount  numeric,
    manual_override    boolean,
    status             text,
    application_status text default 'started',
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

-- ── Visa Cases ──────────────────────────────────────────────────────────────
create table if not exists visa_cases (
    id             uuid primary key default gen_random_uuid(),
    visa_type      text,
    status         text,
    notes          text,
    tags           text,
    application_id uuid references applications(id) on delete cascade,
    agency_id      uuid references agencies(id) on delete cascade,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

-- ── Visa Checklist Items ────────────────────────────────────────────────────
create table if not exists visa_checklist_items (
    id           uuid primary key default gen_random_uuid(),
    visa_case_id uuid references visa_cases(id) on delete cascade,
    item_name    text,
    completed    boolean not null default false,
    created_at   timestamptz not null default now()
);

-- ── Visa Documents ──────────────────────────────────────────────────────────
create table if not exists visa_documents (
    id                uuid primary key default gen_random_uuid(),
    visa_case_id      uuid references visa_cases(id) on delete cascade,
    checklist_item_id uuid references visa_checklist_items(id),
    file_name         text,
    file_url          text,
    created_at        timestamptz not null default now()
);

-- ── Visa Appointments ───────────────────────────────────────────────────────
create table if not exists visa_appointments (
    id               uuid primary key default gen_random_uuid(),
    visa_case_id     uuid references visa_cases(id) on delete cascade,
    type             text,
    appointment_date timestamptz,
    location         text,
    notes            text,
    created_at       timestamptz not null default now()
);

-- ── Visa SOP Drafts ─────────────────────────────────────────────────────────
create table if not exists visa_sop_drafts (
    id           uuid primary key default gen_random_uuid(),
    visa_case_id uuid references visa_cases(id) on delete cascade,
    content      text,
    version      integer,
    created_at   timestamptz not null default now()
);

-- ── Visa LOR Requests ───────────────────────────────────────────────────────
create table if not exists visa_lor_requests (
    id              uuid primary key default gen_random_uuid(),
    visa_case_id    uuid references visa_cases(id) on delete cascade,
    professor_name  text,
    professor_email text,
    university      text,
    deadline        timestamptz,
    status          text default 'pending',
    created_at      timestamptz not null default now()
);

-- ── Tasks ───────────────────────────────────────────────────────────────────
create table if not exists tasks (
    id            uuid primary key default gen_random_uuid(),
    agency_id     uuid references agencies(id) on delete cascade,
    created_by    uuid references users(id),
    title         text not null,
    description   text,
    status        text not null default 'pending',
    priority      text not null default 'medium',
    due_date      timestamptz,
    reminder_at   timestamptz,
    reminder_sent boolean not null default false,
    student_id    uuid references students(id),
    assigned_to   uuid references users(id),
    created_at    timestamptz not null default now()
);

-- ── Activities ──────────────────────────────────────────────────────────────
create table if not exists activities (
    id          uuid primary key default gen_random_uuid(),
    agency_id   uuid references agencies(id) on delete cascade,
    student_id  uuid references students(id) on delete cascade,
    user_id     uuid references users(id),
    action      text,
    description text,
    created_at  timestamptz not null default now()
);

-- ── Student Documents ───────────────────────────────────────────────────────
create table if not exists student_documents (
    id            uuid primary key default gen_random_uuid(),
    student_id    uuid references students(id) on delete cascade,
    agency_id     uuid references agencies(id) on delete cascade,
    document_name text,
    file_url      text,
    document_type text,
    status        text,
    created_at    timestamptz not null default now()
);

-- ── Agency Integrations ─────────────────────────────────────────────────────
create table if not exists agency_integrations (
    id           uuid primary key default gen_random_uuid(),
    agency_id    uuid references agencies(id) on delete cascade,
    provider     text,
    access_token text,
    created_at   timestamptz not null default now()
);

-- ── Indexes (commonly queried columns) ──────────────────────────────────────
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_agency on users(agency_id);
create index if not exists idx_students_agency on students(agency_id);
create index if not exists idx_applications_agency on applications(agency_id);
create index if not exists idx_applications_student on applications(student_id);
create index if not exists idx_leads_agency on leads(agency_id);
create index if not exists idx_visa_cases_agency on visa_cases(agency_id);
create index if not exists idx_activities_agency on activities(agency_id);
create index if not exists idx_tasks_agency on tasks(agency_id);
