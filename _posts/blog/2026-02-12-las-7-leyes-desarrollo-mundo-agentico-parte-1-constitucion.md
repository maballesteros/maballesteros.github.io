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

Y aquí hay una idea clave para que esto sea realmente operable: **features e invariantes son dos contratos distintos, pero deben vivir reconciliados**.  
Las features explican intención y comportamiento end-to-end; los invariantes fijan qué no se puede romper y cómo se verifica.

### Invariant Framework: bloque listo para pegar en `AGENTS.md`

El detalle completo en formato copy/paste está en el **Anexo A**.

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

Plantilla base para pegar en `AGENTS.md` (incluye formato de `OWNERSHIP.md`): **ver Anexo B**.

Sin esta capa, los invariantes existen "en papel", pero el agente no sabe a quién obedecer ni quién decide en casos límite.

### Auto-Doc Framework: bloquear deriva y ahorrar tokens

Con agentes, la documentación deja de ser "nice to have": se convierte en infraestructura operativa.
Sirve para dos cosas: bajar coste de tokens y capturar intenciones de negocio que no se deducen del código.

Bloque unificado para copiar/pegar en `AGENTS.md`: **ver Anexo D**.

Sin este sistema auto-doc, el agente paga "impuesto de exploración" en cada tarea y además pierde contexto de negocio crítico.

### Ejemplo realista (formato completo): `INV-BILL-004`

Ejemplo completo del invariante `INV-BILL-004`:

```markdown
---
id: INV-BILL-004
name: Idempotent capture requests
domain: billing
type: operational
status: blocking
owner: "@team-billing-platform"
last_reviewed: 2026-02-12
---

## Formal Statement (IF/THEN)

IF two or more capture requests arrive with the same `payment_intent_id` + `idempotency_key`,
THEN the system must produce at most one successful provider capture side effect.

IF a capture has already succeeded for that key pair,
THEN every subsequent request must return the same logical result (`capture_id`, `status=CAPTURED`)
without issuing a second provider charge.

## Why this exists

Prevents duplicate customer charges under retries, race conditions, or client/network instability.

## Enforcement Points

1. API boundary:
   * reject capture requests without `idempotency_key`.
2. Persistence:
   * unique constraint on (`payment_intent_id`, `idempotency_key`).
3. Domain/service:
   * concurrency-safe lock/transaction around capture decision.
4. CI tests:
   * parallel request test proving one side effect only.
   * retry test proving same response payload.

## Failure Message (actionable)

`INV-BILL-004 violated: duplicate capture side effect detected for payment_intent_id=<id>, idempotency_key=<key>. Ensure idempotency key validation + unique constraint + single capture path in BillingCaptureService.`

## Exceptions

- none

## Related Features

- ../../features/billing-checkout.md
- ../../features/billing-refunds.md

## Tests and Evidence

- tests/billing/capture_idempotency_concurrency_test.*
- tests/billing/capture_idempotency_retry_test.*
- ci/checks/billing_invariants.yml
```

Por qué este ejemplo es útil para agentes:

* es binario (se cumple/no se cumple),
* define dónde se rompe (API, DB, dominio, CI),
* y ofrece remediación concreta sin interpretación ambigua.

### Segundo ejemplo realista (arquitectura/operación): `INV-ARCH-011`

Este ejemplo resuelve un problema muy común en producción: mezclar errores accionables con ruido (p. ej. desconexiones de cliente).  
Ejemplo completo del invariante `INV-ARCH-011`:

