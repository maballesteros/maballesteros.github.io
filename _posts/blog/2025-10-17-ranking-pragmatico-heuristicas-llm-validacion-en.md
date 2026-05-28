---
title: "Pragmatic ranking: heuristics, a cheap LLM and deterministic validation"
excerpt: "Choosing a recommended resource should not be generative magic: if it does not solve the reader's real problem, it is better to recommend nothing."
tags: [ai, ranking, recommendations, product, llm]
lang: en
ref: ranking-pragmatico-heuristicas-llm-validacion
date: 2025-10-17
modified: 2026-05-28
comments: true
permalink: /en/blog/pragmatic-ranking-heuristics-cheap-llm-deterministic-validation/
---

This case started much less abstractly than "let's build ranking".

The real problem was simple: we have a blog post, we have a catalogue of downloadable resources, and we want to decide whether one of those resources makes sense as the main CTA.

It sounds easy.

But as soon as you look carefully, the trap appears: you can almost always find a resource that shares a keyword, an exam type, a category or a nearby intention. And if the system is hungry for conversion, the temptation is to show it.

That is where bad lead magnets begin: tangential resources, weak promises and CTAs that do not solve the reader's problem but "sort of relate".

This article is part of the [AI Product Engineering without hype](/en/ai-product-engineering/) series.

The essential point is this:

> recommending something is also an editorial responsibility.

It is not enough for the resource to exist. It has to fit.

## The typical failure: confusing topic with problem

The bad version of the system says:

> This post is about healthcare exams. This resource is also about healthcare exams. Recommend it.

But sharing a topic is not enough.

A reader does not arrive at a post with a category in their head. They arrive with a need: understand a call for applications, resolve a doubt, compare options, download a diagram, decide whether to start studying, clarify a requirement.

If the recommended resource does not help with that need, the ranking has failed, even if it is semantically similar.

This is close to the [useful RAG](/en/blog/useful-rag-is-not-just-embeddings/) problem: you do not want the closest chunk; you want the context a competent person would have looked for. Here it is the same. You do not want the most similar resource. You want the next step that actually makes sense.

## The pattern I like

The pragmatic approach is simple:

1. Send the real catalogue.
2. Let a small model help read the fit.
3. Validate deterministically that the chosen resource exists and can be published.
4. If there is no strong fit, recommend nothing.

The fourth point is the important one.

A decent recommendation system must not only know how to choose. It must also know how to say:

> There is nothing good enough here.

In our case, the model does not receive an open-ended prompt like "find something useful". It receives the post, its intention, some metadata and a catalogue of real resources. Its job is not to invent. Its job is to classify candidates:

- strong, if it solves the same main problem as the reader;
- possible, if it shares the topic but the fit is not perfect;
- rejected, if the recommendation would be forced.

This is much humbler than "an intelligent recommendation system". Precisely because of that, it works better.

## Boring validation saves the system

The other half of the design is less shiny: the model can propose, but it cannot materialize reality.

If it returns a resource, the backend checks that the resource exists, the slug exists, it is published, the URL is correct and we are not rendering something invented or retired.

This is plumbing. It is also what prevents the worst product failure an AI system can make: sounding convincing while recommending something that does not exist, should not be visible or does not fit.

Generation produces a proposal. Validation decides whether that proposal may leave the building.

## Sometimes the best CTA is no CTA

This is the part I care about most.

Not forcing a weak resource is a product decision. It is not "losing conversion". It is avoiding a product that looks desperate.

If no resource solves the reader's problem, there are more honest paths: take them to the method, a course, a newsletter, a generic registration or simply avoid interrupting the article with a download that does not belong there.

Pragmatic ranking does not maximize "something to show". It maximizes fit.

The same separation helps when reading [product feedback](/en/blog/product-feedback-loops-from-opinions-to-decisions/): one isolated comment should not automatically become roadmap. One isolated similarity should not automatically become a CTA. In both cases, you need context, not just signal.

## The lesson

I increasingly distrust systems that use AI to cover a lack of criterion.

Here, AI adds value because the problem is bounded: real catalogue, small task, cheap model, structured output and hard validation.

The practical question is not:

> What resource can the model recommend?

It is:

> What resource would a responsible person recommend, knowing that recommending nothing is also allowed?

That small difference separates a useful recommendation from a banner with commercial anxiety.
