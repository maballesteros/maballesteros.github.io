---
title: "El coste de la IA también es arquitectura"
excerpt: "La factura solo te dice cuánto has gastado. La arquitectura empieza cuando sabes qué flujo, modelo y usuario lo está consumiendo."
tags: [ia, llm, costes, latencia, arquitectura]
date: 2026-02-10
modified: 2026-02-10
comments: true
ref: coste-ia-tambien-es-arquitectura
---

Durante bastante tiempo puedes convivir con una mentira cómoda: "la IA cuesta, sí, pero ya lo veremos en la factura del proveedor".

Y eso funciona mientras la IA es un experimento, un botón escondido o una demo que usa poca gente. El problema llega cuando deja de ser un añadido y empieza a aparecer por todas partes: asistentes conversacionales, generación de contenido, prompts específicos para tareas editoriales, flujos nuevos con agentes y herramientas conectadas a tu propio sistema.

Ahí la factura mensual ya no te explica nada. Te dice cuánto has gastado, pero no te dice qué flujo lo ha provocado, qué usuario lo está concentrando, qué modelo está sobredimensionado o qué prompt se ha convertido, sin que nadie se dé cuenta, en una trituradora de tokens.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/), donde estoy ordenando aprendizajes de producto, arquitectura y equipos al llevar IA a sistemas reales.

Lo esencial es esto: el coste de la IA no es solo finanzas. Es una propiedad del diseño del sistema.

## La factura no te dice dónde duele

En nuestro caso no teníamos "una IA". Teníamos varias formas de usar modelos conviviendo al mismo tiempo.

Por un lado estaban los asistentes, con conversaciones largas y contexto acumulado. Por otro, generación de contenido mediante prompts más clásicos, de los de "dame esto con este formato". También había tareas concretas de análisis, reescritura, clasificación o apoyo editorial. Y, más recientemente, flujos con agentes que no solo responden, sino que usan herramientas, consultan información del producto y operan con más estructura.

Todo eso consume tokens, pero no consume igual.

Una respuesta corta de un asistente puede ser barata. Una operación de generación masiva puede ser cara. Un agente puede parecer razonable en una petición aislada, pero tener varias llamadas internas. Un modelo pequeño puede resolver perfectamente una tarea de clasificación, mientras que otro flujo sí necesita un modelo más capaz.

Si lo único que miras es la factura agregada, todo eso se aplana. Es como mirar el contador de la luz y tratar de adivinar si el gasto viene del horno, del aire acondicionado o de que alguien se ha dejado algo encendido durante tres días.

¿Qué nos enseña esto? Que en un producto con IA la unidad de análisis no puede ser "hemos gastado X". Tiene que ser "este flujo, con este modelo, para este tipo de usuario, está costando X y tarda Y".

## Cada llamada necesita apellido

La solución no fue montar un dashboard bonito. Fue bastante menos glamuroso y bastante más útil: que cada llamada a un modelo quedara registrada con apellido.

Apellido significa contexto de negocio.

No basta con saber que se han consumido tokens. Necesitas saber si vienen de un asistente, de una generación de contenido, de una tarea editorial, de un agente, de una búsqueda auxiliar o de un flujo experimental. Necesitas saber qué modelo se usó, cuántos tokens entraron, cuántos salieron, si hubo tokens cacheados, si hubo razonamiento, cuánto tardó la llamada y a qué usuario o cuenta se puede atribuir.

Con esa información cambian las preguntas. Ya no preguntas "¿por qué OpenAI nos ha cobrado esto?". Preguntas cosas mucho mejores:

- ¿qué parte del producto concentra el coste?
- ¿qué usuarios están consumiendo de forma anómala?
- ¿qué prompts están creciendo demasiado?
- ¿dónde estamos usando un modelo caro por inercia?
- ¿qué tareas se pueden resolver con un modelo más pequeño?
- ¿qué flujos necesitan límites explícitos?

Aquí vino el aprendizaje interesante: medir no era solo para ahorrar. Era para poder diseñar mejor.

## El día que vimos leyes enteras en el prompt

Uno de los ejemplos más tontos, y precisamente por eso más reveladores, fue ver usuarios copiando leyes enteras dentro de una petición.

Desde su punto de vista tenía sentido. Si el producto acepta texto libre y el usuario quiere que la IA le ayude con una ley, ¿por qué no pegar la ley completa? El problema es que para el sistema eso no es una pregunta normal: es una entrada enorme, carísima y muchas veces innecesaria.

Antes de tener visibilidad, ese comportamiento quedaba diluido. Podías notar que el gasto subía, pero no ver claramente que una parte venía de peticiones desproporcionadas. Después era evidente.

