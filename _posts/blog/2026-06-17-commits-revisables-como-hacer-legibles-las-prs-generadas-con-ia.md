---
title: "Commits revisables: cómo hacer legibles las PRs generadas con IA"
excerpt: "Una estrategia práctica para convertir PRs grandes generadas con IA en una secuencia de commits pequeños, revisables por intención y útiles para revisión humana."
tags: [ia, agentes, codex, pull-requests, engineering]
date: 2026-06-17
modified: 2026-06-17
comments: true
ref: commits-revisables-como-hacer-legibles-las-prs-generadas-con-ia
---

Una PR generada con IA puede estar bien y aun así ser mala de revisar.

No porque el agente haya hecho algo incorrecto, sino porque ha llegado al estado final mezclando demasiadas decisiones en un único bloque: runtime, limpieza legacy, tests, documentación, wiring, ajustes de contratos, cambios de cobertura.

El resultado compila. Los tests pasan. El agente incluso puede haber validado correctamente el comportamiento final.

Pero la persona que revisa sigue teniendo delante una masa de cambios difícil de recorrer.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/), donde estoy ordenando aprendizajes de producto, arquitectura y equipos al llevar IA a sistemas reales.

También continúa una idea que ya aparecía en [Lo que las PRs saben y el código no cuenta](/blog/lo-que-las-prs-saben-y-el-codigo-no-cuenta/): si vamos a trabajar con agentes como parte del flujo normal de ingeniería, la revisión humana no puede quedar como un peaje al final. Hay que diseñarla.

Lo esencial es esto:

> cuando la IA aumenta el tamaño y la velocidad de las PRs, la unidad de revisión no puede ser solo el diff completo. Tiene que ser la decisión revisable.

## El problema no era la PR grande

Durante años hemos repetido que una PR pequeña se revisa mejor que una PR grande.

Y sigue siendo verdad.

Pero con agentes de código como Codex o Claude aparece un matiz nuevo. El agente puede avanzar muy rápido sobre una tarea que, para una persona, habría salido en muchas sesiones pequeñas. Puede tocar capas distintas, borrar soporte legacy, ajustar tests, actualizar documentación y dejar el sistema en buen estado final.

La PR resultante puede ser razonable desde el punto de vista del cambio completo, pero incómoda desde el punto de vista de la revisión.

El reviewer no está intentando solo contestar:

> ¿Está bien este código?

Está intentando contestar muchas preguntas a la vez:

- ¿por qué este runtime cambia ahora?
- ¿qué parte legacy deja de ser necesaria?
- ¿este contrato se estrecha porque ya no hay consumidores?
- ¿los tests eliminados cubrían algo que sigue importando?
- ¿la documentación describe el estado nuevo o se ha limitado a acompañar el diff?

Cuando todo eso aparece mezclado, la revisión se vuelve cara. No necesariamente mala. Cara.

¿Qué nos enseña esto? Que el problema no es solo cuánto cambia una PR, sino cuántas decisiones distintas obliga a reconstruir al mismo tiempo.

## Varias PRs tampoco siempre ayudan

La respuesta obvia sería partir el trabajo en varias PRs.

A veces es lo correcto.

Si hay hitos independientes, cambios desplegables por separado o riesgos que conviene aislar, varias PRs pequeñas son mejores.

Pero no siempre.

En migraciones, refactors, eliminación de deuda técnica o cambios cross-stack, partir demasiado pronto puede introducir otro tipo de coste:

- ramas dependientes;
- coordinación entre PRs;
- esperas de revisión;
- merge overhead;
- contexto repartido;
- estados intermedios que nadie quiere mantener mucho tiempo.

Terminas cambiando un problema por otro. La PR única es demasiado grande para revisar bien. Las PRs múltiples reparten el contexto y añaden fricción operativa.

Ahí es donde estamos probando un punto intermedio:

> una única PR final, pero dividida internamente en commits pequeños, cada uno con una intención clara.

No commits pequeños por estética.

Commits pequeños porque cada uno representa una decisión revisable.

## El commit como interfaz de revisión

Un commit no debería decir solo "he cambiado estos ficheros".

Debería ayudar al reviewer a entender qué está validando.

No es lo mismo revisar un bloque enorme donde aparecen cambios de runtime, contratos, tests y docs, que recorrer una secuencia como esta:

1. primero hacemos explícito que el runtime ya usa el almacenamiento canónico;
2. después eliminamos el contrato con el proveedor legacy;
3. luego sustituimos cobertura de transición por cobertura del estado final;
4. al final actualizamos documentación para que nadie trate el camino de migración como arquitectura viva.

La diferencia no está solo en el tamaño.

Está en la intención.

Por ejemplo, en una migración anonimizada, la secuencia podría verse así:

```text
Route feature runtime to canonical storage

Replace the runtime wiring with the canonical active and history storages,
and stop registering the completed legacy-to-canonical backfill. This makes
runtime ownership explicit before removing the old support path.
```

Este commit no dice solo "cambio el wiring". Explica la decisión: hacer explícito que el runtime ya pertenece al almacenamiento canónico antes de borrar soporte legacy.

Otro:

```text
Remove legacy provider from the runtime contract

Drop the feature from the legacy backend contract now that runtime reads and
writes no longer depend on that provider. This narrows the legacy backend
responsibility to the capabilities still actively used.
```

Aquí el reviewer sabe qué mirar. No está revisando "cosas del proveedor legacy". Está revisando si el contrato se estrecha correctamente porque ese proveedor ya no es fuente runtime para la funcionalidad.

Otro:

```text
Replace transition-mode tests with final-state coverage

Remove tests for the deleted backfill and transition modes, and add focused
runtime coverage for final-state mutations, history behavior, rollback, and
public selection rules.
```

Este commit concentra una discusión que suele mezclarse demasiado: qué cobertura desaparece porque el modo antiguo ya no existe y qué cobertura nueva prueba el estado final que sí importa.

Y otro:

```text
Document the feature as final-state runtime

Update the feature guide, related references, and guide index to describe the
canonical runtime path as the active architecture. Remove the completed
migration guide so future readers do not treat the rollout path as still live.
```

Aquí la documentación no queda como una nota al final de una PR técnica. Es una decisión propia: actualizar la memoria operativa del repo para que el camino de migración no parezca arquitectura activa.

¿Qué nos enseña esto? Que un buen commit no solo agrupa líneas. Agrupa una pregunta de revisión.

## No hace falta que cada commit compile

Esta parte puede incomodar un poco, pero es importante.

En este flujo no hace falta que cada commit intermedio compile.

Lo que tiene que compilar y pasar los tests relevantes es el estado final de la rama.

Esto separa dos objetivos que muchas veces mezclamos:

- historia de integración;
- historia de revisión.

Si estás construyendo una rama que se va a desplegar commit a commit, cada commit debe ser verde. Pero si estás preparando una PR para revisión humana, puede tener sentido ordenar los commits para que expliquen mejor las decisiones aunque un commit intermedio deje el sistema en tránsito.

Eso no significa barra libre.

No vale hacer commits arbitrarios ni romper la trazabilidad. Cada commit tiene que tener una intención clara, un subconjunto pequeño de ficheros y una explicación útil. El estado final tiene que estar validado. Y si hay un commit intermedio que no compila, no debe venderse como unidad desplegable.

La promesa no es:

> puedes desplegar desde cualquier commit.

La promesa es:

> puedes revisar la PR como una secuencia de decisiones.

En PRs generadas con ayuda intensiva de IA, esa segunda promesa suele ser más valiosa que una historia git perfectamente bisecable.

## El flujo práctico

El flujo que estamos usando es bastante simple:

1. El desarrollador implementa y valida el cambio completo como siempre.
2. Antes de subir, pide al agente que divida los cambios sin confirmar en commits pequeños para revisión humana.
3. El agente propone primero la serie: mensaje exacto, ficheros e intención de cada commit.
4. El humano revisa esa propuesta.
5. Tras aprobarla, el agente hace staging selectivo y crea los commits.
6. Se verifica el estado final de la rama.
7. Se sube una única PR.
8. La revisión se hace por commits, usando `Prev` / `Next` en GitHub.

El prompt base puede ser tan directo como este:

```text
Divide mis cambios sin confirmar en commits pequeños para revisión humana.

Cada commit debe contar una intención clara: qué cambia y por qué. No hace
falta que los commits intermedios compilen, pero el estado final sí debe
compilar y pasar tests.

Propón primero la serie con mensajes exactos, ficheros e intención de cada
commit. Tras aprobarla, crea rama, commitea con staging selectivo, verifica
el resultado final, sube la rama y abre PR.
```

La parte crítica es "propón primero".

