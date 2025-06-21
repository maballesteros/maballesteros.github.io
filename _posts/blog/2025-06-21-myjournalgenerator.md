---
title: MyJournalGenerator - Personalized AI-powered journal generator
excerpt: A tool to generate personalized journals based on a mix of philosophical traditions and life roles. It creates a custom index and daily/weekly entries with reflections, prompts, and challenges.
tags: [myjournalgenerator, ai, journaling, react, typescript, gemini]
date: 2025-06-21
modified: 2025-06-21
comments: true
---

Today I released [MyJournalGenerator](/myjournalgenerator/dist/), an AI‑powered web app that helps you craft personalized journals based on selected philosophical traditions, life roles, and central objectives.

## What can it do?

- **Custom Index Generation**: Create a personalized structure of themes and subchapters based on your chosen traditions and life goals.
- **Daily & Weekly Entries**: Generate reflections, philosophical quotes, narrative prompts, and challenges tailored to the selected format.
- **Flexible Journal Formats**: Support for daily micro entries, weekly deep dives, full-year journeys, and hero’s journey narratives.
- **AI‑Driven Covers & Illustrations**: Optionally generate cover images and in-entry illustrations using Google Gemini.
- **EPUB Export**: Download your journal as an EPUB for offline reading or printing.
- **Local Persistence**: Store and manage your journals directly in the browser, with import/export backup options.
- **Sample Data**: A `diarios-ejemplo.json` sample file is included in the `dist/` folder so you can preload entries and explore the app immediately ([/myjournalgenerator/dist/diarios-ejemplo.json](/myjournalgenerator/dist/diarios-ejemplo.json)).

MyJournalGenerator is built with React and TypeScript, styled with TailwindCSS, and uses the @google/genai SDK (text model `gemini-2.5-flash-preview-04-17`) to generate content entirely on the client side. Give it a try at the link above and let me know your feedback!

![sample image](/myjournalgenerator/myjournalgen-sample1.png)