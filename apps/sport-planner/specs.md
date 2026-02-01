## Sport Planner — Specs (single source of truth)

Este documento describe **lo que hace hoy** Sport Planner según el código actual. Debe mantenerse siempre sincronizado con el comportamiento real (modelo, persistencia y UI).

---

### 1) Propósito (insight clave)

Sport Planner es un instrumento para dos usos, bajo el mismo modelo:

1. **Planificar y ejecutar clases** (sesiones manuales) para tus alumnos.
2. **Eliminar fricción diaria** para implementar hábitos y construir identidad: kungfu (formas/técnicas/segmentos/aplicaciones), fuerza, baile y una **dieta de información** (lecturas curadas tipo “post” diario, como el *Diario del Guerrero*).

El producto está diseñado para que cada día puedas entrar y “ver” qué toca, ejecutarlo con mínimo coste, y registrar el histórico.

---

### 2) Arquitectura (tal cual)

- SPA (React + Vite + TypeScript), desplegada como archivos estáticos bajo `/sport-planner/`.
- Router: `HashRouter` (`#/…`) para hosting estático (GitHub Pages / static hosting).
- Estado: Zustand con persistencia en `localStorage`.
- Supabase (consumido directamente desde el cliente):
  - `planner_states`: snapshot JSON por usuario (estado completo).
  - `works` + `work_collaborators`: catálogo compartible (visibilidad + colaboradores), refresco por Realtime.
- No hay servidor propio ni endpoints custom.

---

### 3) Modelo de dominio

#### 3.1 Objective
Objetivos agrupan trabajos y aportan identidad visual (tinte de cards).

Campos: `id`, `name`, `colorHex`, `descriptionMarkdown`, `createdAt`, `updatedAt`.

#### 3.2 Work (catálogo)
Un `Work` es un ítem reutilizable que puede planificarse en sesiones.

Contenido:
- `name`, `subtitle`
- `descriptionMarkdown` (markdown)
- `notes` (markdown libre)
- `videoUrls` (URLs; YouTube)
- `estimatedMinutes`

Clasificación y grafo:
- `nodeType?: string` (definiciones en `workTaxonomy.nodeTypes`)
- `schedule?: { kind: 'day_of_year' | 'day_of_month' | 'day_of_week', number: number }` (solo se usa para `nodeType=reading`; ver sección 12)
- `tags: string[]` (definiciones en `workTaxonomy.tags`)
- `parentWorkId?: string | null` (jerarquía)
- `nextWorkId?: string | null` (secuencia)
- `variantOfWorkId?: string | null` (variante)
- `orderHint?: number` (orden auxiliar entre hermanos)

Colaboración (Supabase):
- `visibility`: `private | shared | public`
- `ownerId` / `ownerEmail`
- `collaborators` / `collaboratorEmails`
- flags calculadas en cliente: `canEdit`, `isOwner`

#### 3.3 Session
Una sesión es una ejecución planificada en un día (`YYYY-MM-DD`).

Campos:
- `id`, `date`, `title`, `description`, `notes`, `startTime`
- `kind`: `class | personal`
- `planId`: referencia al Plan que gobierna esa “agenda”
- `workItems: SessionWork[]`
- `attendance: SessionAttendance[]` (relevante en clases)
- `notesByGroupId?: Record<string,string>` (notas por grupo en personal)
- `createdAt`, `updatedAt`

#### 3.4 SessionWork
Un Work dentro de una sesión:
- `id`, `workId`, `order`
- personalización por sesión: `focusLabel`, `customDescriptionMarkdown`, `customDurationMinutes`, `notes`
- tracking:
  - `completed: boolean`
  - `result?: ok | doubt | fail`
  - `effort?: number` (puede existir en datos; su presencia en UI ha ido variando)

#### 3.5 Assistant + SessionAttendance
Asistentes (alumnos) y asistencia por sesión:
- `Assistant`: `id`, `name`, `notes`, `active`, timestamps
- `SessionAttendance`: `assistantId`, `status` (previsión), `actualStatus` (real), `notes`, `actualNotes`

