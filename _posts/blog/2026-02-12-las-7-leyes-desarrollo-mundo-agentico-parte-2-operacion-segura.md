---
title: "Las 7 leyes del desarrollo en un mundo agéntico (Parte 2): De entornos deterministas a seguridad operativa"
excerpt: "Segunda parte de la serie: operar autonomía segura con reproducibilidad, observabilidad, guardrails, reconciliación y seguridad."
tags: [ia, agentes, observabilidad, seguridad, software]
date: 2026-02-12
modified: 2026-02-12
comments: true
ref: las-7-leyes-desarrollo-mundo-agentico-parte-2-operacion-segura
---


Primera entrega: [Parte 1](/blog/las-7-leyes-desarrollo-mundo-agentico-parte-1-constitucion/).

En la primera parte fijamos la constitución: invariantes, ownership y docs-first con ciclo de vida explícito.  
Aquí damos el siguiente paso: convertir esa constitución en operación diaria sin frenar el throughput.

Esta segunda entrega cubre las leyes 2 a 7: entornos reproducibles, observabilidad para loops de decisión, guardrails por riesgo, reconciliación continua y postura de seguridad.

Antes de entrar ley por ley, un principio no trivial: no todo debe vivir como texto en `AGENTS.md`.

* `AGENTS.md`: intención operativa y protocolos de decisión del agente.
* CI/policy engine: enforcement binario (pasa/falla).
* Jobs recurrentes: reconciliación y mantenimiento (drift, deuda mecánica, hygiene).
* Observabilidad: evidencia para decidir (logs/metrics/traces/queries).

Si no repartes así, acabas con "normas bonitas" que no cambian el comportamiento real.

# 2) Entornos deterministas y reproducibles

Si quieres autonomía real, "probar" tiene que ser barato y confiable. Si cada ejecución produce resultados distintos, el agente aprende el mensaje equivocado: "validar es ruido".  
La idea es simple: un agente trabaja bien cuando puede ejecutar un loop corto:  
**reproducir -> cambiar -> verificar**.

### Artefacto mínimo: el runbook ejecutable

En cualquier stack, necesitas un punto de entrada único (o casi único). No un README eterno: un script.

Un runbook típico:

* levantar dependencias (DB/redis/queues)
* migraciones
* seed estable
* test rápido (smoke)
* test profundo (e2e)

Lo importante: que sea repetible y que el agente no tenga que "inventar" pasos.

Para cerrar la brecha con producción, añade entornos efímeros por PR/worktree con TTL corto:

* mismo script de bootstrap en local y en CI
* mismo seed estable
* mismo smoke suite antes de permitir merge

### Ejemplo realista (agnóstico)

**"Seed estable + smoke suite"**

* Seed: siempre crea 3 usuarios, 2 roles, 1 tenant demo, 10 items de contenido.
* Smoke: login, navegar a dashboard, crear un item, eliminarlo, comprobar estado.

No da cobertura total, pero sí un "latido" fiable para detectar rápido si el sistema está vivo.

### Clave práctica

Separa suites:

* una rápida para iteración (minutos)
* otra profunda para confianza (más lenta)

Así evitas el dilema clásico: bloquear por exceso de validación o degradar por defecto de validación.

### Bloque para `AGENTS.md`: execution contract (determinismo)

```markdown
# Execution Contract (Deterministic Environments)

**Objective**

* Every agent task must be reproducible with the same inputs and produce comparable validation signals.

**Hard rules**

1. Use a single canonical bootstrap command for local and CI.
2. Use stable seed/fixtures for critical journeys.
3. Separate fast validation (iteration) from deep validation (confidence).
4. Do not claim "fixed" without running the required suite for the risk level.

**Minimum runbook contract**

* `setup` (deps/services/migrations)
* `seed` (deterministic baseline data)
* `test:fast` (unit + smoke)
* `test:deep` (integration/e2e)

**Parity constraints**

* Same bootstrap script in local and CI.
* Same seed source for smoke journeys.
* Same critical env vars contract (with safe defaults).

**Flakiness policy**

* If a test is flaky, tag it and open stabilization task.
* Do not silently bypass flaky critical-path tests.

**PR evidence**

* Include commands executed and pass/fail summary.
* If deep suite is skipped, include explicit rationale + risk acceptance.
```

