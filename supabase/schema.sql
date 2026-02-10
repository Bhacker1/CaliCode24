-- ============================================================
-- CaliCode 24 — Supabase Schema
-- California Title 24 Compliance Checker
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- Linked 1:1 with Supabase Auth users
-- ============================================================
create type subscription_tier as enum ('free', 'pro', 'enterprise');

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text,
  company       text,
  subscription_tier subscription_tier not null default 'free',
  stripe_customer_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. PROJECTS
-- Each project = one compliance check job
-- ============================================================
create type project_status as enum ('draft', 'processing', 'compliant', 'failed');

create table projects (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  title         text not null default 'Untitled Project',
  description   text,
  status        project_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_projects_user_id on projects(user_id);
create index idx_projects_status on projects(status);

-- ============================================================
-- 3. DOCUMENTS
-- Uploaded files (floor plans, equipment lists, photos)
-- ============================================================
create type document_type as enum ('floor_plan', 'equipment_list', 'photo', 'other');

create table documents (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references projects(id) on delete cascade,
  file_url        text not null,
  file_name       text not null,
  file_size       bigint,
  mime_type       text,
  document_type   document_type not null default 'other',
  recognized_text text,
  created_at      timestamptz not null default now()
);

create index idx_documents_project_id on documents(project_id);

-- ============================================================
-- 4. REPORTS
-- AI-generated compliance analysis results
-- ============================================================
create type pass_fail as enum ('PASS', 'FAIL', 'PENDING');

create table reports (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references projects(id) on delete cascade,
  document_id       uuid references documents(id) on delete set null,
  ai_summary        text not null,
  pass_fail_status  pass_fail not null default 'PENDING',
  confidence        real check (confidence >= 0 and confidence <= 1),
  citations         text[] default '{}',
  reasoning         text,
  suggested_fixes   text[] default '{}',
  raw_ai_response   jsonb,
  model_version     text,
  created_at        timestamptz not null default now()
);

create index idx_reports_project_id on reports(project_id);
create index idx_reports_status on reports(pass_fail_status);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================================

alter table profiles enable row level security;
alter table projects enable row level security;
alter table documents enable row level security;
alter table reports enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Projects: users can CRUD their own projects
create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can create projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- Documents: access through project ownership
create policy "Users can view own documents"
  on documents for select using (
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create documents"
  on documents for insert with check (
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own documents"
  on documents for delete using (
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Reports: access through project ownership
create policy "Users can view own reports"
  on reports for select using (
    exists (
      select 1 from projects
      where projects.id = reports.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create reports"
  on reports for insert with check (
    exists (
      select 1 from projects
      where projects.id = reports.project_id
      and projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. STORAGE BUCKET
-- For uploaded plan images & PDFs
-- ============================================================
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false);

create policy "Users can upload project files"
  on storage.objects for insert
  with check (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own project files"
  on storage.objects for select
  using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own project files"
  on storage.objects for delete
  using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 7. UPDATED_AT TRIGGER
-- Auto-update the updated_at column
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();
