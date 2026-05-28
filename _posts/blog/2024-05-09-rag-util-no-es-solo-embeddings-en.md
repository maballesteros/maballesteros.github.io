---
title: "Useful RAG is not just embeddings"
excerpt: "Sometimes the best retrieval strategy is not to look for similar chunks, but to use a candidate index and fast models to decide what is worth reading."
tags: [ai, rag, retrieval, embeddings, product]
lang: en
ref: rag-util-no-es-solo-embeddings
date: 2024-05-09
modified: 2026-05-28
comments: true
permalink: /en/blog/useful-rag-is-not-just-embeddings/
---

There is a fairly standard way to build a RAG demo:

1. split documents into chunks;
2. compute embeddings;
3. store vectors;
4. retrieve the most similar chunks;
5. pass them to a model.

For a demo, it works.

For a product, it is often not enough.

This article is part of the [AI Product Engineering without hype](/en/ai-product-engineering/) series, where I am organizing what I have learned while bringing AI into real products.

We also started there: chunking experiments, semantic search, scoring, ranking, textual fallback, permission scopes and latency limits. All of that matters. If any of it is missing, the system usually breaks in predictable places.

But the interesting lesson came later.

In some problems, when the corpus allows it, the best retrieval path was not "give me the closest chunks". What worked better was a more deliberate pattern:

> first decide where to look; then read better what is worth reading.

That small change alters the design.

## What classic RAG taught us

Embeddings are powerful because they capture intent, not only literal text. If the user asks with different words, semantic search can find useful material where a keyword search would fail.

But an embedding does not know many things a product needs.

It does not know whether the user may see that document. It does not know whether three chunks repeat the same signal. It does not know whether a similar fragment is out of context. It does not know whether an exact textual match, although less elegant semantically, is precisely what the user needs.

That is why usable RAG grows more pieces: security scope, sane chunking, semantic search, textual fallback, ranking, input validation, latency budgets and continuous evaluation. None of this is decoration. It is the difference between a convincing demo and a tool you can put in front of real users.

## The chunk problem

Chunking looks like a small technical decision, but it shapes the whole answer.

If chunks are too small, you retrieve isolated sentences that cannot support a good explanation. If they are too large, the signal gets diluted. If a section is cut badly, the model receives the part that mentions the concept but misses the part that explains it. If several chunks come from the same area, the context fills up with redundancy.

And then there is the subtler problem: the user does not want "relevant chunks". The user wants someone to understand what they need and look in the right place.

When the corpus has a human-readable structure -- documents, chapters, sections, titles, descriptions, categories -- it can be better not to treat it as a bag of fragments. It can be better to use that structure.

## Index first, then reading

The pattern that has worked well for us in some cases is this:

1. maintain an index of candidate contents: documents, sections, titles, descriptions, useful metadata and, when it helps, semantic signals;
2. create a first reduced candidate set for the query;
3. pass that candidate index, together with the user's question, to a small and very fast model;
4. let that model decide which documents or sections are worth exploring;
5. then let another fast model read those contents with more context and extract the passages that actually help answer.

This is not "throwing more AI at the problem".

It changes the question.

Instead of asking:

> Which fragments are closest to this query?

you ask:

> Looking at the available content map, where does it make sense to look?

And then:

> Now that we know where to look, which exact parts answer the user's intent best?

This is closer to how a competent person searches through material. First they look at the index. Then they open the two or three promising places. Then they read inside.

## Why it can work better

Small models, used well, are surprisingly good selectors when the input is bounded.

You are not asking them to reason for a minute or write the final brilliant answer. You are asking humbler tasks: choose relevant candidates, decide which sections to open, extract useful fragments and reject doubtful matches.

Latency can remain low and quality can be very good.

Also, when the second phase reads a whole document or section, the system recovers context that an isolated chunk may have lost: title, section intention, explanatory thread and surrounding nuance.

This does not eliminate semantic search. It moves it to the right place. Semantic search can help build the candidate set, but the final decision of "what is worth reading" does not have to depend only on vector distance.

## The condition: the corpus must allow it

This strategy is not universal.

If you have millions of documents, you cannot pass "the index" to a model and expect magic. You need classic retrieval, specialized indexes, hard filters, efficient ranking and probably several reduction layers.

But many products do not start with an infinite corpus. They have a reasonable library, a catalogue, a set of courses, a group of documents per client, a bounded knowledge base or structured educational material.

In those cases, solving everything as "top-k chunks by embedding" can be too poor a simplification.

A robust system does not need a religion. It can combine vector search for intent, textual search for literal terms, a fast model to select candidates, contextual reading to extract the useful part and validation so the final answer is not just a convincing mixture of weak signals.

The practical question should not be:

> Do we have embeddings?

It should be:

> Are we finding the context that a competent person would have gone looking for?

Embeddings help find similarities. A good retrieval system helps find answers.