---

# 3) Observabilidad "first-class" para agentes

La observabilidad suele diseñarse para humanos (dashboards) y emergencias. Con agentes, necesitas señales hechas para cerrar loops.

El agente necesita responder preguntas como:

* "¿Dónde falló y por qué?"
* "¿Mi cambio mejoró o empeoró algo medible?"
* "¿El journey crítico sigue dentro de límites?"

### Invariante de observabilidad (ejemplo agnóstico)

**"Toda operación crítica emite un log estructurado con campos mínimos"**  
Campos típicos: `request_id`, `actor_id`, `domain`, `action`, `result`, `latency_ms`.

Esto no es estética: es control. Permite consultas fiables y telemetría consistente.

**Enforcement**

* wrapper obligatorio para logging (en vez de logs sueltos)
* lint / test que detecta logs "no estructurados" en rutas críticas

### Plantillas operativas para cerrar loops

Además de logs, necesitas queries reutilizables para incidentes frecuentes:

* "top errores por `domain/action` en 24h"
* "p95 latency por journey crítico antes/después del PR"
* "ratio de retries/timeouts por endpoint sensible"

Cuando esas plantillas son estándar, el agente deja de improvisar.

### Bloque para `AGENTS.md`: observabilidad para detectar cegueras

Si quieres "instilar" este principio en el comportamiento del agente, usa un bloque explícito como este:

```markdown
# Observability Framework (Agentic)

**Core objective**

* Agents must detect their own blind spots, avoid overconfident conclusions, and propose observability improvements before critical changes.

**Hard rules**

1. Do not assert root cause without evidence from logs/metrics/traces/tests.
2. For critical-path changes, run a Blind-Spot Preflight before coding.
3. If visibility is insufficient, include an Observability Delta proposal in the same task/PR.
4. If no observability delta is added, provide explicit rationale.

**Blind-Spot Preflight (mandatory)**

1. Identify impacted journeys/domains.
2. List key questions to answer (correctness, latency, failures, integrity).
3. Mark each question as:
   * observable now
   * partially observable
   * blind
4. For every blind/partial question, propose the minimum signal needed.

**Minimum signal set for critical flows**

* Structured event for start/success/failure.
* Correlation IDs (`request_id`, `trace_id`, `actor_id` when applicable).
* External dependency calls with latency/result.
* Retry/timeout/circuit-breaker outcomes.
* State transitions with reason/source.
* Error taxonomy (domain error code, not only raw exception text).

**Observability Delta (required when blind spots exist)**

For each proposed signal include:

* location (service/module/boundary)
* signal type (log/metric/trace/event)
* fields/schema
* query/use-case enabled
* expected operational decision it unlocks

**Output contract for agent responses**

Always include:

1. Evidence used.
2. Remaining blind spots.
3. Proposed observability improvements (if any).
4. Confidence level conditioned on current visibility.

**CI/PR guardrail**

* Critical-path PRs must include either:
  * observability delta, or
  * explicit "no delta needed" rationale.
* Fail PR when critical paths are changed and neither condition is met.

**Maintenance**

* Remove noisy or unused signals.
* Keep dashboards/queries aligned with current incidents and SLOs.
* Revisit blind-spot patterns in recurring "observability gardening".
```

Este bloque fuerza un comportamiento sano: el agente no solo "mira lo que hay", también sabe reconocer lo que no puede ver todavía y cómo corregirlo.

### Ejemplo práctico: SLO verificable

**"Ningún paso del journey 'checkout' excede 2s"** (o "create-resource < 800ms").  
No hace falta Prometheus para entender la idea: conviertes una expectativa operativa en un check.

**Implementación agnóstica**

* mides latencias en test e2e (aunque sea con umbral grosero)
* o consultas métricas si ya tienes stack de observabilidad
* y lo vuelves binario: pasa/falla

Resultado: el agente deja de "hacer cambios plausibles" y pasa a "hacer cambios demostrables".

