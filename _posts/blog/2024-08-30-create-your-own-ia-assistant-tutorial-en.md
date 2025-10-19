---
title: Build Your Own AI Personal Assistant (Tutorial)
excerpt: "Step-by-step English adaptation of my 2024 guide for creating a proactive assistant that learns about you and pings you through Telegram."
tags: [ai, tutorial, productivity, personal-assistant]
lang: en
ref: create-ia-assistant
modified: 2025-10-19
comments: true
permalink: /en/blog/create-your-own-ai-assistant/
---

This article is the English companion to my Spanish tutorial on crafting a personal AI assistant that remembers facts about you and contacts you proactively via Telegram. The original piece walks through every script in detail; here I summarise the essentials while keeping all code references intact.

---

## 1. Architecture overview

- **Input channels:** Telegram bot (replies to `/remember`, `/list`, `/forget`) and a CLI helper for quick capture.
- **Knowledge store:** A lightweight SQLite database storing facts with timestamps and tags.
- **Reasoning:** OpenAI GPT-4o (or any compatible LLM) with structured prompts that govern memory creation, reminders, and tone.
- **Scheduler:** A cron job that runs periodically, asking the LLM which items deserve a follow-up ping.

## 2. Stack & prerequisites

- Python 3.11+
- `openai` (or `openai`-compatible) SDK
- `python-telegram-bot`
- `sqlite3`
- `dotenv` for secrets management
- A Telegram bot token and an OpenAI API key

Clone the repo, copy `.env.example` to `.env`, and fill in `OPENAI_API_KEY`, `TELEGRAM_TOKEN`, and optional defaults such as preferred reminder hours.

## 3. Database schema

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  remind_at DATETIME,
  status TEXT DEFAULT 'active'
);
```

Helper functions handle insertion, soft deletion, and fetching candidates for reminders. Each memory stores the natural-language fact plus metadata extracted by the LLM.

## 4. Prompt design

The assistant uses three main prompts:

1. **Capture prompt** – Cleans and tags new facts before storing them.
2. **Reminder prompt** – Reviews active memories and decides whether to notify the user.
3. **Notification prompt** – Crafts the actual message sent through Telegram, keeping tone friendly but concise.

Every prompt is versioned and includes guardrails (e.g., never hallucinate actions, mark uncertain items for clarification instead).

## 5. Telegram bot flows

- `/remember <text>` → runs the capture pipeline, stores the fact, and acknowledges with a short summary.
- `/list [filter]` → displays active memories, optionally filtered by tag.
- `/forget <id>` → archives a memory.
- Passive reminders are delivered via scheduled jobs; the bot sends a contextual message and offers quick buttons (`Done`, `Later`, `Pin`) implemented with callback queries.

## 6. Scheduler

A cron entry such as:

```
*/30 * * * * /usr/bin/python /path/to/project/run_scheduler.py
```

calls a script that:

1. Collects candidate memories (e.g., those without reminders or whose `remind_at` has passed).
2. Feeds them to the reminder prompt.
3. Updates `remind_at` according to the LLM’s suggestion.
4. Sends notifications through the Telegram bot API.

## 7. Extending the assistant

Ideas from the original Spanish article that you can explore next:

- Voice capture using Whisper + the same ingestion pipeline.
- Calendar integration so the assistant can cross-reference events.
- Embeddings search to answer free-form questions like “What books did I say I wanted to read?”.
- Multi-user mode with per-user API keys and isolated databases.

---

With these components running you’ll have a personal sidekick that remembers what matters to you, nudges you at the right time, and grows smarter as you keep feeding it context. Check the repository for complete scripts and Spanish commentary if you’d like to follow the walkthrough line by line.
