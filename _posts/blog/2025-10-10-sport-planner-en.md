---
title: "Sport Planner - Plan training sessions with a reusable catalog"
excerpt: "Sport Planner adds Supabase login and cloud sync so training plans remain available across devices while preserving offline-first use."
tags: [sport-planner, react, typescript, training, planner]
lang: en
ref: sport-planner
date: 2025-10-10
modified: 2026-05-28
comments: true
permalink: /en/blog/sport-planner/
---

I released [Sport Planner](/sport-planner/), a client-side SPA to design and run training sessions for martial arts, fitness classes or any sport where a reusable drill catalogue and a live schedule are useful.

It grew out of my own kung-fu teaching workflow. I wanted the next session ready on mobile, easy catalog maintenance and backups one click away.

The app includes reusable work catalogues, session timeline editing, calendar planning, attendance tracking, mobile-first execution and Supabase sync with JSON backups.

It is built with React, TypeScript, Zustand, React Router, Headless UI, TailwindCSS and Supabase. It keeps an offline-first local state while syncing when the user signs in.

![Sport Planner cover](/apps/sport-planner/sport-planner-cover.svg)
