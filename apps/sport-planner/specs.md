## Sport Planner – Especificación de la SPA (estado actual del código)

### 1. Contexto y propósito
- Aplicación web de página única (SPA) para planificar clases o sesiones de entrenamiento.
- SPA **100 % cliente**: no hay servidor propio, SSR ni endpoints personalizados; el bundle final se sirve como archivos estáticos.
- Supabase es un requisito (auth + datos) consumido directamente desde el cliente:
  - `planner_states`: snapshot JSON por usuario.
  - `works` y `work_collaborators`: catálogo de trabajos compartible (visibilidad + colaboradores) con refresco por Realtime.
- Despliegue bajo `/sport-planner/` (por ejemplo, en `maballesteros.com`). La navegación usa `HashRouter` (`#/…`) y Vite `base` para que rutas y assets funcionen en hosting estático.

### 2. Objetivos principales
- Planificar sesiones por fecha, con título/descripcion/notas y hora de inicio.
- Reutilizar sesiones (duplicar) y reutilizar trabajos desde catálogo.
- Editar rápido la secuencia de trabajos dentro de una sesión (drag & drop) y ajustar duraciones.
- Home móvil para la sesión “actual”: marcar trabajos completados, ver detalles (markdown + vídeos) y registrar asistencia real.
- Planificador con calendario mensual (semanas empiezan en lunes) para crear/seleccionar sesiones.
- Backups JSON para exportar/importar el estado completo.

### 3. Alcance y restricciones actuales
- Autenticación obligatoria mediante Supabase (email + contraseña). Todas las rutas están detrás de `/login`.
- Sincronización multi-dispositivo:
  - Estado general (objetivos/sesiones/asistentes) vía `planner_states`.
  - Catálogo de trabajos vía `works`/`work_collaborators` (propietario + colaboradores por email).
- Offline: el estado se cachea en `localStorage` y la sesión de Supabase se persiste. Sin red se puede navegar y editar sesiones/objetivos/asistentes; la edición/creación del catálogo depende de Supabase.
- No hay múltiples agendas, roles complejos, recordatorios ni notificaciones.

### 4. Entidades principales (modelo real en la app)
- **Usuario**
  - Usuario autenticado de Supabase (`auth.users`). No existe un perfil adicional en la app.

- **Objetivo** (`Objective`)
  - `id`, `name`, `colorHex`, `descriptionMarkdown`, `createdAt`, `updatedAt`.

- **Trabajo** (`Work`)
  - Identidad y contenido: `id`, `name`, `subtitle`, `objectiveId`, `parentWorkId`, `descriptionMarkdown`, `estimatedMinutes`, `notes`, `videoUrls`, `createdAt`, `updatedAt`.
  - Inventario/planificación: `nodeType`, `tags`, `orderHint`, `nextWorkId`, `variantOfWorkId`.
  - Compartición: `visibility` (`private` | `shared` | `public`), `ownerId`, `ownerEmail`, `collaboratorEmails`, `collaborators`.
  - Permisos efectivos (calculados): `canEdit`, `isOwner`.

- **Sesión** (`Session`)
  - `id`, `date` (`YYYY-MM-DD`), `kind` (`class` | `personal`), `title`, `description`, `notes`, `startTime` (`HH:mm`), `workItems`, `attendance`, `createdAt`, `updatedAt`.

- **Trabajo en sesión** (`SessionWork`)
  - `id`, `workId`, `order`, `focusLabel`, `customDescriptionMarkdown`, `customDurationMinutes`, `notes`, `completed`, `result`, `effort`.

- **Asistente** (`Assistant`)
  - `id`, `name`, `notes`, `active`, `createdAt`, `updatedAt`.

- **Asistencia por sesión** (`SessionAttendance`)
  - `assistantId`
  - `status` (previsión: `present` | `absent` | `pending`)
  - `actualStatus` (real: `present` | `absent`)
  - `notes`, `actualNotes`

