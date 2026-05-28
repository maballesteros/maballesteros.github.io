---
title: "DreamLoop - Personalized 30-day storytelling powered by AI"
excerpt: "DreamLoop is an interactive web app where dream messages guide a teenager's 30-day adventure and help rewrite identity through story."
tags: [dreamloop, interactive, ai, storytelling, react, typescript, gemini]
lang: en
ref: dreamloop
date: 2025-06-15
modified: 2026-05-28
comments: true
permalink: /en/blog/dreamloop/
---

I released [DreamLoop](/dreamloop/dist/), an interactive web application for teenage readers where dream messages shape a personalized 30-day adventure.

The idea came from reading about emergent misalignment: if narrow negative training can spill into other contexts, what if positive narrative nudges could also spill into identity?

DreamLoop flips that intuition into a story format. The reader sends one-line dream messages to the protagonist, and the story engine uses them to shape the next chapter.

The app includes in-app Gemini API key management, AI-generated protagonists, narrative and images, JSON import/export and image regeneration.

The interesting part is the ritual: after each chapter, the reader whispers a dream. That prompt becomes a small piece of guidance, not a blank-page writing task.

DreamLoop is built with React, TypeScript and the Google Gemini API.

![DreamLoop sample](/dreamloop/dreamloop-sample1.png)
