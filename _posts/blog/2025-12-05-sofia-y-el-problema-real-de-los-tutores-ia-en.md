---
title: "Sofia and the real problem with AI tutors"
excerpt: "Designing an AI tutor is not only about answering questions: it is about sustaining a long relationship without losing memory, trust, boundaries or judgement."
tags: [ai, tutors, education, product, trust]
lang: en
ref: sofia-y-el-problema-real-de-los-tutores-ia
date: 2025-12-05
modified: 2026-05-28
comments: true
permalink: /en/blog/sofia-real-problem-ai-tutors/
---

I am less and less convinced by describing an AI tutor as an "educational chatbot".

Yes, technically there is conversation. There is content search, ranking, memory, tools, generation and validation. All of that matters.

But if you stop there, you miss the delicate part.

This article is part of the [AI Product Engineering without hype](/en/ai-product-engineering/) series.

In our case, we have lived this with Sofia, the AI tutor that supports students inside the learning product. What you learn quickly is that a tutor does not live in one isolated interaction. It lives in a relationship.

The student returns today, tomorrow and next week. They return when they do not understand something, when they failed a test, when they do not know whether they are progressing, when they are blocked, when they feel guilty for not studying, when they need someone to tell them what to do next.

The essential thing is not that Sofia answers.

The essential thing is that Sofia appears in a long, emotional and repeated stretch of the student's life.

That makes tutor design much more serious than "put a chat with notes behind it".

## The relationship is part of the product

Preparing for a public exam or studying for months is lonely, repetitive and emotionally loaded.

There is frustration, guilt, fatigue, comparison with others, small victories and days when the student feels they are not moving forward. If the assistant appears every day, remembers part of the context and responds in moments of blockage, it stops being an ephemeral tool.

It becomes a presence.

That has two sides.

We have seen very beautiful interactions: users who find in Sofia a way to recover focus, understand a doubt or simply feel less alone in front of the syllabus. That has real value. A good human tutor also creates trust, calm and continuity.

But the other end exists too: less healthy relationships, excessive attribution of personality, frustration directed at the assistant or emotional dependency on an answer. There is no need to dramatize it. It is enough to recognize the pattern.

When the user starts treating the assistant as if it had its own intention, the product is no longer only solving doubts. It is participating in a relationship.

What does this teach us? In an AI tutor, the emotional bond is not a minor side effect. It is part of the design.

## A prompt defines boundaries, not only tone

When you look at Sofia's actual system prompt, the interesting part is not cosmetic. It is not "be friendly" or "use a warm tone".

The interesting part is that the prompt tries to define a relationship.

Three ideas summarize the design fairly well:

> Your scope is exam preparation...

> Do not give general advice...

> If information is missing, say so clearly and do not invent it.

That is the core.

Sofia cannot be "an AI friend for everything". It has to be a tutor. It can be warm, yes. It can motivate, yes. It can remember preferences to personalize better, yes. But it cannot become a therapist, legal adviser, financial consultant, family mediator or personal ghostwriter.

This distinction feels obvious until real users arrive.

Users do not ask following your architecture. They ask what is happening to them. Sometimes that is about studying, sometimes it surrounds studying and sometimes it goes completely outside.

There the prompt stops being style guidance and becomes product perimeter.

A well-placed limit does not make the relationship colder. It makes it more reliable.

## Memory: personalize without absorbing everything

Memory is another important piece.

Sofia can keep useful information about the student: preferences, habits, things that motivate them, study methods that work, details that make future answers less generic.

This is powerful because studying is long. If a student says they struggle to start in the morning, get stuck with long tests or feel motivated by small visible progress, that can improve future responses.

But memory also changes the relationship.

There is a connection with my experiment about how [text that sounds like me is easier for me to understand](/en/blog/when-text-sounds-like-me/). Personalization is not cosmetic. It reduces friction and makes explanations fit better in the user's head. In a product tutor, that same force demands more care, because you are not only adapting style; you are building continuity.

The question is not only "what can we remember?". It is "what is useful to remember for studying without absorbing the student's life?".

A tutor can know the student better without pretending to be a person.

## It is not a query; it is a study moment

When a student writes "I do not understand this", they are not launching a clean search.

They may be saying several things at once:

- I cannot formulate the doubt well;
- I do not know exactly which part broke;
- I need an explanation, but maybe also calm;
- I do not want to lose two hours going in circles;
- tell me the next reasonable step.

If you treat that as a keyword, you fail.

The tutor must turn an ambiguous signal into a useful action. It may need to read related content, look at progress, check today's plan or decide that the best answer is not a full explanation but a small practice or a diagnostic question.

This connects again with [useful RAG](/en/blog/useful-rag-is-not-just-embeddings/): bringing the most similar fragment is not enough. You need the context a competent person would have looked for.

In education, that context is not only content. It is also the student's state.

## Ranking becomes pedagogical

An AI tutor can do many things: explain a lesson, search a section, recommend an exercise, review progress, recall today's plan, suggest a short practice, route an issue to support or simply say "I am not sure".

The problem is not having options. The problem is choosing the right one now.

The most complete resource does not always win. Sometimes the smallest resource wins. The most brilliant explanation does not always win. Sometimes a diagnostic question wins. The most advanced content does not always win. Sometimes returning to basics wins.

This is close to [pragmatic ranking](/en/blog/pragmatic-ranking-heuristics-cheap-llm-deterministic-validation/): the goal is not to choose "something to show", but the thing that completes the user's path.

In a tutor, that path is more delicate because it affects learning. A bad recommendation does not only reduce conversion. It can damage trust or make the student study worse.

## False certainty is the dangerous failure

An AI tutor can fail in many ways: inventing an explanation, using the wrong source, confusing course state, recommending something the student cannot see, ignoring progress or answering with confidence where it should recognize uncertainty.

The dangerous failure is not "I don't know". The dangerous failure is "I know perfectly" when it does not.

In education, that hurts more because the student gives authority to the tutor. If you say something wrong with a convincing tone, the student may memorize it, apply it and lose trust later.

Trust is not fixed with a friendly tone. It is designed: correct sources, separated assumptions, explicit limits, validation of what the student can access, consistency with plan and progress, and a useful next step when there is no safe answer.

## The lesson

An AI tutor is not a chatbot with notes behind it.

It is an interface between the student, their plan, their progress, their content, their doubts and their emotional state.

The practical question is not only:

> Does it answer well?

It is:

> Does it help the student move forward without breaking trust, inventing authority or creating a relationship the product cannot care for?

That is where the interesting work begins.
