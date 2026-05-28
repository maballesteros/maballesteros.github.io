---
title: "RAG útil no es solo embeddings"
excerpt: "A veces el mejor retrieval no es buscar chunks parecidos, sino usar un índice de candidatos y modelos rápidos para decidir qué merece la pena leer."
tags: [ia, rag, retrieval, embeddings, producto]
date: 2024-05-09
modified: 2024-05-09
comments: true
ref: rag-util-no-es-solo-embeddings
---

Hay una forma bastante estándar de montar una demo de RAG:

1. troceas documentos,
2. calculas embeddings,
3. guardas vectores,
4. recuperas los chunks más parecidos,
5. se los pasas a un modelo.

Para una demo, funciona.

Para un producto, suele quedarse corto.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/), donde estoy ordenando aprendizajes de producto, arquitectura y equipos al llevar IA a sistemas reales.

Nosotros también empezamos por ahí: pruebas de chunking, búsqueda semántica, scoring, ranking, fallback textual, control de permisos, límites de latencia. Todo eso importa. De hecho, si falta, el sistema se rompe por sitios bastante previsibles.

Pero el aprendizaje interesante vino después.

Visto con perspectiva, esto conecta con una obsesión antigua mía: que el conocimiento no sea solo texto almacenado, sino contexto recuperable y accionable. Ya en [Plain Knowledge Base](/blog/plain-kb/) estaba esa intuición de fondo, aunque en una forma mucho más primitiva: si el conocimiento vive como piezas enlazables, la pregunta importante no es solo dónde está, sino cómo llegas al trozo que te permite pensar mejor.

En algunos problemas, cuando el corpus lo permite, no nos ha funcionado mejor el RAG entendido como "dame los chunks más parecidos". Nos ha funcionado mejor algo un poco más deliberado:

> primero decidir dónde mirar; después leer mejor lo que merece la pena mirar.

Y esa diferencia cambia bastante el diseño.

---

## Lo que aprendimos con el RAG clásico

Los embeddings son una pieza potente. Te permiten capturar intención, no solo texto literal. Si el usuario pregunta con otras palabras, una búsqueda semántica puede encontrar contenido relevante donde una búsqueda clásica fallaría.

Pero el embedding no sabe muchas cosas que en producto son esenciales.

No sabe si el usuario tiene permiso para ver ese documento. No sabe si dos chunks vienen del mismo bloque y están repitiendo señal. No sabe si un fragmento muy parecido está fuera de contexto. No sabe si una coincidencia literal, aunque semánticamente más pobre, es justo lo que el usuario estaba buscando.

Por eso un RAG usable acaba teniendo más piezas:

- scope de seguridad;
- chunking razonable;
- búsqueda semántica;
- fallback textual;
- ranking común;
- validación de entradas;
- presupuestos de latencia;
- evaluación continua.

Nada de esto es adorno. Es lo que separa una demo convincente de una herramienta que puedes poner delante de usuarios reales.

## El problema de los chunks

El chunking tiene una trampa: parece una decisión técnica menor, pero condiciona toda la respuesta.

Si los chunks son demasiado pequeños, recuperas frases sueltas que no sostienen bien una explicación. Si son demasiado grandes, diluyes la señal. Si cortas mal una sección, el modelo recibe justo el trozo que menciona el concepto, pero no el que lo explica. Si recuperas varios fragmentos de la misma zona, llenas contexto con redundancia.

Y luego está el problema más sutil: el usuario no quiere "chunks relevantes". Quiere que alguien entienda qué necesita y busque donde toca.

Esto en algunos casos se nota mucho.

Cuando el corpus tiene una estructura humana reconocible —documentos, capítulos, secciones, títulos, descripciones, categorías— puede ser mejor no tratarlo solo como una bolsa de fragmentos. Puede ser mejor aprovechar esa estructura.

## Cuando el corpus lo permite: índice primero, lectura después

El patrón que nos ha funcionado mejor en ciertos casos es este:

1. Mantienes un índice de contenidos candidatos: documentos, secciones, títulos, descripciones, metadatos útiles y, si tiene sentido, alguna señal semántica previa.
2. Ante una consulta, haces una primera selección de candidatos.
3. Pasas ese índice reducido, junto con la pregunta del usuario, a un modelo pequeño y muy rápido.
4. Ese modelo decide qué documentos o secciones merece la pena explorar.
5. Después, otro modelo también rápido lee esos contenidos con más contexto y extrae los fragmentos realmente útiles para responder.

