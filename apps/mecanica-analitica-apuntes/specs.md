# Apuntes de Mecánica Analítica — specs

## Estado actual

- App estática servida directamente desde `apps/mecanica-analitica-apuntes/index.html`.
- No requiere build ni bundling: la ruta pública prevista es `/apps/mecanica-analitica-apuntes/`.
- La app ya no se presenta como “apuntes”, sino como un curso visual interactivo de mecánica analítica.
- La portada debe mostrar el mapa completo del curso y dejar explícito que, por ahora, el contenido desarrollado corresponde al capítulo 1.
- El contenido actual cubre una versión web desarrollada del capítulo 1:
  - sistema
  - qué observamos
    - grados de libertad frente a coordenadas
    - péndulo simple: cartesianas con restricción frente a ángulo
    - péndulo doble: cuatro coordenadas escritas frente a dos ángulos adaptados
  - ley dinámica
  - mundos posibles
    - mundo sin inercia
    - mundo con demasiada memoria
    - nuestro mundo: la memoria justa
  - estado

## Stack

- HTML5 estático
- CSS embebido en el propio documento
- KaTeX vía CDN para renderizado matemático
- p5.js vía CDN para la visualización del “mundo sin inercia”
- D3 vía CDN para la visualización del “mundo con demasiada memoria”

## Reglas funcionales actuales

- La app debe seguir el guion real de los apuntes, no un discurso meta sobre la POC.
- La app debe seguir también el contenido base del tutorial `.tex` cuando se amplíen o afiancen secciones conceptuales.
- El tono de la interfaz debe sentirse como el de un curso visual interactivo, no como una exportación de notas privadas.
- Todas las ecuaciones deben renderizar correctamente.
- La navegación del capítulo se resuelve con anclas internas.
- La portada debe incluir el mapa de capítulos completo, aunque no todos estén desarrollados todavía.
- El orden conceptual del capítulo debe permitir que la noción de `estado` emerja después de comparar leyes de distinto orden, no antes.
- Las visualizaciones interactivas deben tener botón de `Reset`.
- La experiencia debe ser usable tanto en escritorio como en móvil.
- En `mobile` y `tablet portrait` la cabecera debe comportarse como un bloque editorial compacto, no como una landing de dos columnas.
- La escala tipográfica en pantallas estrechas debe seguir siendo cómoda de leer sin zoom manual.
- Los bloques conceptuales, ecuacionales y de visualización deben reutilizar un mismo sistema de componentes para poder crecer al resto del capítulo sin rediseños ad hoc.
- En `¿Qué observamos?` las visualizaciones deben hacer explícita la diferencia entre coordenadas escritas, vínculos y grados de libertad efectivos.
- Cuando haya coordenadas adaptadas especialmente reveladoras, la app debe preferir mostrarlas en contraste directo con la versión cartesiana redundante.

## Assets actuales

- `index.html`: app principal
- `cover.png`: imagen usada en la landing `/apps/`

## Origen editorial

- El curso base canónico sigue viviendo en el vault de Obsidian en formato LaTeX.
- Esta app es la traducción web rica de los apuntes personales de Mike, no la fuente canónica del curso base.
