---
title: "Lenguajes para agentes (2/3): el compilador como supervisor"
excerpt: "Segunda entrega de la miniserie: una comparación pragmática de cómo Rust, Go, Kotlin, TypeScript, Effect y Python devuelven feedback temprano a los agentes de código."
tags: [ia, agentes, lenguajes, rust, engineering]
date: 2026-06-18 12:02:00 +0200
modified: 2026-06-18
comments: true
ref: el-compilador-como-supervisor-rust-go-python-typescript-era-agentica
---

Miniserie **Lenguajes para agentes**: entrega **2/3**.

Anterior: [El lenguaje importa más](/blog/el-lenguaje-importa-mas-cuando-programa-un-agente/).

Siguiente: [Repos que devuelven feedback](/blog/repos-que-devuelven-feedback-como-disenar-loop-programacion-agentica/).

La idea de fondo era esta: en programación agéntica, el lenguaje no importa menos. Importa más, porque se convierte en una superficie de feedback.

La excusa inicial era la [entrada de OpenAI como Platinum Member de la Rust Foundation](https://rustfoundation.org/media/rust-foundation-welcomes-openai-as-platinum-member-announces-donation-to-rust-project/). El comunicado habla de rendimiento, seguridad y fiabilidad. A mí me interesa la consecuencia para el trabajo con agentes: un stack que convierte más errores en feedback temprano cambia la velocidad real del loop.

Esta segunda parte baja un nivel.

Conviene leerla como lo que es: una investigación comparativa desde la práctica de orquestar y revisar trabajo asistido por agentes. No es una taxonomía académica ni una declaración de autoridad sobre todos los lenguajes. Mi punto fuerte no es ser experto profundo en Rust, Go, TypeScript, Effect y Python a la vez. Mi punto fuerte es poder mirar qué tipo de feedback entrega cada entorno cuando el código lo produce un agente y el humano tiene que decidir si confiar, corregir o redirigir.

Ese matiz importa porque cambia la pregunta.

No estoy intentando decidir qué lenguaje "gana" en abstracto. Estoy intentando entender qué ventajas de feedback temprano ofrece cada uno y en qué contextos esas ventajas justifican pagar su coste de entrada.

Por eso no quiero hacer una guerra de lenguajes. No me interesa decir que Rust gana siempre, que Python ya no sirve, que Go es demasiado simple o que TypeScript necesita convertirse en Haskell para ser serio. Esa discusión suele ser poco útil.

La comparación que me interesa es más concreta: qué tipo de errores consigue desplazar cada stack hacia una fase temprana del loop. No solo "qué tan expresivo es", sino qué feedback devuelve cuando un agente lo modifica.

Porque un agente puede escribir en todos.

Pero no todos le corrigen igual.

## La tabla que me interesa

Si miro los lenguajes desde el punto de vista de agentes de código, la tabla no empieza por sintaxis. Empieza por señal.

| Aspecto | Rust | Go | Kotlin | TypeScript | TypeScript + Effect | Python |
|---|---|---|---|---|---|---|
| Tipos básicos | Compilación estricta | Compilación simple | Compilación fuerte | Compilación si usas TS estricto | Igual, con más modelado | Runtime, con hints opcionales |
| Ausencia | `Option<T>` | `nil` en muchos tipos | Null-safety fuerte | `null`/`undefined` si `strictNullChecks` | Puede modelarse con `Option`/schema | `None` en runtime |
| Errores esperados | `Result<T, E>` idiomático | `error` explícito por retorno | Excepciones no checked | Promises/excepciones poco tipadas | Canal de error tipado | Excepciones runtime |
| Estados de dominio | `enum` + `match` exhaustivo | `const`/tipos simples | `sealed class`/`enum` | Unions discriminadas | Unions + errores/deps tipados | Convención/manual |
| Memoria | Ownership sin GC | GC | GC/JVM | GC/JS | GC/JS | GC |
| Concurrencia | `Send`/`Sync`, ownership | Goroutines/channels, race detector | Coroutines/JVM | Event loop/promises | Fibers/structured concurrency | Async/threading con límites |
| Feedback rápido típico | `cargo check`, tests | `go test`, `go vet` | Gradle/IDE/tests | `tsc --noEmit`, tests | `tsc` + Effect types/tests | `pytest`, `ruff`, `mypy` |
| Riesgo de escapes | `unsafe`, casts, lógica incorrecta | data races si no se detectan | null/platform types, runtime/frameworks | `any`, casts, JS interop | `any`, casts, complejidad de tipos | dinámico por defecto |

La tabla no dice "elige Rust para todo".

Dice algo más interesante: cada lenguaje tiene una forma distinta de fallar.

Y para un agente, la forma de fallar es parte del diseño.

## Rust: cuando el error no entra

Rust es el caso más claro de lenguaje que convierte problemas clásicos de sistemas en errores de compilación.

La propiedad no está solo en "ser tipado". Java, Kotlin, Go y TypeScript también tienen tipos. La diferencia es que Rust mete en el sistema de tipos y ownership problemas que normalmente viven en runtime, disciplina humana o herramientas externas.

La documentación oficial lo explica de forma bastante directa: Rust gestiona memoria con reglas de ownership comprobadas por el compilador; si violas esas reglas, el programa no compila, y esas reglas no ralentizan el runtime. Ver [The Rust Book: Ownership](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html).

Lo interesante para agentes es el efecto operativo.

Si el agente intenta usar un valor después de moverlo, no compila. Si intenta guardar una referencia que vive menos de lo necesario, no compila. Si intenta mutar una estructura mientras existe una referencia incompatible, no compila. Si intenta mandar entre hilos algo que no es seguro, no compila.

La parte de concurrencia es especialmente relevante. El libro de Rust dice que ownership y tipos permiten convertir muchos errores de concurrencia en errores de compilación en vez de runtime. Ver [Fearless Concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html).

Para una persona, eso puede sentirse exigente.

Para un agente, es una ventaja enorme.

El compilador no solo rechaza. Explica. Te dice qué vive demasiado poco, qué se movió, qué trait falta, qué tipo no cumple una restricción. Eso da al agente un mapa de corrección.

La contrapartida es real: Rust tiene curva de aprendizaje, tiempos de compilación que pueden doler en proyectos grandes, complejidad de lifetimes en algunos dominios y un ecosistema donde ciertas piezas web/business no son tan plug-and-play como en Node, Python o JVM.

Pero cuando el dominio exige seguridad, concurrencia, rendimiento, bajo consumo o tooling de infraestructura, Rust ofrece una cosa muy difícil de igualar:

> el agente puede equivocarse mucho antes de que el sistema se ejecute.

## Go: simplicidad, velocidad de tooling y menos garantías estáticas

Go está casi en el polo opuesto de Rust en filosofía.

Go no intenta modelar tantos problemas en el tipo. Prefiere un lenguaje pequeño, tooling rápido, convenciones simples, binarios fáciles de desplegar y concurrencia muy accesible con goroutines y channels.

Eso es potentísimo para muchos equipos.

En un mundo agéntico, Go tiene varias virtudes claras:

- el código suele ser fácil de leer;
- los proyectos tienen estructura bastante convencional;
- `go test` es rápido y directo;
- el formatter elimina discusiones;
- el lenguaje tiene pocas formas de escribir lo mismo;
- el agente tiene menos superficie sintáctica donde perderse.

Pero Go no desplaza tantos problemas a compilación como Rust.

Un ejemplo importante son las data races. Go incluye un race detector muy útil, pero la propia documentación explica que solo encuentra carreras que ocurren en runtime en los caminos ejecutados. Ver [Go Data Race Detector](https://go.dev/doc/articles/race_detector).

Eso no lo hace malo. Lo sitúa en otro punto.

Go gana cuando quieres simplicidad operativa y feedback rápido por tests. Rust gana cuando quieres que más errores sean imposibles de compilar.

Para agentes, esa diferencia importa.

En Go el agente puede avanzar muy deprisa, pero parte de la seguridad depende de que los tests cubran los caminos adecuados y de que las convenciones del equipo estén bien escritas. En Rust, ciertas clases de error no necesitan test porque no pasan el compilador.

La decisión no es moral.

Es económica.

¿Prefieres pagar más modelado al principio para que el compilador bloquee más? ¿O prefieres un lenguaje más simple y un loop de tests/tooling muy rápido, aceptando que más cosas dependen de cobertura y revisión?

Hay productos donde Go es una respuesta excelente.

Solo no le pediría que haga el trabajo que Rust sí hace en memoria y concurrencia estática.

## Kotlin: buen equilibrio, pero con runtime y framework debajo

Kotlin tiene una posición interesante.

Para alguien que viene de Java, Kotlin sube mucho la calidad expresiva: null-safety, data classes, sealed classes, coroutines, extension functions, DSLs razonables. Para backend sobre JVM, permite escribir código bastante legible con un ecosistema industrial muy maduro.

Desde el punto de vista agéntico, Kotlin tiene buenas señales:

- tipos fuertes;
- ausencia modelada con `?`;
- `sealed class` para estados cerrados;
- coroutines con `suspend`;
- buen soporte de IDE;
- tests y frameworks muy establecidos.

Pero hay matices.

Kotlin vive sobre JVM y normalmente dentro de frameworks grandes. En muchos repos reales, el feedback no viene solo del compilador Kotlin. Viene de Gradle, Spring, Ktor, Hibernate, generación de código, annotation processing, DI, configuración, tests de integración y comportamiento runtime.

Eso puede hacer que el loop sea más pesado.

No porque Kotlin sea malo, sino porque el stack empresarial alrededor puede introducir mucho ceremonial y tiempos de build complejos. Gradle puede ser muy eficiente si está bien configurado, pero también puede convertirse en una fuente de latencia si el proyecto acumula tareas, plugins, configuración dinámica y módulos mal aislados.

Para agentes, Kotlin funciona muy bien cuando el repo tiene carriles claros:

- tarea Gradle focalizada;
- tests por módulo;
- convenciones fuertes;
- arquitectura explícita;
- poco comportamiento mágico escondido en runtime.

Si no, el agente puede quedar atrapado en un ciclo caro: cambia código, espera build, falla por wiring, corrige configuración, espera otra vez.

Kotlin no pierde por lenguaje. Pierde cuando el sistema alrededor no ofrece feedback granular.

## TypeScript: ubicuidad con escapes

TypeScript es probablemente uno de los entornos más relevantes para programación agéntica por una razón muy simple: está en todas partes.

Frontend, backend Node, CLIs, herramientas internas, edge functions, integraciones, prototipos, SDKs. Si los agentes van a tocar producto real, van a tocar muchísimo TypeScript.

TypeScript ofrece algo muy valioso: tipos sobre un ecosistema JavaScript enorme.

Con `strict` activado, buenas unions discriminadas, `zod` o schemas equivalentes en boundaries, `tsc --noEmit`, tests y linting, puedes crear un loop bastante sólido.

Pero TypeScript tiene escapes importantes:

- `any`;
- casts agresivos;
- librerías JS sin tipos fuertes;
- valores externos que llegan como `unknown` pero se tratan como válidos;
- errores de Promise poco tipados;
- diferencias entre tipos en compilación y realidad en runtime.

Esto último es central.

TypeScript comprueba tipos antes, pero los tipos se borran al ejecutar. Si entran datos de red, base de datos, usuario o LLM, necesitas validación runtime. Si no, el tipo puede convertirse en una promesa que nadie ha verificado.

Para agentes, esto es una fuente habitual de falsas seguridades.

El agente puede dejar un código que satisface al compilador porque ha hecho un cast, pero que no valida realmente el boundary. Por eso en TypeScript agéntico son tan importantes las reglas de equipo:

- nada de `any` salvo justificación;
- schemas en entradas externas;
- unions discriminadas para estados;
- errores modelados;
- tests cerca de boundaries;
- `tsc --noEmit` como check rápido;
- lint que bloquee escapes peligrosos.

TypeScript puede ser muy agent-friendly.

Pero hay que cerrar puertas.

## Effect: TypeScript intentando parecerse más a un sistema de efectos

Effect me parece una de las respuestas más interesantes a las debilidades de TypeScript normal.

No convierte TypeScript en Rust. No añade ownership ni seguridad de memoria sin GC. Pero sí ataca una zona donde TypeScript suele ser frágil: errores, dependencias, recursos, concurrencia e interrupción.

Su tipo central tiene esta forma:

```ts
Effect<Success, Error, Requirements>
```

Es decir: esta operación puede producir un valor, puede fallar con errores esperados y necesita dependencias concretas para ejecutarse. La documentación oficial lo presenta justo así: éxito, error y requisitos como parámetros del tipo. Ver [Effect Type](https://effect.website/docs/getting-started/the-effect-type/).

Comparado con una `Promise<User>`, eso cambia mucho.

Una `Promise<User>` dice poco:

- puede rechazar con casi cualquier cosa;
- no expresa dependencias;
- no diferencia bien error esperado de defecto;
- no modela por sí sola retry, timeout, interrupción o recursos.

Effect intenta llevar esas piezas al tipo y al runtime. Su documentación compara Effect con Promise y destaca diferencias como ejecución lazy, errores tipados, dependencias tipadas, interrupción y structured concurrency. Ver [Effect vs Promise](https://effect.website/docs/additional-resources/effect-vs-promise/).

Desde el punto de vista agéntico, esto es muy potente.

Si el agente compone una operación que todavía necesita `PaymentGateway`, el tipo puede recordarlo. Si no ha tratado `ValidationError`, el tipo puede exponerlo. Si una función ahora falla con un error nuevo, ese error puede propagarse por la firma hasta que alguien lo maneje.

El coste también es real:

- curva de aprendizaje;
- estilo funcional menos familiar;
- tipos complejos;
- API grande;
- riesgo de que el equipo no comparta el modelo mental.

Effect es una buena señal de hacia dónde va parte del ecosistema: no basta con generar TypeScript. Queremos TypeScript que describa mejor sus efectos.

Para agentes, eso es exactamente el tipo de superficie que ayuda.

## Python: velocidad de exploración, fragilidad de contrato

Python sigue siendo extraordinario.

Para investigación, scripts, notebooks, data, IA, glue code, automatización, pruebas rápidas y producto temprano, es difícil competir con su velocidad de expresión y su ecosistema.

Además, los agentes suelen escribir Python bastante bien porque hay muchísimo código público, APIs simples y feedback rápido con `pytest`.

Pero en términos de garantías tempranas, Python necesita ayuda.

Los type hints mejoran mucho la situación, pero no son el lenguaje en el mismo sentido que Rust o Kotlin. Necesitas herramientas como `mypy` o `pyright`, linters como `ruff`, tests, validación runtime con `pydantic` u otros schemas, y disciplina de equipo.

Si esas piezas no están, muchos errores sobreviven hasta ejecución:

- `None` inesperado;
- atributo inexistente;
- shape incorrecta de diccionarios;
- excepciones no declaradas;
- dependencias globales;
- contratos implícitos entre módulos.

Para agentes, Python es fantástico cuando el objetivo es explorar.

Es más delicado cuando el objetivo es mantener sistemas grandes con muchos cambios concurrentes producidos por agentes. No porque no se pueda. Se puede. Pero hay que compensar la flexibilidad con mecanismos externos.

Python necesita más sistema alrededor.

Y eso es una idea clave de esta serie: si el lenguaje no te da ciertas garantías, puedes construir parte de ellas con tooling, tests y convenciones. Pero entonces debes hacerlo explícitamente.

## Lo que no aparece en la tabla

Hay lenguajes y sistemas más robustos que Rust en ciertos ejes.

SPARK/Ada, Dafny, F*, Lean y otros entornos de verificación formal pueden demostrar propiedades más fuertes. Pueden ir mucho más lejos que "esto compila". Pueden ayudarte a probar ausencia de ciertos errores de runtime o corrección respecto a especificaciones.

Pero no son el centro de esta foto.

La pregunta aquí no es:

> ¿cuál es el lenguaje más verificable del mundo?

La pregunta es:

> ¿qué stack puede adoptar un equipo real para mejorar el loop agente -> cambio -> validación sin convertir cada tarea en investigación formal?

Ahí Rust ocupa un punto muy especial.

No es lo máximo absoluto en verificación. Pero sí ha sintetizado una cantidad enorme de garantías útiles en un lenguaje generalista de sistemas con ecosistema real, tooling razonable y adopción creciente.

Go ocupa otro punto muy especial: menos garantías, mucha simplicidad, tooling muy rápido y operación excelente.

Python ocupa otro: exploración y ecosistema.

TypeScript ocupa otro: ubicuidad web/producto, con posibilidad de endurecerse bastante.

Kotlin ocupa otro: backend/JVM productivo con tipos buenos y ecosistema maduro.

La elección no debería hacerse por identidad tecnológica.

Debería hacerse por el tipo de feedback que necesitas.

## La pregunta práctica

Si tuviera que evaluar un stack para trabajo con agentes, haría estas preguntas:

1. ¿Qué errores bloquea el lenguaje antes de ejecutar?
2. ¿Qué errores solo aparecen en tests?
3. ¿Qué errores solo aparecen en runtime real?
4. ¿Cuánto tarda el check rápido?
5. ¿El agente puede ejecutar ese check sin ritual humano?
6. ¿Los errores son legibles y accionables?
7. ¿El dominio está modelado con tipos o con strings/dicts sueltos?
8. ¿Hay escapes fáciles como `any`, casts, reflection o magic globals?
9. ¿Las dependencias están explícitas?
10. ¿El repo tiene una arquitectura que el agente pueda seguir?

La respuesta puede llevarte a Rust.

O puede llevarte a Go.

O puede llevarte a TypeScript con Effect.

O puede decirte que Python es perfecto para esta fase, pero que necesitas schemas, tests y lint más fuertes antes de dejar a agentes tocar partes críticas.

Lo importante es no confundir velocidad de escritura con velocidad de validación.

## La lección

El compilador no sustituye al ingeniero.

Pero puede convertirse en un supervisor parcial del agente.

Rust lleva esa idea muy lejos: memoria, ownership, ausencia, errores y parte de la concurrencia se convierten en contratos tempranos. Go elige simplicidad y tooling rápido, con menos garantías estáticas. Kotlin ofrece buen equilibrio sobre JVM, condicionado por el peso del build y los frameworks. TypeScript aporta ubiquidad, pero necesita cerrar escapes. Effect intenta hacer explícitos errores, dependencias y efectos dentro del mundo TS. Python sigue siendo el rey de la exploración, pero exige más sistema alrededor para trabajo mantenido.

En la era agéntica, esta comparación deja de ser una discusión de gustos.

Es una discusión sobre loops.

Cuanto antes aparece el error, cuanto más concreto es el mensaje y cuanto más fácil es ejecutar el check, más rápido puede avanzar el agente sin trasladar todo el coste al reviewer humano.

Esa es la unidad real de productividad:

> no líneas generadas por minuto, sino errores importantes detectados antes de que el humano tenga que pensar en ellos.

Siguiente entrega: [Repos que devuelven feedback: cómo diseñar el loop de programación agéntica](/blog/repos-que-devuelven-feedback-como-disenar-loop-programacion-agentica/).
