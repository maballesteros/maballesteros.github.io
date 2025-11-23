---
title: "Cuando la IA va más rápido que tu cabeza"
excerpt: "Hay un tipo de día que se está volviendo familiar para muchos devs que trabajamos en la frontera de la IA: productividad obscena y agotamiento raro."
tags: [ia, productividad, dev-experience, mental-health]
date: 2025-11-23
modified: 2025-11-23
comments: true
---

## Cuando la IA va más rápido que tu cabeza

Hay un tipo de día que se está volviendo familiar para muchos devs que trabajamos en la frontera de la IA: empiezas temprano, lanzas trabajos a varios [agentes de código](/blog/create-your-own-ia-assistant-tutorial/), revisas errores, vuelves a lanzar, validas comportamiento… y, al final del día, la sensación es doble.

Por un lado, **productividad obscena**: haces en una mañana lo que antes te llevaba una semana. Te atreves con refactors gigantes, proyectos que hace un año ni te hubieras planteado. Por otro, **agotamiento raro**: la cabeza acelerada, dificultad para desconectar, sueño ligero y entrecortado. Te levantas a las 3AM pensando en un log, en un job que se quedó a medias, en si el prompt estaba bien especificado.

Lo esencial es que **no es solo “más trabajo”**. Es que hemos [cambiado de rol](/blog/cambio-de-paradigma-en-programacion/) sin darnos cuenta.

Antes éramos quien escribía el código. Ahora somos quien **especifica, lanza y orquesta** a un pequeño ejército de agentes incansables. Y ese cambio tiene efectos que aún estamos aprendiendo a gestionar.

---

### El síndrome del dev-orquestador

Cuando lanzas un trabajo a un agente, no abres solo un proceso en la máquina. Abres un **loop en tu cabeza**:

* ¿Lo habré especificado suficientemente bien?
* ¿Se quedará atascado con un error absurdo?
* ¿Cuántas iteraciones necesitaré hasta que haga “lo que yo tengo en la cabeza”?
* ¿Podría estar haciendo algo más productivo mientras tanto?

Aunque en la pantalla no pase nada, por dentro sigues en modo *polling*: “¿y ahora? ¿y ahora? ¿y ahora?”. Eso desgasta más de lo que parece.

Si además trabajas con muchos agentes en paralelo, el número de loops abiertos se dispara. La mente hace algo muy humano: **no suelta ninguno del todo**. Se queda vigilando todos a la vez. No es casual que aparezcan:

* sensación de estar siempre “en guardia”
* dificultad para relajarse al terminar el día
* sueño ligero, despertares con la cabeza ya en modo debug

El patrón recuerda al efecto Zeigarnik: tendemos a recordar y a seguir procesando las tareas incompletas más que las ya cerradas. La IA, mal gestionada, convierte tu jornada en una **colección creciente de tareas incompletas**.

Y aquí llega el segundo ingrediente.

---

### La trampa de la IA incansable

Un humano se cansa y se va a casa. Un agente no. Siempre está disponible para “una mejora más”:

* “Ya que estoy, que regenere esta parte del código con mejor logging.”
* “Podría dejar lanzado este refactor que me da pereza.”
* “Que vaya adelantando la documentación mientras ceno.”

Cada una de esas micro-mejoras abre otro loop. Y como *“total, lo hace la IA”*, cuesta decir que no. Resultado: tu día laboral termina en el calendario, pero no en tu cabeza.

Esto explica una paradoja curiosa: **cuanto más productivo te sientes con IA, más ansiedad puedes acumular**. No porque hagas menos, sino porque abres y mantienes más procesos en paralelo de los que tu cerebro puede “cargar” sin saturarse.

---

### No estás solo: un problema emergente

Si te das una vuelta por blogs, newsletters técnicas, hilos de Twitter o Reddit, empiezan a aparecer siempre los mismos temas:

* devs que cuentan un “subidón inicial” al usar IA (entrego en 1/10 del tiempo) seguido de un **bajón extraño**: sensación de ser operador de prompts más que ingeniero, y mentalmente reventados al final del día;
* artículos sobre **productivity anxiety**: la sensación de que, con la IA, “deberías estar produciendo aún más”, porque ya no tienes excusa;
* relatos de **frustración por iteración infinita**: el modelo nunca hace exactamente lo que querías a la primera, y terminas en bucles de: prompt → error → aclaración → otro error → retoque… que queman mucho más de lo esperado;
* gente que dice “I’m AI-ed out”: lo uso para todo, y aun así me siento sobrepasado.

Es un problema nuevo porque la combinación es nueva: **potencia x10 + open loops x10 + límites humanos de siempre**.

La pregunta interesante no es si esto pasa (pasa), sino qué hacemos con ello.

---

### Vías de salida: pasar de thread nervioso a scheduler sereno

