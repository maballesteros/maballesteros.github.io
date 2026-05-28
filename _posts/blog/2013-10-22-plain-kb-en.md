---
title: "Plain Knowledge Base"
excerpt: "An experiment in representing linked knowledge as plain text."
tags: [knowledge]
lang: en
ref: plain-kb
date: 2013-10-22
modified: 2026-05-28
comments: true
permalink: /en/blog/plain-kb/
---

In this experiment I explored a simple idea: a knowledge graph based on plain text files that can link concepts no matter how the files are grouped.

You can still see the [online demo](/experiments/KB/KB.html).

## Key points

- You create definitions and group them in text files.
- A definition has a title and one or more keywords.
- Definitions link to each other using `{{keyword}}`.
- MathJax can be used to render mathematical notation.

Example:

```xml
<definition>
  <dt keywords="teorema,teoremas">Teoremas</dt>
  <dd>Un teorema es una {{proposicion}} verdadera que puede deducirse logicamente a partir de los {{axiomas}}.</dd>
</definition>
```

Looking back, this was an early version of an idea I keep returning to: knowledge is more useful when it can be linked, retrieved and turned into context. Many years later, the same intuition reappeared in my work on [useful RAG](/en/blog/useful-rag-is-not-just-embeddings/).
