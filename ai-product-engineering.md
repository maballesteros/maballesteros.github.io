---
layout: page
title: "AI product engineering sin humo"
excerpt: "Una serie sobre cómo convertir IA en producto real: RAG, evaluación, coste, latencia, guardrails, feedback loops y ranking pragmático."
permalink: /ai-product-engineering/
tags: [ia, producto, engineering, agentes, llm]
lang: es
ref: ai-product-engineering
---

Esta serie recoge aprendizajes prácticos de construir productos con IA en contextos reales: usuarios reales, datos reales, costes reales, latencia real y equipos reales.

No va de demos bonitas ni de pegar un chatbot a una pantalla. Va de las piezas menos vistosas que hacen que la IA aguante cuando pasa de experimento a producto.

Los artículos están fechados por el momento aproximado en que empezó cada aprendizaje en trabajo real, no por la fecha en que los he puesto por escrito.

El contexto profesional más sintético está en [Professional profile](/professional/) y [Selected work](/selected-work/).

## Artículos de la serie

1. 2024-05-09 - [RAG útil no es solo embeddings](/blog/rag-util-no-es-solo-embeddings/)
2. 2025-09-19 - [Feedback loops de producto: de opiniones sueltas a decisiones](/blog/feedback-loops-producto-opiniones-decisiones/)
3. 2025-10-17 - [Ranking pragmático: heurísticas, LLM barato y validación determinista](/blog/ranking-pragmatico-heuristicas-llm-validacion/)
4. 2025-12-05 - [Sofía y el problema real de los tutores IA](/blog/sofia-y-el-problema-real-de-los-tutores-ia/)
5. 2026-02-10 - [El coste de la IA también es arquitectura](/blog/coste-ia-tambien-es-arquitectura/)
6. 2026-02-17 - [Codex y AWS: convertir intención en operación](/blog/codex-y-aws-convertir-intencion-en-operacion/)
7. 2026-02-20 - [Guardrails ejecutables: políticas vivas, no documentos bonitos](/blog/guardrails-ejecutables-politicas-vivas-no-documentos-bonitos/)
8. 2026-04-24 - [Evaluar agentes no es preguntar si la respuesta parece buena](/blog/evaluar-agentes-no-es-preguntar-si-parece-buena/)
9. 2026-06-05 - [Codex y AWS: convertir la factura en plan operativo](/blog/codex-y-aws-convertir-la-factura-en-plan-operativo/)
10. 2026-06-17 - [Commits revisables: cómo hacer legibles las PRs generadas con IA](/blog/commits-revisables-como-hacer-legibles-las-prs-generadas-con-ia/)
11. 2026-06-18 - [El lenguaje importa más cuando programa un agente](/blog/el-lenguaje-importa-mas-cuando-programa-un-agente/)
12. 2026-06-18 - [El compilador como supervisor: Rust, Go, Python y TypeScript en la era agéntica](/blog/el-compilador-como-supervisor-rust-go-python-typescript-era-agentica/)
13. 2026-06-18 - [Repos que devuelven feedback: cómo diseñar el loop de programación agéntica](/blog/repos-que-devuelven-feedback-como-disenar-loop-programacion-agentica/)

## La tesis

La IA en producto no se vuelve útil por añadir un modelo.

Se vuelve útil cuando hay:

- datos bien acotados;
- retrieval con permisos, fallback y ranking;
- evaluación persistida;
- coste y latencia observables;
- guardrails ejecutables;
- feedback loops de producto;
- validación determinista antes de enseñar nada al usuario.

Ese es el territorio donde más me interesa trabajar.
