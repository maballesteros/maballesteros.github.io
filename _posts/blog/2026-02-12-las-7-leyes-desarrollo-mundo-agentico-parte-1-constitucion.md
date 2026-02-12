---
title: "Las 7 leyes del desarrollo en un mundo agéntico (Parte 1): Constitución del repo"
excerpt: "Primera parte de la serie: cómo convertir coherencia en propiedad del sistema con invariantes, ownership y docs-first."
tags: [ia, agentes, arquitectura, software, engineering]
date: 2026-02-12
modified: 2026-02-12
comments: true
ref: las-7-leyes-desarrollo-mundo-agentico-parte-1-constitucion
---



Durante años, la coherencia del software se ha sostenido con un pacto tácito: **si alguien revisa, el sistema se mantiene sano**. La arquitectura no deriva, las convenciones se respetan, las decisiones se recuerdan... porque hay ojos humanos mirando cada cambio.

Ese pacto funciona mientras el volumen es humano.

En el momento en que introduces agentes, el throughput cambia de escala. De repente, el cuello de botella no es compilar, ni desplegar, ni escribir código. El cuello de botella es **la atención**. Y ahí aparecen dos futuros (ambos malos):

* Si intentas mantener el control "como siempre", a base de revisiones y gates, acabas **bloqueando** el flujo.
* Si aflojas el control para ganar velocidad, el repo empieza a **degradarse** (deriva arquitectónica, duplicidades, patrones mediocres replicados, deuda que se multiplica).

No es un problema de disciplina. Es un problema de mecanismo.

La solución no es "revisar más". Es cambiar el paradigma:

> Antes controlábamos la coherencia con personas.  
> Con agentes, necesitamos mover el control a **leyes automáticas: invariantes**.

La supervisión humana no desaparece; **sube de capa**. En vez de gastar atención revisando cada línea, inviertes en diseñar el sistema para que **no pueda salirse del carril**.

A eso lo llamo un **sistema operativo para autonomía segura**. Y se puede expresar así:

**Autonomía segura = invariantes fuertes + feedback loops + recovery barato + límites explícitos.**

---

## Las 7 reglas (overview)

### 1) Constitución del repo: invariantes + ownership
- Catálogo de invariantes por dominio (Billing/Auth/Content/Tracking). 
- Cada invariante con **enforcement** (CI/test/lint) y **owner**.
- Framework auto-doc con gate **docs-first** para reducir coste de razonamiento.
- Ciclo de vida explícito de invariantes (crear, evolucionar, retirar).
- Regla: _si un invariante se rompe, no se mergea_. Sin excepciones ad-hoc.
    
> **Meta**: mover coherencia a “leyes automáticas”.

### 2) Entornos deterministas y reproducibles (para que el agente pruebe de verdad)
- Entornos efímeros por PR / worktree.
- Seeds y fixtures estables.
- “Runbook” automático: `setup → test → smoke → e2e`.

> **Meta**: el agente no “opina”, ejecuta validaciones.

### 3) Observabilidad “first-class” para agentes
- Logs/metrics/traces accesibles al agente.
- Dashboards y queries “de plantilla”.
- SLOs verificables (startup time, error rates en journeys, latencias).
- Templates de consulta para incidentes y regresiones frecuentes.

> **Meta**: el agente ve el impacto real, no solo compila.

### 4) Guardrails de riesgo (gating por nivel)
- **Nivel 0**: docs / refactors seguros → auto-merge con CI.
- **Nivel 1**: cambios internos no críticos → auto-merge si pasan pruebas + checks.
- **Nivel 2**: cambios de dominio sensible (billing/auth) → requiere “aprobación humana ligera” o un set extra de pruebas/validaciones.
- **Nivel 3**: migraciones/producción/seguridad → human-in-the-loop obligatorio.
- Reglas de escalado automáticas por paths/dominios afectados.

> **Meta**: minimizar supervisión _donde se puede_, concentrarla _donde duele_.

### 5) “Policy vs Constitution”: separar lo que cambia de lo que no
- Policies (promos, % descuentos, reglas temporales) → config + tests de negocio.
- Constitution (scope por subscription, boundaries, no contaminación de estados, etc.) → invariantes.
- “Pregunta de estabilidad” como criterio de clasificación.

