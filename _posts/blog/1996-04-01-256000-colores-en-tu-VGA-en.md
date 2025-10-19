---
title: 256,000 colors on your VGA
excerpt: "Reverse‑engineering VGA memory tricks to push past the 256-color barrier in 1996."
tags: [rpp]
lang: en
ref: 256000-colores
modified: 2025-10-19
comments: true
image:
  feature: 1996-04-01-256000-colores-en-tu-VGA/RPP-header.jpg
permalink: /en/blog/256000-colores-en-tu-vga/
---

This piece is a translation of my first printed article, published in 1996 by **Revista Profesional para Programadores (RPP)**. Back then the VGA standard limited consumer PCs to 256 simultaneous colours, yet game studios and demo makers were already dreaming in true colour. I spent weeks reading [Michael Abrash](https://en.wikipedia.org/wiki/Michael_Abrash), dissecting Super VGA manuals, and experimenting with memory banks until a workaround emerged.

The trick was to orchestrate the VGA palette updates in sync with the horizontal retrace, effectively multiplexing several palettes per frame. By slicing the screen into bands and refreshing the palette between them, the monitor blended the segments and our eyes perceived far more than 256 colours—around 256,000 in the demos I shipped with the article.

The RPP version (in Spanish) walks through the memory maps, the assembly snippets, and the limitations you hit when pushing the hardware that far. I have scanned the [cover and sample pages](/images/1996-04-01-256000-colores-en-tu-VGA/RPP-page-1.jpg) for nostalgia’s sake.

Even though modern GPUs make this hack obsolete, the core lesson stays with me: deep curiosity about the underlying machinery unlocks seemingly impossible capabilities. That mindset still guides my work today.
