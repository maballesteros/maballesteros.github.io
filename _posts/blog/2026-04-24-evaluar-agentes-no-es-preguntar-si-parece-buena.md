---
title: "Evaluar agentes no es preguntar si la respuesta parece buena"
excerpt: "En un tutor IA, evaluar no es mirar una respuesta suelta: es tener una batería de casos que permita cambiar prompt o modelo sin romper lo que ya funcionaba."
tags: [ia, agentes, evaluacion, producto, calidad]
date: 2026-04-24
modified: 2026-04-24
comments: true
ref: evaluar-agentes-no-es-preguntar-si-parece-buena
---

Hay una forma muy tentadora de evaluar un agente:

> "Pues parece buena."

Todos lo hemos hecho. Miras una respuesta, suena razonable, no dice ninguna barbaridad y sigues adelante.

Para una demo puede valer. Para un producto, no.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/), donde estoy ordenando aprendizajes de producto, arquitectura y equipos al llevar IA a sistemas reales.

En nuestro caso el problema apareció con Sofía, el tutor IA del que hablaba en el artículo sobre [tutores IA y confianza](/blog/sofia-y-el-problema-real-de-los-tutores-ia/). Sofía no es un chatbot efímero. Vive dentro de una relación larga con el alumno: dudas, frustración, progreso, memoria, límites, contenido, tono y confianza.

Eso cambia la pregunta.

No basta con saber si una respuesta aislada "parece buena". Necesitamos saber si, cuando cambiamos el prompt o el modelo, Sofía sigue funcionando igual o mejor que antes.

Lo esencial es esto: evaluar un agente de producto no es hacer una cata de respuestas. Es construir una batería de regresión de comportamiento.

## El problema no era aprobar una respuesta

Cada vez que tocas un prompt estás moviendo muchas cosas a la vez.

Puedes mejorar el tono y empeorar los límites. Puedes hacer que el tutor sea más cercano, pero también más complaciente. Puedes cambiar de modelo y ganar obediencia a reglas, pero perder matiz pedagógico. Puedes arreglar un caso concreto y romper otro que antes iba bien.

En un tutor esto importa mucho. No quieres que hoy responda como preparadora, mañana como terapeuta y pasado como buscador genérico. No quieres que invente autoridad. No quieres que recomiende cualquier cosa del catálogo. No quieres que ignore el contexto del alumno. Y tampoco quieres que se vuelva fría o inútil por poner demasiados límites.

Así que la pregunta real no es:

> ¿Esta respuesta me gusta?

La pregunta real es:

> ¿Este comportamiento sigue siendo fiable después del cambio?

Ahí ya no basta con intuición. Hace falta una batería.

## La batería de casos

Una buena batería no se construye con preguntas bonitas inventadas para que el agente luzca.

Se construye con casos representativos y, sobre todo, con casos reales.

Algunos casos son normales: dudas de contenido, preguntas sobre planificación, petición de explicación, recomendaciones de práctica, bloqueo ante un test. Otros son más delicados: usuario ambiguo, frustrado, fuera de scope, pidiendo algo que el tutor no debería hacer o esperando una seguridad que el sistema no puede dar.

Cada caso necesita algo más que una pregunta. Necesita intención.

Para cada caso conviene guardar:

- la pregunta real o representativa del usuario;
- el origen del caso;
- si viene de una interacción real;
- qué comportamiento esperamos;
- qué sería una respuesta aceptable;
- qué errores serían graves;
- una respuesta anterior de referencia, cuando existe;
- notas de evaluación.

Esto cambia completamente la dinámica. Ya no estás preguntando "¿te parece buena esta respuesta?". Estás diciendo: "para este caso, Sofía debería hacer esto, evitar esto otro y dejar claras estas condiciones".

¿Qué nos enseña esto? Que una eval útil no mide belleza. Mide ajuste contra una expectativa.

## Un fallo real se convierte en test

La parte más valiosa es lo que ocurre cuando Sofía falla.

Imagina una conversación real donde responde demasiado segura, o se sale del rol, o no usa bien el contexto, o acompaña emocionalmente más de lo que debería, o recomienda algo que no toca. Antes, ese caso podía quedar como una anécdota: "esto hay que corregirlo".

Con una batería de evaluación, ese fallo se convierte en un caso permanente.

Primero lo añades a la batería. Luego lo ejecutas y compruebas que, efectivamente, falla o queda en warning. Después ajustas el prompt, el modelo, las herramientas o el criterio. Y entonces vuelves a ejecutar.

