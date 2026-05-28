---
title: "Guardrails ejecutables: políticas vivas, no documentos bonitos"
excerpt: "El salto no fue escribir mejores skills, sino separar guías de proceso y políticas de contenido para producir, auditar y aprender con feedback humano."
tags: [ia, agentes, guardrails, arquitectura, calidad]
date: 2026-02-20
modified: 2026-02-20
comments: true
ref: guardrails-ejecutables-politicas-vivas-no-documentos-bonitos
---

Hay una fase bastante reconocible cuando empiezas a usar IA para producir o revisar contenido:

> "Tenemos que escribir mejores guías."

Y sí, claro. Hay que escribir mejores guías. Pero llega un momento en que eso se queda corto.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/), donde estoy ordenando aprendizajes de producto, arquitectura y equipos al llevar IA a sistemas reales.

En nuestro caso, al principio esas guías vivían sobre todo en formato de skills: documentos operativos que explicaban al agente cómo trabajar, qué pasos seguir, qué herramientas usar, cómo abrir una revisión, cómo hacer handoff, qué no debía tocar, cuándo pedir ayuda.

Eso está bien. De hecho, es imprescindible.

Pero ahí apareció una distinción que para mí ha sido clave: una skill guía el proceso; una política define las condiciones que debe cumplir el material.

Esta distinción encaja con algo que ya había formulado desde el lado del desarrollo en [las 7 leyes del mundo agéntico](/blog/las-7-leyes-desarrollo-mundo-agentico-parte-1-constitucion/): cuando sube el throughput, no puedes sostener coherencia solo con atención humana. Necesitas mover parte del criterio a contratos, invariantes y mecanismos de verificación. En contenido pasa lo mismo, aunque el material sea editorial en vez de código.

El problema real no era solo que el agente no hubiera leído la documentación. Era más incómodo: muchas veces el criterio sobre el contenido no estaba tan definido como pensábamos.

En GoKoan creíamos saber qué era "un buen post", "una buena landing", "una actividad didáctica correcta" o "una explicación útil para un opositor". Pero cuando pones a varios humanos, o a varios agentes, a trabajar sobre esos activos, aparece la verdad: cada persona traía una versión ligeramente distinta de ese estándar.

Lo esencial del trabajo de governance no fue poner más controles. Fue separar proceso y contenido, y convertir criterio editorial disperso en políticas revisables, ejecutables y mejorables.

## Lo que estaba indefinido

Un ejemplo muy claro fue el blog.

Sobre el papel parecía sencillo: un post tiene título, contenido, categoría, SEO, imagen, enlaces, CTA. Nada especialmente misterioso.

Pero en cuanto empiezas a revisar posts de verdad aparecen preguntas que no se resuelven con "hazlo bien":

- ¿La categoría se decide por el tema principal, por una mención secundaria o por el producto al que queremos empujar?
- ¿Un post largo es mejor, o estamos metiendo relleno para cumplir una longitud arbitraria?
- ¿Hay que insertar siempre un recurso descargable, o solo cuando de verdad resuelve el mismo problema?
- ¿Una CTA aislada vale, o tiene que haber una estrategia coherente entre banner, enlaces y siguiente paso?
- ¿Una FAQ aporta claridad, o es otra sección ritual para SEO?

Estas cosas parecen detalles. No lo son.

Son exactamente los puntos donde antes dependías de gusto, memoria, contexto oral o revisión de alguien con experiencia en el producto. Y claro, cuando un agente no acertaba, la tentación era decir: "la IA no entiende nuestro estándar".

Pero muchas veces el estándar no estaba suficientemente escrito.

¿Qué nos enseña esto? Que una política útil no empieza como tecnología. Empieza como una conversación incómoda sobre qué queremos decir exactamente cuando decimos "bien".

## Skills para proceso, políticas para contenido

El salto importante fue dejar de pedirle a una guía que hiciera dos trabajos distintos.

La guía de trabajo responde a preguntas de proceso: cómo se abre una revisión, qué pasos sigue el agente, cómo se enfoca una iniciativa, cómo se registra el resultado, cuándo se pasa a revisión humana.

La política responde a otra pregunta: qué tiene que ser verdad del contenido para que podamos decir que está bien.

Esa diferencia parece pequeña, pero cambia todo. Si mezclas ambas cosas en una misma guía, acabas con documentos larguísimos que nadie lee del todo y que el agente interpreta como puede. Si separas proceso y contenido, el agente sabe cómo trabajar por un lado y qué estándar debe cumplir por otro.

Una política, en este sentido, no es un PDF con recomendaciones. Es un contrato operativo sobre el activo final.

Además, para que sea útil, tiene que poder leerse por humanos. Esto también me parece importante. No vale con tener un YAML opaco lleno de checks. Las reglas tienen que estar agrupadas alrededor de conceptos grandes: clasificación editorial, intención de búsqueda, calidad del contenido, CTA, enlaces, vigencia, composición didáctica, etc.

