# Sport Planner — Kung Fu Personal Training (Option 2: reuse `Work` catalog)

Objetivo: añadir un modo de **entrenamiento personal de Kung Fu** que:
- reutiliza el **Catálogo de trabajos** (`Work`) como inventario entrenable (muchos trabajos actuales ya lo son),
- vive en **Supabase** (tabla `works`) como el resto del catálogo,
- te deja entrar y **ver directamente qué toca entrenar hoy**,
- registra resultados por ítem (tracking estructurado),
- mantiene sesiones de **clases** y sesiones de **entreno personal** separadas en UI y navegación.

Este documento define una versión limpia y consistente con esas decisiones.

---

## 1) Scope y decisiones cerradas

- Inventario Kung Fu = `Work` (no hay modelo paralelo de “Node”).
- Grafo “ligero” sobre `Work`:
  - jerarquía: `parentWorkId`
  - secuencia: `nextWorkId`
  - variantes: `variantOfWorkId`
  - clasificación: `nodeType` + `tags[]`
- Recursos (PDFs/paths externos): quedan dentro de `descriptionMarkdown`/`notes`/`videoUrls` (no hay campos estructurados extra).
- La app debe ofrecer un **Today view** (plan directo) como entrada principal del módulo.
- Tracking de calidad/esfuerzo: **sí**, por ítem entrenado.
- Sesiones de entreno personal: **separadas** de las sesiones de clases (menú distinto + filtro).

---

## 2) Modelo de datos propuesto

### 2.1. Extender `Work` (inventario enriquecido)

Campos nuevos en `Work` (TypeScript) y en Supabase (`works`):

- `nodeType?: string`
  - Ejemplos: `style`, `form`, `segment`, `technique`, `drill`, `form_run_full_normal`, …
  - Default: `undefined` (compatibilidad). Para el motor de cadencia, `undefined` se trata como `"work"`.

- `tags?: string[]`
  - Ejemplos: `["kungfu", "shaolin", "form"]`, `["kungfu", "eagleclaw", "technique"]`
  - Normalización: `trim`, `lowercase`, sin vacíos, deduplicado.

- `orderHint?: number`
  - Orden auxiliar entre hermanos (`parentWorkId`), útil como fallback cuando no hay `nextWorkId`.

- `nextWorkId?: string | null`
  - “A → B” (siguiente principal). Sirve para tramos ordenados y para sugerir transiciones.

- `variantOfWorkId?: string | null`
  - “X es variante de Y” (ej. `run:*` variante de una `form:*`).

Nota: deliberadamente no añadimos `work_edges` aún. Si más adelante necesitamos bifurcaciones/edges seleccionables como primera clase, se puede añadir.

### 2.2. Separar sesiones: clases vs personal

Añadir a `Session`:

- `kind: "class" | "personal"`
  - Default de migración: `"class"` para todas las sesiones existentes.

UI:
- Vistas actuales (`Home`, `Planificar`) se quedan como flujo de **clases** (o se parametrizan para filtrar por `kind="class"`).
- Nuevo menú y rutas para entreno personal filtran por `kind="personal"`.

### 2.3. Tracking por ítem entrenado (estructurado)

Añadir a `SessionWork`:

- `result?: "ok" | "doubt" | "fail"`
- `effort?: number` (RPE 1–10)

Reglas:
- Cada vez que registras entrenamiento personal, queda en una sesión `kind="personal"` del día.
- Para calcular “qué toca hoy”, el motor toma `lastSeen`/`lastResult`/`lastEffort` desde el histórico de sesiones personales.

---

## 3) Programas y cadencias (config por usuario)

Guardar en el snapshot de `planner_states.data`:

- `kungfuPrograms[]`: define qué `Work` entra en el pool activo.
- `kungfuCadence`: define objetivos de cadencia y modifiers.
- `kungfuTodayPlan`: plantilla diaria (foco/ruleta/recap) y límites (cantidad y/o minutos).

Ejemplo mínimo:

```json
{
  "kungfuPrograms": [
    {
      "id": "default",
      "name": "Kung Fu — activo",
      "enabled": true,
      "include": [{ "byTags": ["kungfu"] }],
      "exclude": []
    }
  ],
  "kungfuCadence": {
    "targetsDays": {
      "technique": 5,
      "segment": 8,
      "form": 10,
      "form_run_full_normal": 10,
      "drill": 7
    },
    "overrides": [
      { "match": { "tagsAny": ["weapon"] }, "multiplier": 1.4 }
    ]
  },
  "kungfuTodayPlan": {
    "limitMode": "count",
    "maxItems": 12,
    "minutesBudget": 30,
    "template": { "totalMinutes": 30, "focusMinutes": 18, "rouletteMinutes": 10, "recapMinutes": 2 },
    "defaultMinutesByNodeType": { "work": 3, "technique": 1.5, "segment": 6, "form": 10, "drill": 4, "link": 2 }
  }
}
```

