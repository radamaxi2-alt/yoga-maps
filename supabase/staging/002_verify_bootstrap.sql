-- Yoga Maps Staging — verificación de instalación
-- Solo lectura: ejecutar después de 001_bootstrap.sql.

select
  'tables' as check_name,
  count(*)::text as actual,
  '9' as expected,
  count(*) = 9 as passed
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'teacher_details', 'student_details', 'classes',
    'class_reservations', 'posts', 'post_likes', 'teacher_credits',
    'credit_transactions'
  )

union all

select
  'rls_enabled',
  count(*)::text,
  '9',
  count(*) = 9
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles', 'teacher_details', 'student_details', 'classes',
    'class_reservations', 'posts', 'post_likes', 'teacher_credits',
    'credit_transactions'
  )
  and c.relrowsecurity

union all

select
  'storage_buckets',
  count(*)::text,
  '3',
  count(*) = 3
from storage.buckets
where id in ('avatars', 'teacher-covers', 'blog-images')

union all

select
  'auth_trigger',
  count(*)::text,
  '1',
  count(*) = 1
from information_schema.triggers
where trigger_name = 'on_auth_user_created'

union all

select
  'legacy_plan_limit_disabled',
  count(*)::text,
  '0',
  count(*) = 0
from information_schema.triggers
where trigger_name = 'tr_check_class_limit';

-- Todas las filas deben devolver passed = true.
