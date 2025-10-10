## Sport Planner – Especificación de la SPA

### 1. Contexto y propósito
- Aplicación web de página única (SPA) para planificar clases o sesiones de entrenamiento, inicialmente para kung-fu pero con diseño agnóstico al deporte.
- SPA **100 % cliente**: no habrá servidor propio, SSR ni endpoints personalizados; el bundle final debe poder servirse como archivos estáticos (por ejemplo, como parte de un dominio publicado en Github Pages).
- Persistencia local en el navegador mediante `localStorage`. Cada entidad se serializa en colecciones JSON independientes. La sincronización con Supabase (u otro backend) queda como mejora futura.
- Objetivos clave: planificar sesiones, gestionar un catálogo de trabajos, registrar asistencia y mantener la experiencia de uso fluida y agradable.

### 2. Objetivos principales
- Planificar sesiones por fecha, con la posibilidad de anotar/nombrar cada sesión.
- Facilitar la reutilización de sesiones pasadas (duplicar y ajustar).
- Mantener un catálogo reutilizable de trabajos, organizado por objetivos (tipos de trabajo) que tienen identidad propia.
- Permitir edición rápida de la secuencia de trabajos (añadir, quitar, reordenar con drag & drop) minimizando el espacio ocupado por cada ítem.
- Disponer de una "Home" que muestre la siguiente sesión planificada (incluida la de hoy) en modo visualización optimizada para móvil, permitiendo únicamente marcar qué trabajos se han completado y navegar fácilmente entre sesiones por fecha.
- Planificar desde un calendario semanal/mensual (semanas comienzan en lunes) en el que se destaquen las fechas con sesiones y se pueda crear/editar desde ahí.
- Registrar asistencia de manera sencilla (checkboxes por alumno) y mantener un catálogo básico de asistentes.
- Ofrecer respaldo y restauración completa de la base de datos mediante exportación/importación JSON.

### 3. Alcance inicial
- No hay autenticación; la app funciona completamente offline-first sobre `localStorage`.
- No se gestionan múltiples agendas ni permisos.
- No se contempla aún control de acceso por roles, recordatorios ni notificaciones.
- Primera versión con visualización pensada para mobile (home) y edición avanzada optimizada para desktop, manteniendo responsividad completa.

### 4. Entidades principales
- **Usuario**: perfil propio, preferencia de idioma/tema (opcional).
- **Objetivo (Tipo de trabajo)**: categoría que agrupa trabajos con identidad visual propia.
  - Campos: `id`, `nombre`, `colorHex`, `descripcionMarkdown`, metadata (`created_at`, `updated_at`).
- **Trabajo**: elemento del catálogo.
  - Campos: `id`, `nombre`, `objetivoId`, `descripcionMarkdown`, `tiempoEstimado` (minutos), `notas`, `videosYoutube` (array de URLs), metadata (`created_at`, `updated_at`).
- **Sesión**: planificación asociada a una fecha.
  - Campos: `id`, `fecha`, `titulo` (ej. "7ª Mei Hua - 1/7"), `descripcion`, `notas`, `trabajos` (secuencia ordenada con referencias a `SesiónTrabajo`), `asistentes` (estado), metadata.
- **Asistente**: representación ligera de quienes pueden asistir.
  - Campos: `id`, `nombre`, `notas`, estado activo/inactivo.
- **SesiónTrabajo** (tabla relacional/orden): mantiene la secuencia.
  - Campos: `id`, `session_id`, `trabajo_id`, `orden`, `descripcionPersonalizada` (override markdown plegable), `duracionPersonalizada`, `notas`.
- **SesiónAsistencia**: asociación de asistentes con sesiones y estado (`presente`, `ausente`, `pendiente`).

### 5. Casos de uso clave
1. **Home de próxima sesión**: al abrir la app, mostrar la sesión más cercana (incluida la de hoy) en vista de solo lectura salvo checkboxes de trabajos completados, con navegación a sesión anterior/siguiente, selector de fecha y acceso directo al modo edición.
2. **Explorar calendario**: vista mensual/semanal (semanas comienzan en lunes) resaltando fechas con sesiones planificadas; al seleccionar fecha se muestra la lista de sesiones y se puede crear/editar desde ahí.
3. **Crear sesión**:
   - Desde cero: seleccionar fecha, añadir título/notas, agregar trabajos desde catálogo.
   - Desde sesión existente: duplicar sesión previa (incluyendo orden y notas de trabajos), editar lo necesario.
4. **Editar sesión**: cambiar título/descripcion, plegar/desplegar detalles avanzados de cada trabajo, modificar orden de trabajos (drag & drop), ajustar duraciones, eliminar o insertar nuevos trabajos.
5. **Gestionar asistencia**: lista de asistentes definidos; marcar presente/ausente con checkboxes; notas rápidas.
6. **Catálogo de trabajos**:
   - Crear nuevos trabajos, asignando objetivo/categoría.
   - Editar/borrar trabajos existentes.
   - Autocomplete sensible al teclear (por nombre/descripcion/objetivo).
   - Gestionar enlaces de referencia (vídeos de YouTube) asociados a cada trabajo.
7. **Gestionar objetivos**: crear/editar objetivos con nombre, color y descripción en markdown para reutilizarlos al definir trabajos.
8. **Backups**:
   - Exportar todas las tablas en un JSON legible.
   - Importar desde JSON para restaurar (con confirmación y manejo de duplicados/conflictos).