---

# 4) Guardrails por nivel de riesgo (autonomía graduada)

El error que mata la autonomía es tratar todos los cambios igual.  
La solución es aplicar guardrails proporcionales al daño potencial.

### Un modelo simple de niveles

* **Nivel 0:** docs, cambios mecánicos, refactors "sin comportamiento" -> auto-merge si CI verde.
* **Nivel 1:** cambios internos no críticos -> auto-merge con suites estándar.
* **Nivel 2:** dominios sensibles (billing/auth/pagos/permisos) -> checks extra o aprobación humana ligera.
* **Nivel 3:** migraciones de datos, seguridad, cambios de infraestructura -> human-in-the-loop obligatorio.

### Ejemplo agnóstico de implementación

**Clasificación por "áreas de impacto"**

* Si el PR toca `auth/` o `billing/` => sube a Nivel 2 automáticamente.
* Si toca `migrations/` o `infra/` => Nivel 3.
* Si solo toca `docs/` => Nivel 0.

Esto se puede resolver con un rule-set de CI. Lo importante es el principio.

### Qué habilita

Habilita auto-merge donde procede y reserva atención humana para cambios con daño potencial real.

### Bloque para `AGENTS.md`: risk gating framework

```markdown
# Risk Gating Framework (Autonomy Levels)

**Objective**

* Match autonomy to blast radius, not to developer convenience.

**Risk levels**

* Level 0: docs/mechanical/non-behavioral refactors.
* Level 1: internal non-critical behavior changes.
* Level 2: sensitive domains (auth/billing/payments/permissions/data integrity).
* Level 3: migrations, infrastructure, production safety, security-sensitive changes.

**Classification inputs**

* touched paths/modules
* domain tags
* data-shape changes
* runtime environment impact

**Required evidence by level**

* L0: standard CI green.
* L1: fast + targeted domain tests.
* L2: extra checks (security/integrity/perf) + human lightweight approval.
* L3: explicit rollout plan + rollback + human-in-the-loop mandatory.

**CI guardrail**

* PR must declare computed risk level.
* CI recomputes level from impact map.
* Fail if declared vs computed level mismatch.
* Fail if required evidence for that level is missing.
```

---

# 5) Separar Policy de Constitution

Aquí está una de las confusiones más caras: llamar "regla de negocio" a lo que en realidad es una ley estructural.

* **Policy:** porcentaje, campaña, duración, copy, segmentación. Cambia.
* **Constitution:** scoping de estados, boundaries, acoplamientos permitidos, garantías de consistencia. No debería cambiar cada trimestre.

### Ejemplo (agnóstico) para entenderlo

* Policy: "Descuento del 20% durante 14 días para nuevos usuarios".
* Constitution: "Los descuentos se aplican a una unidad de facturación concreta, nunca a un sujeto global que contamine otros contextos".

La policy cambia sin tocar cimientos. La constitution evita que la policy te rompa el sistema.

### Una técnica útil: "pregunta de estabilidad"

Si una regla probablemente cambie por razones de negocio -> Policy.  
Si cambiarla rompería coherencia del sistema o abriría clases nuevas de bugs -> Constitution (invariante).

### Bloque para `AGENTS.md`: policy/constitution classifier

```markdown
# Policy vs Constitution Classifier

**Objective**

* Prevent mixing changeable business tuning with non-negotiable system guarantees.

**Decision test**

1. Is this expected to change due to business strategy/experiments?
2. Would changing it risk system coherence, integrity, or safety?

**Classification**

* If (1) yes and (2) no -> Policy.
* If (2) yes -> Constitution (Invariant candidate).

**Implementation target**

* Policy -> config + business tests + feature docs.
* Constitution -> invariant spec + CI enforcement + owner accountability.

**PR contract**

* Every new rule must include classification and rationale.
* If classified as Constitution, include invariant delta or explicit defer plan with owner/date.
```

---

# 6) Reconciliación y garbage collection (autonomía mantenible)

Con alto throughput, la entropía aparece por escala: una pequeña imperfección se replica más rápido de lo que la corriges.  
Por eso necesitas "garbage collection": detectar deriva y corregirla en micro-incrementos.

