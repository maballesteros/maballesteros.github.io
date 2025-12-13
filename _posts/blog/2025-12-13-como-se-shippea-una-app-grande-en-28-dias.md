---
title: "Cómo se “shippea” una app grande en 28 días (sin convertir el código en una hoguera)"
excerpt: "Lecciones de Sora para Android con Codex: la programación asistida por IA no reduce la necesidad de rigor; la aumenta."
tags: [ia, codex, productividad, estrategia, android]
date: 2025-12-13
modified: 2025-12-13
comments: true
---

### Cómo se “shippea” una app grande en 28 días (sin convertir el código en una hoguera): lecciones de Sora para Android con Codex

Hay una fantasía recurrente en ingeniería: “si tuviéramos el doble de manos, lo sacaríamos en la mitad de tiempo”. Luego llega la realidad, se llama coordinación, y te pasa por encima con una sonrisa. El artículo de OpenAI sobre cómo construyeron **Sora para Android en 28 días** es interesante precisamente porque no vende magia: lo que muestra es un cambio de **dónde está el cuello de botella** cuando metes un agente como Codex dentro del loop. [^1]

El dato que engancha (y que, si eres de los que mide, te obliga a levantar la ceja) es este: lanzaron en noviembre, el día de lanzamiento llegaron al **#1 en Google Play**, y los usuarios de Android generaron **más de un millón de vídeos en las primeras 24 horas**. Detrás: **cuatro ingenieros**, una ventana de **Oct 8 → Nov 5, 2025**, y el uso de Codex consumiendo **~5.000 millones de tokens**. Y aun así reportan **99,9% crash-free**. [^1]

Lo esencial no es el número de días. Es el patrón.

---

#### 1) Brooks no murió: solo cambió de forma

El texto abre con un clásico: **Brooks’ Law** (“añadir gente a un proyecto tardío lo retrasa”). Lo relevante es cómo lo reinterpretan: con Codex, puedes “añadir manos” de manera barata (más sesiones, más paralelismo), pero **la coordinación no desaparece**; se desplaza. Dejas de ser alguien que escribe código para convertirte en alguien que **toma decisiones, da dirección, revisa y orquesta** (un [cambio de paradigma](/blog/cambio-de-paradigma-en-programacion/) que ya hemos discutido). [^1]

Su forma de evitar el autoengaño fue simple: equipo pequeño, bar alto, y Codex como multiplicador. Resultado operativo: **build interno para empleados en 18 días** y **lanzamiento público 10 días después**. [^1]

La chispa aquí es incómoda: el “speedup” real no viene de escribir más rápido; viene de **reducir el tiempo muerto** y convertir la implementación en algo que puede avanzar mientras tú duermes… siempre que hayas hecho el trabajo duro antes: definir el carril. (Algo que resuena mucho con [cuando la IA va más rápido que tu cabeza](/blog/cuando-la-ia-va-mas-rapido-que-tu-cabeza/)).

---

#### 2) Tratar a Codex como a un senior nuevo (y no como a un genio telepático)

La metáfora que usan es buenísima porque es práctica: Codex “funciona” si lo tratas como un **senior recién fichado**. Es capaz, lee rápido, produce mucho. Pero no conoce tus normas invisibles ni tu intuición de producto. [^1]

Donde dicen que necesita guía (y aquí hay oro para cualquier equipo):

* No infiere bien **lo que no le has dicho**: patrones, estrategia, comportamiento real de usuarios, “cómo hacemos las cosas aquí”. [^1]
* No puede **ver la app corriendo** ni sentir fricciones de UX (scroll raro, flujo confuso). Eso es terreno humano. [^1]
* Cada instancia requiere **onboarding**: objetivos, restricciones, y un “manual de estilo” operativo. [^1]
* Su juicio arquitectónico profundo es limitado: tiende a “que funcione”, no a “que quede limpio para dentro de 6 meses”. [^1]

Y donde brilla:

* Lee y entiende codebases grandes rápido (y sabe muchos lenguajes). [^1]
* Es entusiasta con tests: quizá no todos profundos, pero la **cobertura amplia** ayuda contra regresiones. [^1]
* Responde bien al feedback: le pegas logs de CI y vuelve con fixes. [^1]
* Paraleliza: sesiones desechables probando ideas en paralelo. [^1]
* Aporta perspectiva: lo usaron incluso para investigar SDKs y proponer vías (p.ej. optimizaciones de memoria del reproductor). [^1]

Esto te aterriza una idea: **Codex no sustituye al criterio; amplifica el impacto del criterio**. Si el criterio es difuso, amplifica el caos.

---

#### 3) La decisión clave: “foundation by hand” (y por qué el 85% no significa “autopilot”)