#### 3.6 Plan
Un Plan es una configuración con nombre y tipo:
- `id`, `name`, `kind` (`class | personal`), `enabled`
- En personal: `cadence` + `todayPlan`

---

### 4) Navegación y pantallas (rutas reales)

Cabecera fija (menú):
- `Sesiones` (`/`)
- `Trabajos` (`/catalog`)
- `Ajustes` (`/settings`)
- `Objetivos` (`/objectives`)
- `Asistentes` (`/assistants`)
- `Backups` (`/backups`)

Rutas adicionales existentes:
- `personal/sessions` (histórico personal)
- `personal` redirige a `/?plan=personal-kungfu`
- `catalog/taxonomy` (editor de taxonomy)
- `plan` (Planner legacy; el flujo principal actual está en `Sesiones`)

Login obligatorio (`/login`).

---

### 5) Sesiones (vista unificada por Plan)

`/` muestra una vista unificada con tabs por Plan activo. Según `Plan.kind`:

- `class` → UI de clases (manual, con calendario).
- `personal` → UI personal (por fecha, con grupos y progreso).

Orden de tabs:
- Los planes se ordenan por nombre (colación con números), soportando prefijos tipo `1. ...`, `2. ...` para forzar el orden visual.

---

### 6) Clases (plan manual)

**Calendario**
- Calendario mensual para saltar de día y gestionar sesiones.
- Crear, duplicar y eliminar sesiones.

**Header por sesión**
- Fecha + título.
- Duración estimada (suma de duraciones).
- Progreso (ítems completados).
- Switch `Vista/Editar`.
- “Ir a fecha”.

**Vista**
- Lista de works con card unificada (checkbox).
- Detalle expandible (markdown + vídeos).
- “Última vez” (calculada a partir de sesiones anteriores del mismo plan de clases, si existe).
- Asistencia “en vivo” para asistentes activos (marcar presentes/ausentes).

**Editar**
- `SessionEditor`: reordenar (drag&drop), añadir desde catálogo, swap, duplicar item, eliminar, ajustar duración/descr/foco.
- Previsión de asistencia (status) editable.

---

### 7) Personal (plan automático por día)

**Navegación**
- La sesión personal es por fecha (prev / hoy / next + date picker).
- Switch `Vista/Editar`.

**Header**
- Duración estimada.
- Progreso global:
  - works: “done” si `completed` o `result` definido.
  - grupos “nota”: “done” si el texto no está vacío.
- Acción de planificación:
  - `Recrear sesión` (rehace la planificación del día manteniendo lo registrado)

**Vista**
- Render por grupos.
- Cards unificadas con:
  - checkbox = marcar hecho (en personal marca `completed=true` y `result=ok`).
  - tags visibles.
  - “Última vez” en pequeño (desde histórico personal).
  - detalle expandible (markdown + vídeos) y acción “Editar en catálogo” dentro del detalle.
- Grupos “nota”: textarea con autosave al perder foco; si vacío ⇒ no hecho.

**Editar**
- `SessionEditor` reutilizado para reordenar/swap/add/remove.
- En personal se ocultan los campos meta de sesión en el editor (título/fecha/desc/notas), porque la fecha se controla desde el header y las notas son por grupo.

---

### 8) Card unificada (modo vista)

En modo vista, clases y personal comparten un componente de card con:
- checkbox principal de “hecho”
- número de orden (cambia de estilo al marcar)
- tinte por `Objective.colorHex` + badge del objective
- título + “extra en azul” (normalmente `focusLabel` si representa un foco interno real)
- tags visibles
- “Última vez” (pequeño)
- detalle expandible:
  - `descriptionMarkdown`
  - `notes`
  - grid de vídeos (3 columnas en desktop)
  - acciones dentro del detalle (según pantalla)

---

### 9) Catálogo (Works)

`/catalog`:
- Agrupa por objetivo y muestra jerarquía por `parentWorkId`.
- Los grupos por objetivo aparecen colapsados por defecto (para facilitar catálogos grandes). Permite colapsar/expandir grupos y colapsar ramas (trabajo padre ↔ hijos).
- Cards tintadas por `nodeType` (badge + acento visual).
- Permite crear/editar/duplicar/borrar works (si `canEdit`).
- Campos editables clave: objetivo, parent, `nodeType`, **schedule** (solo lecturas), `tags`, `orderHint`, `nextWorkId`, `variantOfWorkId`, markdown, vídeos, visibilidad y colaboradores.
- Control de inclusión en personal:
  - Tag especial `personal-exclude` excluye el work del auto-planning personal.