Y entonces la conversación cambia. Ya no es "los usuarios gastan mucho". Es: no podemos permitir que una petición razonable sean 60K tokens. Hay que poner límites, guiar mejor la entrada, explicar cuándo el texto es demasiado largo y diseñar alternativas: resumir primero, seleccionar fragmentos, pedir una parte concreta o usar otro flujo cuando el documento completo de verdad importe.

Aquí el coste se cruza con el retrieval. El problema no es solo que 60K tokens sean caros. Es que muchas veces son innecesarios. Si el sistema sabe encontrar contexto, como contaba en [RAG útil no es solo embeddings](/blog/rag-util-no-es-solo-embeddings/), no hace falta obligar al usuario a pegarlo todo. Puedes ayudarle a llegar al fragmento que importa.

¿Qué nos enseña esto? Que los límites no son un gesto defensivo contra el usuario. Son parte de la interfaz. Si el producto no define qué es una petición razonable, el usuario lo descubrirá por ensayo y error, y la factura también.

## Optimizar no es solo bajar tokens

Una vez tienes trazabilidad, aparecen decisiones mucho más concretas.

Algunas son obvias: poner límites de longitud, evitar reintentos inútiles, recortar contexto, cachear cuando tiene sentido. Otras son más de producto: separar flujos baratos y frecuentes de flujos caros y excepcionales; avisar antes de una operación pesada; degradar con una respuesta útil cuando el tiempo se agota; decidir qué tareas merecen una respuesta perfecta y cuáles necesitan una respuesta suficientemente buena, rápida y barata.

También aparece una idea que parece simple, pero que cuesta interiorizar: no todo merece el modelo más caro.

Hay tareas donde necesitas razonamiento serio. Pero hay muchas otras donde lo que necesitas es clasificación, ranking ligero, extracción con formato, reescritura controlada o una decisión muy acotada. En esas tareas un modelo rápido y barato puede ser mejor arquitectura que uno más potente, precisamente porque permite responder antes, gastar menos y reservar el modelo fuerte para donde de verdad aporta.

Es la misma lógica que usábamos en [ranking pragmático](/blog/ranking-pragmatico-heuristicas-llm-validacion/): si la tarea está acotada, el catálogo es real y la salida se valida de forma determinista, no necesitas pedirle al modelo que “sea listo” en abstracto. Necesitas que haga una pequeña decisión bien encajada.

Dicho en limpio: el objetivo no es gastar lo mínimo. El objetivo es que el coste esté alineado con el valor de cada operación.

## Legacy, agentes y herramientas en la misma foto

Hay otro detalle importante. En productos reales, la arquitectura de IA no nace limpia.

Conviven cosas antiguas y nuevas. Prompts clásicos de completado. Chats. Asistentes. Flujos con herramientas. Modelos distintos. Modos de uso distintos. Incluso formas distintas de reportar tokens, caché, salida o razonamiento.

Si cada parte se mide de una forma diferente, vuelves al problema inicial. Tienes datos, pero no tienes una foto operativa. Por eso necesitábamos una capa común que permitiera comparar, aunque por debajo cada flujo funcionara de una manera distinta.

No para esconder las diferencias, sino para poder tomar decisiones con ellas encima de la mesa.

Un asistente conversacional no se optimiza igual que una generación batch. Un agente con herramientas no se comporta igual que un prompt plano. Una búsqueda auxiliar no tiene el mismo presupuesto de latencia que la respuesta final al usuario. Pero todas compiten por el mismo margen, por la misma experiencia y por la misma confianza.

En productos como [Sofía](/blog/sofia-y-el-problema-real-de-los-tutores-ia/), esto se vuelve especialmente visible: el asistente necesita memoria, retrieval, límites y tono, pero también necesita ser rápido y sostenible. Si el coste de cada interacción se dispara, la arquitectura empieza a condicionar la experiencia educativa.

¿Qué nos enseña esto? Que la observabilidad de coste no puede ser un añadido contable al final. Tiene que formar parte del contrato de cada flujo de IA desde el principio.

## La lección

La factura solo te dice cuánto has gastado. La arquitectura empieza cuando puedes explicar por qué.

Si no sabes qué flujo consume, qué usuario concentra uso, qué modelo está sobredimensionado o qué prompt está creciendo sin control, no tienes una arquitectura AI-first. Tienes fe, una tarjeta de crédito y una sorpresa pendiente.

La pregunta práctica que me queda de todo esto es bastante simple: si mañana el uso de tu producto con IA se multiplicara por diez, ¿qué parte del sistema te daría miedo dejar ilimitada?
