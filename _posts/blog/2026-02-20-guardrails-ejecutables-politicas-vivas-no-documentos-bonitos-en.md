---
title: "Executable guardrails: living policies, not pretty documents"
excerpt: "The leap was not writing better skills, but separating process guides from content policies so agents can produce, audit and learn from human feedback."
tags: [ai, agents, guardrails, architecture, quality]
lang: en
ref: guardrails-ejecutables-politicas-vivas-no-documentos-bonitos
date: 2026-02-20
modified: 2026-05-28
comments: true
permalink: /en/blog/executable-guardrails-living-policies-not-pretty-documents/
---

There is a recognizable phase when you start using AI to produce or review content:

> We need better guides.

And yes, of course. You need better guides. But at some point that stops being enough.

This article is part of the [AI Product Engineering without hype](/en/ai-product-engineering/) series.

At first, our guidance mostly lived as skills: operational documents that told agents how to work, what steps to follow, what tools to use, when to open a review, how to hand off, what not to touch and when to ask for help.

That is good. It is necessary.

But then a distinction became central for me: a skill guides the process; a policy defines the conditions the material must satisfy.

This is related to what I described in the [7 laws of agentic development](/en/blog/7-laws-agentic-development-part-1-repo-constitution/). When throughput goes up, coherence cannot depend only on human attention. Part of the criterion has to move into contracts, invariants and verification mechanisms. In content, the same thing happens.

The real problem was not only that the agent had not read the documentation. It was more uncomfortable: our criterion for content was often less defined than we thought.

We thought we knew what "a good post", "a good landing page", "a correct learning activity" or "a useful explanation" meant. But when several humans, or several agents, work on those assets, the truth appears: each person carries a slightly different version of the standard.

The core of governance was not more control. It was separating process and content, and turning dispersed editorial judgement into policies that can be read, executed and improved.

## What was undefined

The blog was a very clear example.

On paper it looked simple: title, content, category, SEO, image, links and CTA.

But real reviews expose questions that "do it well" does not answer:

- Is the category decided by the main topic, a secondary mention or the product we want to push?
- Is a long post better, or are we adding filler to satisfy an arbitrary length?
- Should we always insert a downloadable resource, or only when it solves the same problem?
- Does a CTA alone work, or does it need a coherent path with internal links and next step?
- Does a FAQ add clarity, or is it just a ritual section for SEO?

These look like details. They are not.

They are exactly the points where we used to depend on taste, memory, oral context or review by someone experienced in the product. When an agent missed them, the easy reaction was "AI does not understand our standard".

But often the standard had not been written clearly enough.

## Skills for process, policies for content

The important leap was to stop asking one guide to do two jobs.

A work guide answers process questions: how to open a review, what steps the agent follows, how to register the result, when the human reviews.

A policy answers a different question: what must be true of the content for us to accept it as good.

That distinction changes everything. If you mix both in the same guide, you get long documents nobody reads fully and the agent interprets as best it can. If you separate process and content, the agent knows how to work on one side and which standard to satisfy on the other.

A policy is not a PDF of recommendations. It is an operational contract over the final asset.

It must also be readable by humans. This matters. Rules need to be grouped around large concepts: editorial classification, search intent, content quality, CTA, links, freshness, didactic composition. That hierarchy helps execution, but also understanding.

Some checks are mechanical: valid slug, no H1 inside the body, required fields, valid HTML, no double spaces, existing category, basic internal linking. Those should be code.

Other checks need judgement, but not vague judgement. "Does the recommended resource solve the same problem as the reader?" is not fully mechanical, but it is a concrete audit question. It is much better than "does this look good?".

## One policy, two readings

The part I like most is that the same policy serves production and audit.

For the producer agent, the policy appears as rules:

- the post must answer the main search intent from the beginning;
- the category must come from the current catalogue and fit the reader's main problem;
- a resource must not be inserted if it does not solve the same problem;
- editorial exceptions must be declared and justified.

For the auditor agent, each rule becomes a checklist question:

- Does the post answer the main search intent from the beginning?
- Does the selected category fit the reader's main problem?
- Does the recommended resource solve the same problem?
- Is the exception declared and justified?

Producer and auditor stop speaking different languages. One works with production rules; the other verifies with questions. Both look at the same contract.

## Review aggregates, not loose fields

A post is not only a body field. A landing page is not only a hero. A learning activity is not only an explanation.

Each asset is an editorial unit with pieces that affect each other. Change a post category and you affect SEO path, internal links, CTA type and recommended resource. Generate legal learning content and you must respect legal hierarchy, separate literal text from explanation and anchor questions correctly.

One of the big wins was reviewing aggregates: giving the agent a coherent snapshot of the whole editable asset, its context, proposed changes and applicable policies.

This does not erase domain semantics. It lets each domain contribute its own policy without forcing the agent to learn a different workflow for every content type.

## The producer-auditor loop

The pattern that interests me most now is the loop between producer agent, auditor agent and human.

It is simple:

1. a main agent produces or corrects content;
2. an independent auditor checks it against policies;
3. the main agent receives the audit and corrects;
4. the cycle repeats until they converge;
5. a person reviews the result and leaves comments.

The human comment is not only for that case.

First, it is direct feedback: this CTA does not fit, this classification is weak, this distinction is missing. The agent should correct the asset.

But it also leaves a second signal: maybe the policy did not say that precisely enough. Maybe it did not say it at all.

If the comment reveals a reusable pattern, it should not remain oral wisdom or a recurring complaint. It should feed the policy: add a rule, clarify an exception, change severity or split two criteria that were mixed.

This is the same principle I later applied to [mining pull requests for agentic backend guides](/en/blog/what-prs-know-that-code-does-not-tell/): repeated review feedback should become mechanism.

## The lesson

I now understand guardrails differently.

They are not only a fence around the agent so it does not break things.

They are a way to crystallize judgement: turn implicit standards into contracts that can be reviewed, executed and improved.

A guide says how we would like to work. A living policy helps us work that way, detect when we are not doing it and learn why.
