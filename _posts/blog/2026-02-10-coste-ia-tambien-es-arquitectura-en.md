---
title: "AI cost is architecture too"
excerpt: "The invoice only tells you how much you spent. Architecture starts when you know which flow, model and user consumed it."
tags: [ai, llm, cost, latency, architecture]
lang: en
ref: coste-ia-tambien-es-arquitectura
date: 2026-02-10
modified: 2026-05-28
comments: true
permalink: /en/blog/ai-cost-is-architecture-too/
---

For a while you can live with a comfortable lie:

> AI costs money, yes, but we will see it in the provider invoice.

That works while AI is an experiment, a hidden button or a demo used by a few people. The problem arrives when AI stops being an add-on and starts appearing everywhere: conversational assistants, content generation, editorial prompts, new agent flows and tools connected to your own system.

At that point the monthly invoice no longer explains anything. It tells you how much you spent, but not which flow caused it, which user concentrated it, which model is oversized or which prompt became a token grinder without anybody noticing.

This article is part of the [AI Product Engineering without hype](/en/ai-product-engineering/) series.

The essential point is this: AI cost is not only finance. It is a property of system design.

## The invoice does not tell you where it hurts

In our case, we did not have "one AI". We had several ways of using models at the same time.

There were assistants, with long conversations and accumulated context. There was content generation with more classical prompts. There were specific analysis, rewriting, classification and editorial support tasks. And there were newer agent flows that used tools, queried product information and operated with more structure.

All of that consumes tokens, but not in the same way.

A short assistant answer can be cheap. A massive generation operation can be expensive. An agent can look reasonable in a single request but hide several internal calls. A small model can solve a classification task perfectly, while another flow genuinely needs a stronger model.

If you only look at the aggregated invoice, all of this becomes flat.

What does this teach us? In an AI product, the unit of analysis cannot be "we spent X". It has to be "this flow, with this model, for this kind of user, costs X and takes Y".

## Every call needs a surname

The useful solution was not a beautiful dashboard. It was less glamorous and more important: every model call needed a surname.

Surname means business context.

It is not enough to know that tokens were consumed. You need to know whether they came from an assistant, a content generation flow, an editorial task, an agent, an auxiliary search or an experiment. You need the model, input tokens, output tokens, cached tokens, reasoning tokens, latency and the user or account that can be attributed.

With that information, the questions change:

- which part of the product concentrates cost?
- which users consume abnormally?
- which prompts are growing too much?
- where are we using an expensive model by inertia?
- which tasks can be solved with a smaller model?
- which flows need explicit limits?

The interesting lesson was that measuring was not only about saving money. It was about designing better.

## The day we saw entire laws in prompts

One of the dumbest and most revealing examples was seeing users paste entire laws into a prompt.

From their point of view it made sense. If the product accepts free text and the user wants AI help with a law, why not paste the whole law? The problem is that for the system this is not a normal question. It is a huge, expensive and often unnecessary input.

Before visibility, this behavior was diluted. You could see cost going up, but not clearly that part of it came from disproportionate requests. After instrumentation, it was obvious.

Then the conversation changes. It is no longer "users spend too much". It is: a reasonable request cannot be 60K tokens. We need limits, better guidance, a clear explanation when the text is too long and alternatives: summarize first, select fragments, ask for a specific part or use another flow when the full document really matters.

Cost crosses retrieval here. If the system knows how to find context, as I wrote in [useful RAG](/en/blog/useful-rag-is-not-just-embeddings/), you do not need to force the user to paste everything.

Limits are not a defensive gesture against users. They are part of the interface.

## Optimization is not only reducing tokens

Once you have traceability, more concrete decisions appear.

Some are obvious: length limits, fewer useless retries, context trimming, caching where it makes sense. Others are product decisions: separate cheap frequent flows from expensive exceptional flows, warn before a heavy operation, degrade gracefully when time runs out, decide which tasks need a perfect answer and which need a good-enough, fast and cheap answer.

There is also a simple idea that takes time to internalize: not everything deserves the most expensive model.

Some tasks need serious reasoning. Many others need classification, lightweight ranking, structured extraction, controlled rewriting or a bounded decision. In those cases, a fast cheap model can be better architecture than a stronger one because it responds earlier, spends less and preserves the strong model for where it matters.

This is the same logic behind [pragmatic ranking](/en/blog/pragmatic-ranking-heuristics-cheap-llm-deterministic-validation/): if the task is bounded, the catalogue is real and the output is validated deterministically, you do not need to ask the model to "be smart" in the abstract. You need it to make a small decision inside a clear lane.

The goal is not to spend the minimum. The goal is to align cost with the value of each operation.

## Legacy, agents and tools in the same picture

Real AI architecture does not start clean.

Old and new things coexist: classical completion prompts, chats, assistants, tool-based flows, different models and different reporting formats for tokens, cache, output or reasoning.

If each part is measured differently, you are back to the initial problem. You have data, but no operational picture. That is why we needed a common layer that allowed comparison while preserving the differences below.

An assistant is not optimized like batch generation. An agent with tools does not behave like a flat prompt. An auxiliary search does not have the same latency budget as the final answer. But all of them compete for the same margin, the same experience and the same trust.

In products like [Sofia](/en/blog/sofia-real-problem-ai-tutors/), this becomes visible: the assistant needs memory, retrieval, limits and tone, but it also needs to be fast and sustainable.

## The lesson

The invoice only tells you how much you spent. Architecture starts when you can explain why.

If tomorrow your AI product usage grew by 10x, which part of the system would scare you if it remained unlimited?
