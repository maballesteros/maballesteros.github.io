---
title: "Ranking pragmático: heurísticas, LLM barato y validación determinista"
excerpt: "Elegir un recurso recomendado no debería ser magia generativa: si no resuelve el problema real del lector, mejor no recomendar nada."
tags: [ia, ranking, recomendaciones, producto, llm]
date: 2025-10-17
modified: 2025-10-17
comments: true
ref: ranking-pragmatico-heuristicas-llm-validacion
---

Este caso empezó siendo mucho menos abstracto que “vamos a hacer ranking”.

El problema real era este: tenemos un post del blog, tenemos un catálogo de recursos descargables y queremos decidir si tiene sentido poner uno como CTA principal.

Suena sencillo.

Pero en cuanto lo miras con cariño aparece la trampa: casi siempre puedes encontrar algún recurso que comparte una palabra clave, una oposición, una categoría o una intención más o menos cercana. Y si el sistema tiene hambre de conversión, la tentación es meterlo.

Ahí empiezan los lead magnets malos: recursos tangenciales, promesas flojas, CTAs que no resuelven el problema del lector pero “algo tienen que ver”.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/), donde estoy ordenando aprendizajes de producto, arquitectura y equipos al llevar IA a sistemas reales.

Lo esencial es esto:

> recomendar algo también es una responsabilidad editorial.

No basta con que el recurso exista. Tiene que encajar.

---

## El fallo típico: confundir tema con problema

La versión mala del sistema dice:

> Este post habla de oposiciones sanitarias. Este recurso también. Lo recomiendo.

Pero compartir tema no es suficiente.

Un lector no llega a un post con una categoría en la cabeza. Llega con una necesidad: entender una convocatoria, resolver una duda, comparar opciones, descargar un esquema, decidir si empezar a estudiar, aclarar un requisito.

Si el recurso recomendado no ayuda con esa necesidad, el ranking ha fallado aunque semánticamente “se parezca”.

Y esto conecta bastante con el problema del [RAG útil](/blog/rag-util-no-es-solo-embeddings/): no quieres el chunk que más se parece; quieres el contexto que una persona competente habría ido a buscar. Aquí pasa lo mismo. No quieres el recurso más parecido. Quieres el siguiente paso que de verdad tiene sentido.

## El patrón que sí me gusta

El enfoque pragmático es bastante simple:

1. Primero manda el catálogo real.
2. Después deja que un modelo pequeño ayude a leer el encaje.
3. Luego valida de forma determinista que la elección existe y es publicable.
4. Y, si no hay encaje fuerte, no recomiendas recurso.

La parte importante es la cuarta.

Un sistema de recomendación decente no solo debe saber elegir. También debe saber decir:

> Aquí no hay nada suficientemente bueno.

En nuestro caso, el modelo no recibe una pregunta abierta tipo “búscame algo útil por ahí”. Recibe el post, su intención, algunos metadatos y un catálogo de recursos reales. Su trabajo no es inventar. Es clasificar candidatos:

- fuerte, si resuelve el mismo problema principal del lector;
- posible, si comparte tema pero el encaje no es perfecto;
- rechazado, si sería forzar la máquina.

Esto es mucho más humilde que “un sistema inteligente de recomendaciones”. Y precisamente por eso funciona mejor.

## La validación aburrida es la que salva el sistema

La otra mitad del diseño es menos vistosa: el modelo puede proponer, pero no puede materializar la realidad.

Si devuelve un recurso, el backend comprueba que ese recurso existe, que el slug existe, que está publicado, que la URL es la que toca y que no estamos pintando algo inventado o retirado.

Esto parece fontanería. Lo es.

Pero sin esa fontanería, el sistema puede hacer lo peor que puede hacer una IA en producto: sonar convincente mientras recomienda algo que no existe, no debe verse o no encaja.

La generación produce una propuesta. La validación decide si esa propuesta puede salir al mundo.

## La parte contraintuitiva: a veces el mejor CTA es no poner ese CTA

Esta es la idea que más me interesa.

No forzar un recurso débil es una decisión de producto. No es “perder conversión”. Es evitar que el producto parezca desesperado.

Si no hay un recurso que resuelva bien el problema del lector, hay otras salidas más honestas: llevarlo al método, a un curso, a una newsletter, a un registro genérico o simplemente no interrumpir el artículo con un descargable que no toca.

El ranking pragmático no maximiza “algo que poner”. Maximiza encaje.

Y eso cambia el criterio:

- no gana el recurso más cercano;
- gana el recurso que completa mejor el recorrido;
- y si ninguno lo completa, gana no recomendar.

Esta misma separación ayuda mucho cuando lees feedback de producto. Como contaba en [feedback loops de producto](/blog/feedback-loops-producto-opiniones-decisiones/), un comentario aislado no debería convertirse automáticamente en roadmap. Con una recomendación pasa igual: una coincidencia aislada no debería convertirse automáticamente en CTA. En ambos casos hace falta contexto, no solo señal.

## Cierre

Cada vez desconfío más de los sistemas que usan IA para cubrir una falta de criterio.

En este caso, la IA aporta valor porque el problema está bien acotado: catálogo real, tarea pequeña, modelo barato, salida estructurada y validación dura.

También porque el modelo no tiene que fingir que entiende todo el negocio. Hace una tarea concreta dentro de un carril claro. Ese es el punto que más me interesa de estos sistemas pequeños: cuando el criterio está bien definido, un modelo barato puede ayudar mucho sin convertirse en autoridad.

La pregunta práctica no es:

> ¿Qué recurso puede recomendar el modelo?

Sino:

> ¿Qué recurso recomendaría una persona responsable sabiendo que también puede decidir no recomendar ninguno?

Esa diferencia, pequeña en apariencia, es la que separa una recomendación útil de un banner con ansiedad comercial.
