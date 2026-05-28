---
title: "How to ship a large app in 28 days without turning the code into a bonfire"
excerpt: "Lessons from Sora for Android with Codex: AI-assisted programming does not reduce the need for rigor; it increases it."
tags: [ai, codex, productivity, strategy, android]
lang: en
ref: como-se-shippea-una-app-grande-en-28-dias
date: 2025-12-13
modified: 2026-05-28
comments: true
permalink: /en/blog/shipping-large-app-in-28-days/
---

There is a recurring engineering fantasy: "if we had twice as many hands, we would ship in half the time". Then reality arrives, calls itself coordination, and runs over you smiling.

OpenAI's article about building **Sora for Android in 28 days** is interesting precisely because it does not sell magic. It shows where the bottleneck moves when you put an agent like Codex inside the loop.

The attractive data point is strong: they launched in November, reached **#1 on Google Play** on launch day, Android users generated **more than one million videos in the first 24 hours**, and behind it were **four engineers**, a window from **Oct 8 to Nov 5, 2025**, and around **5 billion Codex tokens**. Still, they reported **99.9% crash-free**.

The essential thing is not the number of days. It is the pattern.

## Brooks did not die

The article begins with Brooks' Law: adding people to a late project makes it later. The relevant move is how they reinterpret it. With Codex, you can add hands cheaply -- more sessions, more parallelism -- but coordination does not disappear. It moves.

You stop being only the person who writes code and become the person who decides, directs, reviews and orchestrates. That is the [programming paradigm shift](/en/blog/programming-paradigm-shift/) in practice.

The real speed-up does not come from typing faster. It comes from reducing dead time and letting implementation advance while you sleep, but only if you did the hard work first: define the lane.

That resonates with [when AI moves faster than your head](/en/blog/when-ai-moves-faster-than-your-head/): Codex does not get blocked by context switching. You do.

## Treat Codex like a new senior

The best metaphor is practical: Codex works if you treat it like a senior engineer who just joined the team.

It is capable, reads fast and produces a lot. But it does not know your invisible rules or product intuition.

It needs guidance where humans usually need guidance too: patterns, strategy, real user behavior, "how we do things here", UX friction, onboarding and architectural judgment.

Where it shines is also clear: reading large codebases, trying alternatives, writing tests, responding to CI logs, investigating SDKs and running disposable sessions in parallel.

Codex does not replace judgement. It amplifies the impact of judgement. If the judgement is vague, it amplifies chaos.

## "85% written by Codex" is not autopilot

The central lesson is that they first built the foundation by hand: architecture, modularization, dependency injection, navigation, auth and base networking.

Then they implemented representative features end-to-end so the agent could see examples of what "correct" meant in that codebase.

From there, Codex could fill in a lot. The claim that the project was around 85% written by Codex is best read as "85% of typing", not "85% of decisions".

The anti-pattern is the single prompt: "Build the Android app based on iOS. Go." It may produce something, but without context it is a lottery.

The sober lesson is:

> Do not only tell it what you want. Show it how you want it.

## Planning before coding

For non-trivial changes, the best workflow is to ask Codex to read the system first, explain its understanding, let the human correct that understanding, and then co-create a plan that looks like a small design doc: which files to touch, which new states exist, which logic goes where.

Only then should implementation begin.

That planning loop creates traceability of intention. When the diff arrives, you are not reviewing blind code. You are comparing implementation against a plan.

## The lesson

AI-assisted programming does not reduce the need for rigor. It increases it.

The agent optimizes for getting from A to B now. Someone still has to hold the map of constraints, system design and future code health.

If you want speed with agents, invest first in invariants, examples, rules and plans. What scales is not typing. What scales is your ability to direct and review without losing the plot.

The important question is not:

> How much code did AI write?

It is:

> Which decisions did AI free me to make better?

[^1]: [How we used Codex to build Sora for Android in 28 days](https://openai.com/index/shipping-sora-for-android-with-codex/)
