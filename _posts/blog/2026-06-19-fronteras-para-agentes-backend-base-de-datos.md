---
title: "Fronteras para agentes (2/3): backend y base de datos"
excerpt: "Segunda entrega de la miniserie: ORMs, query builders, SQL tipado y migraciones como formas de convertir la frontera con la base de datos en feedback temprano para agentes."
tags: [ia, agentes, arquitectura, bases-de-datos, backend, engineering]
date: 2026-06-19 00:02:00 +0200
modified: 2026-06-19
comments: true
ref: fronteras-para-agentes-backend-base-de-datos
---

Miniserie **Fronteras para agentes**: entrega **2/3**.

Anterior: [El contrato SPA-API](/blog/fronteras-para-agentes-contrato-spa-api/).

Siguiente: [Dónde vive la fuente de verdad](/blog/fronteras-para-agentes-fuente-de-verdad/).

En la primera entrega mirábamos la frontera entre una SPA y su API. Ahí el riesgo era que frontend y backend derivaran en silencio.

La siguiente frontera natural está debajo del backend: la base de datos.

Aquí el problema es parecido, pero con más consecuencias. La base no es una dependencia cualquiera. Guarda estado, tiene su propio lenguaje, sus propios tipos, constraints, índices, transacciones y una historia de migraciones que sobrevive a los despliegues.

Por eso esta frontera siempre ha sido delicada:

- columnas nullable que el código trata como obligatorias;
- enums que crecen y no se contemplan;
- migraciones que no encajan con datos históricos;
- queries que compilan pero no devuelven lo que el servicio espera;
- modelos que ya no reflejan el schema real.

Para agentes, la pregunta vuelve a ser la misma:

> ¿qué feedback devuelve la frontera cuando cambia el contrato?

Solo que aquí el contrato no es un JSON entre frontend y backend. Es la relación entre código, schema, queries, migraciones y datos persistidos.

## Por qué los ORMs importaban

Los ORMs siempre me han parecido interesantes por una razón muy concreta: centralizan el mapping entre dos mundos.

La base habla en tablas, columnas, `NULL`, joins, índices y transacciones. El backend habla en tipos, objetos, funciones, errores e invariantes. Entre ambos hay traducción. Y donde hay traducción, hay bugs.

Un ORM clásico como Hibernate/JPA, TypeORM o SQLAlchemy ayuda porque da un sitio reconocible para esa traducción. El agente no tiene que perseguir SQL y mapeos dispersos por todo el repo. Puede mirar entidades, relaciones, tipos y convenciones.

Pero tiene un coste: muchas garantías aparecen tarde.

El código puede compilar y fallar al arrancar. Puede compilar y generar una query inesperada. Puede compilar y esconder un N+1. Puede depender de reflexión, proxies o anotaciones que el compilador no ve bien.

No es un argumento contra los ORMs.

Es el criterio agéntico:

> no basta con centralizar el mapping; hay que adelantar el feedback.

## Tres familias útiles

Visto desde agentes, no separaría el mundo en "ORM sí" y "ORM no". Lo separaría en qué parte de la frontera puede ver el tooling.

### Cliente generado desde schema

