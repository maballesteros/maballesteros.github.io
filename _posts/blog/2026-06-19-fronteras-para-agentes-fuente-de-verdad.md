---
title: "Fronteras para agentes (3/3): dónde vive la fuente de verdad"
excerpt: "Tercera entrega de la miniserie: elegir stack en la era agéntica no es solo elegir lenguaje, sino decidir qué artefactos mandan en cada frontera y cómo fallan cuando derivan."
tags: [ia, agentes, arquitectura, contratos, software, engineering]
date: 2026-06-19 00:01:00 +0200
modified: 2026-06-19
comments: true
ref: fronteras-para-agentes-fuente-de-verdad
---

Miniserie **Fronteras para agentes**: entrega **3/3**.

Anterior: [Backend y base de datos](/blog/fronteras-para-agentes-backend-base-de-datos/).

Inicio: [El contrato SPA-API](/blog/fronteras-para-agentes-contrato-spa-api/).

En las dos primeras entregas miramos dos fronteras concretas.

Primero, la frontera entre una SPA y su API: TypeScript compartido, schemas runtime, tRPC, OpenAPI, GraphQL, clientes generados.

Después, la frontera entre backend y base de datos: ORMs, query builders, SQL tipado y migraciones.

En ambos casos la pregunta era la misma:

> ¿qué feedback devuelve la frontera cuando alguien cambia el contrato?

Esta tercera pieza cierra la serie con una idea más simple:

> el problema no es elegir una herramienta suelta. Es decidir qué artefacto manda en cada frontera.

En un sistema real puede haber demasiadas "verdades": tipos frontend, DTOs backend, OpenAPI, schemas GraphQL, migraciones, entidades ORM, mocks, fixtures, SDKs generados.

Si todo eso se mantiene a mano, el sistema no tiene una fuente de verdad. Tiene una colección de deseos.

Y un agente puede amplificar esa confusión.

## Una fuente de verdad por frontera

La regla que usaría es simple:

> cada frontera importante debería tener una fuente de verdad principal y un mecanismo automático para derivar o validar el resto.

No significa que solo exista un fichero. Significa que debe estar claro qué manda.

En la frontera SPA-API puede mandar un router tRPC, un schema compartido, OpenAPI, GraphQL o un `.proto`.

En la frontera backend-base de datos puede mandar una migración, un schema Prisma, una definición Drizzle, metadata generada desde la base o un schema jOOQ.

Lo importante es que haya una dirección clara:

```text
Fuente de verdad
  -> artefactos generados
  -> checks
  -> consumidores
```

Cuando esa dirección no existe, el agente tiene que adivinar.

Y adivinar no escala.

Hay un matiz importante: no todas las fuentes de verdad tienen el mismo coste operativo.

Un schema TypeScript compartido puede ser consumido directamente por frontend y backend. Cambias el schema y el compilador empieza a señalar consumidores rotos.

Una especificación OpenAPI, un `.proto` o un schema GraphQL normalmente introducen una fase de generación. Eso añade una pieza móvil: el agente debe tocar la fuente, regenerar artefactos y no editar a mano lo derivado.

Esa fricción puede merecer mucho la pena cuando compras neutralidad de lenguaje, SDKs, contratos públicos o repos separados. Pero solo funciona bien si la generación es parte explícita del loop y CI detecta artefactos desactualizados.

## Tres patrones

Lo aterrizaría en tres patrones.

| Patrón | Cuándo encaja | Qué compras |
|---|---|---|
| Full-stack TypeScript | SaaS web, monorepo, API interna, dominio cambiante | Feedback directo: schemas/tRPC, typecheck rápido, menos traducción |
| Backend fuerte + frontend TypeScript | Backend Kotlin/Rust/Go/etc., consumidores externos o repos separados | Contrato agnóstico: OpenAPI/GraphQL/Protobuf, cliente generado, CI de compatibilidad |
| Sistema centrado en datos | Integridad, histórico, migraciones o SQL complejo como riesgo principal | Migraciones y queries como contrato: schema tipado, tests de integración, datos representativos |

La decisión madura no es elegir un lenguaje ganador.

Es diseñar el camino de feedback de cada frontera.

## El checklist mínimo

Una frontera buena para agentes debería cumplir pocas cosas, pero muy claras:

1. Hay una fuente de verdad.
2. Lo derivado se genera, no se edita a mano.
3. Los datos externos se validan en runtime.
4. Hay un check rápido que detecta drift.
5. Los cambios de frontera llegan como decisiones revisables.

Todo lo demás es implementación.

El anti-patrón es el contrario: DTO backend escrito a mano, tipo frontend escrito a mano, mock escrito a mano, spec desactualizada, cliente HTTP manual y ningún check que compare nada.

Eso puede funcionar con poco volumen y mucha memoria humana.

Con agentes, se convierte en auditoría manual de sincronización. Y ese no es el mejor uso del reviewer.

## La lección

La serie de lenguajes terminaba con una idea: el agente trabaja mejor cuando el entorno le permite equivocarse barato. Esta serie añade otra:

> los errores caros no viven solo dentro de las capas; muchas veces viven entre capas.

Por eso no basta con elegir un lenguaje fuerte. Hay que mirar las traducciones: frontend-backend, backend-base de datos, dominio-DTO, schema-runtime, spec-cliente generado.

En cada una hay que decidir qué manda, qué se genera, qué se valida y qué falla.

La pregunta no es "Node o Rust" en abstracto.

Si el producto es una SPA SaaS en monorepo, full-stack TypeScript puede ser una ventaja enorme porque reduce traducción. Si el backend necesita Kotlin, Go o Rust, no pasa nada: la frontera tiene que hacerse explícita con contrato, cliente generado, validación runtime y tests.

Ese es el moat técnico en entornos agénticos: no una pila de moda, sino un sistema donde las fronteras devuelven feedback temprano.

Cuando un agente trabaja rápido, una frontera informal se rompe rápido. Una frontera bien diseñada corrige rápido.