### 6. Experiencia de usuario (UX)
- Interfaz visualmente impactante, con microinteracciones cuidadas, paleta definida y tipografía consistente; Home enfocada en mobile, planificación/edición con layout optimizado para desktop sin perder responsividad.
- Cabecera fija con branding y menús principales (`Home`, `Planificar`, `Catálogo`, `Objetivos`, `Asistentes`, `Backups`), más accesos rápidos a acciones recurrentes.
- Home: tarjeta destacada con la próxima sesión (incluida la de hoy), listado compacto de trabajos con único control editable (checkbox de completado), navegación a sesión anterior/siguiente y selector de fecha.
- Planificación: calendario mensual/semanal (lunes como inicio) con fechas marcadas según objetivos dominantes; al seleccionar una fecha se despliega panel lateral con sesiones del día y opciones de crear/editar.
- Edición de sesión: lista ordenable por drag & drop fluido; cada fila usa el color del objetivo como fondo o banda lateral, se muestra plegada por defecto y ofrece un botón de acciones (tres puntos) para editar descripción/duración/notas; añadir/quitar trabajos desde catálogo mediante búsqueda/autocomplete contextual. La visualización reutiliza el mismo formato cromático pero sin controles de edición.
- Contenido de trabajos: descripción en markdown enriquecido y chips de vídeos de YouTube abribles en modal; mostrar indicadores de duración total de la sesión y avisos de guardado automático o manual (a definir, evitando pérdida de cambios).

### 7. Flujos resumidos
- **Duplicar sesión**:
  1. Elegir fecha origen.
  2. Click en “Duplicar a…”; seleccionar nueva fecha.
  3. Crear copia con misma secuencia de trabajos y notas.
  4. Permitir edición inmediata de la copia.
- **Registro de asistencia**:
  1. Definir lista base de asistentes en la configuración.
  2. Al abrir una sesión, mostrar checkboxes (presente/ausente).
  3. Guardar estado por sesión.
  4. Opcional: ver historial de asistencia por alumno (no imprescindible en MVP, pero tener en cuenta para estructura de datos).
- **Exportar/Importar JSON**:
  - Export: botón que descarga JSON con todas las tablas (estructurado por entidad).
  - Import: selector de archivo; previsualización de conteos; botón “Importar” con paso de confirmación.
- **Marcar trabajos completados**:
  1. Desde la Home, revisar la próxima sesión en modo lectura.
  2. Marcar/desmarcar cada trabajo como realizado mediante checkbox.
  3. Guarda el estado inmediatamente y permite avanzar a la sesión siguiente/anterior.
- **Gestión de objetivos**:
  1. Abrir sección `Objetivos` desde la cabecera.
  2. Crear o editar objetivo definiendo nombre, color y descripción en markdown.
  3. Asociar trabajos existentes o nuevos a los objetivos disponibles.

### 8. Persistencia y sincronización
- **LocalStorage**: fuente de verdad en el MVP. Cada entidad se guarda con clave propia: `sport-planner-usuarios`, `sport-planner-objetivos`, `sport-planner-trabajos`, etc.
- **Respaldo**: el módulo de import/export opera sobre estas colecciones locales.
- **Supabase futuro**: se evaluará una sincronización con Supabase para trabajar desde varios dispositivos, reutilizando el mismo formato JSON. No es parte del MVP.

### 9. Arquitectura y stack
- SPA puramente cliente construida con React + Vite, generando un bundle estático deployable (GitHub Pages, Netlify, etc.).
- No se implementará ningún `hooks.server`, `+page.server`, Edge Functions propias ni lógica que requiera un runtime servidor dedicado dentro de la app.
- Estilado con Tailwind CSS (o librería equivalente) combinada con componentes personalizados para alcanzar la estética descrita.
- Estado: store global (por ejemplo, Zustand, Redux Toolkit o Context + Reducers) sincronizado con `localStorage`, con listeners para reaccionar a cambios en la pestaña actual.
- Testing: configurar base mínima (unit tests o e2e ligeros) cuando se empiece desarrollo.

### 10. Requisitos no funcionales
- Clara separación entre catálogo, sesiones y asistentes.
- Rendimiento fluido en mobile (vista Home) y desktop (edición avanzada).
- Código mantenible y fácil de desplegar (build simple, idealmente `npm run dev` / `npm run build`).
- Seguridad básica: al ejecutarse offline/local, no se cubren escenarios multiusuario. Para la sincronización futura se evaluarán opciones de auth.
- Accesibilidad: componentes navegables con teclado, contraste suficiente.

### 11. Exportación / Importación
- Formato JSON versionado (`version`: 1).
- Estructura sugerida:
  ```json
  {
    "version": 1,
    "usuarios": [...],
    "objetivos": [...],
    "trabajos": [...],
    "sesiones": [...],
    "sesiones_trabajos": [...],
    "asistentes": [...],
    "sesiones_asistencias": [...]
  }
  ```
- Importación debe validar versión y mostrar resumen antes de aplicar. Para restauraciones completas, opción de sobrescribir tablas (requiere confirmación explícita).

### 12. Consideraciones futuras
- Reporte de asistencia por alumno y métricas por objetivo.
- Compartir sesiones por enlace o PDF.
- Etiquetas adicionales (nivel, equipamiento necesario).
- Autosave incremental y versión móvil optimizada.

### 13. Próximos pasos
- Validar si hace falta flujo de alta de asistentes previo o inline desde la sesión.
- Decidir si se habilita guardado automático o manual.
- Definir diseño visual (paleta, tipografías).
- Confirmar estrategia de despliegue (GitHub Pages / Netlify) y estudio de sincronización remota futura.
