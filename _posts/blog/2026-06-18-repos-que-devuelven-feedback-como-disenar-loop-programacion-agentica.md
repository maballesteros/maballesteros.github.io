---
title: "Lenguajes para agentes (3/3): repos que devuelven feedback"
excerpt: "Tercera entrega de la miniserie: el lenguaje ayuda, pero la velocidad real aparece cuando el repo tiene comandos, contratos, tests y revisión diseñados para que los agentes se corrijan pronto."
tags: [ia, agentes, repos, software, engineering]
date: 2026-06-18 12:01:00 +0200
modified: 2026-06-18
comments: true
ref: repos-que-devuelven-feedback-como-disenar-loop-programacion-agentica
---

Miniserie **Lenguajes para agentes**: entrega **3/3**.

Anterior: [El compilador como supervisor](/blog/el-compilador-como-supervisor-rust-go-python-typescript-era-agentica/).

Inicio: [El lenguaje importa más](/blog/el-lenguaje-importa-mas-cuando-programa-un-agente/).

Hasta ahora hemos hablado del lenguaje.

La tesis era que, en programación agéntica, el lenguaje no es solo una herramienta para humanos y máquinas. También es una superficie de feedback para el agente. Rust, Go, Kotlin, TypeScript, Effect o Python no devuelven el mismo tipo de señales cuando el agente se equivoca.

Pero el lenguaje no basta.

Un buen lenguaje dentro de un repo caótico puede perder mucha de su ventaja. Y un lenguaje más flexible puede volverse mucho más robusto si el repo está diseñado para devolver feedback rápido, concreto y accionable.

Esta tercera pieza va de eso: no de qué lenguaje elegir, sino de cómo construir un entorno donde los agentes puedan trabajar rápido sin que toda la carga acabe en la cabeza del reviewer.

La idea central:

> un repo agent-friendly no es el que deja que la IA toque mucho código. Es el que devuelve buen feedback cuando la IA se equivoca.

## El repo como máquina de feedback

Un repo tradicional suele estar pensado para personas que ya conocen el ritual.

Saben qué comando ejecutar, qué test tarda demasiado, qué módulo no conviene tocar, qué error de CI es ruido, qué fixture hay que regenerar, qué logs mirar, qué parte de la documentación está viva y cuál quedó como fósil.

El agente no sabe nada de eso si no se lo damos.

Puede inferir bastante, pero inferir no es gratis. Cada minuto que el agente pasa descubriendo rituales es tiempo perdido. Cada convención implícita que no encuentra se convierte en riesgo. Cada check lento o ambiguo degrada el loop.

En un repo agent-friendly, el conocimiento operativo está cerca del punto de uso:

- cómo instalar;
- cómo validar rápido;
- cómo validar profundo;
- qué rutas son sensibles;
- qué invariantes no se pueden romper;
- cómo se modelan errores;
- qué tests cubren qué riesgo;
- cómo se entrega una PR revisable;
- cuándo hay que escalar a una persona.

Esto conecta con una idea de [Lo que las PRs saben y el código no cuenta](/blog/lo-que-las-prs-saben-y-el-codigo-no-cuenta/): muchas reglas reales de un equipo no viven en el código, sino en las revisiones. Si queremos que los agentes trabajen mejor, esas reglas tienen que convertirse en mecanismo.

No en una wiki bonita.

En feedback ejecutable.

## El primer requisito: un comando que diga la verdad rápido

El error más común es pedir autonomía sin dar un loop reproducible.

Si el agente no sabe cómo validar, va a improvisar.

Y cuando improvisa, a veces acierta. Pero no quieres depender de eso.

Todo repo que vaya a trabajar con agentes debería tener un carril rápido explícito. Algo del estilo:

```text
make check
make test-fast
pnpm typecheck
cargo check --all-targets
go test ./...
./gradlew testFast
pytest tests/unit
```

El nombre da igual. Lo importante es que exista, que sea estable y que diga una verdad útil en poco tiempo.

No tiene que probarlo todo.

Tiene que responder a una pregunta concreta:

> ¿este cambio está lo bastante sano como para seguir iterando?

Después puede haber un carril profundo:

```text
make test-deep
pnpm test:e2e
cargo test
./gradlew integrationTest
pytest tests/integration
```

Ese segundo carril responde otra pregunta:

> ¿este cambio está lo bastante validado como para entregarse?

Mezclar ambas preguntas es un error.

Si todo check tarda demasiado, el agente pierde ciclos. Si el check rápido no detecta nada relevante, el agente avanza con falsa confianza. La gracia está en diseñar una escalera de feedback.

Rápido para corregir dirección.

Profundo para ganar confianza.

## La latencia del feedback es arquitectura

Cuando hablamos de arquitectura solemos pensar en módulos, servicios, boundaries, bases de datos o protocolos.

Pero en programación agéntica hay otra dimensión arquitectónica: cuánto tarda el sistema en decirte que te has equivocado.

Un repo con tests lentos, builds enormes y validaciones poco focalizadas obliga al agente a trabajar con ventanas largas de incertidumbre. Puede seguir generando código, pero genera sobre suposiciones.