Notas:
- La selección real del inventario se hace vía `include/exclude` (tags e ids). No se requiere que el catálogo esté “separado”; basta con tags (y ya tienes muchos works migrados).

---

## 4) Today view (plan directo)

### 4.1. Entrada principal del módulo

Nuevo menú (ejemplo):
- `Personal` / `Kung Fu`
  - `Hoy`
  - `Sesiones`
  - `Ajustes` (Programa, Cadencia, Plan de hoy)
  - `Inventario` (opcional, fase 2)

La pantalla `Hoy` debe permitir:
- ver lista priorizada de ítems sugeridos,
- registrar resultados rápidamente (sin abrir un editor pesado),
- crear/reusar automáticamente la sesión personal del día.
- registrar una nota breve de recap (una corrección concreta para mañana).

### 4.2. Cómo se calcula “qué toca hoy”

1) Construir el pool activo:
- cargar `works` (de Supabase),
- aplicar `kungfuPrograms` (enabled) sobre `nodeType`/`tags`/ids.

2) Calcular `lastSeen` por `workId` usando sesiones `kind="personal"`:
- `lastSeen`: max `Session.date` donde aparece el `workId`.
- `lastResult`: resultado del último evento (si hay).

3) Calcular `targetDays` por ítem:
- por defecto desde `kungfuCadence.targetsDays[nodeType || "work"]`.
- aplicar `overrides` (multiplicadores por tags).

4) Definir prioridad:
- `daysSince = today - lastSeen` (si no hay `lastSeen`, tratar como “muy due”).
- `overdue = max(daysSince - targetDays, 0)`
- ordenar por `overdue` desc y desempatar con:
  - `daysSince` desc
  - aleatorio estable (seed por fecha) para variedad (especialmente útil en ruleta).

Salida:
- lista “Hoy” configurable:
  - por cantidad (top N)
  - por minutos (presupuesto + plantilla foco/ruleta/recap).

---

## 5) Inventario (Catálogo) — cambios mínimos de UI

Extender `CatalogView` para poder editar/ver:
- `nodeType`
- `tags` (chips por coma)
- `orderHint`
- `nextWorkId` (selector/búsqueda)
- `variantOfWorkId` (selector/búsqueda)

Mostrar en tarjeta:
- `nodeType` + tags
- “Deriva de …” (ya existe) + “Variante de …” + “Siguiente: …”

---

## 6) Cambios técnicos (concretos)

### 6.1. TypeScript

- `apps/sport-planner/src/types.ts`: extender `Work`, `Session`, `SessionWork`.
- `apps/sport-planner/src/store/appStore.ts`:
  - normalizar defaults (`tags=[]`, `nextWorkId=null`, etc.)
  - asegurar que sesiones existentes migren a `kind="class"`.

### 6.2. Supabase (tabla `works`)

Añadir columnas:
- `node_type text`
- `tags jsonb` (array de strings)
- `order_hint integer`
- `next_work_id text null references works(id) on delete set null`
- `variant_of_work_id text null references works(id) on delete set null`

Actualizar `apps/sport-planner/src/services/workService.ts` (mapeo `snake_case` ↔ `camelCase`).

### 6.3. Backups

- Export/import: incluir los nuevos campos de `Work`, `Session.kind` y `SessionWork.result/effort`.
- Import: compatibilidad con backups legacy (si faltan campos, defaults).

---

## 7) MVP (orden de entrega recomendado)

1) Modelo + migración Supabase (`Work` + `Session.kind` + `SessionWork.result/effort`).
2) `Personal > Hoy`: lista “due” + quick logging (crea/reusa sesión personal del día).
3) Ajustes en Catálogo para editar `nodeType/tags/next/variant` (inventario enriquecido).
4) UI ligera de “Ajustes”:
   - Programas (`kungfuPrograms`)
   - Cadencias (`kungfuCadence`)
   - Plan de hoy (`kungfuTodayPlan`: límites por cantidad/minutos + plantilla foco/ruleta/recap).
