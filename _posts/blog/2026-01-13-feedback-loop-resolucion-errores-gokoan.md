---
title: "Feedback loop de resolución de errores técnicos en GoKoan"
excerpt: "Un error grande me llevó a montar un loop cerrado de detección, triage, tests y fixes seguros con Codex como operador."
tags: [gokoan, codex, ia, bugs, tdd, feedback-loop]
date: 2026-01-13
modified: 2026-01-13
comments: true
ref: feedback-loop-resolucion-errores-gokoan
---

Hoy la he liado. Pero mucho. Y estoy **MUY feliz** por ello.

No por el error en sí, sino por lo que provocó: por primera vez he sentido que GoKoan no es solo “una app que arreglamos”. Es un sistema que empieza a **desarrollar reflejos**.

Lo esencial es esto: si un producto tiene errores en producción, y esos errores se registran bien, entonces ya tienes el combustible para montar un loop cerrado: **detectar → priorizar → confirmar → corregir → verificar → dejar rastro**. No “debugging”, sino *feedback loop*.

Y sí: suena a panacea. Por eso mismo lo hice con una condición brutal: **solo si es 100% safe**.

---

## El cambio real: Codex deja de ser “generador” y pasa a ser “operador”

Hasta hace poco, mi flujo era el típico: Codex produce código, yo reviso, pruebo, ajusto.

Pero en cuanto le dejas hacer algo más que escribir —**ejecutar**, conectarse a datos, generar logs, iterar— cambia el rol. Ya no estás usando un autocomplete glorificado. Estás orquestando un agente con manos.

Ese salto es peligroso si no le pones límites. Pero si se los pones bien, aparece algo precioso: **un mecánico que trabaja con el capó abierto, con checklist y sin tocar lo que no entiende**.

---

## El loop que monté (versión operativa)

Tenía una pieza clave ya resuelta: **los errores están en BBDD**. Eso significa que el input del sistema es claro: no “sensaciones”, no “me parece que…”, sino eventos concretos con contexto.

Con eso, monté una extensión / skill para que Codex haga este flujo:

1. **Extraer**
   Lanza un script que lee los últimos errores en PRO y los vuelca a un fichero “digest” (algo que puedas pasarle a un LLM sin fricción).

2. **Triage**
   Analiza ese digest y decide qué es “lo más gordo/importante”. No por drama, sino por impacto: frecuencia, severidad, zona afectada, repetición.

3. **Fix con enfoque TDD**
   Aquí está el núcleo:

   * primero crea un test que reproduce / confirma el fallo (o una regresión equivalente),
   * luego aplica el fix en código,
   * luego ejecuta test para verificar que el fix es real y no placebo.

4. **Commit con directrices**
   Si y solo si todo está limpio, comitea siguiendo nuestras normas (naming, mensaje, alcance, etc.).

Hasta aquí suena a “autopilot”. No lo es. Es un loop que se autoejecuta **dentro de un perímetro muy estrecho**.

---

## “100% safe” no es una frase bonita: es el perímetro

La parte interesante no es que Codex arregle cosas. Eso ya lo hace cualquiera a base de iterar.

Lo interesante es que el sistema solo actúa cuando el cambio es *obviamente acotado*. Mi regla mental fue:

> Si hay una posibilidad razonable de que el fix requiera criterio de producto, refactor profundo, migraciones, o tocar zonas sensibles… se cancela. Punto.

Porque un agente rápido sin límites no es un mecánico: es un mono con una llave inglesa.

En la práctica, “safe” significa cosas como:

* cambios pequeños y locales (sin re-arquitecturar nada),
* pruebas ejecutadas (no “debería funcionar”),
* nada de tocar datos en producción más allá de leer,
* nada de secretos, nada de operaciones destructivas,
* y una salida limpia: si hay duda, **no actúa**.

---

## Resultado de ayer: seis errores menos y una release lista

Con este loop, Codex resolvió **unos 6 errores** y nos dejó lista una release.

Lo que me gustó no fue el número (aunque… no está mal). Fue la sensación: en vez de “yo luchando contra una lista de bugs”, fue “el sistema absorbiendo golpes y cerrando heridas con sutura y etiqueta”.

Y lo más importante: al final, el propio Codex no detectó errores potenciales adicionales en ese perímetro. No significa “perfecto”. Significa “cerrado el ciclo con verificación razonable”.

---

## Por qué esto importa (más allá del subidón)

Hay una trampa con la IA aplicada al desarrollo: puedes producir mucho… y aun así vivir en modo incendio.

Este tipo de loop cambia el juego porque convierte el error en *input estructurado*, no en interrupción emocional. Te mueve de “apaga fuegos” a “diseña reflejos”.

Dicho en limpio: un sistema así no elimina bugs. Elimina parte del coste cognitivo del bug.

Y eso, en una codebase viva, es oro.

---

## Lo que me llevo (criterio para repetirlo sin fliparse)

Si mañana tuviera que resumirlo en tres decisiones prácticas:

1. **Sin observabilidad no hay loop.**
   Si los errores no están bien capturados, no hay nada que automatizar. Solo hay ruido.

2. **El test es el contrato.**
   El agente puede equivocarse, pero el test reduce el margen de autoengaño. Sin test, esto es magia. Con test, esto es ingeniería.

3. **El perímetro es el producto.**
   La “inteligencia” aquí no es que Codex programe. Es que el sistema sabe cuándo *NO* debe tocar nada.

---

## Cierre

No sé si esto es “la panacea”. Suena demasiado bien como para no desconfiar un poco.

Pero sí sé esto: ayer sentí, por primera vez, que estaba construyendo algo más interesante que una app. Estaba construyendo un **sistema que aprende a corregirse** dentro de límites seguros.

La pregunta práctica para mañana es simple:

> ¿Qué parte de tu producto podría beneficiarse de un loop cerrado (detectar → test → fix → verificar) si te obligaras a definir un perímetro “100% safe” antes de automatizar nada?
