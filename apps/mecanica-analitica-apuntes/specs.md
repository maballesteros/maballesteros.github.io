# Apuntes de Mecánica Analítica — specs

## Estado actual

- App estática servida directamente desde `apps/mecanica-analitica-apuntes/index.html`.
- No requiere build ni bundling: la ruta pública prevista es `/apps/mecanica-analitica-apuntes/`.
- El contenido actual cubre una versión web del capítulo 1 de los apuntes de Mike:
  - sistema
  - qué observamos
  - configuración y estado
  - ley dinámica
  - mundos posibles

## Stack

- HTML5 estático
- CSS embebido en el propio documento
- KaTeX vía CDN para renderizado matemático
- p5.js vía CDN para la visualización del “mundo sin inercia”
- D3 vía CDN para la visualización del “mundo con demasiada memoria”

## Reglas funcionales actuales

- La app debe seguir el guion real de los apuntes, no un discurso meta sobre la POC.
- Todas las ecuaciones deben renderizar correctamente.
- La navegación del capítulo se resuelve con anclas internas.
- Las visualizaciones interactivas deben tener botón de `Reset`.
- La experiencia debe ser usable tanto en escritorio como en móvil.

## Assets actuales

- `index.html`: app principal
- `cover.png`: imagen usada en la landing `/apps/`

## Origen editorial

- El curso base canónico sigue viviendo en el vault de Obsidian en formato LaTeX.
- Esta app es la traducción web rica de los apuntes personales de Mike, no la fuente canónica del curso base.
