---
title: RunLog Pro - Personalized training plans
excerpt: "RunLog Pro is a web app for runners to log sessions, track progress, and automatically generate personalized training plans."
tags: [runlog-pro, react, typescript, tailwindcss, zustand, recharts, training, logging]
modified: 2025-06-07
comments: true
link: /runlog-pro/
ref: runlog-pro
---

Today I released [RunLog Pro](/runlog-pro/), a new web application designed to help runners log their running sessions, track their progress, and create personalized training plans based on algorithmic calculations.

RunLog Pro was born out of a personal need I couldn’t satisfy with existing tools. I’m a long‑time Garmin user and keep a detailed history on platforms such as [runalyze.com](https://runalyze.com/). While these services excel at tracking progress and producing insightful forecasts, none of them offered the kind of forward‑looking, adaptive training‑plan generator I craved. Thanks to modern tooling—Google AI Studio in particular—building a fully client‑side web app has become a matter of hours (perfecting it still takes time, of course). So I decided to scratch my own itch and create the planner I was missing. RunLog Pro is the result.

![imagen1](/runlog-pro/runlog-pro-1.png)
![imagen2](/runlog-pro/runlog-pro-2.png)

You can find a detailed list of features in the project's [README](/runlog-pro/README.md), but here are some highlights:

- **Detailed Session Logging**: Record runs with distance, duration, elevation, heart rate data, and notes. TRIMP metrics are calculated automatically.
- **Algorithmic Training Plan Generation**: Generate personalized training plans that adapt based on recent performance, with customizable progression settings and manual deload options.
- **Interactive Dashboard**: View your current week, summary statistics, future plan calendar, and progress charts in an intuitive interface.
- **Comprehensive Logbook**: Browse your logged activities by week, add or edit sessions, and manage multiple sessions per day.
- **Weekly Reviews & Notes**: Mark deload weeks, add personal notes, and keep track of subjective feedback that can influence future plans.
- **Customizable Training Settings**: Adjust load increments, deload frequency, plan horizon, and primary target metrics (TRIMP or distance).
- **Offline Support**: Access core features even when you're offline, thanks to local browser storage and client-side data persistence.

RunLog Pro is built with React and TypeScript, styled with TailwindCSS, and uses Zustand for state management. It leverages React Router for navigation, React Hook Form with Zod for validation, and Recharts for data visualization. The app runs entirely in the browser and stores all data locally, with import/export options for backup.

If you're a runner looking to take your training to the next level, give [RunLog Pro](/runlog-pro/) a try and let me know your feedback!
