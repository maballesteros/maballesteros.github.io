# Notas para agentes

- No edites el contenido dentro de `_site/`; es la salida generada por Jekyll y se sobrescribe en cada build.
- El código fuente de las aplicaciones vive en `apps/**`. Haz los cambios ahí y luego genera el bundle público en `/sport-planner` u otras carpetas similares.
- **Docs siempre en sync:** cualquier cambio funcional/modelo/UI de una app debe reflejarse en su `apps/<app>/specs.md`. Ese documento debe describir el estado real del código al 100% (y si algo es “futuro”, debe indicarse explícitamente).

## Publicación de posts (blog)

- Ruta de posts: `_posts/blog/`
- Patrón de nombre: `YYYY-MM-DD-slug.md`
- URL final (por `permalink: /:categories/:title/`): `/blog/<slug>/`

### Frontmatter mínimo recomendado

```yaml
---
title: "Título del artículo"
excerpt: "Resumen breve (1 frase)"
tags: [ia, agentes, software]
date: YYYY-MM-DD
modified: YYYY-MM-DD
comments: true
ref: slug-estable
---
```

### Flujo rápido

1. Crear post en `_posts/blog/`.
2. Si el contenido viene de Obsidian, convertir `[[wikilinks]]` a enlaces Markdown web (`/blog/<slug>/`).
3. Validar local:
   - `bundle exec jekyll serve --watch`
4. Publicar:
   - `git add _posts/blog/<fichero>.md`
   - `git commit -m "Add post: <tema>"`
   - `git push origin master`

### Guardrails

- No mezclar cambios funcionales de apps con publicación de posts en el mismo commit salvo petición explícita.
- No incluir assets no usados ni binarios grandes sin referenciarlos desde el post.
