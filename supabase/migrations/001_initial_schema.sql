-- =============================================
-- SNAP CLAIM — Complete Database Schema
-- Version: 1.0
-- Designed for: Solo freelancers + Employee 
--               claims extensibility
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLE 1: COMPANIES
-- Represents a business account in Snap Claim
-- One company can have many profiles (users)
-- =============================================
create table public.companies (
  id                  uuid default uuid_generate_v4() primary key,
  name                text not null,
  uen_number          text,
  gst_registered      boolean default false,
  gst_number          text,
  financial_year_end  text default 'December',
  default_currency    text default 'SGD',
  plan                text check (plan in (
                        'solo', 'team', 'business'
                      )) default 'solo',
  created_at          timestamp with time zone 
                        default timezone('utc'::text, now())
);

-- =============================================
-- TABLE 2: PROFILES
-- Extends Supabase auth.users
-- One profile per user, linked to one company
-- =============================================
create table public.profiles (
  id              uuid references auth.users 
                    on delete cascade primary key,
  company_id      uuid references public.companies(id) 
                    on delete set null,
  full_name       text,
  role            text check (role in (
                    'owner', 
                    'accountant', 
                    'employee', 
                    'manager'
                  )) default 'owner',
  employee_id     text,
  department      text,
  is_director     boolean default false,
  can_approve     boolean default false,
  spending_limit  decimal(10,2),
  avatar_url      text,
  onboarded       boolean default false,
  created_at      timestamp with time zone 
                    default timezone('utc'::text, now())
);

-- =============================================
-- TABLE 3: COMPANY CATEGORIES
-- Default + custom expense categories per company
-- =============================================
create table public.company_categories (
  id              uuid default uuid_generate_v4() primary key,
  company_id      uuid references public.companies(id) 
                    on delete cascade not null,
  name            text not null,
  is_default      boolean default false,
  gst_applicable  boolean default true,
  spending_limit  decimal(10,2),
  created_at      timestamp with time zone 
                    default timezone('utc'::text, now())
);

-- =============================================
-- TABLE 4: CLAIM BATCHES
-- Groups receipts into a single submission
-- Used for employee bulk claims at month end
-- For solo users: each receipt is its own batch
-- =============================================
create table public.claim_batches (
  id              uuid default uuid_generate_v4() primary key,
  company_id      uuid references public.companies(id) 
                    on delete cascade not null,
  submitted_by    uuid references public.profiles(id) 
                    on delete set null,
  reviewed_by     uuid references public.profiles(id) 
                    on delete set null,
  title           text not null 
                    default 'Expense Claim',
  period_start    date,
  period_end      date,
  total_amount    decimal(10,2) default 0,
  status          text check (status in (
                    'draft',
                    'submitted',
                    'approved',
                    'rejected',
                    'paid'
                  )) default 'draft',
  submitted_at    timestamp with time zone,
  approved_at     timestamp with time zone,
  paid_at         timestamp with time zone,
  notes           text,
  created_at      timestamp with time zone 
                    default timezone('utc'::text, now())
);

-- =============================================
-- TABLE 5: RECEIPTS
-- Core table — one row per captured receipt
-- Linked to a claim_batch (even solo receipts)
-- =============================================
create table public.receipts (
  id               uuid default uuid_generate_v4() primary key,
  company_id       uuid references public.companies(id) 
                     on delete cascade not null,
  captured_by      uuid references public.profiles(id) 
                     on delete set null,
  claim_batch_id   uuid references public.claim_batches(id) 
                     on delete set null,
  approved_by      uuid references public.profiles(id) 
                     on delete set null,
  vendor           text not null,
  amount           decimal(10,2) not null,
  gst_amount       decimal(10,2),
  date             date not null,
  category         text not null default 'Other',
  type             text check (type in (
                     'company',
                     'director_loan',
                     'personal'
                   )) not null,
  status           text check (status in (
                     'draft',
                     'submitted',
                     'inbox',
                     'confirmed',
                     'rejected',
                     'paid'
                   )) default 'inbox',
  image_url        text,
  notes            text,
  rejection_reason text,
  approved_at      timestamp with time zone,
  created_at       timestamp with time zone 
                     default timezone('utc'::text, now())
);

-- =============================================
-- TABLE 6: DIRECTOR LOAN ENTRIES
-- Tracks receipts paid personally by director
-- Creates a running repayment ledger
-- =============================================
create table public.director_loan_entries (
  id               uuid default uuid_generate_v4() primary key,
  receipt_id       uuid references public.receipts(id) 
                     on delete cascade not null,
  company_id       uuid references public.companies(id) 
                     on delete cascade not null,
  director_id      uuid references public.profiles(id) 
                     on delete set null,
  amount           decimal(10,2) not null,
  repaid           boolean default false,
  repaid_at        timestamp with time zone,
  repayment_method text check (repayment_method in (
                     'bank_transfer',
                     'cash',
                     'payroll',
                     'other'
                   )),
  created_at       timestamp with time zone 
                     default timezone('utc'::text, now())
);

-- =============================================
-- TABLE 7: SPENDING POLICIES
-- Per-employee per-category spending rules
-- Phase 2 feature — create table now, use later
-- =============================================
create table public.spending_policies (
  id                uuid default uuid_generate_v4() primary key,
  company_id        uuid references public.companies(id) 
                      on delete cascade not null,
  profile_id        uuid references public.profiles(id) 
                      on delete cascade,
  category          text,
  max_amount        decimal(10,2),
  requires_receipt  boolean default true,
  requires_approval boolean default true,
  created_at        timestamp with time zone 
                      default timezone('utc'::text, now())
);

