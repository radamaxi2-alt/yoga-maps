-- Yoga Maps — reconciliación inicial para Staging
-- Construida desde las migraciones versionadas y el inventario real de producción.
-- No ejecutar todavía en producción.

begin;

-- ============================================================
-- 1. Columnas que usa la aplicación y faltan en el historial
-- ============================================================

alter table public.profiles
  add column if not exists username text unique;

alter table public.teacher_details
  add column if not exists whatsapp_number text,
  add column if not exists gallery text[];

alter table public.classes
  add column if not exists category text default 'clase',
  add column if not exists certification_title text,
  add column if not exists school_id uuid references public.profiles(id),
  add column if not exists guest_teacher_ids uuid[] default '{}'::uuid[];

create index if not exists idx_classes_category
  on public.classes(category);

-- El código actual registra invitados no registrados y asistencia. Estas
-- columnas no aparecen en el inventario de producción y hoy rompen ese flujo.
alter table public.class_reservations
  alter column student_id drop not null,
  add column if not exists guest_name text,
  add column if not exists attendance text default 'none';

alter table public.class_reservations
  drop constraint if exists class_reservations_attendance_check;

alter table public.class_reservations
  add constraint class_reservations_attendance_check
  check (attendance in ('none', 'present', 'absent'));

alter table public.class_reservations
  drop constraint if exists class_reservations_identity_check;

alter table public.class_reservations
  add constraint class_reservations_identity_check
  check (student_id is not null or nullif(btrim(guest_name), '') is not null);

-- ============================================================
-- 2. Abonos de clases y movimientos
-- ============================================================

create table if not exists public.teacher_credits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  credits integer not null default 0 check (credits >= 0),
  updated_at timestamptz not null default now(),
  unique (student_id, teacher_id)
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount <> 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_student_teacher_created
  on public.credit_transactions(student_id, teacher_id, created_at desc);

alter table public.teacher_credits enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "Acceso total teacher_credits" on public.teacher_credits;
drop policy if exists "Acceso total credit_transactions" on public.credit_transactions;

create policy "Students read own credits"
  on public.teacher_credits for select to authenticated
  using (student_id = auth.uid());

create policy "Teachers read managed credits"
  on public.teacher_credits for select to authenticated
  using (teacher_id = auth.uid());

create policy "Teachers create managed credits"
  on public.teacher_credits for insert to authenticated
  with check (teacher_id = auth.uid());

create policy "Teachers update managed credits"
  on public.teacher_credits for update to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Students read own credit transactions"
  on public.credit_transactions for select to authenticated
  using (student_id = auth.uid());

create policy "Teachers read managed credit transactions"
  on public.credit_transactions for select to authenticated
  using (teacher_id = auth.uid());

create policy "Teachers create managed credit transactions"
  on public.credit_transactions for insert to authenticated
  with check (teacher_id = auth.uid());

-- No hay políticas UPDATE/DELETE para movimientos: el historial es inmutable.

-- ============================================================
-- 3. Reservas compatibles con solicitudes pendientes
-- ============================================================

alter table public.class_reservations
  drop constraint if exists class_reservations_status_check;

alter table public.class_reservations
  add constraint class_reservations_status_check
  check (status in ('pending', 'confirmed', 'cancelled'));

drop policy if exists "Users can update their own reservations"
  on public.class_reservations;

create policy "Teachers update reservations for their classes"
  on public.class_reservations for update to authenticated
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_reservations.class_id
        and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = class_reservations.class_id
        and c.teacher_id = auth.uid()
    )
  );

create policy "Teachers create reservations for their classes"
  on public.class_reservations for insert to authenticated
  with check (
    exists (
      select 1 from public.classes c
      where c.id = class_reservations.class_id
        and c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- 4. Alta consistente de alumnos y profesores
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  begin
    requested_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'alumno'::public.user_role
    );
  exception when invalid_text_representation then
    requested_role := 'alumno'::public.user_role;
  end;

  insert into public.profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    requested_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );

  if requested_role = 'profesor' then
    insert into public.teacher_details (id) values (new.id);
  else
    insert into public.student_details (id) values (new.id);
  end if;

  return new;
end;
$$;

-- ============================================================
-- 5. Proteger campos comerciales del perfil
-- ============================================================

revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, username, cover_position)
  on public.profiles to authenticated;

-- ============================================================
-- 6. Storage que realmente utiliza el código
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "Public reads avatars"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy "Users upload own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Los límites comerciales actuales (12/80/ilimitado) no están aprobados.
-- Staging conserva las columnas, pero no bloqueará publicaciones todavía.
drop trigger if exists tr_check_class_limit on public.classes;

commit;
