-- Migration: Add missing columns to tasks table
-- Safe to re-run (all use IF NOT EXISTS)

alter table tasks add column if not exists description   text;
alter table tasks add column if not exists priority      text not null default 'medium';
alter table tasks add column if not exists reminder_at   timestamptz;
alter table tasks add column if not exists reminder_sent boolean not null default false;
alter table tasks add column if not exists assigned_to   uuid references users(id);
alter table tasks add column if not exists due_date      timestamptz;
alter table tasks add column if not exists status        text not null default 'pending';
alter table tasks add column if not exists student_id    uuid references students(id);
