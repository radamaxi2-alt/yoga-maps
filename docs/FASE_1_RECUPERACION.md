# Fase 1 — Recuperación de Yoga Maps

## Objetivo

Recuperar una base técnica reproducible y estable sin modificar ni borrar datos de producción hasta conocer el estado real de Supabase.

## Reglas de seguridad

1. No ejecutar migraciones sobre producción antes de obtener un backup.
2. No editar migraciones que ya puedan estar aplicadas.
3. No copiar secretos al repositorio ni compartirlos por chat.
4. Probar cambios de esquema en staging antes de producción.
5. Cada cambio de datos debe incluir reversión o restauración documentada.

## Baseline auditado

- Commit inicial de trabajo: `e5c105e`.
- Rama de recuperación: `codex/fase-1-recuperacion`.
- Framework: Next.js 15.2.9 / React 19.
- Backend declarado: Supabase.
- Despliegue público: Vercel.
- Estado inicial: las rutas públicas responden, pero las que consultan datos tardan aproximadamente entre 10 y 19 segundos.

## Hallazgos confirmados en producción

- Proyecto Supabase identificado: `Yoga Maps`.
- Organización: `radamaxi2-alt's Org`.
- Plan observado: Free.
- Región observada: AWS `us-west-2`.
- Estado observado el 19/08/2026: **Project is paused**.

El proyecto pausado es una causa directa y prioritaria de la lentitud/inestabilidad observada. La distancia regional también añade latencia para usuarios de Argentina, pero no se tomará todavía ninguna decisión de migración: primero se debe reactivar, medir nuevamente y revisar los datos reales.

### Medición posterior a la reactivación

El proyecto quedó `Saludable` y se repitió la misma medición. Los tiempos bajaron de 10–19 segundos a aproximadamente 3,3–7,9 segundos:

| Ruta | Antes | Supabase activo |
|---|---:|---:|
| Inicio | 11,9 s | 7,9 s |
| Mapa | 18,1 s | 4,6 s |
| Clases | 10,7 s | 3,6 s |
| Profesores | 19,0 s | 3,8 s |
| Blog | 11,9 s | 7,0 s |

Conclusión: la pausa era una causa importante, pero la aplicación continúa siendo lenta. Deben revisarse el layout, las consultas dinámicas sin caché, la cantidad de datos y la región antes de considerar resuelto el rendimiento.

El panel también confirmó `Sin migraciones`, `Sin copias de seguridad` y `No repository connected`.

## Entorno de staging

- Proyecto creado: `Yoga Maps Staging`.
- Región: South America (`São Paulo`).
- Plan: Free / compute Nano.
- Estado inicial observado el 19/08/2026: `Unhealthy` mientras finalizaba el aprovisionamiento.
- Estado posterior confirmado el 19/08/2026: `Healthy` sin realizar ninguna activación manual adicional.
- Comprobación externa: el endpoint público responde, por lo que el proyecto existe y la capa de API está activa.
- No se conectó GitHub ni se ejecutaron migraciones o consultas de escritura.

Este entorno se utilizará para reconstruir y validar el esquema antes de proponer cualquier cambio en producción. El siguiente paso técnico es preparar una migración base consolidada y revisable; no se copiarán ciegamente las migraciones históricas porque no representan por completo el esquema real de producción.

### Primera reconciliación preparada

Se creó `202608190001_reconcile_staging_baseline.sql` para ejecutar únicamente después de su revisión en Staging. La reconciliación:

- incorpora columnas usadas por la aplicación que no estaban versionadas;
- agrega `attendance` y `guest_name`, ausentes incluso en el esquema real exportado;
- reconstruye abonos y movimientos con RLS restringido;
- admite reservas `pending` y gestión por el profesor dueño de la clase;
- corrige el alta automática de perfiles alumno/profesor;
- protege los campos comerciales del perfil frente a cambios desde el cliente;
- crea el bucket `avatars` que el código ya utiliza;
- desactiva en Staging los límites antiguos 12/80/ilimitado hasta definir los planes.

El archivo todavía no se ejecutó. Primero debe validarse la cadena completa de migraciones sobre la base vacía.

### Instalación limpia preparada para Staging

Para no obligar a ejecutar catorce migraciones históricas con deriva, se prepararon dos archivos específicos:

- `supabase/staging/001_bootstrap.sql`: crea desde cero las nueve tablas, relaciones, índices, triggers, RLS y tres buckets.
- `supabase/staging/002_verify_bootstrap.sql`: realiza cinco comprobaciones de solo lectura después de instalar.

