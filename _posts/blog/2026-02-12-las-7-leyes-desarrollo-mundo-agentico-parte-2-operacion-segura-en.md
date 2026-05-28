---
title: "The 7 laws of development in an agentic world, part 2: safe operation"
excerpt: "Part two of the series: operating safe autonomy with reproducibility, observability, guardrails, reconciliation and security."
tags: [ai, agents, observability, security, software]
lang: en
ref: las-7-leyes-desarrollo-mundo-agentico-parte-2-operacion-segura
date: 2026-02-12
modified: 2026-05-28
comments: true
permalink: /en/blog/7-laws-agentic-development-part-2-safe-operation/
---

First part: [repo constitution](/en/blog/7-laws-agentic-development-part-1-repo-constitution/).

In part one I described the constitution: invariants, ownership and docs-first with explicit lifecycle.

This second part is about the next step: turning that constitution into daily operation without stopping throughput.

The laws here are reproducible environments, observability for decision loops, risk guardrails, continuous reconciliation and safety posture.

There is one non-trivial principle before going law by law: not everything should live as text in `AGENTS.md`.

- `AGENTS.md` should carry operational intention and decision protocols.
- CI or a policy engine should enforce binary pass/fail checks.
- recurrent jobs should handle reconciliation and mechanical debt.
- observability should provide evidence for decisions.

If you do not distribute responsibilities this way, you end up with pretty rules that do not change behavior.

## Deterministic environments

If you want real autonomy, testing must be cheap and reliable.

If every run produces different results, the agent learns the wrong message: validation is noise.

The loop should be simple:

> reproduce -> change -> verify.

That requires a canonical runbook: bootstrap dependencies, migrations, stable seed, quick smoke suite and deeper tests when risk demands it.

The important thing is not a long README. It is a repeatable entry point the agent does not have to invent.

Separate suites are essential: fast validation for iteration and deep validation for confidence. Otherwise you face the classic dilemma: block everything with too much validation or degrade because validation is too expensive.

## Observability as input for agents

Agents should not only know whether code compiles. They should see effects.

That means accessible logs, metrics, traces, dashboards, query templates and SLOs for the journeys they may affect.

An agent that can inspect a regression, compare latencies, read error rates or verify startup time can close a much better loop than one that only edits files.

This is why the [technical error feedback loop](/en/blog/gokoan-technical-error-resolution-feedback-loop/) matters: once production errors are structured, they can become input for triage, tests, fixes and verification.

## Risk guardrails

Not all autonomy has the same risk.

A simple model helps:

- Level 0: docs and safe refactors, auto-merge with CI.
- Level 1: non-critical internal changes, auto-merge with tests and checks.
- Level 2: sensitive domains such as billing or auth, requiring extra validation or light human approval.
- Level 3: migrations, production operations and security, mandatory human-in-the-loop.

The point is not to slow everything down. It is to concentrate supervision where it hurts.

This also prevents the opposite failure: asking humans to review every small safe change until the system loses the speed agents were meant to provide.

## Policy vs constitution

Some rules change often. Some rules define system integrity.

Promotions, discount percentages and temporary business settings are policy. Subscription boundaries, auth scope and data isolation are constitution.

A useful test is the stability question:

> If this changes next month, is the system still the same system?

If yes, it is probably policy. If no, it may be constitution.

The distinction matters because policies should be configurable, testable and evolvable. Constitution rules should be strongly enforced.

## Reconciliation and garbage collection

Autonomy creates drift.

Agents can produce many small changes, temporary files, duplicated helpers, stale docs and minor mismatches. None of them may be dramatic alone. Together they become entropy.

So reconciliation has to be part of the system: periodic checks for drift, small mechanical debt PRs, stale artifact cleanup and consistency scans.

The trick is cadence. Pay debt in micro-installments, not in heroic cleanup Fridays.

## Safety posture

The strongest design principle is:

> It cannot cause damage even if it wants to.

That means least privilege, secrets inaccessible outside safe CI, dry-run by default for destructive actions, feature flags, gradual rollout, audit logs and narrow tool permissions.

Do not rely on the agent "being careful". Design the environment so carelessness cannot cross critical boundaries.

## The lesson

Agentic development is not "let the model do more".

It is an operating model: reproducible environments, observable effects, risk-based gates, clear policy/constitution boundaries, recurrent reconciliation and a safety envelope.

The human role is still central. But the work moves up: design the environment where autonomy is useful because it is constrained, observable and recoverable.
