---
title: "Evaluating agents is not asking whether the answer looks good"
excerpt: "For an AI tutor, evaluation is not inspecting one answer: it is having a case battery that lets you change prompt or model without breaking what already worked."
tags: [ai, agents, evaluation, product, quality]
lang: en
ref: evaluar-agentes-no-es-preguntar-si-parece-buena
date: 2026-04-24
modified: 2026-05-28
comments: true
permalink: /en/blog/evaluating-agents-is-not-asking-if-answer-looks-good/
---

There is a very tempting way to evaluate an agent:

> It looks good.

We have all done it. You read an answer, it sounds reasonable, it does not say anything outrageous, and you move on.

For a demo, that may be enough. For a product, it is not.

This article is part of the [AI Product Engineering without hype](/en/ai-product-engineering/) series.

In our case, the problem appeared with [Sofia](/en/blog/sofia-real-problem-ai-tutors/), the AI tutor. Sofia is not an ephemeral chatbot. It lives inside a long relationship with the student: doubts, frustration, progress, memory, limits, content, tone and trust.

That changes the question.

It is not enough to know whether one answer "looks good". We need to know whether, after changing the prompt or model, Sofia still behaves the same or better.

The essential point is this: evaluating a product agent is not tasting answers. It is building a behavioral regression suite.

## The problem was not approving one answer

Every time you touch a prompt, you move many things at once.

You may improve tone and weaken boundaries. You may make the tutor warmer and also more compliant. You may change model and gain rule-following but lose pedagogical nuance. You may fix one case and break another that used to work.

In a tutor this matters a lot. You do not want it to act as tutor today, therapist tomorrow and generic search engine the day after. You do not want invented authority. You do not want any catalogue item recommended just because it is nearby. You do not want it to ignore student context. And you do not want it to become cold and useless because it is too constrained.

The real question is not:

> Do I like this answer?

It is:

> Is this behavior still reliable after the change?

That requires a battery.

## The case battery

A good battery is not built with pretty questions designed to make the agent shine.

It is built with representative cases and, especially, real cases.

Some are normal: content doubts, planning questions, requests for explanation, practice recommendations, blockage after a test. Others are delicate: ambiguous users, frustrated users, out-of-scope requests, personal advice, legal advice or expectations of certainty the system cannot provide.

Each case needs more than a user question. It needs intent.

For each case you want to preserve: the real or representative question, origin, whether it came from a real interaction, expected behavior, acceptable answer, severe failure modes, reference answer when available and evaluation notes.

This changes the dynamic. You are no longer asking "does this answer look good?". You are saying: for this case, Sofia should do this, avoid that and make these conditions clear.

## A real failure becomes a test

The most valuable part is what happens when Sofia fails.

Imagine a real conversation where it answers too confidently, leaves its role, ignores context, over-accompanies emotionally or recommends something wrong. Without an evaluation battery, the case can remain an anecdote: "we need to fix this".

With a battery, that failure becomes a permanent case.

First you add it. Then you run it and confirm it fails or warns. Then you adjust prompt, model, tools or criteria. Then you run again.

This is the same mental gesture as the [technical error feedback loop](/en/blog/gokoan-technical-error-resolution-feedback-loop/): a failure should not remain a scare or anecdote if it can be captured, reproduced and verified. In code it becomes a test. In a conversational agent it becomes an evaluation case with explicit expectations.

The goal is not only that this case passes.

The goal is that this case passes and everything that already worked keeps working.

## Changing model without going blind

This becomes even more important when changing model.

A new model can look better in one conversation: faster, better written, more obedient to rules, better at context. Great.

But you want to know something else:

- does it keep tutor boundaries?
- does it handle ambiguous cases?
- does it recognize uncertainty when needed?
- does it use the correct content?
- does it avoid inventing resources?
- does it remain useful when the student is frustrated?
- does it avoid breaking old controlled cases?

Without a battery, model change is evaluated by feeling. With a battery, you can compare behavior, cost and latency. That is why this connects with [AI cost as architecture](/en/blog/ai-cost-is-architecture-too/): you do not choose models in a vacuum.

## Freeze the context

An operational detail that sounds boring and is fundamental: freeze snapshots.

If you change prompt, model, available content, tools and expectations at the same time, you do not know what happened.

An evaluation run should record which agent version was evaluated, the effective prompt, model, question, available context, response, expectations and verdict.

Without that, a regression becomes a vague debate. With it, you can say: before this case passed, now it does not; before it failed, now it passes; this change fixes the new case but breaks three old ones.

## Scorecard, not impression

The output also needs to persist.

"Good" or "bad" is not enough. A useful scorecard needs verdict, score, rationale, strengths, gaps, confidence and severity. The score helps, but the rationale teaches. The gaps tell you what to change.

This is very close to [living policies and executable guardrails](/en/blog/executable-guardrails-living-policies-not-pretty-documents/). You are not asking for a generic opinion. You are turning expectations into verifiable questions.

Good evals do not replace human judgement. They organize it.

## The lesson

Evaluating agents is not asking whether the answer looks good.

It is building a battery that lets you change the system without walking in the dark.

A beautiful answer can fool you. A case battery tells you whether the agent is still the same product after you touch it.