> **Meta**: puedes cambiar pricing sin tocar la integridad del sistema.

### 6) Reconciliación y garbage collection (autonomía mantenible)
- Jobs/agentes periódicos que detecten drift (código + datos reales).
- Corrección de deuda mecánica en cambios pequeños y frecuentes.
- PRs recurrentes, trazables y auto-mergeables cuando aplique.

> **Meta**: pagar la deuda en “micro-cuotas”, no en “viernes de limpieza”.

### 7) Postura de seguridad: “no puede hacer daño aunque quiera”
- Secrets inaccesibles fuera de CI seguro.
- Permisos mínimos para herramientas.
- “Dry-run by default” en acciones destructivas.
- Feature flags + rollout gradual.
- Auditoría de acciones sensibles.

> **Meta**: limitar blast radius.

El resto del artículo es el "manual de uso": qué significa cada regla en la práctica, qué artefactos introduces en el repo y cómo lo puede ejecutar un agente sin que tú estés encima.

---

# 1) Constitución del repo: invariantes + ownership

El primer paso no es tooling. Es algo más serio: escribir la **constitución** del sistema.  
Constitución = un conjunto pequeño de leyes que **si se rompen, el cambio no entra**.

La diferencia entre "reglas" y "constitución" es que aquí no hablamos de preferencias. Hablamos de propiedades estructurales que evitan que el sistema colapse cuando aceleras.

### Invariant Framework: bloque listo para pegar en `AGENTS.md`

Si quieres llevar este principio a un repo sin ambigüedad, aquí tienes un bloque directo para copiar/pegar:

