-- Yoga Maps — instalación limpia de Staging
-- Fecha: 2026-08-19
-- Destino exclusivo: proyecto vacío "Yoga Maps Staging".
-- No ejecutar en producción: este archivo crea el esquema desde cero.

begin;

create type public.user_role as enum ('profesor', 'alumno');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'alumno',
  full_name text,
  avatar_url text,
  username text unique,
  cover_position integer not null default 50 check (cover_position between 0 and 100),
  subscription_plan text not null default 'zen',
  trial_expires_at timestamptz,
  community_score integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.teacher_details (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  specialties text[],
  latitude double precision,
  longitude double precision,
  address text,
  average_price numeric(10,2) not null default 0,
  teacher_type text not null default 'independiente',
  cover_image text,
  gallery text[],
  whatsapp_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_details (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  health_info text
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_details(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10,2) not null default 0 check (price >= 0),
  scheduled_at timestamptz not null,
  jitsi_room_link text,
  style text,
  instructor_name text,
  max_capacity integer check (max_capacity is null or max_capacity >= 0),
  is_full boolean not null default false,
  latitude double precision,
  longitude double precision,
  address text,
  category text not null default 'clase',
  certification_title text,
  capacity_presential integer not null default 10 check (capacity_presential >= 0),
  capacity_online integer not null default 10 check (capacity_online >= 0),
  total_capacity integer not null default 20 check (total_capacity >= 0),
  series_id uuid,
  school_id uuid references public.profiles(id) on delete set null,
  guest_teacher_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_classes_teacher_id on public.classes(teacher_id);
create index idx_classes_scheduled_at on public.classes(scheduled_at);
create index idx_classes_category on public.classes(category);
create index idx_classes_map_active
  on public.classes(scheduled_at, category)
  where latitude is not null and longitude is not null;

create table public.class_reservations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  guest_name text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  modality text not null default 'presential'
    check (modality in ('presential', 'online')),
  attendance text not null default 'none'
    check (attendance in ('none', 'present', 'absent')),
  created_at timestamptz not null default now(),
  constraint class_reservations_identity_check
    check (student_id is not null or nullif(btrim(guest_name), '') is not null)
);

create index idx_class_reservations_student
  on public.class_reservations(student_id);
create unique index idx_class_reservations_registered_student_unique
  on public.class_reservations(class_id, student_id)
  where student_id is not null;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_posts_created_at on public.posts(created_at desc);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.teacher_credits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  credits integer not null default 0 check (credits >= 0),
  updated_at timestamptz not null default now(),
  unique (student_id, teacher_id)
);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount <> 0),
  created_at timestamptz not null default now()
);

create index idx_credit_transactions_student_teacher_created
  on public.credit_transactions(student_id, teacher_id, created_at desc);

-- Actualización automática de timestamps.
create function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_teacher_details
  before update on public.teacher_details
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_classes
  before update on public.classes
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_posts
  before update on public.posts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_teacher_credits
  before update on public.teacher_credits
  for each row execute function public.handle_updated_at();

-- Perfil y detalle correspondiente al registrarse.
create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.teacher_details enable row level security;
alter table public.student_details enable row level security;
alter table public.classes enable row level security;
alter table public.class_reservations enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.teacher_credits enable row level security;
alter table public.credit_transactions enable row level security;

create policy "Public reads profiles"
  on public.profiles for select to public using (true);
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Evita que un usuario se cambie plan, score o rol desde el navegador.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, username, cover_position)
  on public.profiles to authenticated;

create policy "Public reads teacher details"
  on public.teacher_details for select to public using (true);
create policy "Teachers update own details"
  on public.teacher_details for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Students read own details"
  on public.student_details for select to authenticated
  using (id = auth.uid());
create policy "Teachers read confirmed student details"
  on public.student_details for select to authenticated
  using (exists (
    select 1
    from public.class_reservations r
    join public.classes c on c.id = r.class_id
    where r.student_id = student_details.id
      and r.status = 'confirmed'
      and c.teacher_id = auth.uid()
  ));
create policy "Students update own details"
  on public.student_details for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Public reads classes"
  on public.classes for select to public using (true);
create policy "Teachers create own classes"
  on public.classes for insert to authenticated
  with check (teacher_id = auth.uid());
create policy "Teachers update own classes"
  on public.classes for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "Teachers delete own classes"
  on public.classes for delete to authenticated
  using (teacher_id = auth.uid());

create policy "Students read own reservations"
  on public.class_reservations for select to authenticated
  using (student_id = auth.uid());
create policy "Teachers read class reservations"
  on public.class_reservations for select to authenticated
  using (exists (
    select 1 from public.classes c
    where c.id = class_reservations.class_id
      and c.teacher_id = auth.uid()
  ));
create policy "Students request own reservations"
  on public.class_reservations for insert to authenticated
  with check (student_id = auth.uid() and guest_name is null);
create policy "Teachers create class reservations"
  on public.class_reservations for insert to authenticated
  with check (exists (
    select 1 from public.classes c
    where c.id = class_reservations.class_id
      and c.teacher_id = auth.uid()
  ));
create policy "Teachers update class reservations"
  on public.class_reservations for update to authenticated
  using (exists (
    select 1 from public.classes c
    where c.id = class_reservations.class_id
      and c.teacher_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.classes c
    where c.id = class_reservations.class_id
      and c.teacher_id = auth.uid()
  ));

create policy "Public reads posts"
  on public.posts for select to public using (true);
create policy "Teachers create own posts"
  on public.posts for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'profesor'
    )
  );
create policy "Teachers update own posts"
  on public.posts for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Teachers delete own posts"
  on public.posts for delete to authenticated
  using (author_id = auth.uid());

create policy "Public reads likes"
  on public.post_likes for select to public using (true);
create policy "Users create own likes"
  on public.post_likes for insert to authenticated
  with check (user_id = auth.uid());
create policy "Users delete own likes"
  on public.post_likes for delete to authenticated
  using (user_id = auth.uid());

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
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "Students read own credit transactions"
  on public.credit_transactions for select to authenticated
  using (student_id = auth.uid());
create policy "Teachers read managed credit transactions"
  on public.credit_transactions for select to authenticated
  using (teacher_id = auth.uid());
create policy "Teachers create managed credit transactions"
  on public.credit_transactions for insert to authenticated
  with check (teacher_id = auth.uid());

-- ============================================================
-- Storage
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('teacher-covers', 'teacher-covers', true),
  ('blog-images', 'blog-images', true);

create policy "Public reads Yoga Maps images"
  on storage.objects for select to public
  using (bucket_id in ('avatars', 'teacher-covers', 'blog-images'));

create policy "Users upload own Yoga Maps images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars', 'teacher-covers', 'blog-images')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own Yoga Maps images"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars', 'teacher-covers', 'blog-images')
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id in ('avatars', 'teacher-covers', 'blog-images')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own Yoga Maps images"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars', 'teacher-covers', 'blog-images')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

commit;
