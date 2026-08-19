# Decisiones de producto — Yoga Maps

## Abonos y clases disponibles

**Estado:** conservar y rediseñar.  
**Fecha:** 19/08/2026.

La función de créditos no representa dinero dentro de Yoga Maps. Representa la cantidad de clases disponibles que un alumno compró directamente a un profesor.

Ejemplo:

1. El alumno paga al profesor por fuera de Yoga Maps.
2. El profesor carga un abono de cuatro u ocho clases.
3. Profesor y alumno ven “clases disponibles”.
4. Cada asistencia confirmada descuenta una clase.
5. El historial permite saber cuándo se cargó y consumió cada clase.

### Valor para el producto

- Reemplaza planillas manuales de profesores como Delfina.
- Da al alumno transparencia sobre su abono.
- Genera uso frecuente de Yoga Maps después de descubrir una clase.
- Da al profesor un motivo concreto para invitar a sus alumnos a registrarse.
- Diferencia Yoga Maps de un simple directorio.

### Lenguaje recomendado

En la interfaz usar `Clases disponibles`, `Cargar abono` e `Historial de asistencias`. Reservar `crédito` para el nombre técnico interno si resulta conveniente.

### Reglas iniciales propuestas

- Solo el profesor puede cargar o ajustar el abono de sus alumnos.
- El alumno puede ver su saldo e historial, pero no modificarlo.
- El profesor solo puede ver y gestionar saldos vinculados a él.
- Cada modificación crea un movimiento inmutable con motivo, fecha y responsable.
- El descuento por asistencia debe ser transaccional: confirmar asistencia y descontar una clase ocurren juntos o no ocurre ninguno.
- Pagos, facturación y cobro dentro de Yoga Maps quedan fuera de esta función inicial.
- Las reglas de ausencias, cancelaciones y recuperación de clases requieren decisión de producto posterior.

### Prioridad

Conservar las tablas durante Fase 1 y cerrar inmediatamente sus permisos. Completar la experiencia después de estabilizar mapa, clases y perfiles.

## Identidad visual

**Estado:** aprobada para extender a toda la web.

**Fecha:** 19/08/2026.

La interfaz utilizará una paleta suave de lavanda, lila y magenta empolvado. Los fondos combinarán estos tonos con imágenes naturales visibles, sin blancos puros que encandilen ni violetas excesivamente oscuros en acciones principales.

Reglas acordadas:

- Fondo general en degradados lavanda y rosa empolvado.
- Imágenes naturales visibles con tratamiento suave.
- Títulos y texto principal en ciruela.
- Botones en lila medio, con contraste suficiente y sin violeta casi negro.
- Tarjetas en marfil lavanda translúcido.
- Mantener la estética tranquila y limpia, sin sobrecargar de recursos místicos.
- No alternar automáticamente a un tema oscuro según el dispositivo: la identidad debe ser consistente.