Prisma es el ejemplo claro en TypeScript: partes de un schema y generas un cliente tipado. Sus docs describen Prisma Client como un query builder auto-generado y type-safe para Node.js y TypeScript. Ver [Prisma Client](https://www.prisma.io/docs/orm/prisma-client).

```text
schema.prisma
  -> genera cliente TypeScript
  -> backend usa tipos generados
  -> cambios de schema rompen compilación
```

La ventaja es clara: si desaparece un campo, cambia una relación o un valor pasa a ser nullable, los consumidores pueden romper en compilación.

### Schema y queries tipadas en el lenguaje

Drizzle y Kysely se mueven en esta zona dentro de TypeScript. Drizzle pone el foco en schemas y APIs SQL-like con type safety. Kysely se define como un query builder SQL type-safe. Ver [Drizzle](https://orm.drizzle.team/docs/overview) y [Kysely](https://kysely.dev/).

La idea es parecida: que el agente no escriba strings opacos que solo fallan al ejecutar. Si cambia el shape de una tabla o query, el tipo debería ayudar a detectar consumidores rotos.

### SQL explícito, pero comprobado

La tercera vía no intenta esconder SQL. Intenta hacerlo verificable.

Rust tiene un ejemplo interesante con SQLx. La macro `query!` comprueba SQL y describe columnas de salida en compile-time contra una base o metadata preparada. Ver [SQLx `query!`](https://docs.rs/sqlx/latest/sqlx/macro.query.html).

En JVM, jOOQ explora una idea cercana desde hace años: SQL type-safe generado a partir del schema. Ver [jOOQ](https://www.jooq.org/).

Este enfoque me gusta porque evita una falsa dicotomía:

> ORM cómodo pero opaco vs SQL explícito pero frágil.

Hay un tercer punto:

> SQL visible, pero con feedback temprano.

Para agentes, eso es muy atractivo. No escondes decisiones importantes de base de datos, pero tampoco dejas las queries como strings invisibles al tooling.

## Migraciones como contrato

La parte que no conviene olvidar es que la base tiene historia.

El schema real no es solo el modelo actual. Es una secuencia de migraciones, datos históricos, backfills, columnas legacy, constraints e índices.

Por eso una frontera agent-friendly no se consigue solo eligiendo ORM. También necesita que las migraciones formen parte del loop:

- aplicar migraciones en local;
- tener seed mínimo estable;
- probar casos borde;
- separar cambio de schema y cambio de runtime cuando haya riesgo;
- dejar claro si hay backfill o compatibilidad temporal.

No hace falta convertir cada cambio en una ceremonia enorme. Pero sí hay que evitar que el agente cambie el modelo final sin entender cómo llega producción hasta ahí.

## La matriz práctica

Una versión corta de la matriz sería esta:

| Contexto | Estrategia que miraría primero | Por qué |
|---|---|---|
| Backend TypeScript de producto | Prisma, Drizzle o Kysely | Schema/query tipado, feedback rápido en `tsc`, buena integración con frontend TS |
| Backend Kotlin/Java con dominio complejo | Hibernate/JPA o jOOQ según caso | Ecosistema maduro; ORM si domina el modelo, jOOQ si quieres SQL visible y tipado |
| Backend Rust con SQL relevante | SQLx o Diesel | Más feedback de compilación sobre queries y tipos |
| Sistema con SQL muy específico | SQL explícito + checks/tests fuertes | No esconder decisiones de base importantes |
| CRUD interno sencillo | ORM pragmático + migraciones + tests | Reducir fricción sin sobrediseñar |
| Dominio con migraciones delicadas | Migraciones revisables + contract/integration tests | La transición importa tanto como el estado final |

La elección no debería empezar por "ORM sí" u "ORM no". Debería empezar por:

> ¿qué herramienta hace visible esta frontera y qué errores consigue adelantar?

Si el ORM centraliza mapping pero todos los fallos aparecen al arrancar, el feedback puede ser lento. Si el query builder tipa bien pero las migraciones son manuales y no hay tests, sigues teniendo una frontera frágil. Si SQLx comprueba queries pero no tienes una base reproducible en local, el agente seguirá atascado.

La frontera se evalúa como sistema, no como librería aislada.

## La lección

Los ORMs nacieron, en parte, para reducir fricción humana en una frontera difícil: la traducción entre base de datos y lenguaje. En programación agéntica, esa motivación sigue siendo válida, pero el criterio cambia.

No basta con que una herramienta sea cómoda. Tiene que devolver feedback útil al agente.

Una buena frontera backend-base de datos hace visibles tipos, nullability, relaciones, constraints, queries y migraciones. Rompe pronto cuando código y schema se desincronizan. Permite reproducir la base en local. Y no oculta tanto la base que el agente deje de ver decisiones importantes.

La pregunta central no es:

> ¿prefiero ORM o SQL?

La pregunta es:

> ¿qué estrategia convierte los errores de persistencia en feedback temprano, legible y corregible?

Porque una base de datos no perdona tanto como un objeto en memoria.

Y si vamos a dejar que agentes cambien sistemas con estado, la frontera con ese estado tiene que estar diseñada para fallar pronto.