No es "tirar más IA" por tirar más IA.

Es cambiar la pregunta.

En vez de preguntar:

> ¿Qué trozos se parecen más a esta query?

preguntas:

> Viendo el mapa de contenidos disponible, ¿dónde tiene sentido mirar para responder bien?

Y después:

> Ahora que sabemos dónde mirar, ¿qué partes concretas de ese contenido responden mejor a la intención del usuario?

Esta segunda forma se parece más a cómo buscaría una persona que conoce el material. Primero mira el índice. Luego abre los dos o tres sitios prometedores. Luego lee dentro.

## Por qué puede funcionar mejor

El resultado sorprende porque los modelos pequeños, bien usados, son muy buenos tomando decisiones de selección cuando el input está acotado.

No les estás pidiendo que razonen durante un minuto ni que escriban una respuesta final brillante. Les estás pidiendo tareas más humildes:

- de estos candidatos, cuáles parecen relevantes;
- qué secciones merece la pena abrir;
- qué fragmentos concretos responden a esta pregunta;
- qué resultado es dudoso y conviene descartar.

Ahí la latencia puede ser muy baja y la calidad muy buena.

Además, al leer documentos o secciones completas en la segunda fase, el sistema recupera contexto que un chunk aislado puede haber perdido: el título, la intención de la sección, el hilo de explicación, los matices alrededor.

Esto no elimina la búsqueda semántica. La recoloca.

La búsqueda semántica puede seguir ayudando a construir el conjunto de candidatos. Pero la decisión final de "qué vale la pena leer" no tiene por qué depender solo de una distancia vectorial.

## La condición: que el corpus lo permita

Esta estrategia no es universal.

Si tienes millones de documentos, no puedes pasarle "el índice" a un modelo y esperar que haga magia. Ahí necesitas retrieval clásico, índices especializados, filtros duros, ranking eficiente y probablemente varias capas de reducción.

Pero muchos productos no empiezan con un corpus infinito.

Tienen una biblioteca razonable, un catálogo, un conjunto de cursos, un grupo de documentos por cliente, una base de conocimiento acotada o un material educativo estructurado.

En esos casos, intentar resolverlo todo como "top-k chunks por embedding" puede ser una simplificación demasiado pobre.

La idea se parece bastante a leer con un buen índice delante. No porque el índice responda por ti, sino porque reduce el espacio de búsqueda y evita que confundas proximidad textual con relevancia real.

A veces hay suficiente estructura como para hacer algo más inteligente:

- usar el índice como mapa;
- usar embeddings como señal, no como juez único;
- usar modelos rápidos como selectores;
- leer con más contexto cuando el candidato lo merece;
- mantener fallback textual para términos exactos.

## La búsqueda textual sigue viva

También aprendimos algo muy poco glamuroso: la búsqueda textual sigue siendo útil.

Hay preguntas donde el usuario busca una palabra exacta, una sigla, un nombre propio, una expresión legal, una referencia literal. En esos casos, una coincidencia textual puede ser más valiosa que una similitud semántica elegante.

Un sistema robusto no necesita elegir una religión.

Puede combinar:

- vector search para intención;
- búsqueda textual para literalidad;
- modelo rápido para seleccionar candidatos;
- lectura contextual para extraer el fragmento bueno;
- ranking y validación para que la respuesta final no sea una mezcla convincente de señales flojas.

La parte importante es no enamorarse de una sola pieza.

## La lección

RAG útil no es "embeddings + prompt".

Tampoco es "chunks + top-k + modelo final".

RAG útil es diseñar cómo encuentra contexto un producto real.

A veces eso significa búsqueda vectorial clásica muy bien hecha. A veces significa retrieval híbrido. A veces significa aprovechar un índice humano de contenidos y usar modelos pequeños para decidir qué abrir. A veces significa todo lo anterior, con límites de latencia y seguridad desde el primer día.

La pregunta práctica no debería ser:

> ¿Tenemos embeddings?

Sino:

> ¿Estamos encontrando el contexto que una persona competente habría ido a buscar?

Porque esa es la diferencia.

Los embeddings ayudan a encontrar parecidos. Un buen sistema de retrieval ayuda a encontrar respuestas.