Un repo con checks rápidos permite un flujo mucho más denso:

1. cambia;
2. comprueba;
3. lee error;
4. corrige;
5. vuelve a comprobar.

Eso no es solo productividad. Es calidad.

Cuanto más corto es el loop, menos grande se hace la desviación antes de ser detectada.

Esta es una razón por la que no conviene hacer afirmaciones simples del tipo "este lenguaje es rápido" o "este build es lento". Lo que importa es la latencia del feedback relevante para cada tarea.

Un build completo puede tardar minutos y aun así el repo puede ser bueno para agentes si hay checks parciales fiables. Un lenguaje puede tener compilación exigente y aun así ser ágil si tiene un `check` rápido que detecta el 80% de los errores de integración temprana. Un stack dinámico puede ser muy rápido si tiene tests focalizados y schemas fuertes en boundaries.

La pregunta útil:

> ¿cuál es el primer comando barato que reduce incertidumbre real?

Si no existe, el agente va a pagar el coste en exploración.

Y el humano lo va a pagar en revisión.

## Contratos donde normalmente hay esperanza

Los agentes amplifican patrones.

Eso es bueno cuando el repo tiene buenos patrones. Es peligroso cuando el repo funciona por costumbre no escrita.

Por eso conviene convertir expectativas importantes en contratos.

Algunos contratos viven en el lenguaje:

- tipos de dominio;
- enums cerrados;
- errores recuperables;
- null-safety;
- ownership;
- interfaces explícitas.

Otros viven en tests:

- reglas de negocio;
- journeys críticos;
- regresiones;
- integración con proveedores;
- migraciones;
- permisos.

Otros viven en CI/lint:

- no usar `any`;
- no tocar rutas críticas sin test;
- no introducir dependencias prohibidas;
- no hacer llamadas de red en tests unitarios;
- no cambiar contratos públicos sin actualizar docs.

Y otros viven en documentación operativa:

- cómo se divide el trabajo;
- cómo se revisa una PR generada con IA;
- qué comandos se consideran evidencia;
- cuándo se pide aprobación humana;
- qué decisiones deben explicarse en el handoff.

La idea importante es que cada contrato debe vivir en el sitio donde pueda fallar con mejor señal.

Si algo puede ser un error de compilación, mejor que sea compilación.

Si algo puede ser un test determinista, mejor que sea test.

Si algo puede ser lint, mejor que sea lint.

Si algo requiere criterio humano, al menos debe llegar al humano bien empaquetado.

Lo peor es dejarlo como esperanza:

> el agente debería darse cuenta.

Esa frase no escala.

## `AGENTS.md` no es documentación, es una interfaz de ejecución

En un repo con agentes, `AGENTS.md` no debería ser un README decorativo.

Debería ser una interfaz de ejecución.

No hace falta que sea enorme. De hecho, si es enorme y no distingue lo importante, puede empeorar el problema. Pero sí debería decir con claridad:

- cómo orientarse;
- qué comandos ejecutar;
- qué rutas son sensibles;
- qué estilo de cambios se espera;
- qué no se debe tocar;
- cómo reportar evidencia;
- qué hacer si hay incertidumbre;
- cómo entregar una PR revisable.

Lo más valioso no son frases genéricas como:

```text
Mantén el código limpio.
Añade tests cuando sea necesario.
Respeta la arquitectura.
```

Eso está bien, pero no guía demasiado.

Mucho mejor:

```text
Si cambias una regla de permisos, añade o actualiza tests en permissions/*.
Si modificas un endpoint público, actualiza el contrato OpenAPI.
Si añades un estado nuevo, revisa todos los matches exhaustivos y la serialización.
Si eliminas soporte legacy, separa el cambio de runtime, tests y documentación en commits revisables.
```

Esto no es literatura.

Es control operativo.

Y funciona especialmente bien si nace de comentarios reales de PR. Cuando una revisión humana detecta por tercera vez el mismo tipo de fallo, esa corrección debería convertirse en regla, test, lint o instrucción.

No para escribir más documentación.

Para reducir comentarios repetidos.

## Revisión por intención, no por masa de diff

El agente puede dejar el estado final correcto y aun así entregar una PR mala de revisar.

Esto ya lo desarrollé en [Commits revisables: cómo hacer legibles las PRs generadas con IA](/blog/commits-revisables-como-hacer-legibles-las-prs-generadas-con-ia/). La idea era que, cuando la IA aumenta el tamaño y velocidad de las PRs, la unidad de revisión no puede ser solo el diff completo. Tiene que ser la decisión revisable.

En un repo agent-friendly, eso debería formar parte del contrato de entrega.

Para cambios pequeños, una PR normal basta.

Para cambios con mezcla de capas, migraciones, eliminación de deuda o mucha intervención del agente, la PR debería llegar ordenada:

- commit de runtime;
- commit de contrato;
- commit de tests;
- commit de documentación;
- commit de limpieza;
- explicación de validaciones ejecutadas.

No porque el git log tenga que quedar bonito.

Sino porque el reviewer necesita navegar decisiones, no solo ficheros.

