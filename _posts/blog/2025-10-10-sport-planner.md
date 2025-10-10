---
title: Sport Planner - Plan training sessions with a reusable catalog
excerpt: Sport Planner is an offline-first planner that helps you design, iterate, and execute sport training sessions with reusable work catalogs, attendance tracking, and instant JSON backups.
tags: [sport-planner, react, typescript, training, planner]
date: 2025-10-10
modified: 2025-10-10
comments: true
---

Today I released [Sport Planner](/sport-planner/), a client-side SPA to design and run training sessions for martial arts, fitness classes, or any sport where you need a reusable catalog of drills and a responsive schedule you can tweak on the fly.

Sport Planner grew out of my own kung-fu teaching workflow. I wanted a tool where the next session is always ready on mobile, catalog maintenance is painless, and backups are just a click away. Everything runs 100 % in the browser using `localStorage`, so you can use it offline during class and sync data manually through JSON exports when needed.

## Highlights

- **Reusable Work Catalog**: Define objectives, drills, and reference material once, then drag & drop them into any session with color-coded cues.
- **Session Timeline Editing**: Duplicate past sessions, reorder drills inline, collapse or expand advanced details, and fine-tune durations without leaving the screen.
- **Calendar Planning**: Browse a monthly view with highlighted training days, pick a date, and jump straight into editing or duplicating an existing plan.
- **Attendance Tracking**: Mark who showed up, flag absences, and take quick notes per student as you progress through the session.
- **Mobile-first Execution**: The home screen always surfaces the next session, optimized for one-handed use so you can tick drills as completed while teaching.
- **Backups Made Easy**: Export the full dataset as JSON, import it later on another device, and keep your records versioned safely.

Sport Planner is built with React, TypeScript, Zustand, React Router, Headless UI, and TailwindCSS. State is persisted locally, and the production build is optimized with Vite for deployment on GitHub Pages at `/sport-planner/`.

![Sport Planner cover](/apps/sport-planner/sport-planner-cover.svg)
