# Apuntes de Mecánica Analítica — specs

## Principio editorial

La app no es una adaptación libre ni una versión decorada de unos apuntes. Es la traducción web interactiva de un curso cuyo objetivo es entender la física teórica desde primeros principios, de forma constructiva, casi algorítmica o axiomática.

Cada apartado debe conservar esta secuencia de razonamiento:

1. identificar qué problema conceptual o de descripción aparece;
2. mostrar por qué las nociones anteriores no bastan;
3. introducir el concepto mínimo que resuelve esa insuficiencia;
4. formalizarlo después con ecuaciones, figuras o demos.

Las fórmulas no deben entrar como autoridad ni como tradición. Deben aparecer cuando el lector ya entiende qué problema conceptual vienen a cerrar. Las demos interactivas deben cumplir la misma función: hacer visible una necesidad conceptual concreta, no adornar ni sustituir el argumento canónico.

El tono buscado es claro, riguroso y pedagógico: estilo Feynman en el sentido de construir intuición desde casos simples y primeros principios, sin esconder la dificultad ni convertirla en exposición de manual.

### Principio rector recurrente

La app debe hacer visible, desde el capítulo 1, la distinción entre contenido físico y elección de descripción.

Las coordenadas son etiquetas sobre el espacio físico que se está describiendo. Una elección de coordenadas puede revelar u ocultar la estructura del problema, pero no debe cambiar el contenido físico. Esta idea debe aparecer explícitamente al pasar de \(Q\) a coordenadas generalizadas y debe reutilizarse cuando el curso hable de Lagrangianos, acción, espacios de estados, simetrías o cambios de variables.

Regla editorial: cuando una explicación diga o sugiera que algo depende de una coordenada concreta, revisar si lo correcto es decir que depende del punto físico, la configuración, la historia o el estado, y que la coordenada solo lo etiqueta.

### Gramática mental recurrente: flujo sobre presentes

Desde el capítulo 1, una ley local y determinista debe poder leerse como un campo de flechas sobre un espacio de presentes:

\[
\dot s=X(s,t).
\]

La pregunta constructiva prioritaria es qué debe contener \(s\), no cuál es el orden tradicional de la ecuación. El curso debe reutilizar esta imagen cuando compare descripciones: elegir un espacio de presentes, pintar flechas, seguir curvas y solo después proyectar sobre configuración.

## Estado actual

- App estática servida directamente desde `apps/mecanica-analitica-apuntes/index.html`.
- No requiere build ni bundling: la ruta pública prevista es `/apps/mecanica-analitica-apuntes/`.
- La app ya no se presenta como “apuntes”, sino como un curso visual interactivo de mecánica analítica.
- La raíz `index.html` debe funcionar como portada pura de curso: mapa de capítulos, tono editorial y acceso a los capítulos desarrollados.
- Cada capítulo debe vivir en su propio HTML plano dentro de la carpeta de la app, con su JS específico al lado cuando haga falta.
- El contenido desarrollado actual vive en `capitulo-1.html` a `capitulo-7.html`.
- El capítulo 1 conserva demos interactivas desarrolladas. Los capítulos 2–7 están sincronizados con el TeX tras el replanteo constructivo e incluyen una primera capa de demos/figuras centradas en simetrías, fase, generadores, acción canónica, proyección lagrangiana, Liouville y fase estacionaria.
- Existe una serie de snapshots editoriales recuperables en el área canónica del curso dentro de `snapshots/`: `2026-05-09-v001` como base previa, `2026-05-09-v002` tras la reestructura de flujo, `2026-05-09-v003` tras la poda centrada en \(\eta\) como dato esencial de cambio, y `2026-05-09-v004` como punto previo al siguiente cambio conceptual grande.
- Capítulo 1:
  - por qué no empezar por \(F=ma\)
  - principios rectores: criterios de admisibilidad para la clase de mecánica construida
  - del fenómeno a la pregunta física
  - sistema
  - modelar es decidir qué conservamos
  - configuración y espacio de configuraciones \(Q\)
  - las coordenadas como etiquetas, no como física
  - grados de libertad y coordenadas
    - péndulo simple: cartesianas con restricción frente a ángulo
    - péndulo doble: cuatro coordenadas escritas frente a dos ángulos adaptados
  - movimiento como curva en el espacio de configuraciones
  - qué es una ley dinámica
  - qué significan local y determinista
  - una ley local como campo de flechas sobre un espacio de presentes
  - intento 1: solo configuración \(s=q\)
  - intento 2: configuración más dato de cambio \(s=(q,\eta)\)
  - intento 3: añadir más memoria \(s=(q,\eta,\alpha)\)
  - una precisión sobre reversibilidad
  - estado mínimo y punto de partida
  - resumen visual
