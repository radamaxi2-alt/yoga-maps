-- BORRADOR: NO EJECUTAR EN PRODUCCIÓN TODAVÍA.
-- Requiere adaptar primero el flujo de reservas/créditos y probar en staging.

begin;

-- ============================================================
-- 1. Cerrar acceso público total a saldos y movimientos
-- ============================================================

drop policy if exists "Acceso total teacher_credits" on public.teacher_credits;
drop policy if exists "Acceso total credit_transactions" on public.credit_transactions;

create policy "Students read own credits"
  on public.teacher_credits for select
  to authenticated
  using (student_id = auth.uid());

create policy "Teachers read managed credits"
  on public.teacher_credits for select
  to authenticated
  using (teacher_id = auth.uid());

create policy "Teachers create managed credits"
  on public.teacher_credits for insert
  to authenticated
  with check (teacher_id = auth.uid());

create policy "Teachers update managed credits"
  on public.teacher_credits for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Students read own credit transactions"
  on public.credit_transactions for select
  to authenticated
  using (student_id = auth.uid());

create policy "Teachers read managed credit transactions"
  on public.credit_transactions for select
  to authenticated
  using (teacher_id = auth.uid());

create policy "Teachers create managed credit transactions"
  on public.credit_transactions for insert
  to authenticated
  with check (teacher_id = auth.uid());

-- Los movimientos no tienen UPDATE ni DELETE: el historial es inmutable.

-- ============================================================
-- 2. Alinear estados de reserva con el flujo existente
-- ============================================================

alter table public.class_reservations
  drop constraint if exists class_reservations_status_check;

alter table public.class_reservations
  add constraint class_reservations_status_check
  check (status in ('pending', 'confirmed', 'cancelled'));

create policy "Teachers update reservations for their classes"
  on public.class_reservations for update
  to authenticated
  using (
    exists (
      select 1
      from public.classes c
      where c.id = class_reservations.class_id
        and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.classes c
      where c.id = class_reservations.class_id
        and c.teacher_id = auth.uid()
    )
  );

commit;

-- Reversión conceptual:
-- 1. eliminar las políticas nuevas;
-- 2. restaurar las políticas anteriores solo si fuera imprescindible;
-- 3. antes de restaurar el constraint antiguo, resolver filas pending existentes.