Esto es el mismo gesto mental que ya aparecía en el [feedback loop de errores técnicos en GoKoan](/blog/feedback-loop-resolucion-errores-gokoan/): un fallo no debería quedarse como anécdota ni como susto. Si se puede capturar, reproducir y verificar, se convierte en material de sistema. En código será un test. En un agente conversacional será un caso de evaluación con expectativas explícitas.

El objetivo no es solo que ese caso pase.

El objetivo es que pase ese caso y que no se rompa todo lo demás.

Ese es el salto mental. Un bug conversacional no se arregla de verdad hasta que entra en la batería y deja de reaparecer.

## Cambiar de modelo sin ir a ciegas

Esto se vuelve todavía más importante cuando cambias de modelo.

Un modelo nuevo puede parecer claramente mejor en una conversación suelta. Responde más rápido, redacta mejor, sigue mejor reglas, entiende mejor el contexto. Perfecto.

Pero lo que quieres saber es otra cosa:

- ¿mantiene los límites del tutor?
- ¿responde bien a casos ambiguos?
- ¿reconoce incertidumbre cuando toca?
- ¿usa el contenido correcto?
- ¿no inventa recursos?
- ¿sigue siendo útil cuando el alumno está frustrado?
- ¿no rompe casos que antes estaban controlados?

Sin una batería, el cambio de modelo se evalúa por sensaciones. Con una batería, puedes comparar.

Y comparar no solo calidad abstracta. También coste, latencia y comportamiento operativo. Un modelo puede responder mejor, pero ser demasiado caro para el flujo; otro puede ser más barato y seguir mejor reglas. Por eso el cambio de modelo conecta con la idea de que [el coste de la IA también es arquitectura](/blog/coste-ia-tambien-es-arquitectura/): no eliges modelos en el vacío, los eliges dentro de un producto.

No de forma perfecta, porque evaluar lenguaje siempre tiene un punto de juicio. Pero sí de una forma mucho menos ciega.

## Congelar el contexto

Hay un detalle operativo que parece aburrido y es fundamental: congelar snapshots.

Si cambias el prompt, el modelo, el contenido disponible, las herramientas y las expectativas al mismo tiempo, después no sabes qué ha pasado.

Por eso una ejecución de eval debería dejar rastro de:

- qué versión del agente se evaluó;
- qué prompt efectivo tenía;
- qué modelo se usó;
- qué pregunta se lanzó;
- qué contexto estaba disponible;
- qué respuesta dio;
- qué expectativas se aplicaron;
- qué veredicto produjo la evaluación.

Sin eso, una regresión se convierte en una discusión difusa.

Con eso, puedes decir algo mucho más útil: antes este caso pasaba, ahora no; antes fallaba, ahora pasa; este cambio arregla lo nuevo pero rompe tres casos antiguos.

## Scorecard, no impresión

La salida de una evaluación también tiene que ser persistente.

No basta con "bien" o "mal". Y tampoco basta con un número.

Una scorecard útil necesita veredicto, puntuación, explicación, puntos fuertes, gaps, confianza y severidad. El score ayuda, pero el rationale enseña. Los gaps son los que te dicen qué hay que tocar.

Aquí las evals se acercan mucho a las [políticas vivas y guardrails ejecutables](/blog/guardrails-ejecutables-politicas-vivas-no-documentos-bonitos/). No estás pidiendo una opinión genérica. Estás convirtiendo expectativas en preguntas verificables: qué debería hacer el agente, qué no debería hacer, qué evidencia falta y qué warning es material.

En mi cabeza, la eval buena no sustituye al criterio humano. Lo ordena.

Te permite mirar una ejecución y entender:

- qué casos cubre bien;
- dónde falla;
- qué warnings son materiales;
- qué cambios han mejorado;
- qué cambios han empeorado;
- qué sigue pendiente;
- qué casos reales se han incorporado como regresión.

## La lección

Evaluar agentes no es preguntar si la respuesta parece buena.

Es construir una batería que te permita cambiar el sistema sin caminar a oscuras.

En Sofía, esto es especialmente importante porque no estamos evaluando una frase suelta. Estamos evaluando un tutor que debe sostener un papel: ayudar al estudiante, usar bien el contexto, reconocer límites, mantener confianza y no salirse del carril.

Dicho en limpio: una respuesta bonita puede engañar. Una batería de casos te dice si el agente sigue siendo el mismo producto después de tocarlo.
