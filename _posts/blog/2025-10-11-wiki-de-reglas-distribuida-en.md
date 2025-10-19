---
title: Distributed Rule Wiki – An Idea Clarified by AI
excerpt: "English version of my essay on building a collaborative, edge-executed knowledge base of logic rules."
tags: [wiki, logic, ai, prolog, ideas]
lang: en
ref: wiki-reglas-distribuida
date: 2025-10-11
modified: 2025-10-19
comments: true
permalink: /en/blog/distributed-rule-wiki/
---

Ever since the late 90s, when I started tinkering with Prolog, I dreamt about a place where logical knowledge could be written, tested, and shared like code: a collaborative **rule wiki**. For years the concept remained a tangle of notebooks, repos, and half-baked prototypes. In 2025 an AI assistant finally helped me untangle it.

## Why a rule wiki?

Traditional wikis capture prose. I want something that treats rules as **first-class artefacts**—versionable, executable, and remixable by anyone. Imagine:

- Modules you can import, extend, or fork.
- Proofs and tests bundled with each rule so you can reproduce reasoning.
- Edge execution so inference happens on your machine, not a central server.

## What changed in 2025

I fed voice notes, diagrams, and scattered references into my AI assistant. Instead of drafting yet another messy document, the assistant acted as editor and mirror: proposing structures, spotting gaps, insisting on precise definitions. Layer by layer it distilled the fog into a clean specification—purpose, components, principles, lifecycle.

## System overview

- **Knowledge as code**: rules, views, datasets, and tests are modules you can import and execute locally.
- **Provenance-first**: every inference carries the exact versions that produced it, enabling audits and pedagogy.
- **Pedagogy built-in**: examples and tests live next to each module so learning happens by running and tweaking code.
- **Edge execution**: a WebAssembly runtime runs in the browser; the central wiki only stores history, signatures, and governance metadata.
- **Distributed governance**: the wiki is an archive and forum, not the CPU. Users decide what to run and share.

## Workflow sketch

1. **Authoring** – write rules in a declarative DSL, add tests, document intent.
2. **Publishing** – push the module to the wiki; it undergoes linting, verification, and review.
3. **Consumption** – another user clones the module, runs tests locally, composes it with others.
4. **Derivations** – the runtime records inputs, versions, and outputs so results remain reproducible.

## Why AI mattered

The true breakthrough wasn’t the document itself but the process: the AI served as editor, devil’s advocate, and structure enforcer. It forced me to separate principles from implementation, to name ambiguities, to justify each component. The vision went from ghostly to concrete.

## Will I build it?

Not tomorrow. But now that the idea is crisp I can approach it in phases—define the DSL, prototype a WASM runtime, explore the wiki interface. Even if it never ships, articulating it with this clarity rekindled the fascination that kept the concept alive for two decades.

Sometimes the best way to take care of an idea is to publish it while it’s still latent. If it ever becomes real, I hope it keeps the blend of rigour and curiosity that helped it survive this long.