Esa jerarquía ayuda a entender la política. No solo a ejecutarla.

En un post de blog, por ejemplo, algunas reglas son mecánicas: que el slug sea válido, que no haya H1 metido en el cuerpo, que las imágenes tengan alt, que no queden enlaces legacy, que la categoría exista, que el enlazado interno mínimo esté resuelto. Eso se puede comprobar de forma bastante determinista, y ahí la política puede apoyarse en código.

Otras reglas se parecen más al criterio de recomendación que comentaba en [ranking pragmático](/blog/ranking-pragmatico-heuristicas-llm-validacion/). No basta con que exista un recurso descargable. Tiene que resolver el mismo problema del lector. Esa no es una validación mecánica pura, pero sí puede convertirse en una pregunta de auditoría bastante concreta.

Otras reglas necesitan juicio: que la categoría elegida sea la que realmente corresponde a la intención de búsqueda, que el primer párrafo responda rápido, que el contenido sea extractable por IA sin convertirse en una lista artificial, que el lead magnet no sea un pegote, que la CTA no empuje a un sitio que no tiene sentido para ese lector.

La gracia está en separar ambas cosas.

Lo mecánico debe caer por reglas duras: HTML válido, campos obligatorios, enumerados correctos, dobles espacios, slugs, imágenes, enlaces, estructuras mínimas. Lo editorial debe caer por auditoría, pero no por una auditoría vaga del tipo "¿te parece bueno?". Debe tener preguntas concretas, evidencia mínima y criterios de reparación.

Ahí cambia mucho la calidad del trabajo. El agente ya no recibe "mejora el post". Recibe un activo completo, una intención, una política aplicable y una forma concreta de demostrar que ha cumplido.

## La misma política tiene dos lecturas

La idea que más me gusta de este modelo es que una misma política sirve para producir y para auditar.

Para el agente productor, la política aparece como un conjunto de reglas aplicables al material. Reglas formuladas de forma bastante taxativa:

- el post debe resolver la intención principal de búsqueda desde el inicio;
- la categoría debe salir del catálogo vigente y encajar con el problema principal del lector;
- no se debe insertar un recurso si no resuelve el mismo problema;
- cuando una excepción editorial sea necesaria, debe declararse y justificarse;
- las actividades didácticas deben poder entenderse sin depender de contexto invisible.

Esas frases orientan la producción. Dicen qué debe ocurrir o qué no debe ocurrir.

Para el agente auditor, la misma política se transforma en checklist. Cada regla tiene asociada una pregunta:

- ¿el post responde la intención principal de búsqueda desde el inicio?
- ¿la categoría seleccionada encaja con el problema principal del lector?
- ¿el recurso recomendado resuelve el mismo problema que trajo al usuario hasta aquí?
- ¿la excepción editorial está declarada y justificada?
- ¿la actividad didáctica se entiende sin contexto invisible?

Esto es crítico porque productor y auditor dejan de hablar idiomas distintos. Uno trabaja con reglas de producción; el otro con preguntas de verificación. Pero ambos están mirando el mismo contrato.

¿Qué nos enseña esto? Que una buena política no es solo una lista de checks. Es una forma de alinear producción, auditoría y revisión humana alrededor de las mismas condiciones.

## Revisar agregados, no campos sueltos

Otra pieza que me parece clave es que la revisión no se haga sobre campos sueltos.

Un post no es solo un body HTML. Una landing no es solo una cabecera. Un contenido didáctico no es solo una explicación.

Cada uno de esos activos es una unidad editorial con muchas piezas que se afectan entre sí. Si cambias una landing de un curso, quizá también tienes que revisar posts satélite que enlazan a esa landing. Si cambias la clasificación de un post, afecta al recorrido SEO, a los enlaces internos, al tipo de CTA y al recurso recomendado. Si generas contenido didáctico legal, no basta con que "suene bien": debe respetar la jerarquía de la norma, separar literal legal de explicación, anclar preguntas y actividades al contenido correcto y no inventar contexto.

Esto fue una de las ganancias grandes del enfoque por agregados: transformar entidades editables muy distintas en una superficie de trabajo común.

Da igual si hablamos de una sección didáctica, un post del blog, una landing, una categoría o una ficha pública. Para el agente, todas pueden presentarse como una revisión de agregado: una foto coherente del activo, con sus datos editables, su contexto relevante, sus derivados de lectura, sus cambios propuestos y sus políticas aplicables.

Esa abstracción no elimina la semántica de cada dominio. Al contrario: permite que cada dominio aporte su propia política sin obligar al agente a aprender un flujo distinto para cada tipo de contenido.

En la práctica, el flujo se parece más a esto:

1. Hay una iniciativa con intención clara.
2. Se abre una revisión sobre un activo completo.
3. El agente produce cambios dentro de esa revisión.
4. Las políticas validan el resultado con checks mecánicos y auditoría por IA.
5. El resultado queda congelado y revisable antes de publicar.
6. La publicación final sigue siendo una acción humana explícita.