### Ejemplo agnóstico: reconciler de estado

Supón que tienes "estado esperado" y "estado real". El reconciler hace:

* detecta divergencias
* abre PRs pequeños (o ejecuta correcciones controladas)
* deja trazabilidad

En billing puede ser "datos vs Stripe"; en auth puede ser "roles vs permisos efectivos"; en contenido puede ser "metadatos vs índices".

### Cadencia: la clave es el tamaño, no la heroicidad

* PRs pequeños, recurrentes, casi auto-mergeables
* si requiere "un viernes entero", no escala
* si se paga como micro-cuotas, se vuelve invisible (y por eso funciona)

### Cómo encaja con agentes

Este es el punto ideal para delegar: el agente escanea, propone y corrige; tú supervisas el sistema, no cada parche.

### Bloque para `AGENTS.md`: reconciliation framework

```markdown
# Reconciliation Framework (Drift and GC)

**Objective**

* Continuously reduce entropy with small, recurrent, low-risk corrections.

**Scope**

* data-vs-source drift
* schema/contract drift
* naming and structural hygiene
* stale exceptions/bypasses

**Cadence**

* Run on a fixed schedule (e.g., daily/weekly by domain criticality).
* Prefer small PRs with bounded scope and clear ownership.

**PR shape constraints**

* One drift class per PR.
* Clear before/after evidence.
* Auto-merge only for low-risk, fully validated corrections.

**Escalation**

* If reconciliation detects potential destructive impact, stop and escalate to owner.
* Do not auto-apply high-blast-radius fixes.

**Maintenance**

* Track recurring drift classes.
* Turn repeated drift into new invariants or better guardrails.
```

---

# 7) Postura de seguridad: "no puede hacer daño aunque quiera"

Autonomía sin límites no es valentía: es irresponsabilidad.  
Aunque el agente sea "bueno", puede equivocarse; el objetivo es diseñar el blast radius.

### Invariantes de seguridad (agnósticos)

* **Permisos mínimos:** el agente solo puede hacer lo que necesita para la tarea.
* **Dry-run por defecto:** acciones destructivas requieren un "modo explícito".
* **Secretos fuera de alcance:** el agente no debe poder exfiltrar credenciales por diseño.
* **Rollout gradual:** feature flags + despliegues progresivos.
* **Auditoría:** toda acción relevante queda registrada.

### Ejemplo práctico (agnóstico)

Una migración de datos:

* se prepara en modo "plan"
* se ejecuta en entorno de prueba con dataset representativo
* se despliega con flag y métricas de control
* y solo entonces se amplía

El agente puede automatizar gran parte, pero el sistema limita el daño.

### Bloque para `AGENTS.md`: safety envelope

```markdown
# Safety Envelope (Agent Operations)

**Objective**

* Ensure agents cannot cause irreversible or high-blast-radius damage by default.

**Hard defaults**

1. Least privilege for tools, tokens, and environments.
2. Dry-run by default for destructive operations.
3. Two-step execution for destructive changes (plan -> apply).
4. Mandatory audit trail for sensitive actions.

**Change safety protocol**

* plan: show impact scope, affected entities, rollback path.
* verify: run in staging/sandbox with representative data.
* release: gradual rollout with guard metrics and kill-switch.

**Secrets and exfiltration controls**

* Never expose raw secrets in logs, prompts, or artifacts.
* Restrict outbound channels for sensitive contexts.
* Redact identifiers where full fidelity is unnecessary.

**CI/PR guardrail**

* Security-sensitive PRs require safety checklist completion.
* Fail when destructive paths lack dry-run and rollback evidence.
```

---

## Cierre de la Parte 2

Conclusión breve: la autonomía no se escala "revisando más", se escala operando mejor.

* La constitución define qué no se puede romper.
* Las leyes operativas (2 a 7) hacen viable ese marco en el día a día.
* La atención humana se mueve de revisar líneas a gobernar el sistema.

Cuando ambas capas encajan, el resultado no es solo más velocidad: es velocidad con coherencia acumulativa.
