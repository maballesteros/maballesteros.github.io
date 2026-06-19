---
title: "Fronteras para agentes (1/3): el contrato SPA-API"
excerpt: "Primera entrega de la miniserie: si los lenguajes aceleran el feedback de los agentes, las fronteras bien diseñadas evitan que frontend y backend deriven en silencio."
tags: [ia, agentes, arquitectura, frontend, backend, engineering]
date: 2026-06-19 00:03:00 +0200
modified: 2026-06-19
comments: true
ref: fronteras-para-agentes-contrato-spa-api
---

Miniserie **Fronteras para agentes**: entrega **1/3**.

Siguiente: [Backend y base de datos](/blog/fronteras-para-agentes-backend-base-de-datos/).

En [Lenguajes para agentes](/blog/el-lenguaje-importa-mas-cuando-programa-un-agente/) la idea era que el lenguaje no importa menos cuando programa un agente. Importa más, porque se convierte en parte del loop de feedback.

Un buen compilador, unos tipos expresivos o un sistema de errores explícito pueden hacer que muchos fallos aparezcan antes: en `cargo check`, en `tsc --noEmit`, en un test focalizado, en un linter o en una validación determinista.

Pero el lenguaje no es el único sitio donde se gana o se pierde velocidad.

Hay otro sitio donde los sistemas se rompen mucho: las fronteras.

Cada vez que una capa habla con otra, aparece una traducción. Frontend a backend. Backend a base de datos. Dominio a DTO. Evento a consumidor. API pública a cliente externo. Lo que para una capa es un objeto, para la otra es JSON. Lo que para una base de datos es `nullable`, para el backend puede ser `Option`, `String?`, `undefined` o una bomba de relojería.

En esas traducciones vive una parte enorme de los errores de producción.

Y en programación agéntica, esa zona se vuelve todavía más importante.

Porque si un agente puede cambiar frontend y backend muy rápido, también puede desincronizarlos muy rápido. Si la frontera está bien diseñada, el sistema le devuelve feedback. Si la frontera está mal diseñada, el error puede sobrevivir hasta que alguien abra la pantalla, pulse un botón y vea que algo no encaja.

La tesis de esta miniserie es esta:

> en sistemas con agentes, las fronteras entre capas tienen que comportarse como contratos ejecutables, no como acuerdos informales entre ficheros.

Esta primera entrega mira una frontera muy común: una SPA en React o Angular hablando con un backend por API.

## El problema no es REST

El patrón es conocido:

- una aplicación frontend;
- un backend con API HTTP;
- DTOs de request y response;
- errores de validación;
- enums de dominio;
- paginación;
- filtros;
- autenticación;
- estados de carga;
- manejo de errores.

Esto puede estar montado con React, Angular, Vue o cualquier framework de frontend. El backend puede estar en Node, Kotlin, Java, Go, Rust, Python o .NET. La API puede ser REST, GraphQL, RPC o una mezcla.

El problema no es REST.

El problema es el contrato.

En un sistema pequeño, el contrato parece fácil de recordar. El endpoint `/tasks` devuelve `id`, `title`, `status` y `dueDate`. El frontend lo consume. Todo bien.

Hasta que un día el backend cambia `dueDate` por `dueAt`, añade un estado nuevo `blocked`, convierte un campo obligatorio en opcional o modifica el shape de un error.

Si el frontend y el backend no comparten una fuente de verdad, el sistema puede quedar en una situación incómoda:

- el backend compila;
- el frontend compila;
- los tests pasan porque no cubrían ese caso;
- la pantalla falla en runtime.

Para un humano, esto ya era un problema clásico.

Para agentes es más delicado, porque el agente puede tocar los dos lados con mucha más velocidad que una persona, pero no necesariamente con una comprensión perfecta de todos los consumidores.

Si la frontera no le devuelve feedback, el agente puede creer que ha terminado.

Y el coste se desplaza al reviewer.

## La frontera como superficie de feedback

En la serie anterior mirábamos el lenguaje como una superficie de feedback.

Aquí la pregunta cambia:

> ¿qué feedback devuelve la frontera cuando alguien cambia el contrato?

Una frontera pobre dice poco:

```ts
const response = await fetch("/api/tasks")
const tasks = await response.json()
```

A partir de ahí, el frontend puede tratar `tasks` como lo que espera que sea. Pero el sistema no ha demostrado nada. `json()` devuelve datos sin confianza. TypeScript puede ayudar si haces un cast, pero un cast no valida:

