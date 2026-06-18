---
title: "Lenguajes para agentes (1/3): el lenguaje importa más"
excerpt: "Primera entrega de la miniserie: a partir de la apuesta de OpenAI por Rust, por qué los lenguajes, tipos y compiladores se convierten en parte del loop de velocidad agéntica."
tags: [ia, agentes, lenguajes, software, engineering]
date: 2026-06-18 12:03:00 +0200
modified: 2026-06-18
comments: true
ref: el-lenguaje-importa-mas-cuando-programa-un-agente
---

Miniserie **Lenguajes para agentes**: entrega **1/3**.

Siguiente: [El compilador como supervisor](/blog/el-compilador-como-supervisor-rust-go-python-typescript-era-agentica/).

El detonante de esta serie fue una noticia muy concreta: la [Rust Foundation anunció que OpenAI se incorporaba como Platinum Member y aportaba 600.000 dólares al ecosistema Rust](https://rustfoundation.org/media/rust-foundation-welcomes-openai-as-platinum-member-announces-donation-to-rust-project/).

La parte interesante no es solo el dinero. Es la señal.

En el comunicado, OpenAI no habla de Rust como una moda ni como un capricho de ingeniería. Lo enmarca en sistemas ambiciosos donde no quiere elegir entre rendimiento, seguridad y fiabilidad.

Esa frase me parece una buena puerta de entrada a una pregunta más grande: por qué una empresa que está empujando el desarrollo con agentes de código mira con tanta seriedad a un lenguaje como Rust.

Mi lectura no es que Rust sea "el lenguaje de la IA". Sería una simplificación absurda. Python seguirá siendo central en investigación, TypeScript en producto, Go en infraestructura cloud y Kotlin/Java en muchísimo backend real.

Tampoco escribo esto desde la posición de experto en todos esos lenguajes. Mi experiencia más sólida está en Kotlin y en ecosistemas de producto/backend donde pesan arquitectura, equipos, revisión y operación. Precisamente por eso me interesa esta exploración: porque con agentes de código ya no necesito dominar cada detalle sintáctico de Rust para entender qué problemas está intentando resolver y qué tipo de feedback ofrece.

La pregunta no es "¿puedo escribir Rust como alguien que lleva diez años en Rust?". La pregunta es otra:

> si hoy tuviera que montar una pieza nueva, asistido por agentes de código, ¿qué ventajas me daría un lenguaje que convierte más errores en feedback temprano?

La idea que me interesa es otra: cuando los agentes empiezan a escribir, modificar y revisar código a gran velocidad, el lenguaje se convierte en una pieza del sistema de control.

Durante un tiempo parecía razonable pensar que, si los agentes iban a escribir cada vez más código, el lenguaje de programación importaría menos.

Total: si ya no soy yo quien pelea con la sintaxis, ¿qué más da que el stack sea más o menos cómodo?

Cada vez lo veo más al revés.

Cuando programa un agente, el lenguaje no desaparece. Cambia de función. Deja de ser solo una herramienta para expresar instrucciones a una máquina y se convierte también en una superficie de colaboración: algo que el agente tiene que leer, modificar, compilar, romper, corregir y volver a intentar.

En ese mundo, el lenguaje importa mucho.

No por una razón estética. No porque Rust sea más elegante que Go, TypeScript más ubicuo que Kotlin o Python más rápido para prototipar. Importa porque cada lenguaje y cada ecosistema devuelven señales distintas cuando el agente se equivoca.

Y en programación agéntica, la calidad de la señal decide la velocidad real.

Este artículo forma parte de la serie [AI Product Engineering sin humo](/ai-product-engineering/). Es la primera pieza de una serie corta sobre lenguajes, feedback loops y desarrollo con agentes de código. La segunda parte mira la foto comparativa entre Rust, Go, Python, Kotlin y TypeScript. La tercera baja al repo: cómo diseñar proyectos que devuelvan feedback útil antes de que el humano tenga que reconstruirlo todo.

La tesis es sencilla:

> en un mundo donde el agente escribe más código y el humano revisa más decisiones, el mejor stack no es solo el que permite escribir rápido. Es el que permite validar rápido.

## El cambio no es escribir menos

La forma ingenua de contar la programación agéntica es esta:

> antes escribía código; ahora lo escribe el agente.

Algo de eso hay, claro. Pero se queda corto.

El cambio profundo no es que yo escriba menos líneas. Es que el centro de gravedad se mueve. La tarea importante deja de ser producir texto de programa y pasa a ser diseñar un loop:

1. explicar la intención;
2. dejar que el agente modifique el sistema;
3. obtener feedback;
4. corregir dirección;
5. validar el resultado;
6. hacerlo revisable por otra persona.

Ese loop puede ser muy rápido o puede ser desesperante. Y una parte enorme de la diferencia está en la superficie técnica sobre la que trabaja el agente.

Un agente puede generar código en casi cualquier lenguaje. Eso no significa que todos los lenguajes le den la misma calidad de feedback.

Hay entornos donde un error aparece como una excepción tarde, después de levantar media aplicación, preparar datos y recorrer manualmente un flujo. Hay otros donde el compilador te dice en segundos que no has tratado un caso, que una dependencia no existe, que un tipo no encaja o que estás intentando compartir estado mutable de forma insegura.

Para una persona, esa diferencia ya importaba.

Para un agente, importa todavía más, porque el agente puede iterar sobre señales concretas con una eficacia que no tiene cuando solo recibe síntomas vagos.

No es lo mismo decirle:

> el endpoint falla.

que devolverle:

> esta rama del `match` no cubre el estado `Blocked`; este `Result` no está manejado; esta función espera `UserId` y estás pasando `OrgId`; este módulo ya no implementa el puerto que declara el servicio.

La segunda clase de error es mucho más accionable.

## El lenguaje como interfaz de feedback

Normalmente hablamos de lenguajes de programación como si tuvieran dos públicos:

- la máquina que ejecuta;
- la persona que lee y mantiene.

Con agentes aparece un tercer público.

El agente no lee como una persona, pero tampoco ejecuta como una máquina. Está en medio. Necesita inferir intención, tocar el mínimo necesario, respetar patrones locales y corregirse a partir de señales.

Eso convierte al lenguaje y al tooling en una interfaz.

Una interfaz buena para agentes tiene varias propiedades:

- contratos explícitos;
- errores legibles;
- checks rápidos;
- estructura de proyecto predecible;
- convenciones fuertes;
- pruebas que fallan cerca de la causa;
- herramientas que pueden ejecutarse sin contexto humano;
- pocos caminos mágicos que dependan de memoria tribal.

Cuando esas piezas existen, el agente no tiene que adivinar tanto.

Si una operación puede fallar y el tipo lo dice, el agente tiene una pista. Si una dependencia se inyecta de forma explícita, el agente no tiene que buscar un singleton escondido. Si el dominio usa `TaskStatus` en vez de strings sueltos, el agente puede ver el espacio de estados. Si el repo tiene un comando canónico de validación rápida, el agente puede cerrar el loop sin inventar el ritual.

Esto no hace que el agente sea infalible.

Hace algo más útil: convierte parte de su error en feedback barato.

## Compilar no es solo producir binarios

En esta conversación suele aparecer Rust muy pronto, y con razón.

Rust no es interesante aquí solo porque sea rápido en runtime. Lo interesante es que desplaza muchos errores a compilación: ownership, borrowing, mutabilidad, ausencia con `Option`, errores recuperables con `Result`, exhaustividad en `match`, seguridad de concurrencia con `Send` y `Sync`.

Esa lista no es un adorno académico. Es una forma de cambiar cuándo aparece el problema.

Si el problema aparece en producción, es carísimo. Si aparece en un test de integración, sigue siendo caro. Si aparece en un test unitario, es mejor. Si aparece en `cargo check` antes de generar binario, mejor todavía.

La documentación de Cargo explica que `cargo check` compila el paquete sin hacer el paso final de generación de código, por eso suele ser más rápido que `cargo build`, aunque no detecta algunos errores que solo aparecen en codegen. Ese matiz importa: no es una validación total, pero es una validación temprana muy valiosa. Ver [Cargo Book: cargo check](https://doc.rust-lang.org/cargo/commands/cargo-check.html).

No conviene convertir esto en una afirmación simple del tipo "Rust siempre compila más rápido que Java con Gradle".

Eso no sería serio.

Rust puede tener builds pesados, sobre todo en proyectos grandes o con muchas dependencias genéricas. Java/Kotlin con Gradle puede mejorar muchísimo con daemon, build cache, configuration cache, compilación incremental, paralelismo y tareas bien separadas. Gradle tiene una guía completa de performance precisamente porque el build también es una pieza de productividad. Ver [Gradle Build Performance](https://docs.gradle.org/current/userguide/performance.html).

La pregunta relevante no es solo:

> ¿cuánto tarda el build completo?

La pregunta agéntica es más precisa:

> ¿cuánto tarda el primer feedback fiable que permite corregir dirección?

En Rust puede ser `cargo check`. En TypeScript puede ser `tsc --noEmit`. En Go puede ser `go test` sobre un paquete pequeño. En Kotlin puede ser un test focalizado o una tarea Gradle bien aislada. En Python puede ser una combinación de `pytest`, `mypy`, `ruff` y validaciones de contrato.

Lo importante es diseñar el carril rápido.

Porque si cada iteración cuesta dos minutos, el agente puede seguir trabajando, pero el loop pierde densidad. Si cada iteración cuesta cinco o diez segundos y el error es concreto, el agente puede corregir con mucha más precisión.

## El compilador como reviewer parcial

No me gusta vender el compilador como si sustituyera la revisión humana.

No lo hace.

El compilador no sabe si el producto tiene sentido, si el usuario entiende la pantalla, si el modelo de negocio es correcto, si el cambio respeta una intención no escrita o si una abstracción es prematura.

Pero sí puede hacer una cosa muy valiosa: quitarle al humano una parte del trabajo que no debería depender de atención humana.

Un compilador estricto puede decir:

- este caso no está cubierto;
- este valor puede no existir;
- este error no ha sido manejado;
- esta referencia ya no es válida;
- esta dependencia no está disponible;
- este tipo no representa el dominio que crees;
- este estado no puede enviarse entre hilos de forma segura.

Cada una de esas señales reduce carga cognitiva.

En una revisión tradicional, eso ya era bueno. En una revisión con agentes es crítico, porque el volumen cambia. Si el agente puede producir más cambios de los que una persona puede revisar con calma, el sistema necesita desplazar parte de la coherencia a mecanismos automáticos.

Esta idea conecta con [las 7 leyes del desarrollo en un mundo agéntico](/blog/las-7-leyes-desarrollo-mundo-agentico-parte-1-constitucion/): cuando sube el throughput, la coherencia no puede depender solo de heroísmo humano. Hay que mover parte del control al sistema.

El lenguaje forma parte de ese sistema.

No todo vive en `AGENTS.md`. No todo vive en tests. No todo vive en CI. Algunas garantías viven en el propio lenguaje.

Y esas garantías cambian la economía del trabajo.

## No necesitas ser experto para revisar mejor

Hay un punto que me parece importante.

No hace falta ser experto absoluto en Rust para entender por qué Rust interesa. Igual que no hace falta ser diseñador del compilador de Kotlin para valorar la null-safety, ni experto en Effect para entender que un tipo como `Effect<Success, Error, Requirements>` hace explícitas cosas que una `Promise` normal oculta.

Esto no es una invitación a la superficialidad. Es una forma distinta de investigar.

La programación agéntica hace más valiosa una competencia que antes estaba más repartida entre experiencia directa y memoria técnica: entender las propiedades del medio.

No se trata de memorizar cada detalle del borrow checker. Se trata de reconocer qué problemas está desplazando al compilador y cómo eso cambia el loop:

- menos errores silenciosos;
- más contratos visibles;
- menos estados implícitos;
- más feedback antes de ejecutar;
- más capacidad de revisar por intención y no solo por diff.

Eso permite algo interesante: puedes no ser quien escribe cada línea y, aun así, tener criterio fuerte sobre la arquitectura del trabajo.

También permite adoptar una tecnología con una curva de entrada alta de otra manera. No porque el agente elimine la necesidad de aprender, sino porque reduce el coste de exploración. Puedes pedirle que monte un vertical pequeño, que explique el `Result`, que compare `join!` con coroutines, que ejecute `cargo check`, que corrija errores del compilador y que te devuelva una lectura de las decisiones.

Eso no te convierte automáticamente en experto.

Pero sí puede convertir una tecnología que antes parecía lejana en una opción evaluable.

De hecho, ese es cada vez más el rol.

El humano no desaparece. Cambia su punto de intervención. En vez de pelear cada detalle sintáctico, evalúa si el agente ha usado bien el medio: si ha modelado el dominio con tipos útiles, si ha dejado errores explícitos, si ha creado tests que capturan comportamiento, si el cambio se puede revisar, si el repo ha ganado o perdido capacidad de feedback.

La pregunta deja de ser:

> ¿habría escrito yo esta línea así?

y pasa a ser:

> ¿este cambio deja al sistema más fácil de validar la próxima vez?

## La trampa de la productividad aparente

Hay stacks donde el agente parece avanzar más rápido porque hay menos fricción inicial.

Eso puede ser verdad y puede ser una trampa.

Python, JavaScript o Ruby permiten moverse muy rápido en exploración. Para prototipos, scripts, notebooks, glue code o pruebas de concepto, esa velocidad es real. No hay que despreciarla.

Pero si el sistema empieza a crecer y la única forma de descubrir ciertos errores es ejecutar rutas concretas, preparar datos concretos o esperar a que una excepción aparezca tarde, la velocidad inicial puede convertirse en deuda de validación.

En programación agéntica, esa deuda se multiplica.

Un agente puede generar mucho código correcto en apariencia. Si el stack permite que muchos fallos sobrevivan hasta runtime, el humano acaba pagando la revisión en una fase más cara.

Por eso la pregunta importante no es:

> ¿en qué lenguaje escribe el agente más rápido?

Sino:

> ¿en qué entorno el agente se equivoca de forma más barata?

Un lenguaje estricto puede parecer más lento al principio porque obliga a modelar más. Pero si ese modelado produce errores tempranos y refactors más seguros, el resultado neto puede ser más rápido.

No siempre.

Hay problemas donde el coste de modelar supera el beneficio. Hay fases donde conviene explorar con menos rigidez. Hay equipos donde el ecosistema pesa más que las garantías del lenguaje. Hay productos donde el principal riesgo no está en memoria, concurrencia o tipos, sino en entender qué construir.

Pero una vez que el trabajo entra en sistemas reales, con mantenimiento, revisiones, despliegues, datos y usuarios, el feedback temprano empieza a pesar mucho.

## La nueva pregunta de arquitectura

Hasta ahora, cuando elegíamos stack, mirábamos cosas como:

- rendimiento;
- ecosistema;
- contratación;
- coste operativo;
- librerías disponibles;
- experiencia del equipo;
- compatibilidad con el producto.

Todo eso sigue importando.

La programación agéntica añade otra pregunta:

> ¿qué calidad de feedback devuelve este stack a un agente que intenta cambiarlo?

Esa pregunta no se responde solo con el lenguaje.

Se responde con lenguaje, tooling, tests, CI, docs, estructura del repo, convenciones, observabilidad y cultura de revisión.

Pero el lenguaje es una pieza central porque define qué se puede expresar como contrato y qué queda como esperanza.

Rust expresa muchas cosas como contrato de compilación. Go expresa menos, pero ofrece simplicidad, velocidad de tooling y una cultura muy fuerte de código directo. TypeScript ofrece tipos sobre un runtime dinámico, y librerías como Effect intentan hacer explícitos errores, dependencias y recursos. Kotlin ofrece null-safety y un ecosistema sólido para backend JVM, aunque muchas garantías siguen dependiendo de runtime, frameworks y disciplina. Python ofrece velocidad brutal de exploración, pero necesita herramientas externas y mucha convención para no volverse frágil.

No hay una respuesta universal.

Sí hay una idea transversal:

> en la era agéntica, la velocidad no es producir más código. La velocidad es cerrar antes el loop entre intención, cambio y verificación.

## La lección

Los agentes no hacen que el lenguaje sea irrelevante.

Lo convierten en una parte más visible del sistema de control.

Cuando una persona programa línea a línea, puede compensar muchas ambigüedades con memoria, experiencia y lectura lenta. Cuando un agente modifica el sistema a velocidad alta, esas ambigüedades se vuelven caras. Necesitamos que el entorno devuelva señales claras, rápidas y accionables.

Ahí el lenguaje importa.

Importan los tipos. Importan los errores explícitos. Importa la exhaustividad. Importa el tooling. Importa cuánto tarda el primer check fiable. Importa si el repo permite al agente corregirse sin esperar a que el humano reconstruya todo el contexto.

La programación agéntica no reduce la necesidad de rigor.

La desplaza.

Y una parte de ese rigor empieza en una decisión que parecía vieja: el lenguaje en el que decidimos construir.

Siguiente entrega: [El compilador como supervisor: Rust, Go, Python y TypeScript en la era agéntica](/blog/el-compilador-como-supervisor-rust-go-python-typescript-era-agentica/).