### 5. Casos de uso clave (consistente con UI)
1. **Home (próxima sesión)**:
   - Selecciona automáticamente la sesión más cercana (incluida la de hoy).
   - Permite marcar trabajos completados (`completed`), ver detalles, navegar por sesiones, y saltar a edición (link al planificador con `?session=<id>`).
   - Permite marcar asistencia real (`actualStatus`) para asistentes activos.

2. **Planificador (calendario mensual)**:
   - Calendario mensual con inicio de semana en lunes.
   - Lista de sesiones del mes + sesiones del día seleccionado.
   - Crear sesión en el día seleccionado, duplicar una sesión al día seleccionado y eliminar sesiones.
   - Editor completo de sesión con drag & drop y buscador del catálogo.

3. **Personal (Kung Fu)**:
   - `Personal > Hoy`: plan directo basado en programas + cadencias + histórico de sesiones personales, con registro rápido (`OK/Dudosa/Fallo` + RPE) y recap.
   - `Personal > Sesiones`: histórico y edición de sesiones personales (sin asistencia).
   - `Personal > Ajustes`: edita `kungfuPrograms`, `kungfuCadence` y `kungfuTodayPlan`.

4. **Editar sesión**:
   - Editar título, fecha, hora de inicio, descripción y notas.
   - Añadir trabajos desde catálogo (búsqueda por nombre/objetivo/descripción/ruta de derivación).
   - Reordenar trabajos con drag & drop.
   - Ajustar foco, duración y descripción personalizada; duplicar un ítem; sustituir el trabajo por otro del catálogo.
   - Editar previsión de asistencia (`status`) por asistente.

5. **Catálogo de trabajos**:
   - Vista jerárquica (trabajos “Deriva de …” vía `parentWorkId`) y agrupada por objetivos.
   - Crear/editar/duplicar/eliminar trabajos (si `canEdit`).
   - Configurar visibilidad (`private/shared/public`) y colaboradores (emails) con rol `editor`.
   - Detalles: markdown + embeds de YouTube.

6. **Backups**:
   - Exporta un JSON versionado.
   - Importa un JSON y sobrescribe el estado local actual (sin paso previo de confirmación en la UI).

### 6. UX (lo que hace hoy la app)
- Cabecera sticky con navegación: `Home`, `Personal`, `Planificar`, `Trabajos`, `Objetivos`, `Asistentes`, `Backups`.
- Home optimizada para móvil: checklist de trabajos, horarios calculados desde `startTime` + duraciones, detalles colapsables y panel “asistencia en vivo”.
- Planificador con calendario mensual y editor integrado.
- Contenido de trabajos:
  - Markdown con soporte GFM y enlaces externos abriendo en nueva pestaña.
  - Embeds de YouTube inline usando `youtube-nocookie.com` + enlace “Abrir en YouTube”.
  - En la Home, el markdown de trabajos puede autovincular nombres de trabajos al catálogo.

### 7. Flujos resumidos (tal como se comporta hoy)
- **Duplicar sesión**:
  1. Seleccionar el día destino en el planificador.
  2. Pulsar “Duplicar” sobre una sesión del día.
  3. Se crea una copia con título `"<título> (copia)"` y `workItems` clonados (incluyendo su estado actual).

- **Registro de asistencia**:
  1. Mantener una lista de asistentes con `active=true`.
  2. En el editor de sesión: marcar previsión (`status`).
  3. En la Home: marcar asistencia real (`actualStatus`).

- **Exportar/Importar JSON**:
  - Export: descarga un JSON con colecciones y tablas relacionales.
  - Import: carga y aplica el JSON; tras importar se muestra un resumen de conteos.

### 8. Persistencia y sincronización
- **LocalStorage** (cache/offline). Claves:
  - `sport-planner-objetivos`
  - `sport-planner-trabajos`
  - `sport-planner-sesiones`
  - `sport-planner-asistentes`
  - `sport-planner-kungfu-programs`
  - `sport-planner-kungfu-cadence`
  - `sport-planner-kungfu-today-plan`

