---
title: Distributed Rule Wiki – An Idea Clarified by AI
excerpt: "After years of thinking about a Wikipedia of logical rules, a push from AI turned my scattered notebooks into a crisp specification."
tags: [wiki, logic, ai, prolog, ideas]
lang: en
ref: wiki-reglas-distribuida
date: 2025-10-11
modified: 2025-10-19
comments: true
permalink: /en/blog/distributed-rule-wiki/
---

Ever since I started playing with Prolog in the late 90s, the same obsession has been on my mind: to create a place where logical knowledge is written, tested, and shared as if it were code. I have filled notebooks, repositories, and half-baked mockups trying to encapsulate that intuition, a kind of distributed *Wikipedia of rules* that never quite took shape.

The idea survived because it had something elusive and precious about it. I dreamed of a space where rules were versioned, verifiable, and reusable; where each browser could execute inferences without depending on a centralized server; where learning logic involved playing with live examples. But every time I tried to capture it, I hit the same wall: too many mixed concepts, too many blind spots in the architecture.

This is not the first time I have written about it. In 2013, I published the [Plain Knowledge Base](/blog/plain-kb/) experiment, a minimalist prototype of a knowledge graph woven with text files and cross-references with `{{keys}}`. More recently, in 2024, I documented the [Create your own IA assistant](/blog/create-your-own-ia-assistant-tutorial/) tutorial to build a personal “Jarvis” that records facts and reminders in its own knowledge base. Both pieces are partial reflections of the same obsession: to capture knowledge in a structured and actionable way.

This summer I changed my strategy. Instead of forcing myself to write another technical document from scratch, I relied on my AI assistant to distill, layer by layer, what I really wanted to build. From voice notes, old diagrams, and scattered references, the AI returned a clean conceptual specification: purpose, components, principles, lifecycle, all organized as if it were a product manifesto. I finally saw the complete idea, without the accumulated noise of twenty years of unfinished versions.

## What this distributed wiki proposes

The specification describes an open platform where declarative knowledge is treatable as versioned artifacts. The server only stores the history and signatures; the computation happens on the client thanks to a WebAssembly logic runtime. Each module declares its data sources, views, and materializations, and whoever downloads it can reproduce any inference with the same hashes and limits. It is the conscious inversion of traditional infrastructure: we move the computational weight to the *edge* to maintain independence and privacy.

These are the pillars that excite me the most:

- **Knowledge as executable code**: rules, views, and datasets function as verifiable modules that can be imported, combined, and tested without touching a monolithic backend.
- **Provenance and reproducibility integrated**: any result carries with it the exact versions that generated it, which allows auditing or teaching the inference step by step.
- **Embedded pedagogy**: tests and examples live next to each module, so that learning is executing, playing, and modifying on the fly.
- **Distributed governance**: the wiki is the archive and the forum, but not the CPU. Each person decides what to execute, what to publish, and when to share their derivations.

## What changes with AI

The real achievement here is not that the document exists, but how it was generated. The AI acted as an editor and a mirror: it proposed structures, found gaps, demanded precise definitions, and forced me to separate principles from implementations. That accelerated iteration helped me get out of the swamp of pending decisions and to name, finally, the essence of the idea.

Am I going to implement it tomorrow? Probably not. But now that I see it with this clarity, I can advance in stages: perhaps first design the logical dialect, then a prototype of a WASM runtime, later the wiki interface. Even if it never goes into production, the exercise was already worth it for the conceptual beauty achieved. Having a clean specification reminds me why I am still in love with this obsession and gives me a map to return to it when I want to continue exploring.

In the meantime, I am publishing it here so as not to let it get lost in the drawer again. Sometimes the best way to take care of an idea is to share it, even if it remains in a latent state. And if one day it becomes real code, I hope it retains that mixture of rigor and curiosity that made it survive so many years in my head.


# APPENDIX: 🧠 Project: *Distributed Rule Wiki*

### (a collaborative Wikipedia of declarative knowledge executable on the edge)

---

## 1. Essential Purpose

To create an **open infrastructure** where people can **declare logical knowledge** (rules, relationships, data transformations) in a **collaborative, verifiable, and locally executable** way.

Each user not only *reads knowledge*, but can **execute, extend, test, and combine it** directly from their browser.

---

## 2. Central Idea

> **"Knowledge as executable code"**, shared and versioned like a *Wikipedia of rules*,
> but with **decentralized** execution:
> the **computation and cost are borne by each client**, not the server.

The wiki acts as a **source of truth and historical archive**,
and each browser becomes an **independent inference engine** capable of:

*   downloading signed rules and their associated datasets,
*   executing them locally,
*   deriving new knowledge,
*   and, optionally, publishing reproducible results.

---

## 3. Foundational Principles

1.  **Open, verifiable, and versioned knowledge.**
    Each rule has authorship, version, and traceability.

2.  **Local (edge) execution.**
    Inferences, queries, and derivations occur on the client (WebAssembly).

3.  **Independence and reproducibility.**
    Any result can be redone exactly, thanks to fixed versions and content hashes.

4.  **Privacy by design.**
    User data is not sent to the cloud, unless they explicitly decide to do so.

5.  **Social collaboration.**
    Comments, suggestions, requests, examples, and tests will coexist in the same interface.

6.  **Integrated pedagogy.**
    Each set of rules includes its own tests and examples, which serve both to verify and to teach.

---

## 4. Conceptual Components

### 4.1 Central Wiki (community core)

*   Public repository of **rules, modules, and versions**.
*   Page per rule or module with:

    *   readable code,
    *   documentation and examples,
    *   self-executing tests,
    *   comments and improvement requests.
*   **Signing, versioning, and trust** system (e.g., `org/module@1.0.3`).
*   Public API for distribution of signed bundles.

**Analogy:** a mix between *GitHub* and *Wikipedia*, but for logical knowledge in extended Prolog.

---

### 4.2 Client / Edge Runtime

*   **WebAssembly** inference engine (the extended Prolog runtime).
*   Runs inside the browser, with support for:

    *   **loading modules** from the wiki (cryptographically verified),
    *   **downloading external data** (JSON/CSV with declared schema),
    *   **local materialization** of derived facts and rules,
    *   **persistence** in cache (IndexedDB / FileSystem Access),
    *   **executable tests** directly on the client.

The client **pays the computational cost**, and can optionally share the results.

---

### 4.3 Extended Language (declarative logical dialect)

Extends Prolog with three main ideas:

1.  **External data sources** (`datasource`)
    Allows declaring a remote source (JSON, CSV, REST API) with its schema and limits.

2.  **Declarative views** (`view`)
    Logical maps between the source and internal facts.

3.  **Local materialization** (`materialize`)
    Rules or queries that can be persisted and reused without recalculating.

The dialect prioritizes **purity, reproducibility, and security** (no arbitrary I/O or side effects).

---

## 5. Lifecycle of a Rule or Module

1.  **Creation**: a user proposes new rules on the wiki.
2.  **Testing**: the wiki itself runs the tests (on the client) to validate consistency.
3.  **Publication**: the module is signed and versioned (with content hash).
4.  **Download**: clients import it into their local environments.
5.  **Execution**: modules and real data are combined in the browser.
6.  **Derivation**: the user can materialize new knowledge.
7.  **Contribution**: derivations or improvements can be uploaded again, with traceability.

---

## 6. Knowledge Model

Each basic entity—**rule, fact, view, or dataset**—has:

*   a **semantic identifier** (`org/module:pred/arity`),
*   a **content hash** (guarantee of integrity),
*   and a **change history** (git style).

The knowledge is structured as a **network of versioned dependencies**,
where each node can be verified, tested, or replaced independently.

---

## 7. Execution and Reproducibility

Each query executed on the client produces a **provenance** block that describes:

*   what exact versions of rules and data were used,
*   what configurations and limits were active,
*   and what results were derived.

This allows **reproducing or auditing** any inference in another context,
guaranteeing the transparency of the reasoning.

---

## 8. Collaboration and Learning

*   **Tests as living documentation:** examples and tests can be run live.
*   **Comment and request system:** users discuss improvements or extensions.
*   **Trust “badges”:** rules verified by the community or by reviewers.
*   **Readable history:** each change can be tracked and cited.

The wiki thus becomes a **school of shared reasoning**,
where knowledge is not only described, but demonstrated by executing it.

---

## 9. Governance and Sustainability

*   **Open model:** anyone can use and extend the platform locally.
*   **Mixed service model:** the wiki can offer:

    *   advanced verification,
    *   storage space for reproducible artifacts,
    *   badges or editorial curation.

The computation cost is borne by the client,
which allows **scaling without infrastructure cost** and maintaining independence.

---

## 10. Final Essence

> A system where **logic becomes a language of shared knowledge**,
> where rules do not live on servers but in the minds and browsers of those who use them.

A **distributed ecosystem of inference**,
a *Wikipedia of living rules* where each query is, at the same time, a way of learning, verifying, and expanding what we know.