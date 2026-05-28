---
title: "Lo que las PRs saben y el código no cuenta"
excerpt: "Cómo usé IA para convertir 400 PRs y sus comentarios en guías agénticas de backend más útiles que una documentación escrita desde cero."
tags: [ia, agentes, codex, backend, engineering]
date: 2026-05-19
modified: 2026-05-19
comments: true
ref: lo-que-las-prs-saben-y-el-codigo-no-cuenta
---

El otro día, en una reunión de equipo sobre uso de IA, volvió a salir una queja bastante razonable:

> La IA hace código, pero a veces no lo entiendo.  
> No sigue del todo nuestras normas.  
> No escribe como escribiríamos nosotros.

Al principio esto suena a crítica contra la IA. Pero cuanto más lo pensaba, más claro veía que el problema no era solo el agente. El problema era nuestro.

Este texto complementa la serie [AI Product Engineering sin humo](/ai-product-engineering/) desde el lado del equipo y del repo: cómo convertir IA y agentes en una práctica de ingeniería real, no solo en una herramienta de generación de código.

Este es un paso más dentro del [cambio de paradigma en la programación](/blog/cambio-de-paradigma-en-programacion/). Si el trabajo del ingeniero se desplaza de escribir cada línea a especificar, revisar y orquestar, entonces las instrucciones que recibe el agente dejan de ser documentación auxiliar. Se convierten en parte del sistema de producción.

Le estábamos pidiendo a Codex que se comportara como “uno más del equipo”, pero muchas de las cosas que definen cómo trabaja ese equipo no estaban escritas en ningún sitio. Vivían en la cabeza de la gente. O peor: vivían dispersas en cientos de comentarios de PR.

Lo esencial es esto:

> El código cuenta cómo está construido el sistema.  
> Las PRs cuentan cómo aprendimos a no construirlo mal.

Y esa segunda parte, para un agente, es oro.

Así que hice un experimento. En vez de escribir una guía agéntica de backend desde cero, usando mi memoria y cuatro intuiciones, le pedí a la IA que me ayudara a construirla en dos fases:

1. Primero, leyendo el propio código.
2. Después, minando comentarios de PR para extraer los detalles finos que el código ya no enseña.

La primera fase dio la estructura. La segunda dio el carácter.

---

## Fase 1: dejar que la IA lea el repo

La parte obvia era pedirle a Codex que analizara el backend como si entrara una persona nueva al equipo.

No “léete todo y dime cosas”, sino algo más concreto:

- qué módulos existen,
- qué responsabilidades viven en cada capa,
- qué patrones se repiten,
- cómo se inicializan componentes,
- cómo se nombran las cosas,
- dónde están los tests,
- cómo se trata la configuración,
- qué señales de arquitectura parecen importantes.

Esto funciona sorprendentemente bien. Un repo grande, si tiene cierta coherencia, habla bastante.

Si todos los controladores delegan de una forma parecida, si los servicios siguen cierto patrón, si los tests tienen un estilo reconocible, si hay boundaries de dominio más o menos estables... la IA puede extraer una guía base razonable.

Pero aquí aparece el límite.

El código muestra el resultado final. No muestra todos los caminos que el equipo rechazó para llegar ahí.

Un repo limpio no te dice:

- “esto antes estaba en el controller y lo quitamos porque mezclaba lifecycle con dominio”,
- “este helper compartido parecía buena idea, pero acabó generando acoplamiento”,
- “este nombre es técnicamente correcto, pero en nuestro dominio pierde un matiz importante”,
- “este log no ayuda a diagnosticar nada cuando producción se rompe”.

Eso no está en el código.

Eso está en las revisiones.

¿Qué nos enseña esto? Que analizar el código es necesario, pero insuficiente. Te da la gramática del repo, no sus manías sanas.

---

## Fase 2: usar las PRs como memoria del equipo

Aquí vino la parte interesante.

Un compañero dijo algo que me hizo clic: en los comentarios de las PRs hay mucha documentación no escrita. No documentación formal, claro. Documentación de batalla.

Así que hicimos el experimento con las últimas **400 PRs**.

