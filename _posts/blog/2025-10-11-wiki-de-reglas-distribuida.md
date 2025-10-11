---
title: Wiki de Reglas Distribuida - una idea que la IA me ayudó a ordenar
excerpt: "Después de años dándole vueltas a una Wikipedia de reglas lógicas, un empujón de la IA convirtió mis cuadernos dispersos en una especificación nítida."
tags: [wiki, logica, ia, prolog, ideas]
date: 2025-10-11
modified: 2025-10-11
comments: true
---

Desde que empecé a jugar con Prolog a finales de los 90 me ronda la misma obsesión: crear un lugar donde el conocimiento lógico se escriba, se pruebe y se comparta como si fuera código. He llenado libretas, repositorios y maquetas a medias tratando de encapsular esa intuición, una especie de *Wikipedia de reglas* distribuida que nunca terminaba de tomar forma.

La idea sobrevivió porque tenía algo de inasible y precioso. Soñaba con un espacio donde las reglas fueran versionadas, verificables y reutilizables; donde cada navegador pudiera ejecutar inferencias sin depender de un servidor centralizado; donde aprender lógica implicara jugar con ejemplos vivos. Pero cada vez que intentaba plasmarlo chocaba contra el mismo muro: demasiados conceptos mezclados, demasiados puntos ciegos en la arquitectura.

No es la primera vez que escribo sobre ello. En 2013 publiqué el experimento [Plain Knowledge Base](/experiments/plain-kb/), un prototipo minimalista de grafo de conocimiento tejido con archivos de texto y referencias cruzadas con `{{llaves}}`. Más recientemente, en 2024, documenté el tutorial [Create your own IA assistant](/blog/create-your-own-ia-assistant-tutorial/) para construir un “Jarvis” personal que registra hechos y recordatorios en su propia base de conocimiento. Ambas piezas son reflejos parciales de la misma obsesión: capturar conocimiento de forma estructurada y accionable.

Este verano cambié de estrategia. En vez de obligarme a escribir otro documento técnico desde cero me apoyé en mi asistente de IA para ir destilando, capa por capa, qué quería realmente construir. A partir de notas de voz, diagramas viejos y referencias dispersas, la IA me devolvió una especificación conceptual limpia: propósito, componentes, principios, ciclo de vida, todo organizado como si fuera un manifiesto de producto. Por fin vi la idea completa, sin el ruido acumulado de veinte años de versiones inconclusas.

## Qué propone esta wiki distribuida

La especificación describe una plataforma abierta donde el conocimiento declarativo es tratable como artefactos versionados. El servidor solo guarda la historia y las firmas; el cálculo sucede en el cliente gracias a un runtime lógico en WebAssembly. Cada módulo declara sus fuentes de datos, vistas y materializaciones, y quien lo descarga puede reproducir cualquier inferencia con los mismos hashes y límites. Es la inversión consciente de la infraestructura tradicional: llevamos el peso computacional al *edge* para mantener la independencia y la privacidad.

Estos son los pilares que más me entusiasman:

- **Conocimiento como código ejecutable**: reglas, vistas y datasets funcionan como módulos verificables que se pueden importar, combinar y testear sin tocar un backend monolítico.
- **Provenance y reproducibilidad integradas**: cualquier resultado lleva consigo las versiones exactas que lo generaron, lo que permite auditar o enseñar la inferencia paso a paso.
- **Pedagogía embebida**: los tests y ejemplos viven junto a cada módulo, de modo que aprender es ejecutar, jugar y modificar en caliente.
- **Gobernanza distribuida**: la wiki es el archivo y el foro, pero no la CPU. Cada persona decide qué ejecutar, qué publicar y cuándo compartir sus derivaciones.

## Lo que cambia con la IA

El verdadero logro aquí no es que el documento exista, sino cómo se generó. La IA actuó como editora y espejo: proponía estructuras, encontraba huecos, reclamaba definiciones precisas y me obligaba a separar principios de implementaciones. Esa iteración acelerada me ayudó a salir del pantano de decisiones pendientes y a nombrar, por fin, la esencia de la idea.

¿Voy a implementarla mañana? Probablemente no. Pero ahora que la veo con esta claridad puedo avanzar por etapas: quizá diseñar primero el dialecto lógico, después un prototipo de runtime en WASM, más adelante la interfaz de la wiki. Incluso si nunca llega a producción, el ejercicio ya valió la pena por la belleza conceptual alcanzada. Tener una especificación limpia me recuerda por qué sigo enamorado de esta obsesión y me da un mapa para volver a ella cuando quiera seguir explorando.

Mientras tanto, la publico aquí para no dejar que se pierda otra vez en el cajón. A veces la mejor manera de cuidar una idea es compartirla, aunque permanezca en estado latente. Y si un día se convierte en código real, espero que conserve esa mezcla de rigor y curiosidad que la hizo sobrevivir tantos años en mi cabeza.


# ANEXO: 🧠 Proyecto: *Wiki de Reglas Distribuida*

### (una Wikipedia colaborativa de conocimiento declarativo ejecutable en el edge)

---

## 1. Propósito esencial

Crear una **infraestructura abierta** donde las personas puedan **declarar conocimiento lógico** (reglas, relaciones, transformaciones de datos) de forma **colaborativa, verificable y ejecutable localmente**.

Cada usuario no solo *lee conocimiento*, sino que puede **ejecutarlo, extenderlo, probarlo y combinarlo** directamente desde su navegador.

---

## 2. Idea central

> **"El conocimiento como código ejecutable"**, compartido y versionado como una *Wikipedia de reglas*,
> pero con ejecución **descentralizada**:
> el **cálculo y coste lo asume cada cliente**, no el servidor.