```markdown
---
id: INV-ARCH-011
name: Actionable error classification on critical HTTP boundaries
domain: architecture
type: observability
status: blocking
owner: "@team-platform-observability"
last_reviewed: 2026-02-12
---

## Formal Statement (IF/THEN)

IF an error in a critical HTTP boundary matches a known non-actionable client-abort signature
(`client_closed_request`, `broken_pipe`, `ECONNRESET` before server-side effect),
THEN it must be emitted as `actionable=false`, `severity=info|warn`, and excluded from pager/SLO error budget.

IF an error can affect correctness, integrity, or completed side effects,
THEN it must be emitted as `actionable=true`, `severity=error`, and included in pager/SLO error budget.

## Why this exists

Prevents alert fatigue and keeps production error signals trustworthy for operators and agents.

## Enforcement Points

1. Error middleware:
   * all boundary exceptions pass through a centralized classifier.
2. Taxonomy source:
   * signatures and classes versioned in `docs/observability/error-taxonomy.yml`.
3. CI tests:
   * classification contract tests for known signatures.
   * pager query tests asserting only `actionable=true` contributes to alerting.
4. Logging guard:
   * lint/check forbids raw `logger.error` in HTTP boundaries without classification fields.

## Failure Message (actionable)

`INV-ARCH-011 violated: unclassified or misclassified boundary error detected. Route exception through ErrorClassifier and set actionable/severity according to docs/observability/error-taxonomy.yml.`

## Exceptions

- id: EXC-ARCH-2026-02-12-01
  reason: new upstream signature pending classification
  expires_at: 2026-02-19

## Related Features

- ../../features/api-gateway.md
- ../../features/platform-observability.md

## Tests and Evidence

- tests/observability/error_classification_contract_test.*
- tests/observability/pager_budget_filter_test.*
- ci/checks/observability_invariants.yml
```

### Anti-patrones (confundir invariante con regla de negocio)

**Anti-patrón 1 (mal):**  
"Durante campaña, descuentos al 20% para nuevos usuarios" como invariante.

**Correcto:**  
Es `Policy` (cambia por estrategia). Lo invariante sería algo como: "nunca aplicar descuento fuera de la unidad de facturación definida".

**Anti-patrón 2 (mal):**  
"Enviar push a las 09:00" como invariante.

**Correcto:**  
Es `Policy` de canal/horario. Lo invariante sería: "si un evento requiere notificación crítica, debe dejar traza auditable y estado de entrega".

**Anti-patrón 3 (mal):**  
"Usar color verde para éxito" como invariante.

**Correcto:**  
Es decisión UI. Lo invariante sería: "un estado terminal exitoso debe mapearse a una semántica consistente en API/UI/analytics".

### Verificación contra la definición (ambos ejemplos)

Checklist de definición de `System invariant`:

* **Binario:** sí. Ambos definen condiciones IF/THEN evaluables (cumple/no cumple).
* **Verificable mecánicamente:** sí. Ambos incluyen enforcement en CI/tests/checks.
* **Fallo accionable:** sí. Ambos incluyen mensaje de fallo con remediación concreta.
* **No es policy cambiante:** sí. Ambos protegen coherencia/safety, no una preferencia de negocio temporal.

---

## Cierre de la Parte 1

Conclusión breve: no hay autonomía segura sin constitución operativa.

* Los invariantes convierten intención estable en checks ejecutables.
* El ownership evita que la calidad quede "sin dueño".
* El sistema docs-first reduce coste de razonamiento y preserva intención de negocio.

Con esa base, en la Parte 2 bajamos a ejecución diaria: cómo operar esa constitución con entornos deterministas, observabilidad, guardrails por riesgo, reconciliación continua y seguridad por diseño.

Siguiente entrega: [Parte 2: De entornos deterministas a seguridad operativa](/blog/las-7-leyes-desarrollo-mundo-agentico-parte-2-operacion-segura/).

---

## Anexos (snippets copy/paste para `AGENTS.md`)

### Anexo A — `Invariant Framework`