El instalador es transaccional: si una sentencia falla, no debe dejar medio esquema creado. Está destinado únicamente al proyecto vacío `Yoga Maps Staging`; producción necesitará migraciones incrementales y backup previo.

### Instalación y verificación ejecutadas

El 19/08/2026 se ejecutó `001_bootstrap.sql` en `Yoga Maps Staging` con resultado exitoso. La consulta `002_verify_bootstrap.sql` devolvió las cinco comprobaciones aprobadas:

| Comprobación | Resultado |
|---|---:|
| Tablas esperadas | 9/9 |
| Tablas con RLS activo | 9/9 |
| Buckets de Storage | 3/3 |
| Trigger de alta de usuarios | 1/1 |
| Trigger antiguo de límites | 0/0 |

Staging ya cuenta con una base reproducible y segura. El próximo paso es conectar un despliegue web de prueba a este proyecto y realizar recorridos funcionales con cuentas ficticias de alumno y profesor.

### Primer recorrido del Preview

Se publicó la rama `codex/fase-1-recuperacion` y Vercel generó correctamente un Preview conectado a Staging. Inicio, mapa, profesores, clases y retiros respondieron, pero el recorrido visual detectó dos incidencias:

- El blog devolvió `permission denied for table posts`. La causa es que RLS estaba configurado, pero el bootstrap no declaraba privilegios SQL base para `anon` y `authenticated`.
- Google Maps cargó con la marca `For development purposes only`, lo que requiere revisar autorización del dominio Preview, restricciones de la API y/o facturación de Google Maps.

Se preparó `supabase/staging/003_fix_web_grants.sql` para corregir el primer problema sin debilitar RLS. El bootstrap se actualizó también para futuras instalaciones limpias.

El 19/08/2026 se ejecutó `003_fix_web_grants.sql` en Staging. El blog volvió a cargar correctamente y mostró su estado vacío (`Aún no hay publicaciones en el blog`), confirmando que la lectura pública funciona y que RLS permanece activo. La incidencia queda resuelta en Staging.

La revisión del código confirmó que el mapa y los formularios de ubicación necesitan Google Maps JavaScript API y Places API. La autenticación por correo y Google utiliza la ruta `/auth/callback`, dato que debe contemplarse en las URLs permitidas de Supabase Auth.

El registro de prueba de profesor completó confirmación por correo, creación de username, asignación de rol y acceso al panel. Durante el recorrido se corrigieron contrastes ilegibles y se retiraron precios, límites, alias y WhatsApp ficticios que no habían sido aprobados como decisiones comerciales.

Max y Delfina aprobaron una nueva dirección visual en lavandas, lilas y magentas empolvados. Se inició su aplicación global y se desactivó el cambio automático a tema oscuro, identificado como causa sistémica de varios problemas de contraste.

Google Maps queda pendiente porque la prueba gratuita de la cuenta de facturación finalizó. El código, la clave y las APIs requeridas están presentes; la reactivación se posterga para evitar solicitar una tarjeta en esta etapa.

## Acceso requerido

El acceso debe hacerse mediante las sesiones oficiales de Supabase y Vercel. Nunca mediante contraseñas o secretos copiados en mensajes.

### Supabase — datos de solo lectura a recopilar

- Nombre y región del proyecto.
- Estado del proyecto y consumo.
- Lista de migraciones aplicadas.
- Exportación del esquema `public` sin datos.
- Tablas, columnas, claves foráneas, índices, triggers y funciones.
- Políticas RLS.
- Buckets y políticas de Storage.
- Proveedores de autenticación y URLs de redirección.
- Logs de consultas/API lentas.

### Vercel — datos de solo lectura a recopilar

- Proyecto y rama de producción.
- Región de funciones.
- Variables configuradas por entorno, solo nombres y presencia; no copiar valores.
- Logs de `/`, `/mapa`, `/profesores`, `/clases` y `/blog`.
- Historial de despliegues y último build.

## Orden de ejecución

1. Inventariar producción sin escribir.
2. Crear backup verificable.
3. Crear proyecto/entorno staging.
4. Comparar esquema real contra migraciones y tipos.
5. Escribir migraciones de reconciliación nuevas.
6. Corregir build, tipos y lint.
7. Optimizar consultas públicas y medir nuevamente.
8. Probar autenticación y recorridos alumno/profesor.
9. Recién entonces preparar despliegue controlado.

## Criterios de salida de Fase 1

- Base reproducible desde cero con migraciones versionadas.
- Build y validaciones sin errores ignorados.
- RLS y Storage auditados.
- Registro/login y perfiles probados.
- Rutas públicas estables y con tiempos medidos.
- Ningún precio o límite comercial no aprobado expuesto como definitivo.
