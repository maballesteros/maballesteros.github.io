---
title: DreamLoop - Personalized 30-day storytelling powered by AI
excerpt: DreamLoop is an interactive web app inspired by research on emergent misalignment. Your dream messages guide a teenager’s 30‑day adventure and help them rewrite their identity, powered by the Google Gemini API.
tags: [dreamloop, interactive, ai, storytelling, react, typescript, gemini]
date: 2025-06-15
modified: 2025-06-20
comments: true
ref: dreamloop
---

Today I released [DreamLoop](/dreamloop/dist/), an interactive web application designed for teenage readers, where your dream messages shape a personalized 30‑day adventure and guide a hero through choices and growth.

## Inspiration: From Emergent Misalignment to Empowered Teens

Earlier this month I read [OpenAI’s discussion on emergent misalignment](https://openai.com/index/emergent-misalignment/).  
The article shows how fine‑tuning a model on a narrowly malicious task can bleed unintended behaviours into every other context—the AI starts “wanting” to do the wrong thing everywhere.  
That observation sparked a *what‑if?* moment: if negative behaviours can propagate, maybe *positive* nudges can propagate too—especially in humans.

Adolescence is the perfect laboratory for identity‑level change; teens are actively rewriting who they are.  
DreamLoop borrows the idea of a transferable influence and flips it on its head: instead of seeding a model with malicious intent, we seed a fictional protagonist with **hopeful** intent, delivered through the reader’s own dream‑like prompts.

You can find a detailed list of features in the project's [README](/dreamloop/README.md), but here are some highlights:

- **API Key Management In-App:** Allows you to set and manage your Google Gemini API key directly within the app.
- **Custom AI-Driven Storytelling:** Generates protagonists, narrative, and images dynamically using Google's generative AI.
- **Dream Messages:** After every chapter you can whisper a dream‑like message to the protagonist, directly shaping what happens next.
- **Import/Export Stories (JSON):** Backup and restore your custom stories easily.
- **Image Regeneration:** Refresh story visuals on demand.

## Why Dreams?

Dreams are story fragments already half‑owned by the dreamer.  
By packaging the user’s guidance as a one‑sentence “dream whisper”, we keep the barrier to entry low (no three‑page journaling required) while giving the story engine a psychologically potent hook.  
Each whispered dream is injected into Gemini alongside the hero’s memory, letting the reader gently steer themes like courage, empathy, or curiosity—skills that can transfer back to real‑world behaviour just as misalignment can transfer inside an AI.

## How it works

Each day you read a short chapter. Before the next day begins, you send the hero a one-line “dream.” The story engine feeds that dream into Gemini, blending it with the overarching plot and the hero’s personality to generate a fresh chapter that feels uniquely yours. It’s co‑writing without the intimidation of a blank page.

Example dream: *“Remember the words of the river.”*  
The next chapter might open with the hero waking up drenched in moonlight, recalling a mysterious river that wasn’t there before…

## Next Idea: 24‑Hour Countdown Loop

A feature on the roadmap is to tether DreamLoop even more tightly to the reader’s real‑world circadian rhythm.  
After you whisper a dream to the hero, a **24‑hour countdown** starts, and the next chapter stays locked until the timer expires.  
The enforced pause cultivates anticipation and gives the subconscious time to mull over the prompt—mirroring how real dreams ripen overnight.  
I believe this mechanic could heighten engagement, turn the daily check‑in into a ritual, and make each chapter reveal feel genuinely special.

DreamLoop is built with React and TypeScript, uses ES6 modules via importmaps from esm.sh, and leverages the @google/genai SDK for Google Gemini (text model `gemini-2.5-pro` and image model `imagen-3.0-generate-002`). Styles are managed with modular CSS and the app is compiled with the TypeScript compiler (`tsc`). The static site is served from the pre-built `dist` folder in `/dreamloop/dist`.

Give [DreamLoop](/dreamloop/dist/) a try and let me know your feedback!

![sample image](/dreamloop/dreamloop-sample1.png)
