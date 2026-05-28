---
title: "Product feedback loops: from loose opinions to decisions"
excerpt: "Not all user feedback is an opinion: sometimes it is a possible editorial correction, and sometimes it is a product signal that needs context."
tags: [product, ai, feedback, content, decision]
lang: en
ref: feedback-loops-producto-opiniones-decisiones
date: 2025-09-19
modified: 2026-05-28
comments: true
permalink: /en/blog/product-feedback-loops-from-opinions-to-decisions/
---

There is a sentence that sounds good and says almost nothing:

> We have user feedback.

Fine. What does that mean exactly?

Under that label you can put very different things: a student reporting that a test answer is wrong, someone saying an explanation is confusing, a thumbs-down on a screen, a rating after using a feature, or a free-form comment like "this confused me".

All of that is feedback. Treating it as the same thing is a very good way to create an inbox full of noise.

This article is part of the [AI Product Engineering without hype](/en/ai-product-engineering/) series.

In an educational product, there is not one feedback loop. There are at least two:

1. an **editorial quality** loop: is what we teach or ask correct?
2. a **product** loop: does this help the user, create value or create friction?

They look related. They are not the same.

## When the user is not giving an opinion

The clearest case is a user reporting a question.

Imagine a student takes a test, chooses an option, the system marks it as wrong, and the student says:

> I think the correct answer is wrong.

This is not a soft product opinion. It is a possible editorial failure.

And an editorial failure has evidence behind it: the statement, the options, the answer marked as correct, the explanation, the associated teaching content and the user's report.

Solving this manually is not intellectually impossible, but it is tedious: read the report, locate the question, understand the dispute, review the related content, decide whether the user is right, write an answer and, if needed, prepare the correction.

This is a very good job for an agent. Not so the agent can decide the truth and publish changes. That would be reckless. The useful role is **editorial preparer**: read the report, contrast the question with the related content, explain whether there is a real error, draft a response to the user and, when appropriate, prepare a corrected version of the activity.

This connects directly with [useful RAG](/en/blog/useful-rag-is-not-just-embeddings/). The agent cannot just retrieve a similar passage. It must know which pieces of the case file to open: question, explanation, associated content, syllabus section, user report and publication state.

The human no longer starts from zero. They start from a reasoned proposal.

What does this teach us? AI is most useful here when it arrives at the meeting with the file already read, not when it pretends to be the final judge.

## Study material follows the same pattern

The same happens with teaching content.

A user may report that an explanation is unclear, contradictory, missing nuance or simply wrong. Now you are not correcting one question. You are reviewing a piece of material that supports learning.

The mechanism is almost the same: the report arrives, the system locates the affected content, the agent reads related context, proposes an interpretation, prepares a correction when needed and a person validates before anything public changes.

The point is not "automating content". The point is reducing the time between a useful user signal and a reviewable editorial improvement.

The user is not only complaining. The user is helping train product quality. The agent turns that help into something the team can process.

## Product feedback is a different lane

The second lane is different.

Here we are not asking whether an answer was correct. We are asking whether part of the product works for the person using it.

That is where in-app campaigns make sense: a small widget, a thumbs up or down, a contextual question, a quick rating or a free-form comment after using a feature.

This feedback does not look for factual truth. It looks for product signal:

- this screen is understandable;
- this flow creates friction;
- this feature creates value;
- this change went unnoticed;
- the user expected something else;
- something damaged trust.

One individual comment may be gold, but it may also be anecdote. This lane needs aggregation, context of capture, segmentation and follow-up. If someone says "I don't like this", the useful question is not "do we add it to the roadmap?". The useful questions are: how many people say it, where does it appear, what were they trying to do and what changed afterwards?

## The trap is mixing both lanes

The easy mistake is putting everything in the same backlog: a possibly wrong question, a confusing explanation, a thumbs-down on a screen, a UX complaint and a commercial suggestion.

An editorial report needs evidence and resolution: correct, incorrect, doubtful, corrected, answered. Product feedback needs patterns: volume, segment, recurrence, impact, opportunity.

If you mix them, content errors become opinions and product signals become isolated tickets. Both outcomes are bad.

Lane separation is not bureaucracy. It is mental hygiene.

## AI accelerates the loop; it does not own the criterion

AI fits both lanes, but with different roles.

In editorial quality, it prepares: gather the case, read context, compare, argue, draft a response and prepare a correction.

In product, it analyzes: group comments, summarize recurring themes, detect friction, separate signal from noise and help formulate hypotheses.

The reusable piece is not "put AI in feedback". It is designing the mechanism: what context it reads, what proposal it produces, what evidence it leaves and where the human enters.

If the loop is broken, AI only makes the confusion faster.

## The lesson

I am less and less interested in "listening to users" as a generic slogan.

Listening matters, of course. But value appears when you know what mechanism is activated afterwards.

If the user reports a question, I want an editorial loop: evidence, contrast, proposal, validation and response.

If the user rates a feature, I want a product loop: contextual capture, aggregation, reading, hypothesis, decision and follow-up.

The practical question is simple:

> When feedback arrives, do we know whether it is a possible editorial correction or a product signal?

If not, we do not have a feedback loop. We have an inbox with good intentions.