- Capítulo 2:
  - simetrías y leyes admisibles
  - cambio de descripción frente a simetría física
  - simetría como transformación de soluciones
  - homogeneidad espacial, isotropía y homogeneidad temporal
  - relatividad galileana
  - partícula libre como ley restringida por simetrías
  - simetría todavía no implica conservación
  - todas sus secciones tienen figura o demo local asociada
- Capítulo 3:
  - del estado al espacio de fases
  - \(p_i dq^i\) como emparejamiento coordenada-covector
  - \(T^*Q\), forma canónica y forma simpléctica
  - Hamiltoniano como generador del flujo
  - todas sus secciones tienen figura o demo local asociada
- Capítulo 4:
  - corchete de Poisson
  - evolución temporal como transformación generada
  - conservación como conmutación con la evolución
  - momento, momento angular y energía como generadores
  - Hamiltoniano libre obtenido desde simetrías galileanas
- Capítulo 5:
  - acción canónica en fase
  - variación de \(S[q,p]\) y ecuaciones de Hamilton
  - Lagrange como proyección regular al eliminar \(p\)
  - Euler–Lagrange como sombra de Hamilton
  - derivadas totales, cambios de coordenadas y simetrías físicas como equivalencias distintas
  - Noether lagrangiano como traducción variacional
- Capítulo 6:
  - estructura hamiltoniana aplicada a problemas clásicos
  - osciladores, modos normales, potenciales centrales y restricciones
  - transformaciones canónicas, Liouville, variables acción–ángulo y Hamilton–Jacobi
- Capítulo 7:
  - acción como fase
  - propagador, composición y suma sobre historias
  - fase estacionaria, aproximación semiclásica, WKB
  - cuantización de la acción
  - corchete de Poisson y conmutador

## Stack

- HTML5 estático
- `course.css` compartido por la portada y los capítulos
- `course-demos.js` compartido por todos los capítulos: toolkit común para render matemático, canvas p5 responsive, primitivas SVG, primitivas geométricas, campos vectoriales, integración numérica y utilidades de controles.
- `constructive-demos.js` compartido por los capítulos 2–7: implementa las demos del replanteo constructivo usando primitivas comunes de `course-demos.js`.
- JS específico por capítulo cuando haga falta visualización propia
- KaTeX vía CDN para renderizado matemático
- p5.js vía CDN para visualizaciones de campo de flechas, estado y reversibilidad
- D3 vía CDN para visualizaciones de memoria adicional y diagramas de apoyo
- p5.js vía CDN para comparadores dinámicos y demos de espacio de presentes/reversibilidad

## Reglas funcionales actuales

