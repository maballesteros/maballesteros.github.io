# Notas para agentes

- No edites el contenido dentro de `_site/`; es la salida generada por Jekyll y se sobrescribe en cada build.
- El código fuente de las aplicaciones vive en `apps/**`. Haz los cambios ahí y luego genera el bundle público en `/sport-planner` u otras carpetas similares.
- **Docs siempre en sync:** cualquier cambio funcional/modelo/UI de una app debe reflejarse en su `apps/<app>/specs.md`. Ese documento debe describir el estado real del código al 100% (y si algo es “futuro”, debe indicarse explícitamente).
