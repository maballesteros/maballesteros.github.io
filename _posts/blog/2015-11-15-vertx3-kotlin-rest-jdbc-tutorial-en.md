---
title: "Vert.x 3 + Kotlin tutorial for a REST API with a JDBC backend"
excerpt: "A step-by-step tutorial to publish an asynchronous REST API using Vert.x 3, Kotlin and JDBC."
tags: [vertx, kotlin, rest, jdbc]
lang: en
ref: vertx3-kotlin
date: 2015-11-15
modified: 2026-05-28
comments: true
permalink: /en/blog/vertx3-kotlin-rest-jdbc-tutorial/
---

This tutorial walks through the construction of an asynchronous REST API using Vert.x 3, Kotlin and a JDBC backend.

The original exercise was useful because it showed the evolution from a tiny HTTP server to a more realistic REST service:

1. Start a simple Vert.x HTTP server.
2. Add an in-memory REST user repository.
3. Simplify REST definitions with Kotlin.
4. Replace the in-memory repository with a JDBC backend.
5. Use promises and more Kotlin syntax to make the asynchronous flow easier to read.

The main point was not only "Vert.x can expose REST". It was that Kotlin made asynchronous Java server code much more pleasant at a time when Vert.x 3 was becoming a practical option for lightweight services.

The complete code for the original tutorial remains available in the repository linked from the Spanish/original post.