```markdown
# Invariant Framework

**Definitions**

* **System invariant**: a binary, mechanically-verifiable property that must hold after every change. If violated, CI must fail with an actionable message.
* **Business policy**: product/marketing rules that may change (pricing, percentages, promo windows). Policies should be implemented *within* the invariant boundaries.

**Rule of alignment (Docs-first)**

* `docs/features/*` captures intent and behavior.
* `docs/invariants/*` captures non-negotiable system guarantees.
* If intent is stable and safety/consistency-critical, it must become an invariant.

**Invariant types (examples)**

* Structural (architecture, ownership, coupling)
* Data-boundary (parse/validate at boundaries)
* Observability (logs/traces/metrics minimums)
* Safety (security/privacy constraints)
* Operational (SLOs, performance caps, migrations)

**How to add an invariant**

1. Write an invariant spec file under `docs/invariants/<domain>/<ID>.md` using the template.
2. Implement enforcement:

    * Prefer: CI checks / linters / structural tests.
    * If needed: webhook guards + reconciliation job.
3. Add tests proving it fails when violated and passes when fixed.
4. Ensure CI error messages include a short remediation instruction.

**When to create a new invariant**

Create one when at least one condition is true:

1. A bug class can cause high blast radius (security, billing, auth, data integrity).
2. A "must never happen" rule appears in feature docs but is not mechanically enforced.
3. The same regression appears more than once (or requires repeated manual review).
4. A critical boundary is introduced (new domain boundary, migration safety rule, ownership boundary).

**When to update an invariant**

Update (not bypass) when:

1. Architecture or domain boundaries intentionally change.
2. Business intent stays the same but enforcement is noisy/ambiguous.
3. Scope expands to new modules/paths that should be covered by the same guarantee.

Update requires:

* spec update in `docs/invariants/<domain>/<ID>.md`
* enforcement update (CI/lint/tests/hooks/jobs)
* failing-then-passing test evidence
* owner review and new `last reviewed` date

**When to retire an invariant**

Retire only when the protected risk no longer exists (feature/domain removed or replaced).
Never retire only to unblock delivery. If delivery pressure exists, define a time-boxed exception with owner + expiry.

**Invariant spec template**

* ID, Name, Domain, Type
* Formal statement (IF/THEN), plus examples
* Enforcement points (CI/lint/tests/webhooks/jobs)
* Failure message (actionable)
* Exceptions (explicit; avoid ad-hoc)
* Owner + last reviewed date
* Links to tests and related docs

**Maintenance**

* Invariants are part of the “system constitution”. Avoid adding low-ROI invariants.
* If an invariant causes frequent exceptions, rewrite it (don’t accumulate bypasses).
* Add a recurring “invariant gardening” task that scans for drift and opens PRs.

**PR/CI decision flow (Docs-first -> Invariants)**

1. Read feature + cross-stack docs first.
2. Extract candidate rules from "Business Intent and Constraints".
3. Classify each rule:
   * likely to change by business -> Policy (config/tests/docs)
   * must remain true for system coherence -> Invariant
4. If invariant-impacting change is present, PR must include invariant delta:
   * new/updated/retired invariant spec, or
   * explicit "no invariant change needed" rationale.
5. CI fails if invariant-impacting PR lacks required invariant delta evidence.
```

La regla de fondo sigue siendo la misma: si no puede fallar en CI con mensaje accionable, no es un invariante, es una intención.

Eso cubre la mitad técnica del problema. La otra mitad es organizativa: **ownership**.
Un invariante sin owner acaba en tierra de nadie cuando falla.

### Ownership Framework: quién responde de qué

Ownership no es "a quién mencionar en Slack". Es el sistema que decide, en cada ejecución del agente, **quién tiene autoridad, quién debe validar y quién responde cuando algo se rompe**.

Su función operativa por ejecución es concreta:

* **Routing**: cada tarea se enruta a un dominio con owner explícito.
* **Authority**: el nivel de autonomía permitido depende del owner + riesgo.
* **Escalation**: si hay ambigüedad o impacto alto, se escala al owner antes de actuar.
* **Approval**: cambios en rutas críticas no se cierran sin validación del owner.
* **Accountability**: fallos de invariantes y drift generan follow-up con dueño asignado.

Plantilla base para pegar también en `AGENTS.md`:

```markdown
# Ownership Framework

**Purpose**

* Ownership is execution routing + authority + accountability for agentic changes.

**Runtime function (per execution)**

1. Route task to domain owner using `docs/ownership/OWNERSHIP.md`.
2. Derive allowed autonomy level from domain criticality/risk.
3. Enforce escalation when uncertainty or high-blast-radius impact exists.
4. Require owner validation on critical-path changes.
5. Auto-route invariant failures/incidents to the corresponding owner.

**Minimum artifacts**

1. `docs/ownership/OWNERSHIP.md` with domain -> owner mapping, backup owner, and response SLA.
2. `CODEOWNERS` entries for critical paths.
3. Invariant specs with `Owner` field and review date.
4. Risk map (paths/domains -> autonomy level) used by CI/policy engine.

**CI/policy enforcement**

* CI fails if changed critical path has no owner mapping.
* CI fails if an invariant spec has no owner.
* CI fails if owner is not present in ownership map.
* CI fails if required owner approval is missing for high-risk changes.
* Invariant-breaking PRs/incidents auto-route to domain owner.

**No-owner rule**

* If no clear owner exists, no autonomy for that domain.
```

Ejemplo mínimo de `OWNERSHIP.md`:

```markdown
# Ownership Map

| Domain | Owner | Backup owner | SLA (critical) | Critical paths | Invariants |
|---|---|---|---|---|---|
| billing | @team-billing-platform | @team-platform-oncall | 30m | `src/billing/`, `migrations/billing/` | INV-BILL-001, INV-BILL-004 |
| auth | @team-auth-platform | @team-platform-oncall | 30m | `src/auth/` | INV-AUTH-002 |
| content | @team-content | @team-platform-oncall | 4h | `src/content/` | INV-CONT-003 |
```

Sin esta capa, los invariantes existen "en papel", pero el agente no sabe a quién obedecer ni quién decide en casos límite.

### Auto-Doc Framework: bloquear deriva y ahorrar tokens

Con agentes, la documentación deja de ser "nice to have": se convierte en infraestructura operativa.
Sirve para dos cosas: bajar coste de tokens y capturar intenciones de negocio que no se deducen del código.

Bloque unificado para copiar/pegar en `AGENTS.md`:

```markdown
# Documentation Framework (/docs)

**Core principle**

* Documentation is part of runtime governance for agents: it reduces token cost and preserves non-obvious business intent.

**Language**

* Use one canonical language across `/docs` guides (recommended: English) and keep it consistent.

**Hard rule (Docs-first mandatory gate)**

* For any feature-related question/change (locations, modules, endpoints, models, screens), do not inspect code or answer implementation details before this preflight:
  1. Find relevant feature guide(s): `rg -n "<feature keywords>" docs/features` (and related index entries).
  2. Read the guide(s): at least overview + impacted surfaces (API/frontend/persistence/admin).
  3. Read cross-stack guides that apply to the touched area (backend, frontend, admin, shared components, infra).
  4. Only then inspect code to confirm files/routes/implementation.
  5. If no guide exists, state it explicitly and ask for confirmation to continue with code inspection (or create the guide first, if task requires it).
  6. In final response / PR description, reference the guide path(s) used (e.g., `docs/features/<feature>.md`).

**Feature guide scope**

* Guides are vertical by feature and represent complete, coherent, up-to-date end-to-end behavior.
* A feature is an end-to-end product capability, not an isolated endpoint or one-off task.
* Guides are not change logs.

**Update policy**

* If a feature has a guide, update it whenever behavior changes; rewrite sections when needed.
* If a feature has no guide, create a complete one before closing the task.
* If multiple verticals are affected, document all of them.

**Required contents**

* Purpose and non-obvious business intent.
* Use cases and key flows.
* Domain model and relationships.
* API contracts and frontend surfaces.
* Security constraints and migration notes.
* Build/test commands relevant for validation.

**Intent capture from developer conversations**

* Record business intent that is not obvious in code (constraints, trade-offs, rejected alternatives, domain vocabulary).
* Keep these notes in the feature guide under a dedicated section (e.g., "Business Intent and Constraints").
* When intent changes, update the section in the same PR/task.

**Docs index**

* Keep the project docs index updated (in `AGENTS.md` and/or `docs/README.md`, depending on repo convention).

**Diagrams (Mermaid)**

* Use diagrams only when they add real clarity: architecture, model relationships, decision/lifecycle flows, end-to-end sequences.
* Avoid trivial diagrams or text duplication.
* GitHub Mermaid constraints:
  * avoid commas in ER attributes (use `string id PK`, not `PK, FK`)
  * use simple names and basic types (`string`, `int`, `bool`)
  * keep node labels plain; if needed, use `\n` with alphanumeric/hyphen text
```

Sin este sistema auto-doc, el agente paga "impuesto de exploración" en cada tarea y además pierde contexto de negocio crítico.

### Ejemplo agnóstico: un invariante de arquitectura que sirve en cualquier proyecto

**Invariante (agnóstico): "No saltarse capas"**  
Imagina una arquitectura por capas (da igual el framework): UI -> Application -> Domain -> Infrastructure.

* La UI nunca habla con Infrastructure directamente.
* Domain no depende de Infrastructure.
* Infrastructure puede depender de Domain (interfaces), pero no al revés.

Esto evita la deriva típica: el primer "atajo" se copia, luego se normaliza, y en tres meses el dominio está lleno de acoplamientos.

**Cómo se verifica sin casarte con una tecnología**

* Generas (o infieres) el grafo de dependencias del repo.
* Defines reglas de dirección (quién puede importar a quién).
* Lo conviertes en un check que falla en CI.

**Cómo lo entiende un agente**  
Porque es binario: "este import está prohibido". Y la remediación puede ser guiarlo: "introduce una interfaz en Domain y una implementación en Infrastructure".

### Anti-patrón común

"Tenemos un doc con arquitectura".  
Si ese doc no se refleja en checks, en seis meses es literatura.

---

## Cierre de la Parte 1

Conclusión breve: no hay autonomía segura sin constitución operativa.

* Los invariantes convierten intención estable en checks ejecutables.
* El ownership evita que la calidad quede "sin dueño".
* El sistema docs-first reduce coste de razonamiento y preserva intención de negocio.

Con esa base, en la Parte 2 bajamos a ejecución diaria: cómo operar esa constitución con entornos deterministas, observabilidad, guardrails por riesgo, reconciliación continua y seguridad por diseño.

Siguiente entrega: [Parte 2](/blog/las-7-leyes-desarrollo-mundo-agentico-parte-2-operacion-segura/).
