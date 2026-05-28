---
title: "A technical error resolution feedback loop in GoKoan"
excerpt: "A big mistake pushed me to build a closed loop of detection, triage, tests and safe fixes with Codex as operator."
tags: [gokoan, codex, ai, bugs, tdd, feedback-loop]
lang: en
ref: feedback-loop-resolucion-errores-gokoan
date: 2026-01-13
modified: 2026-05-28
comments: true
permalink: /en/blog/gokoan-technical-error-resolution-feedback-loop/
---

Today I messed up. A lot. And I am **very happy** about it.

Not because of the error itself, but because of what it triggered: for the first time I felt that GoKoan was not only "an app we fix". It was starting to develop reflexes.

The essential point is this: if a product has production errors, and those errors are recorded well, you already have the fuel for a closed loop: **detect -> prioritize -> confirm -> fix -> verify -> leave a trace**.

Not debugging. A feedback loop.

And yes, that sounds too good. That is why I imposed a brutal condition: **only if it is 100% safe**.

## Codex stops being generator and becomes operator

Until recently my flow was typical: Codex produces code, I review, test and adjust.

But once you let it do more than write -- execute, inspect data, generate logs, iterate -- the role changes. You are no longer using a glorified autocomplete. You are orchestrating an agent with hands.

That is dangerous if you do not set limits. But with the right limits, something beautiful appears: a mechanic working with the hood open, checklist in hand, not touching what it does not understand.

## The loop

The key piece was already solved: **errors live in the database**. That means the input is clear. Not feelings. Not "I think". Concrete events with context.

With that, I built an extension/skill for Codex:

1. **Extract.**
   Run a script that reads recent production errors and writes a digest file that can be passed to an LLM.

2. **Triage.**
   Analyze the digest and decide what matters most by frequency, severity, affected area and repetition.

3. **Fix with TDD.**
   First create a test that reproduces or confirms the failure. Then apply the fix. Then run the test to verify the fix is real and not placebo.

4. **Commit with rules.**
   Only if everything is clean, commit following repository conventions.

This is not autopilot. It is a loop running inside a very narrow perimeter.

## "100% safe" is the product boundary

The interesting part is not that Codex fixes things. Many people can get there by iterating.

The interesting part is that the system acts only when the change is obviously bounded.

My mental rule was:

> If there is a reasonable chance the fix requires product judgement, deep refactoring, migrations or touching sensitive areas, it stops.

In practice, "safe" means small local changes, tests executed, no production data writes beyond reading, no secrets, no destructive operations and a clean exit: when in doubt, do not act.

## The result

With this loop, Codex fixed around six errors and left a release ready.

The number is nice, but the feeling mattered more. Instead of "me fighting a bug list", it felt like the system absorbing hits and closing wounds with stitches and labels.

More importantly, Codex did not detect additional potential errors inside that perimeter. That does not mean "perfect". It means the cycle closed with reasonable verification.

## Why this matters

There is a trap with AI in development: you can produce a lot and still live in fire-fighting mode.

This loop changes the game because it turns the error into structured input, not emotional interruption. It moves you from extinguishing fires to designing reflexes.

In plain terms: a system like this does not eliminate bugs. It eliminates part of the cognitive cost of bugs.

And in a living codebase, that is gold.

## The lesson

Three decisions make this repeatable without getting carried away:

1. **No observability, no loop.**
   If errors are not captured well, there is nothing to automate.

2. **The test is the contract.**
   Without a test, this is magic. With a test, it starts being engineering.

3. **The perimeter is the product.**
   The intelligence is not that Codex can code. It is that the system knows when not to touch anything.

The practical question is:

> Which part of your product could benefit from a detect -> test -> fix -> verify loop if you first forced yourself to define a 100% safe perimeter?
