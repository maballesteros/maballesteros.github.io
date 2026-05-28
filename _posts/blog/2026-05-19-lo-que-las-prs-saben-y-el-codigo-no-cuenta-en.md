---
title: "What PRs know that the code does not tell"
excerpt: "How I used AI to turn 400 pull requests and their comments into backend agentic guides that are more useful than documentation written from scratch."
tags: [ai, agents, codex, backend, engineering]
lang: en
ref: lo-que-las-prs-saben-y-el-codigo-no-cuenta
date: 2026-05-19
modified: 2026-05-28
comments: true
permalink: /en/blog/what-prs-know-that-code-does-not-tell/
---

The other day, in a team meeting about AI usage, a reasonable complaint came back again:

> AI writes code, but sometimes I do not understand it.
> It does not quite follow our rules.
> It does not write like we would.

At first this sounds like criticism of AI. But the more I thought about it, the clearer it became that the problem was not only the agent. It was ours too.

This text complements the [AI Product Engineering without hype](/en/ai-product-engineering/) series from the team and repository side: how to turn AI and agents into a real engineering practice, not only a code generation tool.

It is another step in the [programming paradigm shift](/en/blog/programming-paradigm-shift/). If the engineer's work moves from writing every line to specifying, reviewing and orchestrating, the instructions given to the agent stop being auxiliary documentation. They become part of the production system.

We were asking Codex to behave like "one of the team", but many of the things that define how the team works were not written anywhere. They lived in people's heads. Or worse: they were scattered across hundreds of PR comments.

The code tells how the system is built.

The PRs tell how we learned not to build it badly.

That second part is gold for an agent.

So I ran an experiment. Instead of writing a backend agentic guide from scratch, I asked AI to help build it in two phases:

1. first, by reading the code itself;
2. then, by mining PR comments to extract the fine details the code no longer teaches.

The first phase gave structure. The second gave character.

## Phase 1: let AI read the repo

The obvious part was asking Codex to analyze the backend as if a new person were joining the team.

Not "read everything and tell me things", but something concrete:

- what modules exist;
- which responsibilities live in each layer;
- which patterns repeat;
- how components are initialized;
- how things are named;
- where tests live;
- how configuration is handled;
- which architectural signals seem important.

This works surprisingly well. A large repo, if it has some coherence, speaks quite a lot.

If controllers delegate in a similar way, services follow a pattern, tests have a recognizable style and domain boundaries are stable enough, AI can extract a reasonable base guide.

But this has a limit.

The code shows the final result. It does not show all the paths the team rejected to get there.

A clean repo does not tell you: this used to be in the controller and was removed because it mixed lifecycle and domain; this shared helper looked like a good idea but created coupling; this name is technically correct but loses an important domain nuance; this log does not help when production breaks.

That is not in the code.

That is in reviews.

What does this teach us? Analyzing code is necessary, but insufficient. It gives you the grammar of the repo, not its healthy obsessions.

## Phase 2: use PRs as team memory

Then came the interesting part.

A colleague said something that clicked: PR comments contain a lot of unwritten documentation. Not formal documentation. Battle documentation.

So we ran the experiment over the last **400 PRs**.

The corpus had **480 inline comments**. After filtering noise, we kept **291 human comments** and **172 useful human root comments**. Enough to see patterns.

We were not looking for "who makes more mistakes" or "which reviewer is annoying". That would be a poor reading. We wanted something else:

> Which comments appear again and again because the repo has rules nobody has written yet?

Clear families appeared.

Responsibility and lifecycle: components, controllers and models mixed in ways that worked but did not respect the architecture.

Shared infra and configuration: common helpers introduced too early, shared APIs without a clear consumer, changes that forced unnecessary churn.

UI/XML/CSS issues, async behavior, diagnostics, naming, tests, premature abstractions.

The value was not each individual case. The value was repetition.

When you see the same kind of comment ten, twelve or thirteen times, it stops being one person's preference. It starts being a team convention that has not found its place in documentation yet.

PRs are not only a quality control mechanism. They are a corpus of technical culture.

## The detail you only see when it is missing

There is a stubborn kind of knowledge: details nobody explains well until someone breaks them.

Not grand architectural principles. Smaller things:

- this name is confusing here;
- this helper should not exist yet;
- this change touches too many layers;
- this log gives no diagnostic context;
- this test verifies implementation, not behavior;
- this initialization happens too early;
- this abstraction looks elegant but will be expensive in this repo.

That knowledge is hard to extract by looking only at code because the final code is already corrected. The learning trace remained in the PR conversation.

After mining PRs you can write much more useful instructions:

> Do not extract a shared helper if there is only one real consumer.
> Do not mix component lifecycle with model responsibility.
> If you introduce a shared API, explain who consumes it now and which contract it stabilizes.
> Before handoff, check whether you moved functions unnecessarily or left generated artefacts.

That is not a pretty recommendation. It is operational memory.

It also reduces the cognitive load of the developer-orchestrator. In [when AI moves faster than your head](/en/blog/when-ai-moves-faster-than-your-head/), I wrote about the open loops created by working with agents. A good checklist closes some of those loops: I no longer need to remember every repo habit in every review; the system puts them in front of me when needed.

## From report to mechanism

The danger of this kind of experiment is ending with a beautiful report nobody uses.

"We analyzed 400 PRs, here are the conclusions, interesting stuff."

That is not enough.

The learning had to become mechanisms:

1. **Changes in the backend architecture guide.**
   Not a philosophical rewrite, but concrete adjustments where PRs showed repeated friction.

2. **A review checklist.**
   So a person or an agent can check the usual points before finishing a task.

3. **Strong instructions in `AGENTS.md`.**
   So the agent treats the checklist as part of the handoff contract in non-trivial work or PR review.

A passive guide says: here are our preferences.

An operational guide says: before delivering, check this, because historically this is where we fail.

The goal is not more docs. It is fewer repeated comments in future PRs.

## The loop: every review should improve the agent

The part I liked most was not the initial mining. It was the consequence.

If a PR reveals an unwritten rule, that rule should not die in a GitHub thread.

It should enter a loop:

1. the agent works;
2. the human reviews;
3. a reusable comment appears;
4. that comment becomes guide, checklist or rule;
5. the next agent run starts with that learning.

The editorial version of this pattern appears in [executable guardrails and living policies](/en/blog/executable-guardrails-living-policies-not-pretty-documents/). There human feedback feeds content policies. Here it feeds repo guides, checklists and agent instructions. The underlying pattern is the same: repeatable corrections should become mechanisms.

Without the loop, each repeated comment feels like frustration:

> Again the AI did this wrong.

With the loop, the comment becomes training material for the system:

> This just revealed a convention we had not written yet.

The agent will still fail. But repeated failures stop being pure cost and become fuel.

## The lesson

Working well with agents is not only about choosing the right model. It is about building operational context.

And that context does not come only from code.

It comes from code, yes. But also from PRs, reviews, healthy team habits and the tiny "not like this here" comments that kept the repo standing for years without anybody calling them architecture.

The practical question is simple:

> Which PR comment is your team repeating so often that it should stop being a comment and become a system?