La clave está en cambiar la identidad: dejar de funcionar como “otro hilo más” dentro del sistema y empezar a actuar como **scheduler**.

Algunas palancas muy concretas:

1. **Poner una frontera de lanzamiento**
   Si empiezas a las 6:00, por ejemplo, puedes decidir que **a partir de las 13:00 no se lanzan jobs nuevos**, salvo incidentes serios. Después de esa hora solo se revisa, se cierra, se toma nota de ideas.
   El mensaje para tu sistema nervioso es claro: “A partir de aquí ya no se abren nuevos loops”.

2. **Bloques de revisión predefinidos**
   En lugar de mirar compulsivamente si el agente ya ha terminado, defines **ventanas fijas de revisión**: 8:00–8:30, 11:00–11:30, 12:30–13:00, por ejemplo.
   Cada job que lanzas se anota con su **próximo bloque de revisión**. Y haces un pacto básico: fuera de ese bloque, no lo miras. Pasas del *polling continuo* a un modelo de *cron jobs humanos*.

3. **Asumir la iteración como parte del diseño**
   En vez de vivir cada fallo como decepción (“otra vez no ha hecho lo que quería”), lo integras en el contrato:

   * Iteración 1: borrador.
   * Iteración 2: corregir errores obvios y alinear estructura.
   * Iteración 3+: ajustes finos.
     Si ya sabes que **2–3 iteraciones son lo normal**, dejas de pelear con la realidad y empiezas a diseñar tus prompts y tus tiempos alrededor de eso.

4. **Límite de trabajo en curso (WIP)**
   Decide cuántos jobs “calientes” estás dispuesto a tener activos a la vez: 3, 4… no 12.
   Si llegas al límite, no lanzas más hasta cerrar alguno. Esto convierte el tablero de tareas en un **cortafuegos cognitivo**.

5. **Ritual de cierre diario**
   Últimos 10–15 minutos del día:

   * revisas qué jobs siguen abiertos;
   * anotas próx. paso y cuándo lo tocarás;
   * capturas ideas de mejoras en una lista aparte (para decidir luego).
     Y terminas con una frase tonta pero efectiva: “Todo lo importante está apuntado, mañana sigo aquí.”
     No estás engañando a tu cerebro: le estás enseñando que hay un sistema externo que vigila por ti.

Estas medidas no cambian la potencia de la IA. Cambian **cómo de caro sale, para tu mente, explotar esa potencia**.

---

### Side-thinking: convertir la ansiedad en una ventaja x10

Hasta aquí, defensas. Vamos al ataque.

¿Qué pasaría si en vez de ver esto como “un problema personal”, lo miramos como **una nueva capa de ingeniería** que casi nadie está trabajando aún?

Llamémosla, por ejemplo, **ingeniería de carga cognitiva en entornos IA**.

* Igual que hacemos arquitectura de sistemas para que no se caigan con 10x tráfico,
* podemos hacer arquitectura de trabajo para que no se caiga nuestro cerebro con 10x potencia.

Eso abre una oportunidad enorme:

1. **Nuevo skill de alto valor**
   No solo saber usar modelos, sino saber **diseñar flujos de trabajo humano-IA** que mantengan:

   * productividad alta sostenida en el tiempo,
   * niveles razonables de foco y bienestar,
   * [aprendizaje real del dev](/blog/lo-que-la-ia-me-enseno-de-mi-mismo/) (no degenerar en “operador de prompts”).

2. **Nuevo tipo de tooling**
   Igual que existen APMs para medir latencias y cuellos de botella, falta tooling para:

   * visualizar loops abiertos,
   * mostrar cuántos jobs tienes activos y en qué fase,
   * ayudarte a programar ventanas de revisión y límites de WIP,
   * sugerirte momentos de cierre.
     Una especie de “Kubernetes mental” para orquestar agentes sin quemar al humano.

3. **Nueva narrativa profesional**
   Pasamos de “si no programo yo, pierdo valor” a:

   * “Mi valor está en **diseñar sistemas donde la IA y las personas trabajan bien juntas**;
   * en saber dónde poner límites, qué no delegar, cómo transformar ruido en señal.”

Quien domine esto no solo sufrirá menos. Podrá liderar equipos y productos que aprovechen la IA sin freír a la gente. Eso, para mí, es una oportunidad x10.

---

### Cierre

La IA no nos está quemando solo porque sea poderosa, sino porque nos ha cambiado el rol más rápido de lo que hemos cambiado nuestras reglas de juego. Seguimos funcionando como si fuéramos el hilo principal cuando, en realidad, ya somos el scheduler.

La pregunta práctica es sencilla y exigente a la vez:

> ¿Qué dos límites nuevos vas a poner mañana —horario, número de jobs activos, bloques de revisión— para que tu cabeza vuelva a ir al ritmo de tu vida, y no solo al ritmo de tus agentes?

A partir de ahí, todo lo demás es iterar: igual que con los modelos.

---

**Referencias y lecturas relacionadas**

* Sraavan Chevireddy – *AI, Burnout, and the Future: Navigating the New Era of Software Engineering* (Medium).
  [https://medium.com/@sraavanchevireddy/ai-burnout-and-the-future-navigating-the-new-era-of-software-engineering-9fbc54b658f9](https://medium.com/@sraavanchevireddy/ai-burnout-and-the-future-navigating-the-new-era-of-software-engineering-9fbc54b658f9) ([Medium][1])

* Dragos Nedelcu – *Why I Stopped Using AI as a Senior Developer (After 150,000 Lines of AI-Generated Code)* (TheSeniorDev).
  [https://www.theseniordev.com/blog/why-i-stopped-using-ai-as-a-senior-developer-after-150-000-lines-of-ai-generated-code](https://www.theseniordev.com/blog/why-i-stopped-using-ai-as-a-senior-developer-after-150-000-lines-of-ai-generated-code) ([theseniordev.com][2])

* Fran Soto – *You’re using AI wrong if you’re trying to be fast* (Strategize Your Career / newsletter para devs).
  [https://strategizeyourcareer.com/p/ai-pause-deep-work-for-engineers](https://strategizeyourcareer.com/p/ai-pause-deep-work-for-engineers) ([strategizeyourcareer.com][3])

* Johannes ‘jo’ Millan – *The Zeigarnik Effect: Why Your Brain Won’t Let Go of Unfinished Tasks (and How to Use This)* (DEV Community).
  [https://dev.to/johannesjo/the-zeigarnik-effect-why-your-brain-wont-let-go-of-unfinished-tasks-and-how-to-use-this-with-3ocn](https://dev.to/johannesjo/the-zeigarnik-effect-why-your-brain-wont-let-go-of-unfinished-tasks-and-how-to-use-this-with-3ocn) ([DEV Community][4])

* Olivier – *The Zeigarnik Effect and How it Affects Productivity* (DEV Community).
  [https://dev.to/olivier32621338/the-zeigarnik-effect-and-how-it-affects-productivity-4o3p](https://dev.to/olivier32621338/the-zeigarnik-effect-and-how-it-affects-productivity-4o3p) ([DEV Community][5])

* Serie *Developer Productivity* – incluye *The Unreasonable Effectiveness of the To-do List – Zeigarnik Effect and Developer Productivity* (DEV Community).
  [https://dev.to/itstrueintheory/series/18114](https://dev.to/itstrueintheory/series/18114) ([DEV Community][6])

* Geewiz – *The psychology of unfinished tasks* (nota/resumen sobre Zeigarnik y rumia en desarrolladores).
  [https://www.geewiz.dev/notes/Readwise/Articles/The%2Bpsychology%2Bof%2Bunfinished%2Btasks%2B%28Readwise%29](https://www.geewiz.dev/notes/Readwise/Articles/The%2Bpsychology%2Bof%2Bunfinished%2Btasks%2B%28Readwise%29) ([geewiz.dev][7])

[1]: https://medium.com/%40sraavanchevireddy/ai-burnout-and-the-future-navigating-the-new-era-of-software-engineering-9fbc54b658f9?utm_source=chatgpt.com "AI, Burnout, and the Future: Navigating the New Era of ..."
[2]: https://www.theseniordev.com/blog/why-i-stopped-using-ai-as-a-senior-developer-after-150-000-lines-of-ai-generated-code?utm_source=chatgpt.com "Why I Stopped Using AI as a Senior Developer (After ..."
[3]: https://strategizeyourcareer.com/p/ai-pause-deep-work-for-engineers?utm_source=chatgpt.com "You're using AI wrong if you're trying to be fast"
[4]: https://dev.to/johannesjo/the-zeigarnik-effect-why-your-brain-wont-let-go-of-unfinished-tasks-and-how-to-use-this-with-3ocn?utm_source=chatgpt.com "The Zeigarnik Effect: Why Your Brain Won't Let Go of ..."
[5]: https://dev.to/olivier32621338/the-zeigarnik-effect-and-how-it-affects-productivity-4o3p?utm_source=chatgpt.com "The Zeigarnik Effect and How it Affects Productivity"
[6]: https://dev.to/itstrueintheory/series/18114?utm_source=chatgpt.com "Developer Productivity Series' Articles"
[7]: https://www.geewiz.dev/notes/Readwise/Articles/The%2Bpsychology%2Bof%2Bunfinished%2Btasks%2B%28Readwise%29?utm_source=chatgpt.com "The psychology of unfinished tasks (Readwise) - geewiz Knowledge ..."
