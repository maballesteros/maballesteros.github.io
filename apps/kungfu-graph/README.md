# KungFu Response Tree

Desktop/local-first editor for Kung Fu partner-work response trees.

## Current scope

- React/Vite UI inspired by `dance-graph`, but with a simpler domain model.
- Tauri shell with native open/save commands for local `.kfg.yaml` files.
- YAML is the source of truth: stimulus/cue -> possible responses.
- SQLite is intentionally not used yet.
- Seed graph is derived from `[[Secuencias]]`.
- A/B drill reading is a projection, not the data model.

## Commands

```bash
npm install
npm run dev
npm run build
npm run tauri:dev
```

## Format

The app reads and writes `.kfg.yaml` files:

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
      - id: tui[rear] + punch[lead@cara]
        label: Tui y puño a cara
        phase: contra
drills:
  - id: D001
    name: Tui con contra
    start: punch[lead@cara]
    starter: A
    path:
      - punch[lead@cara]:tui[rear] + punch[lead@cara]
```

The notation itself is the stable id. Yields are inferred from counter responses that end in a new stimulus.
Human lines such as `punch[lead@cara]`, `tui[rear] + punch[lead@cara]` and drill steps such as
`punch[lead@cara]:tui[rear] + punch[lead@cara]` are parsed into action tokens for filtering and display.