Esto parece burocracia hasta que lo comparas con la alternativa: cambios editoriales dispersos, criterios implícitos, estados intermedios imposibles de reconstruir y revisiones donde nadie sabe si se está opinando sobre el texto, sobre la estructura, sobre SEO o sobre la intención original.

También conecta con una idea más antigua: tratar conocimiento como algo estructurado, versionable y ejecutable. En [Wiki de Reglas Distribuida](/blog/wiki-de-reglas-distribuida/) lo llevaba a un extremo más lógico y declarativo. Aquí la versión práctica es menos ambiciosa, pero comparte la intuición: si una regla importa, conviene darle una forma que pueda leerse, revisarse y aplicarse.

## El bucle productor-auditor

La parte que más me interesa ahora es el bucle entre agente productor, agente auditor y humano.

El patrón es potente:

- un agente principal produce o corrige el contenido;
- un auditor independiente revisa contra políticas;
- el agente principal recibe esa auditoría y corrige;
- el ciclo se repite hasta que productor y auditor convergen;
- entonces entra una persona, revisa el resultado y deja comentarios.

Lo importante es que el comentario humano no sirve solo para arreglar ese caso.

Primero sirve, por supuesto, como feedback directo: "esto no me gusta", "esta CTA no encaja", "esta clasificación es floja", "aquí falta una distinción". El agente debe corregir el activo.

Pero además deja una segunda señal: quizá la política no decía eso con suficiente precisión. O quizá no lo decía en absoluto.

Ese es el punto fino. El humano no está solo revisando contenido. Está ayudando a descubrir dónde el estándar común sigue siendo incompleto.

Si ese comentario revela un patrón reutilizable, no debería quedarse como sabiduría oral ni como bronca recurrente en revisiones futuras. Debería alimentar la política: añadir una regla, aclarar una excepción, cambiar una severidad, pedir una evidencia distinta o separar dos criterios que estaban mezclados.

## Un ejemplo: categorías, longitudes y recursos

El caso del blog lo explica bastante bien.

Una política pobre diría:

> El post debe estar bien categorizado, tener una longitud adecuada y proponer recursos útiles.

Eso no sirve de mucho.

Una política útil fuerza decisiones más concretas:

- la categoría se decide por la búsqueda principal, la SERP esperada y el problema del lector, no por temas secundarios;
- si ninguna categoría encaja de forma limpia, no se inventa una nueva: se usa la mejor disponible y se registra deuda editorial;
- la longitud no se mide con un rango global ciego, sino según la etapa del recorrido del usuario;
- si el texto queda fuera de rango pero aporta valor, se declara una excepción editorial, no se rellena por rellenar;
- un lead magnet solo se recomienda si resuelve el mismo problema; si no hay candidato fuerte, es mejor no meterlo.

Esto ya no es "que el agente tenga buen gusto". Es convertir buen gusto en criterio discutible.

Y esa palabra, "discutible", es importante. Una política no elimina el juicio humano. Lo hace visible. Te permite decir: esta regla no está bien, esta excepción falta, esta severidad es demasiado dura, este caso demuestra que el catálogo de categorías se nos ha quedado corto.

## En didáctica pasa lo mismo

En contenido didáctico el patrón se ve todavía más claro.

Antes puedes tener una intuición general: "que el contenido sea correcto, útil y pedagógico". Pero eso no basta para producir contenido de calidad de forma repetible.

Hay que bajar a preguntas más duras:

- ¿la explicación respeta el contenido normativo o lo está suavizando hasta cambiarlo?
- ¿la literalidad legal está separada de la explicación didáctica?
- ¿las preguntas se sostienen por sí mismas o dependen de haber leído el párrafo anterior?
- ¿las actividades cubren bien el concepto o solo rellenan portfolio?
- ¿el esquema ayuda a estudiar o es una tabla mínima para pasar el check?

Lo interesante es que estas preguntas no salen de la nada. Salen de revisar casos reales, de ver qué falla, de discutir qué debería haber pasado y de convertir ese aprendizaje en reglas que el siguiente agente pueda usar.

## La lección

Ahora entiendo los guardrails de otra manera.

No son una valla alrededor del agente para que no rompa cosas. O no solo eso.

Son una forma de cristalizar criterio. De convertir estándares implícitos en contratos revisables. De hacer que un equipo deje de depender de "esto Clara lo habría puesto así" o "editorial siempre corrige esto" y empiece a tener un lenguaje común para producir, auditar y mejorar.

La documentación sigue siendo necesaria, claro. Explica intención, contexto y por qué. Pero si un criterio importa de verdad, tarde o temprano tiene que bajar a una política, a una evidencia, a una revisión y a un loop de mejora.

Dicho en limpio: una guía dice cómo nos gustaría trabajar. Una política viva nos ayuda a trabajar así, detectar cuándo no lo estamos haciendo y aprender por qué.
