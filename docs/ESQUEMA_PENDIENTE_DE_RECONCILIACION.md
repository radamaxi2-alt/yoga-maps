# Esquema pendiente de reconciliación

Este archivo registra diferencias detectadas entre el código/tipos y las migraciones versionadas. No confirma que los objetos falten en producción: eso debe verificarse contra el Supabase real.

## Tablas confirmadas en producción

El Editor de tablas de Supabase confirmó el 19/08/2026 estas nueve tablas en el esquema público:

- `class_reservations`
- `classes`
- `credit_transactions`
- `post_likes`
- `posts`
- `profiles`
- `student_details`
- `teacher_credits`
- `teacher_details`

Por lo tanto, `teacher_credits` y `credit_transactions` no faltan en producción: faltan en el historial de migraciones versionado. Los nombres se muestran traducidos en la interfaz de Supabase, pero corresponden a los identificadores usados por el código.

## Columnas confirmadas en producción

Se exportó `information_schema.columns` y se confirmaron 73 columnas. Diferencias relevantes respecto de las migraciones versionadas:

- `profiles` sí contiene `username`.
- `teacher_details` sí contiene `whatsapp_number`.
- `classes` contiene `category`, `certification_title`, `school_id` y `guest_teacher_ids`.
- `classes` también contiene capacidades presencial, online y total, además de `series_id`.
- `teacher_credits` contiene saldo por pareja alumno/profesor.
- `credit_transactions` registra movimientos de créditos.
- `class_reservations.status` continúa siendo texto; todavía debe verificarse su constraint real porque el código utiliza `pending`.
- `guest_teacher_ids` es `uuid[]`, mientras los tipos generados actuales lo representan de manera menos precisa como un array genérico de strings.

El esquema real demuestra que parte del desarrollo se aplicó directamente sobre Supabase o mediante SQL no conservado en el repositorio.

| Objeto esperado por el código | Uso | Presente en migraciones |
|---|---|---|
| `profiles.username` | Identidad pública y búsqueda | No |
| `teacher_details.whatsapp_number` | Contacto y reservas | No |
| `classes.category` | Clase/retiro/formación/armonización | No |
| `classes.guest_teacher_ids` | Profesores invitados | No |
| `classes.school_id` | Vinculación con escuela | No |
| `teacher_credits` | Créditos del alumno | No; confirmada en producción |
| `credit_transactions` | Historial del wallet | No; confirmada en producción |
| bucket `avatars` | Fotos de perfil | No |
| bucket `blog-images` | Imágenes del blog | No |
| `profiles.cover_position` | Posición de portada | Sí, pero el código actual indica deriva histórica |

## Inconsistencias funcionales a resolver

- `user_role` admite `profesor` y `alumno`, mientras algunas consultas buscan también `escuela` como rol.
- Escuela aparece a la vez como `teacher_details.teacher_type` y como concepto de plan.
- Los límites de publicación existen en SQL y en Server Actions con criterios diferentes.
- El trigger SQL cuenta clases creadas durante 30 días móviles; la acción actual cuenta todas las filas históricas.
- Una recurrencia crea muchas filas y su consumo de cuota no está definido formalmente.
- `class_reservations.status` nació con `confirmed/cancelled`, pero el código inserta también `pending`.

## Seguridad y reglas confirmadas

El inventario de RLS, constraints, índices y triggers confirmó:

### Crítico

- `teacher_credits` tiene una política `ALL` con `using=true` y sin restricción de usuario. Permite acceso total a la tabla a través de los roles expuestos.
- `credit_transactions` tiene la misma política de acceso total.
- `profiles` permite al usuario actualizar su propia fila completa. Como allí viven `subscription_plan` y `community_score`, se debe impedir que el cliente modifique campos de negocio aunque conserve permiso para editar nombre/avatar/username.

### Funcional

- El constraint `class_reservations_status_check` solo admite `confirmed` y `cancelled`; la inserción de `pending` del código falla.
- Solo el alumno posee política de `UPDATE` sobre su reserva. No existe una política para que el profesor dueño de la clase confirme o cancele solicitudes.
- La tabla `classes` tiene activo el trigger `check_class_limit()`, además de límites duplicados en Server Actions. La definición de la función debe auditarse antes de unificar la regla.

### Deuda técnica

- Hay políticas públicas de lectura duplicadas: dos en `classes`, cuatro en `profiles`, cinco en `posts` y dos en `post_likes`.
- RLS está habilitado en las nueve tablas públicas, lo cual es una buena base, pero no compensa políticas `ALL` abiertas.
- Los índices básicos de clases existen para `teacher_id`, `scheduled_at` y `category`; todavía faltan índices geográficos y compuestos para el mapa futuro.

## Funciones y Storage confirmados

- `check_class_limit()` aplica todavía 12 clases para `zen`, 80 para `namaste` e ilimitadas para `escuela`, contando filas creadas durante los últimos 30 días.
- `handle_new_user()` es la versión inicial: crea `profiles`, pero no asigna rol ni crea `student_details`/`teacher_details`.
- Existen los buckets públicos `blog-images` y `teacher-covers`; el bucket `avatars` utilizado por el código no existe.
- La inserción en `teacher-covers` exige autenticación, pero no exige que el archivo se guarde dentro de la carpeta del UID del usuario.
- La política llamada “Solo profesores pueden subir fotos” en `blog-images` comprueba únicamente autenticación/bucket, no el rol profesor.

## Resultado esperado

La comparación con producción debe producir una migración nueva por corrección, tipos regenerados automáticamente y una decisión explícita para cada inconsistencia. No se deben modificar las migraciones históricas para simular que siempre existieron esos cambios.