```markdown
# Invariant Framework

**Definitions**

* **System invariant**: a binary, mechanically-verifiable property that must hold after every change. If violated, CI must fail with an actionable message.
* **Business policy**: product/marketing rules that may change (pricing, percentages, promo windows). Policies should be implemented *within* the invariant boundaries.

**Rule of alignment (Docs-first)**

* `docs/features/*` captures intent and behavior.
* `docs/invariants/*` captures non-negotiable system guarantees.
* If intent is stable and safety/consistency-critical, it must become an invariant.

**Domain catalog (required)**

* Canonical domain list lives in `docs/domains/catalog.yml`.
* Each domain entry must declare: `domain`, `owner`, `backup_owner`, `risk_level`, `status`.
* New domains cannot be used in invariants until registered in the catalog.

**Storage model (recommended)**

* One file per invariant: `docs/invariants/<domain>/INV-*.md`.
* One index per domain: `docs/invariants/<domain>/index.md`.
* Domain index summarizes status/owner/enforcement and links to each invariant file.
* Cross-domain invariants live under `docs/invariants/_cross/INV-CROSS-*.md`.

**Location and naming rules (at scale)**

* Invariant IDs follow: `INV-<DOMAIN>-NNN` (e.g., `INV-BILL-001`).
* `<DOMAIN>` token must exist in `docs/domains/catalog.yml`.
* Invariant file name must match its ID exactly.
* Feature guides live in `docs/features/<feature>.md` and reference invariants by ID + relative link.

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

**Bootstrap mode (docs-first, zero invariants yet)**

If the repo already has docs-first but no invariants, bootstrap in phases:

1. Build an invariant candidate backlog from docs (`must`, `never`, `always`, critical constraints).
2. Map each candidate to domain owner + risk level.
3. Prioritize top 3-5 high-blast-radius candidates first.
4. Implement checks in CI as `warn-only` for a short calibration window.
5. Fix noise/false positives, then promote critical checks to `blocking`.
6. Keep PR contract active during bootstrap:
   * invariant delta included, or
   * explicit rationale for "no invariant change needed".

**Bootstrap exit criteria**

* Critical domains have at least one blocking invariant.
* Recurrent incidents have corresponding invariant candidates or implemented checks.
* Owner/risk mapping is complete for critical paths.

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

**Feature-Invariant link contract**

* Feature guides must reference applicable invariant IDs.
* Invariant specs must reference related feature guides.
* Critical feature changes must include:
  * invariant delta, or
  * explicit `no-invariant-needed` rationale.
* CI fails on:
  * missing references in critical feature docs,
  * invariant IDs referenced by features that do not exist,
  * invariant specs without linked feature context (when feature exists).

**Scalability checks (CI)**

* invariant ID uniqueness across repository.
* invariant file name == invariant ID.
* invariant domain token exists in domain catalog.
* every critical-path feature declares `## Invariants` section.
* every blocking invariant has at least one enforcement hook (CI/test/lint/job).

**Reference format (normative)**

In `docs/features/<feature>.md`:

`## Invariants`

`- INV-BILL-001 - [No negative settled amount](../invariants/billing/INV-BILL-001.md) - protects billing integrity after settlement.`

`- INV-BILL-004 - [Idempotent capture requests](../invariants/billing/INV-BILL-004.md) - prevents duplicated charges on retries.`

If no invariant applies:

`## Invariants`

`- no-invariant-needed: reason="UI-only copy update"; owner="@team-content"; reviewed="2026-02-12"`

In `docs/invariants/<domain>/INV-*.md`:

`## Related Features`

`- ../../features/billing-checkout.md`

`- ../../features/billing-refunds.md`
```

### Anexo B — `Ownership Framework`

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

**`OWNERSHIP.md` format (normative example)**

| Domain | Owner | Backup owner | SLA (critical) | Critical paths | Invariants |
|---|---|---|---|---|---|
| billing | @team-billing-platform | @team-platform-oncall | 30m | `src/billing/`, `migrations/billing/` | INV-BILL-001, INV-BILL-004 |
| auth | @team-auth-platform | @team-platform-oncall | 30m | `src/auth/` | INV-AUTH-002 |
| content | @team-content | @team-platform-oncall | 4h | `src/content/` | INV-CONT-003 |

**CI/policy enforcement**

* CI fails if changed critical path has no owner mapping.
* CI fails if an invariant spec has no owner.
* CI fails if owner is not present in ownership map.
* CI fails if required owner approval is missing for high-risk changes.
* Invariant-breaking PRs/incidents auto-route to domain owner.

**No-owner rule**

* If no clear owner exists, no autonomy for that domain.
```

### Anexo D — `Documentation Framework (/docs)`

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
* Related invariant IDs (or explicit `no-invariant-needed` rationale).

**Feature-Invariant reconciliation**

* Add an `Invariants` section in each feature guide with invariant IDs + one-line intent.
* If no invariant applies, add `No invariant needed` with reason, owner, and review date.
* Keep bidirectional links: feature -> invariant and invariant -> feature.
* Update both sides in the same PR/task when behavior or guarantees change.

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
