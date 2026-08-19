-- Yoga Maps Staging — permisos base para clientes web
-- Ejecutar una sola vez después de 001_bootstrap.sql.
-- RLS continúa limitando las filas visibles/modificables.

begin;

grant usage on schema public to anon, authenticated;

grant select on
  public.profiles,
  public.teacher_details,
  public.classes,
  public.posts,
  public.post_likes
to anon;

grant select on all tables in schema public to authenticated;

grant update (full_name, avatar_url, username, cover_position)
  on public.profiles to authenticated;
grant update on public.teacher_details, public.student_details
  to authenticated;
grant insert, update, delete on public.classes to authenticated;
grant insert, update on public.class_reservations to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant insert, delete on public.post_likes to authenticated;
grant insert, update on public.teacher_credits to authenticated;
grant insert on public.credit_transactions to authenticated;

commit;

-- Comprobación rápida: debe devolver has_table_privilege = true.
select
  has_table_privilege('anon', 'public.posts', 'select')
    as anon_can_read_posts,
  has_table_privilege('anon', 'public.classes', 'select')
    as anon_can_read_classes,
  has_table_privilege('authenticated', 'public.profiles', 'select')
    as authenticated_can_read_profiles;