-- =============================================
-- TABLE 8: NOTIFICATIONS
-- In-app notifications for claim events
-- Phase 2 feature — create table now, use later
-- =============================================
create table public.notifications (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) 
                        on delete cascade not null,
  company_id          uuid references public.companies(id) 
                        on delete cascade not null,
  type                text check (type in (
                        'claim_submitted',
                        'claim_approved',
                        'claim_rejected',
                        'batch_submitted',
                        'batch_approved',
                        'loan_repaid'
                      )) not null,
  title               text not null,
  message             text,
  read                boolean default false,
  related_receipt_id  uuid references public.receipts(id) 
                        on delete set null,
  related_batch_id    uuid references public.claim_batches(id) 
                        on delete set null,
  created_at          timestamp with time zone 
                        default timezone('utc'::text, now())
);

-- =============================================
-- ROW LEVEL SECURITY
-- Every table locked by company_id
-- Accountants get SELECT only
-- Employees see only their own receipts
-- =============================================

-- COMPANIES
alter table public.companies enable row level security;

create policy "Users can view their own company"
  on public.companies for select
  using (
    id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Users can update their own company"
  on public.companies for update
  using (
    id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Anyone can insert a company"
  on public.companies for insert
  with check (true);

-- PROFILES
alter table public.profiles enable row level security;

create policy "Users can view profiles in their company"
  on public.profiles for select
  using (
    id = auth.uid()
    or company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- COMPANY CATEGORIES
alter table public.company_categories enable row level security;

create policy "Users can view their company categories"
  on public.company_categories for select
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Owners and managers can manage categories"
  on public.company_categories for all
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager')
    )
  );

-- CLAIM BATCHES
alter table public.claim_batches enable row level security;

create policy "Users can view company claim batches"
  on public.claim_batches for select
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Employees can insert their own batches"
  on public.claim_batches for insert
  with check (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
    and submitted_by = auth.uid()
  );

create policy "Submitters and approvers can update batches"
  on public.claim_batches for update
  using (
    submitted_by = auth.uid()
    or reviewed_by = auth.uid()
    or company_id in (
      select company_id from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager')
    )
  );

-- RECEIPTS
alter table public.receipts enable row level security;

create policy "Owners and accountants can view all receipts"
  on public.receipts for select
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
      and role in ('owner', 'accountant', 'manager')
    )
  );

create policy "Employees can view their own receipts"
  on public.receipts for select
  using (
    captured_by = auth.uid()
  );

create policy "Users can insert receipts for their company"
  on public.receipts for insert
  with check (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
    and captured_by = auth.uid()
  );

create policy "Owners and managers can update any receipt"
  on public.receipts for update
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager')
    )
  );

create policy "Employees can update their own draft receipts"
  on public.receipts for update
  using (
    captured_by = auth.uid()
    and status = 'draft'
  );

-- DIRECTOR LOAN ENTRIES
alter table public.director_loan_entries enable row level security;

create policy "Owners and accountants can view director loans"
  on public.director_loan_entries for select
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
      and role in ('owner', 'accountant')
    )
  );

create policy "Directors can view their own loans"
  on public.director_loan_entries for select
  using (director_id = auth.uid());

create policy "Owners can insert director loans"
  on public.director_loan_entries for insert
  with check (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
    and role = 'owner'
  );

create policy "Owners can update director loans"
  on public.director_loan_entries for update
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
      and role = 'owner'
    )
  );

-- SPENDING POLICIES
alter table public.spending_policies enable row level security;

create policy "Owners can manage spending policies"
  on public.spending_policies for all
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
    and role = 'owner'
  );

create policy "Employees can view their own policies"
  on public.spending_policies for select
  using (profile_id = auth.uid());

-- NOTIFICATIONS
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can mark their notifications as read"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert
  with check (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid()
    )
  );

-- =============================================
-- AUTO-CREATE PROFILE TRIGGER
-- Fires when a new user signs up via Supabase Auth
-- Creates their profile row automatically
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    full_name,
    role,
    is_director,
    can_approve,
    onboarded
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(
      new.raw_user_meta_data->>'role', 
      'owner'
    ),
    case 
      when coalesce(
        new.raw_user_meta_data->>'role', 
        'owner'
      ) = 'owner' 
      then true 
      else false 
    end,
    case 
      when coalesce(
        new.raw_user_meta_data->>'role', 
        'owner'
      ) in ('owner', 'manager') 
      then true 
      else false 
    end,
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- AUTO-UPDATE BATCH TOTAL TRIGGER
-- Recalculates claim_batches.total_amount
-- whenever a receipt is added or updated
-- =============================================

create or replace function public.update_batch_total()
returns trigger as $$
begin
  if new.claim_batch_id is not null then
    update public.claim_batches
    set total_amount = (
      select coalesce(sum(amount), 0)
      from public.receipts
      where claim_batch_id = new.claim_batch_id
      and type != 'personal'
    )
    where id = new.claim_batch_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_receipt_saved
  after insert or update on public.receipts
  for each row execute procedure public.update_batch_total();

-- =============================================
-- SEED DEFAULT CATEGORIES
-- These fire after company_id is known
-- Called from application code not here
-- Just documenting the default list:
-- Meals, Transport, Software, Equipment,
-- Supplies, Marketing, Professional Services,
-- Travel, Home Office, Courses, Other
-- =============================================