De ahí salió una muestra de **480 comentarios inline**. Tras filtrar ruido, quedaron **291 comentarios humanos** y **172 comentarios raíz humanos útiles**. Suficiente para empezar a ver patrones.

No buscábamos “quién se equivoca más” ni “qué reviewer es más pesado”. Eso habría sido una lectura pobre. Lo que queríamos era otra cosa:

> ¿Qué comentarios aparecen una y otra vez porque el repo tiene reglas que nadie ha escrito todavía?

Y empezaron a salir familias muy claras.

Había comentarios sobre responsabilidad y lifecycle: componentes, controllers y modelos mezclados de formas que “funcionan”, pero no respetan la arquitectura.

Había comentarios sobre configuración e infra compartida: helpers comunes que se añaden demasiado pronto, APIs compartidas sin consumidor claro, cambios que fuerzan churn innecesario.

Había comentarios sobre UI/XML/CSS, sobre asincronía, sobre diagnóstico, sobre naming, sobre tests, sobre abstracciones prematuras.

La gracia no estaba en cada caso individual. La gracia estaba en la repetición.

Cuando ves el mismo tipo de comentario diez, doce o trece veces, deja de ser una preferencia personal. Empieza a ser una convención del equipo que todavía no ha encontrado su sitio en la documentación.

¿Qué nos enseña esto? Que las PRs no son solo un mecanismo de control de calidad. También son un corpus de cultura técnica.

---

## El detalle que no se ve hasta que falta

Hay una categoría de conocimiento muy puñetera: los detalles que nadie sabe explicar bien hasta que alguien los rompe.

No son grandes principios arquitectónicos. No son “usa hexagonal” o “haz tests”. Son cosas más pequeñas:

- este tipo de nombre aquí confunde,
- este helper no debería existir todavía,
- este cambio toca demasiadas capas,
- este log no aporta contexto,
- este test prueba implementación, no comportamiento,
- esta inicialización ocurre demasiado pronto,
- esta abstracción parece elegante, pero en este repo nos va a costar cara.

Ese conocimiento es difícil de extraer mirando solo el código porque muchas veces el código final ya está corregido. La pista de aprendizaje quedó en la conversación de la PR.

Y esto me parece una idea muy potente para el mundo agéntico.

Hasta ahora, muchas guías para agentes se escriben como si fueran manuales ideales:

> “Sigue los patrones del proyecto.”  
> “Mantén el código simple.”  
> “Respeta la arquitectura.”  
> “Añade tests.”

Todo eso está bien, pero es demasiado genérico.

Después de minar PRs puedes decir cosas mucho más útiles:

> “No extraigas un helper compartido si solo hay un consumidor real.”  
> “No mezcles lifecycle de componente con responsabilidad de modelo.”  
> “Si introduces API compartida, explica quién la consume ahora y qué contrato estabiliza.”  
> “Antes de cerrar, revisa si has movido funciones sin necesidad o has dejado artefactos generados.”

Esto ya no es una recomendación bonita. Es memoria operativa.

También es una forma muy concreta de reducir la carga mental del dev-orquestador. En [cuando la IA va más rápido que tu cabeza](/blog/cuando-la-ia-va-mas-rapido-que-tu-cabeza/) hablaba de los loops abiertos que genera trabajar con agentes. Una checklist buena cierra parte de esos loops: no depende de que yo recuerde cada manía del repo en cada revisión, sino de que el sistema me la ponga delante cuando toca.

¿Qué nos enseña esto? Que una buena guía agéntica no debería describir solo cómo nos gustaría programar. Debería codificar las correcciones que ya hemos repetido demasiadas veces.

---

## De informe a mecanismo

El peligro de este tipo de experimento es acabar con un informe precioso que nadie usa.

“Hemos analizado 400 PRs, aquí están las conclusiones, qué interesante todo.”

Y ya.

Eso no sirve.

El aprendizaje tenía que acabar en mecanismos concretos. En nuestro caso, tres:

1. **Cambios en la guía de arquitectura backend.**  
   No una reescritura filosófica, sino ajustes donde las PRs mostraban fricción repetida.

2. **Una checklist de revisión.**  
   Para que una persona o un agente pueda pasar por los puntos típicos antes de dar por terminado un trabajo.

