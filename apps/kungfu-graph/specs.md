# KungFu Response Tree Specs

## Purpose

Local-first editor and explorer for Eagle Claw partner-work drills. The app models the material as a simple response tree: if one side launches a stimulus, the other side has a set of possible responses. A response may finish the exchange or may end by generating the next stimulus for the other side.

## Publication

- Web entry point: `/apps/kungfu-graph/dist/`
- App catalog entry: `/apps/`
- Static web build uses the embedded seed YAML and bundled raster assets.
- Tauri build can read and write the default local YAML file at `src/data/eagle-claw-punos-directos.kfg.yaml`.

## Data Model

The YAML file is the source of truth. SQLite is intentionally deferred.

```yaml
version: 2
source: kungfu-response-tree
graph:
  id: eagle-claw-punos-directos
  title: Eagle Claw - Respuestas a puño
cues:
  - id: punch[lead@cara]
    label: Puño adelantado a cara
    responses:
      - id: tui[rear]
        label: Tui trasero
        phase: defensa
      - id: tui[rear] + punch[lead@cara]
        label: Tui y puño a cara
        phase: contra
drills:
  - id: D001
    name: Secuencia inicial - Tui con contra
    start: punch[lead@cara]
    starter: A
    path:
      - punch[lead@cara]:tui[rear] + punch[lead@cara]
```

Rules:

- `cue.id` and `response.id` are canonical notation strings.
- A drill path item uses `stimulus:response`.
- The parser derives action tags, labels, display tokens, duration defaults, and the generated next stimulus.
- A response generates a next stimulus when its trailing action can be treated as a cue, normally a counter attack such as `punch[...]`.

## Views

- `Explorar`: browse stimuli and compatible responses, filtered by action.
- `Drills`: inspect and edit drills as A/B turn rows; additions are selected from compatible stimuli or responses.
- `YAML`: inspect and edit the backing YAML directly.

## Visual Assets

Raster assets live under `public/visuals/raster/` and are copied by Vite into `dist/visuals/raster/`.

Variant images follow a convention rather than a registry:

```text
<actor>-<action>-<lead|rear|any>-<target|any>.png
```

Examples:

- `a-punch-lead-cara.png`
- `a-punch-rear-cara.png`
- `b-tui-rear-any.png`
- `b-punch-lead-estomago.png`
- `b-punch-rear-cara.png`

When a specific variant is missing, the UI falls back visually to the action-level image. More variants can be added incrementally without changing data.

## Current Limitations

- The web build is read-only with respect to the repository seed; browser edits remain in memory or downloaded by the user.
- Tauri can persist edits to the default YAML source path.
- Visual coverage is intentionally partial while validating the actor/side/action convention.