- La app debe seguir el guion real de los apuntes, no un discurso meta sobre la POC.
- La app debe seguir también el contenido base del tutorial `.tex` y mantener la misma secuencia de apartados, texto canónico, fórmulas y figuras-base, usando las demos solo como capa aditiva.
- El cuerpo teórico del `.tex` debe aterrizar en HTML principalmente como párrafos normales `<p>`, no como paneles de diseño.
- `equation-panel` no debe usarse por defecto; solo en casos excepcionales y respaldados por la estructura del `.tex`.
- `world-card` debe usarse solo para demos o visualizaciones interactivas, con texto adicional específico de lectura de la demo.
- `concept-card` debe usarse de forma muy selectiva, solo cuando compacte una distinción realmente útil.
- `callout` queda reservado a conclusiones de mucha fuerza teórica o advertencias conceptuales de alcance.
- El tono de la interfaz debe sentirse como el de un curso visual interactivo, no como una exportación de notas privadas.
- La estructura debe permitir crecer por capítulos sin convertir la app en un único HTML monolítico.
- Todas las ecuaciones deben renderizar correctamente.
- La navegación del capítulo se resuelve con anclas internas.
- Cada capítulo publicado debe cerrar su menú interno y su contenido principal con navegación entre capítulos. Si existe capítulo siguiente publicado, debe aparecer como enlace explícito al final del `toc` y como bloque de cierre del `main`; si no existe todavía, no se debe crear un enlace muerto.
- La portada debe incluir el mapa de capítulos completo, aunque no todos estén desarrollados todavía.
- La portada debe reflejar con honestidad qué capítulos están disponibles y hasta dónde llega cada uno si está publicado de forma parcial.
- El orden conceptual del capítulo debe permitir que la noción de `estado` emerja después de comparar espacios de presentes candidatos, no antes.
- El capítulo 1 debe introducir al principio los criterios de admisibilidad que se reutilizarán como filtros: covariancia descriptiva o independencia de coordenadas; compatibilidad con las simetrías del modelo; homogeneidad del espacio; isotropía del espacio; homogeneidad del tiempo; principio de relatividad galileana; localidad temporal; determinismo local; reversibilidad temporal del núcleo ideal; completitud y minimalidad del estado.
- Esos criterios no deben presentarse como axiomas absolutos de toda física, sino como principios rectores de la clase de mecánica que se está construyendo; cuando se violen, el texto debe aclarar qué estructura física adicional o qué cambio de familia de modelos haría legítima esa violación.
- Antes de usar leyes locales y deterministas para contar datos iniciales, el capítulo 1 debe explicar `local` como localidad temporal y `determinista` como unicidad local de la continuación bajo datos físicos suficientes.
- El conteo de datos iniciales debe presentarse como dimensión local del espacio de soluciones de una EDO regular de orden \(r\), no como preferencia por derivadas ni por una coordenada particular. En capítulo 1 debe entrar después de la gramática de flujo sobre presentes, como nota matemática subordinada.
- La comparación central del capítulo 1 debe formularse como intentos constructivos de elegir el espacio de presentes \(s\), no como una taxonomía de órdenes de ecuación.
- Debe existir una demo central temprana de la gramática común: \(s=q\), \(s=(q,\eta)\) y \(s=(q,\eta,\alpha)\), todos leídos como espacios donde una ley local pinta flechas.
- En el intento 1, \(s=q\), la app debe distinguir entre leyes de relajación útiles, como un atractor, y una ley fundamental para una partícula libre. El argumento central es que, si ningún lugar ni sentido del espacio está físicamente privilegiado, una ley \(\dot x=u(x)\) para una partícula libre acaba introduciendo un atractor, una deriva incorporada o reposo trivial.
- Justo después de explicar que el punto de configuración decidiría por sí solo la velocidad, puede aparecer una demo local de campo vectorial 2D hacia un atractor \(A\). Su función es hacer visible que el atractor marca una localización preferente y por tanto exige estructura física adicional en un espacio que pretendía ser homogéneo.
- La demo del intento 1 debe visualizar ese trilema, no solo una trayectoria: atractor \(\dot x=-kx\) como lugar especial, deriva \(\dot x=c\) como sentido especial y reposo \(\dot x=0\) como ausencia de memoria de lanzamiento.
- En el intento 2, \(s=(q,\eta)\), la app debe presentar \(\eta\) como dato neutral de cambio: aquello que distingue preparaciones que comparten configuración. No anticipar lecturas de marcos posteriores. Este intento es el mínimo que permite inercia: el flujo vive en estados; el segundo orden aparece al proyectar sobre configuración.
- La demo del intento 2 debe mostrar el plano \((q,\eta)\), el campo de flechas, una curva integral y sus proyecciones \(q(t)\) y \(\eta(t)\). Debe quedar visible que una misma configuración puede corresponder a estados distintos.
- En el intento 3, \(s=(q,\eta,\alpha)\), la app debe explicar que el problema no es la notación de orden alto sino la memoria adicional. En el caso libre \(x^{(3)}=0\), \(\alpha_0\) produce curvatura inicial libre; si ese dato extra no tiene interpretación física, probablemente se han escondido grados de libertad o memoria efectiva.
- La demo del intento 3 debe mostrar primero el campo en el espacio ampliado \((x,\eta,\alpha)\): mismo presente visible \((x_0,\eta_0)\), distintas capas \(\alpha_0\), distintas flechas locales. Después puede mostrar el abanico de historias como proyección.
- El capítulo no debe cerrarse solo con `estado`: debe dejar explícito el punto de partida adoptado y la pregunta que abre el capítulo siguiente.
- Las visualizaciones interactivas deben tener botón de `Reset`.
- Las demos nuevas deben apoyarse primero en `course-demos.js` antes de reimplementar primitivas: flechas, mapeo mundo→pantalla, rejillas/ejes, campos de flechas, partículas, curvas muestreadas, paneles SVG, marcadores SVG e integradores. Si una demo necesita una abstracción nueva reutilizable, añadirla al toolkit compartido en vez de esconderla en un capítulo.
- La experiencia debe ser usable tanto en escritorio como en móvil.
- En `mobile` y `tablet portrait` la cabecera debe comportarse como un bloque editorial compacto, no como una landing de dos columnas.
- La escala tipográfica en pantallas estrechas debe seguir siendo cómoda de leer sin zoom manual.
- Los bloques conceptuales, ecuacionales y de visualización deben reutilizar un mismo sistema de componentes para poder crecer al resto del capítulo sin rediseños ad hoc.
- La distinción entre configuración y estado debe cerrarse como síntesis conceptual, no con una demo redundante si el capítulo ya la hizo visible mediante flujos y proyecciones.
- En `Grados de libertad y coordenadas` las visualizaciones deben hacer explícita la diferencia entre coordenadas escritas, vínculos y grados de libertad efectivos.
- Cuando haya coordenadas adaptadas especialmente reveladoras, la app debe preferir mostrarlas en contraste directo con la versión cartesiana redundante.
- El capítulo 1 debe hacer visible la diferencia entre configuración y espacio de estados, y usarla para explicar por qué el segundo orden es una sombra/proyección de un flujo de primer orden sobre el espacio de presentes.
- A partir del capítulo 2, el curso ya no debe seguir la autopista tradicional `Lagrange -> Noether -> Hamilton`. El hilo rector es `estado -> ley local -> simetrías admisibles -> estructura de fase -> generadores -> conservación -> acción canónica -> Lagrange como proyección`.
- El capítulo 2 debe adelantar simetrías como restricciones sobre campos de evolución, sin adelantar Noether lagrangiano.
- El capítulo 3 debe introducir \(p\) como covector conjugado a desplazamientos, no como derivada de un lagrangiano previo.
- El capítulo 4 debe presentar conservación desde generadores hamiltonianos y corchetes de Poisson antes de Noether.
- El capítulo 5 debe recuperar la acción primero como acción canónica \(S[q,p]\); \(\mathcal{L}(q,\dot q,t)\) aparece solo si \(p\) puede eliminarse de forma regular.
- Cuando se diga que dos formulaciones son equivalentes, debe aclararse si la equivalencia viene de un cambio de coordenadas, de una transformación canónica, de una derivada total o de una simetría física. No mezclar esos niveles.