Taxonomy:
- `catalog/taxonomy` permite crear/borrar `nodeTypes` y `tags` (borrado bloqueado si están en uso).

---

### 10) Configuración del plan personal (algoritmo actual)

La configuración vive dentro del `Plan` personal (persistida en `planner_states`):
- `cadence`: objetivos de días por `nodeType` + overrides por tags.
- `todayPlan`: lista de grupos (N), límites y estrategias.
  - `defaultMinutesByNodeType`: fallback de minutos por `nodeType` (incluye `reading`).

**Grupos**
Cada grupo puede definir:
- `type`: `work` o `note`
- `daysOfWeek` (0=domingo … 6=sábado)
- `include[]` / `exclude[]` por:
  - `byNodeTypes`
  - `byTags` (AND)
  - `byWorkIds`
- `strategy`: `overdue` o `weighted`
- `hierarchyRule`: `allow_all` o `prefer_leaves`
- límites: por `count` / `minutes` / `both`

**Cadencia / due scoring**
- El sistema calcula `lastSeen`/histórico desde sesiones personales.
- Estima “vencido” con `targetDays` por `nodeType`, y usa el resultado previo para ponderar (en weighted).
- **Lecturas (`nodeType=reading`) con schedule**: solo entran en el pool si su `schedule` coincide con la fecha activa (ver sección 12). Si no se leen, no se arrastran (regla strict por diseño: simplemente no “tocan” hasta la próxima ocurrencia).

**Actualizar vs Recrear**
- `Recrear sesión` conserva lo registrado (done/result) y notas, elimina el resto y vuelve a planificar.

---

### 11) Persistencia, sync y backups

**Local**
- Zustand persiste colecciones en `localStorage` (objetivos, works, sesiones, asistentes, planes, taxonomy, config personal).

**Supabase**
- `planner_states`: snapshot JSON por usuario, con debounce (last-write-wins).
- `works`/`work_collaborators`: catálogo con RLS y refresco por Realtime.
  - `works` incluye `schedule_kind` + `schedule_number` (para `nodeType=reading`), reflejados en cliente como `work.schedule`.

Notas de escala:
- El catálogo (`works`) puede ser grande (ej. 365 lecturas con markdown). Para evitar snapshots enormes y problemas de cuota, el sync de `planner_states` **no incluye** el catálogo; el catálogo se carga desde `works` (Realtime) y se cachea localmente si cabe.

**Backups**
- `version: 1`
- export/import incluye: objetivos, works, sesiones, asistentes, relaciones, planes, config personal y taxonomy.
- importar sobrescribe estado (sin undo).

---

### 12) Lecturas programadas (`nodeType=reading`) — dieta de información

Objetivo funcional:
- Añadir ítems de tipo “post/lectura” para una dieta de información (ej. *Diario del Guerrero*), planificables automáticamente dentro de un grupo del plan personal.

Implementación actual:
- `Work.nodeType = 'reading'` (taxonomy).
- `Work.schedule?: { kind, number }`:
  - `kind = day_of_year` con `number` 1–366
  - `kind = day_of_month` con `number` 1–31
  - `kind = day_of_week` con `number` 0–6 (dayjs; 0=domingo)
- Persistencia en Supabase: `works.schedule_kind` + `works.schedule_number` (con constraints).
- Planner personal:
  - Si el Work es `reading` y tiene `schedule`, solo entra en el pool cuando **la fecha activa coincide**.
  - Regla strict: si no se lee, no se “arrastra” (simplemente no aparece hasta la siguiente ocurrencia).

Configuración típica:
- Crear un grupo de tipo `work` con:
  - `include: [{ byNodeTypes: ['reading'], byTags: ['diario-del-guerrero'] }]`
  - límite por count (p.ej. `maxItems=1`) para mostrar solo la lectura del día.
