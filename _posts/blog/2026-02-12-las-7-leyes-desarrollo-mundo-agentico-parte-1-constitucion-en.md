---
title: "The 7 laws of development in an agentic world, part 1: repo constitution"
excerpt: "Part one of the series: turning coherence into a system property through invariants, ownership and docs-first."
tags: [ai, agents, architecture, software, engineering]
lang: en
ref: las-7-leyes-desarrollo-mundo-agentico-parte-1-constitucion
date: 2026-02-12
modified: 2026-05-28
comments: true
permalink: /en/blog/7-laws-agentic-development-part-1-repo-constitution/
---

For years, software coherence has relied on a tacit pact: **if someone reviews, the system stays healthy**. Architecture does not drift, conventions are respected and decisions are remembered because human eyes are looking at every change.

That pact works while volume is human.

When agents enter the picture, throughput changes scale. Suddenly the bottleneck is not compiling, deploying or writing code. The bottleneck is **attention**.

Two bad futures appear:

- if you try to maintain control as usual, with reviews and gates, you block the flow;
- if you loosen control to gain speed, the repo degrades through architectural drift, duplicated patterns and multiplied debt.

This is not a discipline problem. It is a mechanism problem.

The solution is not "review more". It is changing the paradigm:

> Before, we controlled coherence with people.
> With agents, part of that control must move to automatic laws: invariants.

Human supervision does not disappear. It moves up a layer. Instead of spending attention on every line, you design the system so it cannot leave the lane.

I think of this as an operating system for safe autonomy:

> Safe autonomy = strong invariants + feedback loops + cheap recovery + explicit limits.

## The seven laws

The full model has seven parts.

1. **Repo constitution: invariants + ownership.**
   A catalogue of domain invariants, each with enforcement and owner. If an invariant breaks, it does not merge.

2. **Deterministic and reproducible environments.**
   Agents cannot validate by opinion. They need stable seeds, runbooks, fixtures and short loops.

3. **First-class observability for agents.**
   Logs, metrics, traces and queries become part of the agent's decision loop.

4. **Risk guardrails.**
   Not every change deserves the same supervision. Documentation and safe refactors can move faster than billing, auth, migrations or production operations.

5. **Policy vs constitution.**
   Separate what changes often from what must remain stable. Discounts are policy. Subscription scope is constitution.

6. **Reconciliation and garbage collection.**
   Autonomy creates drift. Pay debt in small frequent installments, not in heroic cleanup Fridays.

7. **Safety posture: it cannot cause damage even if it wants to.**
   Least privilege, dry-run by default, feature flags, rollout and audit for sensitive actions.

This first part is about the constitution.

## Invariants are not preferences

The word "invariant" is important.

A preference says: "we usually do this". An invariant says: "if this breaks, the system is no longer acceptable".

That difference matters in agentic development because agents are very good at replicating local patterns. If a mediocre shortcut passes once, it may be copied many times. If an invariant is executable, the shortcut fails at the boundary.

An invariant needs:

- a formal statement;
- why it exists;
- where it is enforced;
- an actionable failure message;
- allowed exceptions;
- related features;
- tests and evidence.

That may look heavy, but it is cheaper than rediscovering the same architectural rule in every PR.

## Ownership makes invariants alive

An invariant without owner becomes decoration.

Every invariant needs someone responsible for deciding whether it still makes sense, whether exceptions are valid, whether enforcement is too weak or too strict and whether the wording helps agents and humans.

Ownership is not about blame. It is about maintenance.

Agentic systems need more maintenance of rules, not less, because rules become part of the production interface.

This connects directly with [what PRs know that code does not tell](/en/blog/what-prs-know-that-code-does-not-tell/): if a team keeps repeating the same PR comment, that comment may be a missing invariant or at least a missing policy.

## Docs-first is not bureaucracy

When humans are the main writers, documentation often lags behind code.

With agents, that becomes expensive. The agent spends tokens reconstructing context that could have been explicit. Worse, it may reconstruct it wrongly.

A docs-first gate is not about writing beautiful documents. It is about lowering reasoning cost and preventing drift.

The question is not "did we document everything?". The question is:

> Can the next agent understand the boundary without reverse engineering it from scattered code and PR comments?

## The lesson

In an agentic world, coherence cannot depend only on review memory.

The repo needs a constitution: explicit invariants, owners, enforcement and documentation that agents can actually use.

The human role moves from checking every detail to designing the laws that make safe autonomy possible.

Part 2 continues with the operational side: reproducible environments, observability, risk gating, reconciliation and safety.