La wiki actúa como **fuente de verdad y archivo histórico**,
y cada navegador se convierte en un **motor de inferencia independiente** capaz de:

* descargar reglas firmadas y sus datasets asociados,
* ejecutarlas localmente,
* derivar conocimiento nuevo,
* y, opcionalmente, publicar resultados reproducibles.

---

## 3. Principios fundacionales

1. **Conocimiento abierto, verificable y versionado.**
   Cada regla tiene autoría, versión y trazabilidad.

2. **Ejecución local (edge).**
   Las inferencias, consultas y derivaciones ocurren en el cliente (WebAssembly).

3. **Independencia y reproducibilidad.**
   Cualquier resultado puede rehacerse exactamente, gracias a versiones fijadas y hashes de contenido.

4. **Privacidad por diseño.**
   Los datos del usuario no se envían a la nube, salvo que él lo decida explícitamente.

5. **Colaboración social.**
   Comentarios, sugerencias, peticiones, ejemplos y tests convivirán en la misma interfaz.

6. **Pedagogía integrada.**
   Cada conjunto de reglas incluye sus propios tests y ejemplos, que sirven tanto para verificar como para enseñar.

---

## 4. Componentes conceptuales

### 4.1 Wiki central (núcleo comunitario)

* Repositorio público de **reglas, módulos y versiones**.
* Página por regla o módulo con:

  * código legible,
  * documentación y ejemplos,
  * tests autoejecutables,
  * comentarios y peticiones de mejora.
* Sistema de **firma, versionado y confianza** (p. ej., `org/module@1.0.3`).
* API pública para distribución de bundles firmados.

**Analogía:** una mezcla entre *GitHub* y *Wikipedia*, pero de conocimiento lógico en Prolog extendido.

---

### 4.2 Cliente / runtime edge

* Motor de inferencia **en WebAssembly** (el runtime de Prolog extendido).
* Se ejecuta dentro del navegador, con soporte para:

  * **carga de módulos** desde la wiki (verificados criptográficamente),
  * **descarga de datos externos** (JSON/CSV con esquema declarado),
  * **materialización local** de hechos y reglas derivadas,
  * **persistencia** en caché (IndexedDB / FileSystem Access),
  * **tests ejecutables** directamente en cliente.

El cliente **paga el coste computacional**, y puede compartir opcionalmente los resultados.

---

### 4.3 Lenguaje extendido (dialecto lógico declarativo)

Extiende Prolog con tres grandes ideas:

1. **Fuentes de datos externas** (`datasource`)
   Permite declarar una fuente remota (JSON, CSV, API REST) con su esquema y límites.

2. **Vistas declarativas** (`view`)
   Mapas lógicos entre la fuente y hechos internos.

3. **Materialización local** (`materialize`)
   Reglas o consultas que pueden persistirse y reutilizarse sin recalcular.

El dialecto prioriza **pureza, reproducibilidad y seguridad** (sin I/O arbitrario ni efectos laterales).

---

## 5. Ciclo de vida de una regla o módulo

1. **Creación**: un usuario propone nuevas reglas en la wiki.
2. **Pruebas**: la propia wiki ejecuta los tests (en cliente) para validar consistencia.
3. **Publicación**: se firma y versiona el módulo (con hash de contenido).
4. **Descarga**: los clientes lo importan en sus entornos locales.
5. **Ejecución**: se combinan módulos y datos reales en el navegador.
6. **Derivación**: el usuario puede materializar conocimiento nuevo.
7. **Contribución**: las derivaciones o mejoras pueden subirse de nuevo, con trazabilidad.

---

## 6. Modelo de conocimiento

Cada entidad básica —**regla, hecho, vista o dataset**— tiene:

* un **identificador semántico** (`org/module:pred/arity`),
* un **hash de contenido** (garantía de integridad),
* y un **historial de cambios** (estilo git).

El conocimiento se estructura como una **red de dependencias versionadas**,
donde cada nodo puede verificarse, probarse o sustituirse independientemente.

---

## 7. Ejecución y reproducibilidad

Cada consulta ejecutada en cliente produce un bloque de **provenance** que describe:

* qué versiones exactas de reglas y datos se usaron,
* qué configuraciones y límites estaban activos,
* y qué resultados se derivaron.

Esto permite **reproducir o auditar** cualquier inferencia en otro contexto,
garantizando la transparencia del razonamiento.

---

## 8. Colaboración y aprendizaje

* **Tests como documentación viva:** los ejemplos y pruebas se pueden ejecutar en vivo.
* **Sistema de comentarios y peticiones:** los usuarios discuten mejoras o extensiones.
* **“Badges” de confianza:** reglas verificadas por la comunidad o por revisores.
* **Historial legible:** cada cambio se puede rastrear y citar.

La wiki se convierte así en una **escuela de razonamiento compartido**,
donde el conocimiento no solo se describe, sino que se demuestra ejecutándolo.

---

## 9. Gobernanza y sostenibilidad

* **Modelo abierto:** cualquiera puede usar y extender la plataforma localmente.
* **Modelo mixto de servicio:** la wiki puede ofrecer:

  * verificación avanzada,
  * espacio de almacenamiento para artefactos reproducibles,
  * badges o curación editorial.

El coste de cómputo lo asume el cliente,
lo que permite **escalar sin coste de infraestructura** y mantener la independencia.

---

## 10. Esencia final

> Un sistema donde **la lógica se convierte en un lenguaje de conocimiento compartido**,
> donde las reglas no viven en servidores sino en las mentes y navegadores de quienes las usan.

Un **ecosistema distribuido de inferencia**,
una *Wikipedia de reglas vivas* donde cada consulta es, a la vez, una forma de aprender, verificar y ampliar lo que sabemos.