- **Supabase (actual)**:
  - `planner_states`:
    - En login: descarga `data` del usuario (o lo inicializa con el estado local).
    - En cambios: sube un snapshot con debounce (~600 ms).
    - En logout: se resetea el estado local.
    - `data` incluye también configuración de Personal Kung Fu (`kungfuPrograms`, `kungfuCadence`, `kungfuTodayPlan`).
  - `works`/`work_collaborators`:
    - El catálogo se carga desde Supabase y se vuelve a cargar cuando hay cambios (Realtime `postgres_changes`).
    - La UI se apoya en `canEdit`/`isOwner` calculados en cliente; el filtrado real depende de RLS.

### 9. Arquitectura y stack
- React + Vite + TypeScript.
- Router: `HashRouter` (rutas `#/…`) para evitar configuración adicional del servidor en GitHub Pages.
- Estado: Zustand con persistencia en `localStorage` y sincronización con Supabase vía hooks.
- Build: Vite genera el bundle en `sport-planner/` con `base: "/sport-planner/"`.

### 10. Requisitos no funcionales
- Rendimiento fluido en mobile (Home) y desktop (editor/catálogo).
- Accesibilidad básica (navegación con teclado, contraste).
- Seguridad basada en RLS de Supabase (datos por usuario + catálogo con visibilidad/colaboradores).

### 11. Exportación / Importación
- Formato exportado (versión 1):
  ```json
  {
    "version": 1,
    "usuarios": [],
    "objetivos": [],
    "trabajos": [],
    "sesiones": [],
    "sesiones_trabajos": [],
    "asistentes": [],
    "sesiones_asistencias": [],
    "kungfuPrograms": [],
    "kungfuCadence": {},
    "kungfuTodayPlan": {}
  }
  ```
- Importación: soporta `version: 1` y sobrescribe el estado local actual.

### 12. Consideraciones futuras (no implementadas)
- Reporte de asistencia por alumno y métricas por objetivo.
- Compartir sesiones por enlace o PDF.
- Etiquetas adicionales (nivel, equipamiento necesario).
- Mejorar autosave/conflictos (no hay resolución de conflictos entre dispositivos).

### 13. Próximos pasos sugeridos
- Definir estrategia de conflictos para `planner_states` (por ejemplo, “last write wins” explícito, o merge).
- Documentar y endurecer las políticas RLS de `works`/`work_collaborators`.

### 14. Integración Supabase

1. **Variables de entorno**  
   Crear un `.env.local` en `apps/sport-planner`:
   ```
   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<tu-anon-key>
   ```

2. **Tabla `planner_states`**  
   Tabla para el snapshot por usuario:
   ```sql
   create table planner_states (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null unique references auth.users on delete cascade,
     data jsonb not null,
     updated_at timestamptz not null default now()
   );

   alter table planner_states enable row level security;

   create policy "allow individual access"
     on planner_states
     for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

3. **Tablas del catálogo (`works`, `work_collaborators`)**  
   Estructura mínima esperada por el cliente (ajustable):
   ```sql
   create type work_visibility as enum ('private', 'shared', 'public');

   create table works (
     id text primary key,
     name text not null,
     subtitle text,
     objective_id text not null,
     parent_work_id text references works(id) on delete set null,
     description_markdown text not null default '',
     estimated_minutes integer,
     notes text,
     video_urls jsonb not null default '[]'::jsonb,
     visibility work_visibility not null default 'private',
     owner_id uuid not null references auth.users(id) on delete cascade,
     owner_email text not null default '',
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create table work_collaborators (
     id uuid primary key default gen_random_uuid(),
     work_id text not null references works(id) on delete cascade,
     email text not null,
     role text not null default 'editor',
     user_id uuid references auth.users(id) on delete set null,
     created_at timestamptz not null default now(),
     unique (work_id, email)
   );
   ```
   Notas:
   - El cliente decide “solo lectura” si el actor no es propietario y su email no está en `work_collaborators`.
   - El filtrado de “qué trabajos puedo ver” depende de RLS (el cliente hace `select` a `works` y asume que ya está filtrado).

4. **Realtime**  
   El cliente se suscribe a `postgres_changes` en `public.works` y `public.work_collaborators` para recargar el catálogo cuando cambie.