```ts
const tasks = await response.json() as TaskDto[]
```

Esto tranquiliza al compilador, no al sistema.

Una frontera mejor convierte el contrato en algo que se puede comprobar:

- tipos compartidos;
- schemas runtime;
- cliente generado;
- spec versionada;
- contract tests;
- CI que falla cuando el contrato deriva;
- mocks generados desde la misma fuente de verdad.

Desde el punto de vista agéntico, la diferencia es enorme.

En el primer caso, el agente cambia algo y no recibe señal hasta muy tarde. En el segundo, puede romper un tipo, un schema, una generación de cliente o un test de contrato. Ese fallo es más barato, más concreto y más corregible.

## Opción 1: TypeScript compartido en monorepo

Si frontend y backend están en TypeScript, y además viven en un monorepo, hay una opción muy atractiva: compartir contratos como paquete interno.

Algo así:

```text
packages/
  contracts/
    task.ts
  backend/
  frontend/
```

Y en `contracts`:

```ts
export type TaskDto = {
  id: string
  title: string
  status: "todo" | "blocked" | "done"
}
```

El backend usa `TaskDto` para responder. El frontend usa `TaskDto` para pintar. Si alguien cambia `status`, `title` o `id`, TypeScript puede romper ambos lados.

Para agentes, esto es muy potente.

El agente no tiene que descubrir dos modelos paralelos. Puede ver el contrato compartido. Si lo cambia, `tsc` le dice qué consumidores quedan desactualizados.

La ventaja principal no es que TypeScript sea "mejor backend" que Kotlin, Go o Rust. La ventaja es que, para esta frontera concreta, tener un mismo sistema de tipos a ambos lados reduce muchísimo el coste de sincronización.

En un SaaS típico, con una SPA y un backend de producto que cambia rápido, esto puede ser una decisión muy pragmática.

Pero tiene un matiz importante.

Compartir tipos no basta.

## El problema de TypeScript: el JSON no sabe tipos

TypeScript comprueba tipos en compilación, pero esos tipos desaparecen en runtime.

Cuando el frontend recibe JSON por HTTP, está recibiendo datos externos. Aunque backend y frontend vivan en el mismo repo, siguen comunicándose a través de una frontera que en runtime no transporta tipos TypeScript.

Por eso un tipo compartido como este ayuda, pero no valida:

```ts
export type TaskDto = {
  id: string
  title: string
  status: "todo" | "blocked" | "done"
}
```

Si quieres que el contrato exista también en runtime, necesitas un schema:

```ts
import { z } from "zod"

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["todo", "blocked", "done"]),
})

export type TaskDto = z.infer<typeof TaskSchema>
```

Ahora el contrato cumple dos funciones:

- genera el tipo estático `TaskDto`;
- valida datos reales con `TaskSchema.parse(...)`.

Esto es un cambio pequeño, pero desde la perspectiva agéntica importa mucho.

El agente ya no tiene que mantener por separado un tipo y una validación. Si cambia el schema, cambia el tipo. Si el dato real no cumple, falla en el boundary.