## Backup y restore editorial

La app participa en el protocolo de snapshots del curso, aunque viva fuera del vault.

Ubicación canónica:

`/Users/mike/Library/CloudStorage/GoogleDrive-maballesteros@gmail.com/Mi unidad/mikevault/04 Áreas/Física/01 Mecánica Analítica/snapshots/`

Reglas:

- El identificador de snapshot debe tener forma `YYYY-MM-DD-vNNN`.
- Antes de cambios grandes en narrativa, estructura, demos o sincronía TeX/HTML, crear un snapshot recuperable.
- El snapshot debe incluir tanto la fuente TeX como la app HTML, porque el estado pedagógico real vive en la sincronía entre ambas.
- No meter en snapshots salidas generadas de la app (`output/`, capturas temporales) salvo que se pidan como evidencia.
- Para restaurar, usar primero el modo seco del `restore_snapshot.sh` del snapshot y aplicar solo después con `--apply`.
- Tras restaurar, volver a verificar TeX y JS; si hay cambios visuales, revisar la app en navegador.

## Assets actuales

- `index.html`: portada del curso
- `course.css`: sistema visual compartido
- `capitulo-1.html`: capítulo 1
- `capitulo-1.js`: visualizaciones y lógica del capítulo 1
- `capitulo-2.html`: capítulo 2
- `capitulo-3.html` a `capitulo-7.html`: capítulos constructivos sincronizados con TeX y demos locales
- `constructive-demos.js`: visualizaciones constructivas compartidas de capítulos 2–7
- `capitulo-2.js`: visualizaciones históricas del capítulo 2 anterior; no debe considerarse parte activa del replanteo constructivo salvo que se reutilice deliberadamente en una etapa posterior
- `cover.png`: imagen usada en la landing `/apps/`
- `assets/capitulo-1-resumen-infografia.svg`: infografía resumen actual del capítulo 1
- `assets/capitulo-1-resumen-infografia.prompt.md`: prompt fuente de la infografía para futuras iteraciones

## Origen editorial

- El curso base canónico sigue viviendo en el vault de Obsidian en formato LaTeX.
- Esta app es la traducción web rica de los apuntes personales de Mike, no la fuente canónica del curso base.