Hay un punto que me parece la pieza central del artículo: antes de soltar a Codex a producir a lo loco, ellos construyen a mano lo que un senior prudente construiría a mano: **arquitectura, modularización, dependency injection, navegación**, y además **auth + base networking**. [^1]

Luego implementan “features representativas” end-to-end para que el agente **vea ejemplos** de lo que la organización considera correcto. A partir de ahí, Codex puede rellenar. Dicen que el proyecto fue **~85% escrito por Codex**, pero ese porcentaje, leído bien, significa: “85% de tecleo”, no “85% de decisiones”. [^1]

También cuentan el anti-patrón: probaron el prompt tipo “Build the Android app based on iOS. Go.” y lo abortaron. Funcionaba, pero la experiencia era mediocre, y el “single-shot” sin contexto (miles de líneas) es una lotería. [^1]

La lección es muy sobria: **no le digas lo que quieres; enséñale cómo lo quieres**.

---

#### 4) Planificar antes de codear: convertir prompts en mini-design docs

Otro giro interesante: para cambios no triviales, primero le pedían a Codex que **leyera archivos y explicara el sistema** (cómo fluye la data del API al repo, viewmodel y UI), luego corregían su entendimiento, y después co-creaban un plan que se parece a un design doc: qué archivos tocar, qué estados nuevos, qué lógica va dónde. Solo entonces empezaba a implementar, paso a paso. [^1]

Dos detalles que son pura ingeniería de workflow:

* Si el task era largo y chocaban con el límite de contexto, le pedían que guardara el plan en un fichero para reutilizarlo en otra sesión. [^1]
* Ese “planning loop” permite dejarlo trabajar más rato “sin supervisión”, porque no estás revisando un diff ciego: estás comparando implementación vs plan. [^1]

Aquí el cambio mental es fuerte: el output valioso no es solo código, es **una trazabilidad de intención**.

---

#### 5) Ingeniería distribuida: más sesiones ≠ más velocidad (y tú te conviertes en el cuello de botella)

En el pico del proyecto corrían varias sesiones en paralelo: una para playback, otra para search, otra para error handling, otra para tests/refactors. Lo describen como “gestionar un equipo”. [^1]

Y entonces aparece el efecto secundario: Codex no se bloquea por context switching; tú sí. La cola de revisión crece. El cuello de botella pasa a ser **decidir, dar feedback, integrar**. Incluso con agentes, Brooks vuelve: no hay escalado lineal, solo **orquestación más exigente**. [^1]

Esta es una de esas verdades que se notan en el cuerpo cuando has vivido un sprint: “No estoy cansado de programar; estoy cansado de elegir”.

---

#### 6) Codex como “superpoder cross-platform”: traducción en lugar de abstracción

Su parte más provocadora (con una broma incluida) es que dicen que “reinventaron el cross-platform”: no React Native, no Flutter; “el futuro es Codex”. Debajo de la broma hay dos principios muy concretos: **la lógica es portable** y **los ejemplos concretos son contexto potente**. [^1]

Hicieron convivir repos de iOS, backend y Android en el mismo entorno y le pedían a Codex cosas del estilo: “lee estos modelos/endpoints en iOS y planifica el equivalente en Android usando nuestro cliente API y modelos existentes”. Incluso mencionan un truco: documentar en `~/.codex/AGENTS.md` dónde están los repos locales y qué contienen, para que Codex navegue mejor. [^1]

Traducción en vez de abstracción compartida. Menos “framework común”, más “equivalencia semántica guiada”.

---

### Cierre: la ingeniería no se vuelve menos rigurosa; se vuelve más

Me quedo con su frase-idea: **la programación asistida por IA no reduce la necesidad de rigor; la aumenta**. Porque el agente optimiza para llegar de A a B “ya”, y alguien tiene que sostener el mapa de restricciones del mundo real, el diseño del sistema y la salud futura del código. [^1]

Si tuviera que convertir el artículo en un criterio aplicable mañana, sería este:

* Si quieres velocidad con agentes, invierte primero en **invariantes** (arquitectura, ejemplos, reglas, planes).
* Lo que escalas no es el “tecleo”; lo que escalas es tu capacidad de **dirigir y revisar** sin perder el norte.
* Y la pregunta que manda no es “¿cuánto código escribe la IA?”, sino “¿qué decisiones me está liberando tiempo para tomar mejor?”

Porque al final, lo interesante de nuestro oficio nunca fue centrar botones (aunque a veces nos coma el día). Lo interesante es construir cosas que funcionen *y* sigan funcionando cuando el futuro llegue a cobrar intereses.

¿Tu equipo está preparado para que el trabajo principal ya no sea escribir, sino **conducir**? [^1]

[^1]: https://openai.com/index/shipping-sora-for-android-with-codex/ "How we used Codex to build Sora for Android in 28 days | OpenAI"