Zod se define como una librería de validación TypeScript-first con inferencia estática de tipos. Ver [Zod](https://zod.dev/). Hay alternativas como Valibot o Effect Schema, y la elección concreta depende del stack. La idea de fondo es la misma: no confiar en un cast cuando puedes validar en la frontera.

Esto evita una trampa común:

```ts
const task = data as TaskDto
```

Ese `as` puede ser útil en un momento puntual, pero para un agente es peligroso si se convierte en mecanismo habitual. Le permite callar al compilador sin demostrar que el contrato se cumple.

Una frontera agent-friendly debería hacer lo contrario: dificultar los silencios falsos.

## Opción 2: tRPC cuando todo es TypeScript

Si el sistema es full-stack TypeScript, [tRPC](https://trpc.io/docs) es una opción muy interesante.

La documentación lo resume como APIs end-to-end typesafe sin schemas ni codegen, aprovechando la inferencia de TypeScript para mantener sincronizados cliente y servidor.

Desde fuera, eso suena casi diseñado para agentes.

El backend define procedimientos. El frontend consume esos procedimientos con tipos inferidos. Si cambia la entrada o salida, el frontend se entera en compilación.

La ventaja es clara:

- no hay OpenAPI que mantener a mano;
- no hay cliente generado en un paso separado;
- el contrato vive muy cerca del código;
- la experiencia de desarrollo es rápida;
- `tsc` puede detectar consumidores rotos.

Para un producto interno, monorepo, con frontend y backend en TypeScript, tRPC puede dar un loop muy corto:

1. el agente cambia el router;
2. el frontend rompe en tipos;
3. el agente corrige consumidores;
4. los tests validan comportamiento;
5. la PR llega con menos drift.

Pero tRPC también tiene coste.

No es una frontera especialmente neutral. Acopla cliente y servidor al mundo TypeScript. Si tienes consumidores externos, equipos en otros lenguajes, SDKs públicos, una API que quieres documentar como producto o un backend en Kotlin/Rust/Go, quizá no sea la mejor fuente de verdad.

La pregunta no es si tRPC es "mejor que REST".

La pregunta es:

> ¿quiero optimizar esta frontera para un monorepo full-stack TypeScript o necesito un contrato agnóstico que sobreviva fuera de ese repo?

En el primer caso, tRPC puede ser una ventaja enorme.

En el segundo, probablemente miraría OpenAPI, GraphQL o Protobuf.

## Opción 3: OpenAPI cuando hay lenguajes distintos

Si el backend está en Kotlin, Rust, Go, Java o .NET y el frontend está en TypeScript, compartir tipos directamente ya no es tan natural.

Ahí aparece OpenAPI.

La [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) define una descripción estándar y agnóstica de APIs HTTP para que humanos y máquinas puedan entender las capacidades de un servicio sin inspeccionar código fuente, documentación adicional o tráfico de red.

Desde la perspectiva de agentes, eso es muy importante: OpenAPI convierte la frontera en un artefacto legible por herramientas.

Un flujo típico:

```text
Backend
  -> genera openapi.json
  -> genera cliente TypeScript
  -> frontend usa cliente generado
  -> CI falla si el contrato cambia sin actualizar cliente/tests
```

Ese paso de generación es parte de la arquitectura, no una tarea administrativa secundaria.

Si el agente cambia el contrato, debe regenerar. Si el cliente generado cambia, el diff debe dejar claro que es una consecuencia. Si el servidor no cumple el spec, el test de contrato debe fallar.

La fuente de verdad puede estar en varios sitios:

- contract-first: escribes OpenAPI y generas stubs/clientes;
- backend-first: el backend genera OpenAPI desde controladores/anotaciones/tipos;
- schema-first parcial: schemas compartidos y rutas generadas alrededor.

Lo importante no es la etiqueta.

Lo importante es que no haya cinco verdades.

Si el backend devuelve una cosa, OpenAPI dice otra, el cliente generado espera una tercera y la documentación cuenta una cuarta, el agente va a tener un problema. Y el humano también.

OpenAPI funciona bien cuando:

- frontend y backend están en lenguajes distintos;
- hay consumidores externos;
- quieres documentación de API;
- necesitas SDKs generados;
- tienes repos separados;
- quieres contract tests;
- el contrato debe ser más estable que una implementación concreta.

Su debilidad aparece cuando el spec se vuelve un documento muerto.

Si OpenAPI se actualiza "cuando alguien se acuerda", deja de ser contrato y vuelve a ser documentación. Para que sea agent-friendly, tiene que estar en el loop:

- generación automática;
- validación en CI;
- cliente TypeScript generado;
- diffs de contrato revisables;
- tests contra mocks o servidor real;
- reglas de compatibilidad cuando la API es pública.

El agente necesita que el spec falle, no que simplemente exista.

## Opción 4: GraphQL como schema compartido

GraphQL resuelve esta frontera de otra manera: el schema es el contrato.

El frontend puede generar tipos a partir de sus queries. El backend expone un schema tipado. Herramientas como codegen permiten que una query que pide `task.status` se convierta en tipos concretos en el cliente.

Desde la perspectiva agéntica, GraphQL tiene ventajas claras:

- schema central;
- introspección;
- tipos generados por operación;
- buena experiencia frontend para datos compuestos;
- detección temprana si una query deja de ser válida.

Pero también introduce otro tipo de complejidad:

- resolvers;
- N+1;
- caching;
- autorización por campo;
- versionado menos explícito que REST;
- errores que pueden ser parciales;
- una capa de ejecución que hay que observar bien.

No lo usaría como respuesta automática.

Lo vería fuerte cuando el producto tiene pantallas con necesidades de datos cambiantes, varios clientes, composición de entidades y un equipo capaz de cuidar el schema como contrato vivo.

Para agentes, GraphQL puede ser muy bueno si el schema y el codegen están bien integrados. Puede ser confuso si el schema es grande, los resolvers esconden demasiada lógica o los errores no están bien modelados.

De nuevo, la pregunta no es "GraphQL sí o no".

La pregunta es qué feedback devuelve cuando el agente cambia una entidad, una query o una regla de autorización.

## Feedback directo vs feedback con generación

Después de ver las opciones, hay una diferencia que no conviene esconder.

No todas las estrategias devuelven feedback con la misma latencia.

En la opción TypeScript compartida, si el contrato vive como código fuente consumido por frontend y backend, el loop puede ser muy directo:

```text
Cambias TaskSchema
  -> cambia TaskDto inferido
  -> rompe backend si responde mal
  -> rompe frontend si consume mal
  -> tsc lo detecta
```

No hay un paso conceptual intermedio. No tienes que generar un cliente para que el frontend se entere. El schema es el artefacto que ambos lados importan.

Eso es muy potente para agentes.

El agente toca una fuente de verdad y el compilador le devuelve inmediatamente qué superficies se han roto. Si el repo tiene `tsc --noEmit`, tests y validación runtime bien conectados, el feedback puede ser rápido y bastante preciso.

En cambio, con OpenAPI, Protobuf o ciertos flujos GraphQL, suele aparecer una etapa adicional:

```text
Cambias spec/schema
  -> regeneras cliente/servidor/tipos
  -> compilas consumidores
  -> ejecutas tests
```

Eso no es malo.

Pero no es gratis.

Hay más superficies:

- la especificación;
- el código generado;
- el servidor real;
- el cliente consumidor;
- los tests o mocks derivados.

La regla operativa debería ser clara: el agente no debe "arreglar" a mano el código generado. Debe cambiar la fuente de verdad y regenerar.

Si toca el cliente generado directamente, está silenciando el síntoma y rompiendo el mecanismo.

Para que una estrategia con codegen sea agent-friendly, necesita estar muy procedimentada:

- comando canónico de generación;
- generated files marcados como no editables;
- CI que falle si el código generado está desactualizado;
- tests que comparen spec y servidor real;
- instrucciones explícitas para que el agente regenere después de tocar contrato;
- diffs revisables donde se separe el cambio de spec del cambio generado.

Visto así, la fricción del codegen puede ser real o solo aparente.

Es real si la generación es lenta, manual, frágil o depende de conocimiento tribal. En ese caso, el agente puede saltársela, tocar artefactos derivados o dejar el repo en un estado medio actualizado.

Es bastante aparente si está automatizada: `pnpm generate`, `make api-client`, `buf generate`, `graphql-codegen`, CI de "generated files up to date" y un mensaje de error claro. Ahí el coste existe, pero se convierte en un paso mecánico que el agente puede ejecutar.

La diferencia con TypeScript compartido sigue estando: el feedback directo tiene menos piezas móviles. Pero el codegen compra otra cosa muy valiosa: neutralidad de lenguaje, API pública, SDKs, repos separados y contratos más estables.

Por eso no es una cuestión de "codegen malo".

Es una cuestión de coste de frontera.

Si puedes permitirte una frontera interna full-stack TypeScript, el feedback directo es una ventaja. Si necesitas una frontera políglota o pública, el codegen puede ser el precio correcto, siempre que esté automatizado y tratado como parte del contrato.

## La matriz práctica

Si tuviera que elegir estrategia para una SPA + API pensando en agentes, usaría una matriz simple.

| Contexto | Estrategia que miraría primero | Por qué |
|---|---|---|
| Monorepo full-stack TypeScript, API interna | tRPC o schemas compartidos | Feedback directo por compilador, poca fricción, menos superficies |
| React/Angular + backend TypeScript REST | Schemas compartidos + cliente tipado | Mantiene REST, reduce drift, valida runtime sin depender solo de casts |
| Frontend TS + backend Kotlin/Rust/Go | OpenAPI + cliente TS generado | Contrato agnóstico; requiere generación automatizada y CI de compatibilidad |
| API pública o con consumidores externos | OpenAPI contract-first o backend-first estricto | Documentación, SDKs, versionado y revisión explícita de breaking changes |
| Producto con datos muy composables | GraphQL + codegen | Schema central y tipos por operación; requiere codegen integrado en el loop |
| Sistema pequeño/prototipo | Tipos compartidos simples, pero con camino a schema | Velocidad inicial sin cerrar puertas |

No hay una única respuesta.

Pero sí hay una regla:

> una frontera importante no debería depender de que el agente recuerde actualizar dos lados a mano.

Si frontend y backend comparten TypeScript, aprovecha esa cercanía. Si no la comparten, genera contratos. Si usas JSON, valida en runtime. Si tienes una spec, que sea parte de CI. Si cambias un enum, que alguien se entere antes de producción.

Ese "alguien" idealmente es una herramienta.

Y el agente puede leer esa herramienta.

## Qué debería poder hacer un agente

Una frontera SPA-API bien diseñada debería permitir que un agente haga esto:

1. Cambiar un DTO o schema.
2. Ver qué endpoints, componentes y tests se rompen.
3. Regenerar el cliente si aplica.
4. Actualizar consumidores.
5. Ejecutar typecheck.
6. Ejecutar tests de contrato o integración.
7. Entregar una PR que explique el cambio de frontera.

Ese flujo es muy distinto de:

1. Cambiar backend.
2. Buscar a mano dónde se usa en frontend.
3. Tocar artefactos generados o hacer casts hasta que compile.
4. Probar una pantalla.
5. Esperar que no haya otro consumidor.

El primer flujo convierte la frontera en sistema.

El segundo la convierte en memoria.

Y la memoria humana es justo lo que peor escala cuando aumentas throughput con agentes.

## El criterio de arquitectura

La decisión no debería ser "Node sí" o "Rust sí" en abstracto.

Después de la serie anterior, mi lectura sería más matizada:

- Rust puede ser una gran elección para piezas donde importan sistemas, rendimiento, concurrencia o seguridad.
- Kotlin puede seguir siendo excelente para backend de producto con ecosistema JVM y arquitectura madura.
- Go puede ser magnífico para servicios simples, operables y con tooling rápido.
- TypeScript full-stack puede ser especialmente fuerte cuando la frontera crítica es SPA-API y el contrato cambia mucho.

La ventaja de TypeScript full-stack no es que mágicamente sea más robusto que Rust.

Es que reduce una frontera.

Si el frontend ya vive en TypeScript y el backend también, puedes hacer que el contrato se exprese una vez, se valide en runtime y se consuma en ambos lados. Para un agente, eso es una superficie excelente: menos traducción, más feedback, menos drift.

Pero si el backend tiene razones fuertes para estar en otro lenguaje, no pasa nada. La respuesta no es forzarlo todo a Node. La respuesta es hacer que la frontera sea explícita: OpenAPI, GraphQL, Protobuf, schemas compartidos, cliente generado, contract tests.

Lo que no compraría en un entorno agéntico es una frontera informal.

Un endpoint que "más o menos devuelve esto". Un DTO duplicado. Un cliente HTTP escrito a mano sin generación ni validación. Un `as SomeResponse` para tranquilizar al compilador. Una spec que nadie comprueba.

Eso puede funcionar con poco volumen.

Con agentes, es una invitación al drift.

## La lección

La programación agéntica no solo cambia cómo escribimos código dentro de una capa.

Cambia cómo debemos diseñar las traducciones entre capas.

El lenguaje correcto ayuda a que el agente reciba feedback temprano. Pero si la frontera entre frontend y backend está mal diseñada, muchos errores se escaparán igualmente: campos que cambian, enums incompletos, errores no modelados, payloads no validados, clientes desactualizados.

Por eso la frontera SPA-API debe convertirse en un contrato ejecutable.

En un monorepo TypeScript, eso puede ser tRPC o schemas compartidos con validación runtime. En un sistema políglota, puede ser OpenAPI con cliente generado. En un producto con datos muy composables, puede ser GraphQL con codegen. La herramienta concreta importa menos que la propiedad que buscamos:

> si cambia el contrato, el sistema debe enterarse antes que el usuario.

Y, si es posible, antes que el reviewer.

Porque un agente trabaja bien cuando puede equivocarse barato. Una buena frontera hace exactamente eso: transforma desincronización silenciosa en feedback accionable.

La siguiente frontera natural está justo debajo del backend: la base de datos. Ahí la pregunta será parecida: cómo evitar que schema, queries, modelos y migraciones deriven en silencio mientras el agente trabaja rápido.