Esto también mejora el feedback al agente. Si le pedimos que proponga primero la serie de commits, vemos cómo ha entendido el cambio antes de que toque git. Podemos corregir su lectura de la intención sin esperar a revisar una masa final.

El agente no solo escribe.

También puede preparar el trabajo para ser entendido.

## Observabilidad para cerrar el loop

Hay cambios que no pueden validarse solo con compilador y tests.

En sistemas reales importan latencia, errores, retries, timeouts, jobs, colas, proveedores externos, datos inconsistentes y comportamientos que solo aparecen con tráfico.

Ahí la observabilidad también forma parte del feedback loop.

Un repo agent-friendly debería tener señales operativas reutilizables:

- logs estructurados en boundaries críticos;
- IDs de correlación;
- métricas por journey;
- queries de errores frecuentes;
- dashboards o plantillas;
- trazas en integraciones delicadas;
- taxonomía de errores de dominio.

No para que el agente "mire dashboards" como una persona sin contexto.

Para que pueda responder preguntas concretas:

- ¿esta ruta está fallando más que antes?
- ¿el retry subió después del cambio?
- ¿el p95 del journey crítico empeoró?
- ¿este error es de usuario, dependencia externa o bug interno?
- ¿el job procesó todos los estados esperados?

Si esas preguntas no tienen señal, el agente puede compilar y pasar tests, pero seguirá ciego en producción.

Y cuando un sistema trabaja con agentes, las cegueras se multiplican rápido.

## Guardrails por riesgo

No todos los cambios merecen la misma fricción.

Un typo en documentación, una mejora de naming local y una migración de pagos no deberían pasar por el mismo circuito.

En programación agéntica, esto es clave porque la supervisión humana es el recurso escaso. Si todo requiere revisión pesada, bloqueas el throughput. Si nada la requiere, asumes riesgos innecesarios.

El repo debería ayudar a clasificar:

- cambios seguros y mecánicos;
- cambios internos con tests claros;
- cambios de dominio sensible;
- cambios con datos, permisos, pagos, seguridad o producción;
- operaciones destructivas o migraciones.

Cada nivel necesita un contrato distinto:

- checks rápidos;
- checks profundos;
- evidencia obligatoria;
- aprobación humana;
- dry-run;
- rollback;
- observabilidad extra;
- feature flag.

Esto no depende del lenguaje, pero el lenguaje puede ayudar. Un dominio bien modelado hace más fácil detectar qué está tocando el agente. Un repo bien organizado permite aplicar reglas por path. Una CI bien diseñada puede exigir más evidencia cuando el cambio toca zonas sensibles.

La autonomía segura no es dejar hacer.

Es ajustar el nivel de libertad al nivel de riesgo.

## Qué miraría en un repo antes de soltar agentes

Si tuviera que evaluar si un repo está preparado para trabajo agéntico serio, no empezaría preguntando qué modelo usamos.

Preguntaría esto:

1. ¿Hay un comando rápido que el agente pueda ejecutar siempre?
2. ¿Hay un comando profundo para cerrar entrega?
3. ¿Los errores del check rápido son accionables?
4. ¿El dominio usa tipos o strings/dicts dispersos?
5. ¿Los estados importantes son exhaustivos?
6. ¿Los errores esperados están modelados?
7. ¿Las entradas externas se validan en runtime?
8. ¿Hay instrucciones de repo específicas y actuales?
9. ¿Las reglas repetidas de PR se han convertido en mecanismo?
10. ¿Las PRs generadas por agentes se entregan por decisiones revisables?
11. ¿Hay rutas sensibles con guardrails distintos?
12. ¿El agente puede producir evidencia de lo que validó?
13. ¿Hay observabilidad suficiente para cambios críticos?
14. ¿Los tests están separados por velocidad y riesgo?
15. ¿Sabemos qué no debe tocar el agente sin aprobación?

Esta lista no es sofisticada.

Pero si falla mucho, el problema no es el agente. El problema es que el repo no devuelve señales suficientes.

Y cuando el repo no devuelve señales, el humano se convierte en compilador, test runner, arquitecto, QA, historiador y detector de convenciones.

Eso no escala.

## La lección

La programación agéntica no va solo de modelos mejores.

Va de sistemas que permiten a esos modelos equivocarse barato.

El lenguaje es una pieza importante porque decide qué errores pueden aparecer antes de ejecutar. Pero el repo completo decide si ese feedback se convierte en velocidad real.

Un buen repo para agentes tiene carriles claros, checks rápidos, contratos explícitos, tests por riesgo, instrucciones operativas, observabilidad y una forma de entregar cambios que respeta la atención humana.

No se trata de automatizar todo.

Se trata de reservar el criterio humano para lo que de verdad requiere criterio humano.

Si el compilador puede detectar algo, que lo detecte. Si un test puede fijarlo, que lo fije. Si un lint puede bloquearlo, que lo bloquee. Si una instrucción puede evitar una repetición tonta, que exista. Si una PR puede contarse como una secuencia de decisiones, que llegue así.

La velocidad agéntica no nace de que el agente escriba más rápido.

Nace de que el sistema responde antes.

Y diseñar esa respuesta es, cada vez más, una de las tareas centrales de la ingeniería.