3. **Instrucciones fuertes en `AGENTS.md`.**  
   Para que el agente no trate la checklist como “documentación opcional”, sino como parte del contrato de handoff en trabajos no triviales o cuando se le pide revisar una PR.

Este punto me parece clave.

Una guía pasiva dice:

> “Aquí están nuestras preferencias.”

Una guía operativa dice:

> “Antes de entregar, comprueba esto, porque históricamente es donde más nos equivocamos.”

La diferencia es enorme. Una es documentación. La otra empieza a parecerse a un sistema inmunológico.

Esto conecta directamente con las [leyes del desarrollo en un mundo agéntico](/blog/las-7-leyes-desarrollo-mundo-agentico-parte-1-constitucion/): la coherencia no puede depender solo de que alguien revise con memoria infinita. Hay que desplazar parte de esa coherencia a invariantes, ownership, checks y contratos de handoff.

¿Qué nos enseña esto? Que el objetivo no es tener más docs. Es reducir comentarios repetidos en futuras PRs.

---

## El loop: que cada revisión mejore al agente

La parte que más me gustó del experimento no fue el mining de las 400 PRs. Fue la consecuencia.

Si una PR revela una regla no escrita, esa regla no debería morir en el hilo de GitHub.

Debería entrar en un loop:

1. El agente trabaja.
2. El humano revisa.
3. Aparece un comentario útil y reaprovechable.
4. Ese comentario se convierte en guía, checklist o regla.
5. La siguiente ejecución del agente ya parte con ese aprendizaje.

La versión editorial de esta misma idea aparece en [guardrails ejecutables: políticas vivas](/blog/guardrails-ejecutables-politicas-vivas-no-documentos-bonitos/). Allí el feedback humano alimenta políticas de contenido. Aquí alimenta guías, checklists e instrucciones de repo. El patrón de fondo es el mismo: una corrección repetible no debería quedarse como comentario; debería convertirse en mecanismo.

Esto cambia bastante la sensación emocional de las revisiones.

Sin loop, cada comentario repetido sabe a frustración:

> “Otra vez la IA ha hecho esto mal.”

Con loop, el comentario se convierte en una pieza de entrenamiento del sistema:

> “Esto acaba de revelar una convención que todavía no habíamos escrito.”

No es magia. El agente seguirá fallando. Pero al menos los fallos repetibles dejan de ser puro coste y pasan a ser combustible.

Y esto conecta con una idea que cada vez veo más clara: en un equipo que usa agentes, la documentación no es un repositorio muerto. Es una interfaz de control.

---

## Cómo lo repetiría mañana

Si tuviera que aplicar esto en otro repo, haría algo bastante simple:

1. **Analizar el código actual** para construir la guía base.
2. **Extraer PRs recientes**; no hace falta toda la historia, pero sí una muestra suficiente.
3. **Filtrar ruido**: bots, checks automáticos, comentarios sin aprendizaje, discusiones irrelevantes.
4. **Agrupar patrones**: responsabilidad, naming, tests, config, async, observabilidad, abstracciones, higiene de diff.
5. **Convertir patrones en reglas accionables**.
6. **Meter esas reglas en el flujo real**: checklist, `AGENTS.md`, review prompts, handoff final.
7. **Crear el hábito de actualización**: si un comentario se repite, no se repite otra vez; se captura.

La clave está en no confundir extracción con mejora.

La mejora ocurre cuando el aprendizaje cambia el siguiente comportamiento del agente.

---

## Cierre

Cada vez tengo más claro que trabajar bien con agentes no va solo de elegir el modelo correcto. Va de construir contexto operativo.

Y ese contexto no sale únicamente del código.

Sale del código, sí. Pero también de las PRs, de las revisiones, de las manías sanas del equipo, de los pequeños “esto aquí no” que durante años han mantenido el repo en pie sin que nadie los llamara arquitectura.

La pregunta práctica es sencilla:

> ¿Qué comentario de PR estáis repitiendo tanto que ya debería dejar de ser un comentario y convertirse en sistema?

Porque probablemente ahí está vuestra próxima guía agéntica.
