---
title: "Codex y AWS: convertir la factura en plan operativo"
excerpt: "Cómo una factura de AWS dejó de ser un total difícil de atacar y se convirtió en diagnóstico, criterios de negocio, quick wins seguros y backlog de optimización."
tags: [ia, agentes, codex, aws, costes, finops, engineering]
date: 2026-06-05
modified: 2026-06-05
comments: true
ref: codex-y-aws-convertir-la-factura-en-plan-operativo
---

Las facturas de AWS tienen una cosa bastante puñetera: el número final es muy visible, pero no te dice casi nada sobre qué hacer.

Puedes ver que la factura pesa. Puedes intuir que hay margen de mejora. Pero entre esa intuición y un cambio seguro hay mucho trabajo: entender qué partidas mandan, qué recursos las explican, qué tiene justificación de negocio, qué parece residual y qué no conviene tocar hasta medir mejor.

Ahí Codex me ha servido como una mezcla de FinOps y DevOps operativo. No para “recortar AWS” a ciegas, sino para convertir una factura en una investigación con decisiones trazables.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/), donde estoy ordenando aprendizajes de producto, arquitectura y equipos al llevar IA a sistemas reales.

La idea empezó claramente el 5 de junio de 2026, cuando pasé de mirar una factura mensual a construir un informe vivo: diagnóstico, inventario, criterios de negocio, quick wins seguros, impacto esperado y trabajo pendiente.

La tesis fuerte es esta:

> el valor no está en que Codex lea una factura. Está en que puede convertir coste agregado en decisiones operativas.

## La factura no dice qué hacer

Una factura te dice cuánto has gastado, pero no sabe nada de tus restricciones. No distingue producción de preproducción, un servicio público de una herramienta interna, un recurso crítico de un resto histórico que nadie ha apagado.

Por eso la primera pregunta no debería ser “¿qué puedo borrar?”, sino “¿qué explica realmente esta factura y qué decisiones son seguras con la evidencia que tengo?”.

Ese matiz importa. La optimización de costes en infraestructura no puede ser una limpieza nerviosa. Si apagas algo sin entender su función, quizá bajas la factura un poco, pero compras riesgo operativo. Lo útil es separar lo que ya se puede decidir de lo que todavía necesita medición.

## Del PDF al inventario real

El primer paso fue convertir la factura en una foto útil. Codex extrajo las partidas, validó que la extracción tenía sentido y la cruzó con un inventario read-only de AWS: entornos, instancias, bases de datos, balanceadores, direcciones públicas, almacenamiento, transferencia y métricas agregadas.

Ahí la conversación cambia. Ya no estás ante “AWS es caro”, sino ante preguntas mucho más concretas:

- ¿qué entornos tienen que vivir 24/7?
- ¿qué entornos pueden seguir horario laboral?
- ¿qué recursos son legacy?
- ¿qué backups tienen sentido?
- ¿qué tráfico hay que atribuir antes de tocar?
- ¿qué cosas parecen caras, pero todavía no están bien explicadas?

Esa es la parte importante: la factura deja de ser un total incómodo y se convierte en un mapa de trabajo.

## Criterios antes que cambios

La parte más útil no fue encontrar un botón para apagar cosas. Fue fijar criterios antes de tocar recursos.

La intención de negocio puede ser muy sencilla:

> esto no necesita estar encendido todo el domingo;  
> esto es producción y no quiero asumir riesgo;  
> esto parece legacy, pero antes de borrarlo necesito evidencia.

Codex ayuda porque traduce ese criterio en opciones concretas: scheduled scaling, reducción prudente de retención, inventario de recursos huérfanos, verificación de dependencias, plan de rollback, lista de comprobaciones.

El valor no está solo en ejecutar. Está en ordenar la decisión para que el cambio sea defendible.

## Quick wins, pero con cinturón

Una auditoría de costes suele tentar a buscar quick wins, y tiene sentido: muchas veces hay ahorro evidente. Pero “evidente” no debería significar “ciego”.

En mi caso, los quick wins seguros tenían este patrón:

1. identificar un recurso o configuración candidata;
2. entender su función;
3. aplicar criterio de negocio;
4. estimar impacto;
5. ejecutar un cambio reversible;
6. dejar evidencia;
7. apuntar el seguimiento.

Por ejemplo: entornos no críticos que pueden seguir horario laboral, retenciones de backup no-prod que no necesitan ser largas, infraestructura legacy confirmada como no usada.

Nada especialmente glamuroso. Pero sí útil, rentable y repetible.

La pregunta buena no es “¿qué puedo apagar?”, sino “¿qué puedo cambiar con evidencia suficiente, impacto claro y rollback sencillo?”.

## La investigación que queda también es valor

No todo acaba en quick wins. Una parte importante de la auditoría fue dejar claro qué no debía tocarse todavía: tráfico que necesita atribución, recursos públicos que pueden tener una razón, balanceadores que parecen redundantes pero sostienen HTTPS o rutas concretas, servicios auxiliares que parecen residuales pero necesitan medición.

Codex ayuda a convertir esas dudas en backlog: qué hay que medir, qué hipótesis revisar, qué dependencia confirmar, qué decisión queda bloqueada por falta de evidencia.

Eso también es valor. Optimizar bien no es solo encontrar ahorro, sino evitar dos errores muy habituales: no tocar nada porque da miedo, o tocar demasiado porque la factura molesta.

## El ciclo

El patrón se parece mucho al de incidentes. Primero haces el análisis una vez. Luego preguntas:

> ¿qué parte de este análisis debería ser repetible?

Y de ahí salen herramientas, runbooks y checks para el mes siguiente.

En costes, el ciclo queda así:

1. Leer factura.
2. Agrupar partidas.
3. Cruzar con inventario real.
4. Aplicar criterios de negocio.
5. Ejecutar quick wins seguros.
6. Estimar impacto.
7. Dejar backlog priorizado.
8. Repetir el mes siguiente con mejor tooling.

La mejora no es solo pagar menos. La mejora es tener más control: saber qué explica la factura, qué decisiones están tomadas, qué cambios ya se hicieron, qué ahorro es realista y qué falta medir.

## La lección

El gran salto no fue que Codex leyera una factura de AWS. Fue pasar de una factura a un sistema de decisión: coste agregado, inventario real, criterios de negocio, cambios seguros, rollback, impacto estimado y backlog.

Dicho en limpio:

> Codex se vuelve realmente útil en FinOps cuando no le pides solo que encuentre ahorro, sino que convierta la factura en decisiones operativas trazables.

Para mí, esa es la diferencia entre “AWS cuesta mucho” y “sé qué parte pesa, qué puedo tocar ya, qué no debo tocar todavía y qué tengo que medir mejor”.