No quieres que el agente empiece a trocear cambios a ciegas. Quieres revisar el plan de commits igual que revisarías un plan de implementación: qué decisiones ve, cómo las separa y qué orden propone.

Si el plan mezcla docs con runtime, o tests con eliminación legacy, o mete demasiados ficheros en un commit, se corrige antes de tocar git.

Esto convierte al agente en algo más útil que un escritor rápido de commits. Lo convierte en un asistente de preparación de revisión.

## Revisar por commits cambia la conversación

GitHub permite revisar una PR commit a commit con `Prev` y `Next`.

Parece un detalle menor, pero cambia bastante la experiencia cuando los commits están bien diseñados.

En vez de mirar una PR como una pared de diff, el reviewer avanza por capítulos:

- ahora revisamos el cambio de ownership runtime;
- ahora revisamos la eliminación del soporte legacy;
- ahora revisamos la cobertura;
- ahora revisamos la documentación.

Esto reduce la carga cognitiva porque en cada paso hay una pregunta dominante.

También hace más efectiva la revisión en pareja.

Para este tipo de cambios, me parece especialmente útil que autor y reviewer recorran la PR juntos. El autor guía el contexto. El reviewer valida decisiones. El commit pone el marco. GitHub enseña el subconjunto exacto de cambios.

No sustituye la revisión independiente.

Pero cuando la PR viene de una sesión intensa con agentes, hay mucho contexto que el diff no cuenta: por qué se eligió ese corte, qué alternativas descartó el agente, qué validaciones se hicieron, qué parte del cambio es migración y qué parte es arquitectura final.

La revisión en pareja permite sacar ese contexto justo donde hace falta.

¿Qué nos enseña esto? Que una PR grande no tiene por qué revisarse como una masa si la convertimos en una secuencia navegable de decisiones.

## Esto no va de limpiar el git log

La tentación sería leer esta práctica como una cuestión de higiene git.

No lo es, o no principalmente.

No estamos buscando una historia bonita para mirar dentro de seis meses. Estamos diseñando una interfaz de revisión para ahora.

En un equipo que usa agentes, esto importa porque el cuello de botella cambia. La IA puede generar código más rápido de lo que una persona puede revisar con criterio. Si no cambiamos la forma de entregar el trabajo, solo trasladamos el atasco al reviewer.

Esto conecta con las [leyes del desarrollo en un mundo agéntico](/blog/las-7-leyes-desarrollo-mundo-agentico-parte-1-constitucion/): cuando sube el throughput, la coherencia no puede depender solo de heroísmo humano. Hay que mover parte del control al sistema.

En este caso, el sistema no es una herramienta compleja.

Es una convención:

> las PRs grandes generadas con IA deben llegar divididas en commits revisables por intención.

Esa convención no evita tener que pensar. Pero hace que el pensamiento tenga puntos de apoyo.

## Dónde funciona mejor

No usaría este flujo para cualquier cambio.

Para una corrección pequeña, una PR normal basta.

Donde más sentido le veo es en trabajos con mezcla de capas o con mucha ayuda de IA:

- refactors;
- eliminación de deuda técnica;
- migraciones;
- cambios cross-stack;
- sustitución de runtime;
- retirada de soporte legacy;
- cambios donde tests y documentación tienen peso propio;
- PRs que el agente puede dejar correctas, pero no necesariamente legibles.

La señal de alerta es sencilla:

> si el reviewer necesita reconstruir demasiadas decisiones antes de poder opinar, probablemente la PR necesita commits revisables.

No siempre varias PRs.

No siempre una sesión de explicación eterna.

A veces basta con que el propio cambio cuente mejor cómo quiere ser revisado.

## La lección

Trabajar bien con agentes no termina cuando el código compila.

Termina cuando el trabajo puede ser entendido, revisado e integrado por el equipo.

Y ahí los commits importan más de lo que parecía.

En una PR tradicional, un commit puede ser solo una unidad histórica. En una PR generada con IA, un commit bien escrito puede ser una unidad de comprensión: qué decisión se tomó, qué se eliminó, qué se reemplazó, qué cobertura cambia y qué memoria del repo se actualiza.

Dicho en limpio:

> no queremos PRs grandes que obliguen al reviewer a descubrir la historia escondida en el diff. Queremos PRs que se puedan recorrer como una secuencia de decisiones explícitas.

Porque si la IA va a escribir más código, nosotros tenemos que diseñar mejores formas de revisarlo.
