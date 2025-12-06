# Guía de estilo visual – Sport Planner

Esta guía destila el lenguaje visual de la app para poder replicarlo en otros proyectos (por ejemplo, en una web de marketing, otra herramienta interna, etc.).

---

## 1. Fundamentos globales

- **Paleta general y ambiente**
  - Fondo principal: `bg-slate-950` con degradados radiales superpuestos:
    - `radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.08), transparent 45%)`
    - `radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.12), transparent 50%)`
    - `radial-gradient(circle at 10% 90%, rgba(34, 197, 94, 0.1), transparent 55%)`
  - Esquema de color: `color-scheme: dark;`
  - Texto base: `text-slate-100` sobre fondo casi negro.

- **Tipografía**
  - Importadas desde Google Fonts:
    - Títulos / display: `"Poppins"` (600–700).
    - Texto base: `"Inter"` (400–700).
  - Mapeo Tailwind:
    - `fontFamily.display = ["Poppins", ...sans]`
    - `fontFamily.sans = ["Inter", ...sans]`
  - Uso:
    - Body: `font-sans`.
    - Encabezados `h1–h4`: `font-display`.

- **Sombras y profundidad**
  - Sombra de “glow” principal (`boxShadow.glow` en Tailwind):
    - `0 0 20px rgba(59, 130, 246, 0.35)` (halo azul suave).
  - Sombras frecuentes:
    - Tarjetas y chips: `shadow shadow-black/20` o `shadow-black/30`.
    - Destacados: `shadow-sky-500/10`, `shadow-sky-500/20`, `shadow-emerald-500/15`, `shadow-rose-500/10`.

---

## 2. Contenedores y paneles

- **Panel principal “glass” (`.glass-panel`)**
  - Bordes y radio:
    - `border-radius: 1.5rem` (`rounded-3xl`).
    - `border: 1px solid rgba(255,255,255,0.05)` (`border-white/5`).
  - Fondo:
    - `background: rgba(255,255,255,0.05)` (`bg-white/5`).
  - Desenfoque:
    - `backdrop-filter: blur(24px)` aproximado (`backdrop-blur-xl`).
  - Sombra:
    - `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8), 0 0 20px rgba(56,189,248,0.1)` equivalente a:
      - `shadow-xl shadow-sky-500/10`.
  - Uso:
    - Bloques principales de contenido en todas las vistas (`HomeView`, `PlannerView`, `ObjectivesView`, etc.).

- **Tarjetas internas sobre glass**
  - Fondo secundario:
    - `bg-white/5` o `bg-slate-950/60–80` según jerarquía.
  - Borde:
    - `border-white/10` o `border-white/15` (más claro que el panel padre).
  - Radio:
    - Generalmente `rounded-2xl` (`border-radius: 1rem–1.25rem`).

- **Layout general**
  - Contenedor:
    - `max-width: 72rem` (`max-w-6xl`) centrado.
    - `padding-x` principal: `0.75rem` en móvil (`px-3`), `1.5rem` en escritorio (`sm:px-6`).
    - `padding-y` principal: `1.25rem`–`2.5rem` (`py-5`, `sm:py-10`).
  - Altura mínima:
    - `min-height: 100vh` en `body`.
    - `min-h-screen` en layouts con pantalla completa.

- **Cabecera fija (`AppHeader`)**
  - Contenedor del header:
    - `position: sticky; top: 0; z-index: 50`.
    - Fondo: `bg-slate-950/80`.
    - Borde inferior: `border-b border-white/10`.
    - Desenfoque: `backdrop-blur-xl`.
  - Logo redondo:
    - Tamaño: `h-9 w-9` (móvil), `h-10 w-10` (desktop).
    - `border-radius: 9999px`.
    - Fondo: `bg-gradient-to-br from-sky-500 to-indigo-500`.
    - Texto: `text-base`–`text-lg`, `font-bold`, `color: #fff`.

---

## 3. Colores y estados

- **Grises y neutros**
  - Fondo principal: `#020617` (`bg-slate-950`).
  - Panel oscuro: `bg-slate-900/80–95`.
  - Texto:
    - Primario: `#f9fafb` (`text-slate-100`).
    - Secundario: `text-white/80` (~`rgba(255,255,255,0.8)`).
    - Terciario: `text-white/60` (~`rgba(255,255,255,0.6)`).
    - Cuaternario / etiquetas: `text-white/40` (~`rgba(255,255,255,0.4)`).

- **Azules / cian (sky/indigo)**
  - Principal:
    - `sky-500` ≈ `#0EA5E9`.
    - `indigo-500` ≈ `#6366F1`.
  - Usos:
    - Botón primario (gradiente).
    - Sombras de enfoque (`shadow-sky-400/30`).
    - Bordes activos (`border-sky-400/60`, `ring-sky-400/70`).
    - Acentos de texto (`text-sky-300` para microenlaces).

- **Verdes (éxito / presente)**
  - Tonos usados:
    - `emerald-500` (`#10B981`), `emerald-400`, `emerald-200`.
  - Ejemplos:
    - Badges asistencia prevista: fondo `bg-emerald-500/10`, borde `border-emerald-500/40`, texto `text-emerald-100`.
    - Toggles “Presente”: `border-emerald-500/60`, `bg-emerald-500/15–20`, `shadow-emerald-500/20–25`.

- **Rosas / rojos (error / ausente / destructivo)**
  - Tonos utilizados:
    - `rose-500`, `rose-400`, `rose-200`, `red-500`.
  - Ejemplos:
    - Badges de error: `border-rose-500/40`, `bg-rose-500/10`, `text-rose-200`.
    - Botones de eliminar: borde `border-rose-500/40`, texto `text-rose-300`, hover `border-rose-400`, `text-rose-200`.

- **Paleta de objetivos (`ObjectivesView`)**
  - Colores pasteles para categorías, como strings hex en `PASTEL_PALETTE`:
    - Naranjas/rosas/rojos:
      - `#F97316`, `#FB7185`, `#F43F5E`, `#EC4899`, `#EA580C`, `#C2410C`, `#E11D48`, `#EF4444`, `#F87171`, `#FB923C`, `#F472B6`.
    - Violetas/morados:
      - `#D946EF`, `#A855F7`, `#8B5CF6`, `#6366F1`, `#4F46E5`, `#7C3AED`.
    - Azules / cian / teal:
      - `#3B82F6`, `#38BDF8`, `#0EA5E9`, `#06B6D4`, `#14B8A6`, `#0D9488`.
    - Verdes / lima / amarillos:
      - `#10B981`, `#22C55E`, `#65A30D`, `#84CC16`, `#A3E635`, `#FACC15`, `#FBBF24`, `#F59E0B`, `#FDE047`.
  - Estos colores se usan:
    - Como fondo de chips (`ObjectiveChip`) y halos de paneles relacionados.
    - Como indicadores en el calendario (`PlannerView`), pequeñas barras de color.

---

## 4. Botones y controles principales

- **Botón primario (`.btn-primary`)**
  - Geometría:
    - `display: inline-flex`, `align-items: center`, `justify-content: center`.
    - `gap: 0.5rem` (`gap-2`).
    - `border-radius: 9999px` (`rounded-full`).
  - Fondo:
    - Gradiente horizontal: `bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500`.
  - Tipografía:
    - `font-size: 0.875rem` (`text-sm`).
    - `font-weight: 600` (`font-semibold`).
    - Color: `#fff`.
  - Espaciado:
    - `padding-left/right: 1rem` (`px-4`).
    - `padding-top/bottom: 0.5rem` (`py-2`).
  - Interacciones:
    - `transition: all`.
    - Hover: `hover:shadow-glow`, `hover:scale-[1.01]` (ligeramente más grande).

- **Botón secundario (`.btn-secondary`)**
  - Geometría:
    - Igual base (`inline-flex`, `items-center`, `justify-center`, `gap-2`, `rounded-full`).
  - Borde:
    - `border: 1px solid rgba(255,255,255,0.1)` (`border-white/10`).
    - Hover: `border-white/20`.
  - Fondo:
    - `background: rgba(255,255,255,0.02–0.05)` (`bg-white/5` o sin fondo).
  - Texto:
    - `text-sm`, `font-semibold`, color `text-white/80`; hover `text-white`.

- **Botones “píldora” contextuales**
  - Badges de estado / filtros:
    - `rounded-full`, borde fino (`border-white/15–20`), `px-2–3`, `py-0.5–1`.
    - Usados para:
      - Estado de visibilidad (`Private/Shared/Public`).
      - Contadores (`+N`, “sesión”, etc.).

- **Toggles de asistencia (HomeView)**
  - Contenedor base:
    - `inline-flex`, `rounded-full`, `border`, `px-3`, `py-1.5`, `text-xs`–`text-sm`.
    - Presente:
      - `border-emerald-500/60`, `bg-emerald-500/15`, `text-emerald-100`, `shadow-sm shadow-emerald-500/20`.
    - Ausente:
      - `border-white/15`, `bg-white/5`, `text-white/60`, hover `border-white/40`, `text-white`.
  - Indicador circular interno:
    - Tamaño: `h-6 w-6` (móvil), `h-7 w-7` (desktop).
    - Presente:
      - `border-emerald-400`, `bg-emerald-400/20`, `text-emerald-100`, `shadow-emerald-500/25`.
    - Ausente:
      - `border-white/25`, `text-white/40`, hover `border-white/50`, `text-white/80`.

---

## 5. Formularios

- **Campo base (`.input-field`)**
  - Ancho: `width: 100%` (`w-full`) por defecto.
  - Geometría:
    - `border-radius: 1rem` aprox. (`rounded-2xl`).
    - `border: 1px solid rgba(255,255,255,0.1)` (`border-white/10`).
    - Fondo: `background: rgba(255,255,255,0.05)` (`bg-white/5`).
  - Tipografía:
    - `font-size: 0.875rem` (`text-sm`).
    - Texto: `color: #fff`.
    - Placeholder: `color: rgba(255,255,255,0.4)` (`placeholder:text-white/40`).
  - Espaciado:
    - `padding-left/right: 1rem` (`px-4`).
    - `padding-top/bottom: 0.5rem` (`py-2`).
  - Estado de foco:
    - Borde: `focus:border-sky-400`.
    - Anillo: `focus:ring-2 focus:ring-sky-500/30`.
    - `outline: none`.

- **Textareas**
  - Mismos estilos de `.input-field` con:
    - Altura mínima: `min-height: 100–140px` (`min-h-[100px]`, `min-h-[120px]`, `min-h-[140px]` según contexto).

- **Labels**
  - Estilo consistente:
    - `font-size: 0.75rem` (`text-xs`).
    - `font-weight: 600` para algunos (`font-semibold`).
    - `text-transform: uppercase`.
    - `letter-spacing` amplio: `tracking-wide` o `tracking-[0.3em]`.
    - Color: `text-white/40`–`50`.

- **Checkboxes y radios**
  - Check de trabajos completados:
    - `h-5 w-5`, `rounded-full`, `border-2 border-white/30`, `bg-transparent`, `text-sky-400`.
  - Checkbox de “asistente activo”:
    - `h-5 w-5`, `rounded`, `border-white/20`, `bg-white/10`, `text-sky-400`.

- **Mensajes de feedback en formularios**
  - Error:
    - Borde: `border-red-500/30` o `border-rose-500/40`.
    - Fondo: `bg-red-500/10` o `bg-rose-500/10`.
    - Texto: `text-red-200` / `text-rose-200`.
    - Radio: `rounded-xl`–`rounded-2xl`.
    - Padding: `px-4 py-3`, `font-size: 0.875rem`.
  - Éxito:
    - Borde: `border-emerald-500/30–40`.
    - Fondo: `bg-emerald-500/10`.
    - Texto: `text-emerald-200`.

---

## 6. Componentes clave

- **Chips de objetivo (`ObjectiveChip`)**
  - Fondo:
    - `background-color: objective.colorHex` (hex dinámico).
  - Geometría:
    - `display: inline-flex`, `align-items: center`, `gap: 0.5rem`.
    - `border-radius: 9999px`.
    - Sombra: `shadow shadow-black/30`.
  - Texto:
    - Color: `text-slate-950`.
    - Peso: `font-medium`.
    - Tamaño:
      - `size="md"`: `text-sm`, `px-3`, `py-1.5`.
      - `size="sm"`: `text-xs`, `px-2`, `py-1`.
  - Punto interno:
    - `h-2.5 w-2.5`, `rounded-full`.
    - Borde: `border-black/20`.
    - Fondo: `bg-white/70`.

- **Tarjetas de trabajo / sesión**
  - Patrones comunes:
    - Panel base: `rounded-3xl`, `border-white/10`, `bg-white/5`, `shadow-black/20–30`.
    - Halo de objetivo (cuando hay color):
      - Div absolutamente posicionado `inset-0`, `rounded-3xl`, `opacity: 0.2–0.3`, `blur-xl–3xl`, `backgroundColor: objective.colorHex`.
  - Información tipográfica:
    - Título: `text-lg`–`text-xl`, `font-semibold`, color `text-white`.
    - Subtítulo: `text-sm`, `text-white/70`.
    - Metadatos: `text-xs`, `uppercase`, `tracking-[0.3em]`, `text-white/40`.

- **Calendario mensual (Planner)**
  - Celda de día:
    - `h-20`, `rounded-2xl`, `border`, `p-2`, `text-sm`.
    - Fondo normal: `border-white/10`, `bg-white/5`, `text-white/70`.
    - Día seleccionado:
      - `border-sky-400/60`, `bg-sky-500/20`, `text-white`, `shadow-lg shadow-sky-500/20`.
    - Día de hoy:
      - Badge de día: `h-8 w-8`, `rounded-full`, `bg-white`, `text-slate-900`.
  - Indicadores de sesiones:
    - Pequeñas barras:
      - Tamaño: `h-2 w-6`, `border-radius: 9999px`.
      - `backgroundColor: objective.colorHex` (o `rgba(255,255,255,0.4)` si sin objetivo).

- **Navegación principal**
  - Navegación desktop:
    - Elementos:
      - `rounded-full`, `px-4`, `py-2`, `text-sm`, `font-medium`.
      - Activo:
        - Fondo `bg-white`, texto `text-slate-900`, sombra `shadow-lg shadow-sky-400/30`.
      - Inactivo:
        - Texto `text-white/70`, hover `text-white`, `bg-white/10`.
  - Navegación móvil (panel lateral):
    - Panel:
      - `fixed inset-y-4 right-3`, `w ~ 17rem`.
      - `rounded-3xl`, `border-white/10`, `bg-slate-900/95`, `p-6`, `shadow-2xl`.
    - Items:
      - `rounded-2xl`, `px-4`, `py-3`, `text-sm`, `font-semibold`.
      - Activo:
        - Fondo `bg-white`, texto `text-slate-900`, sombra `shadow-sky-400/40`.
      - Inactivo:
        - Texto `text-white/80`, hover `bg-white/10`.

---

## 7. Estados especiales y pantallas completas

- **Pantalla de carga (`LoadingScreen`)**
  - Fondo:
    - `flex min-h-screen items-center justify-center bg-slate-950`.
  - Spinner:
    - `h-12 w-12`, `rounded-full`, `border-2`.
    - `border: 2px solid rgba(255,255,255,0.2)` global.
    - `border-top-color: #38BDF8` (`border-t-sky-400`).
    - `animation: spin` (rotación continua).
  - Texto:
    - `text-sm font-medium text-white/60`.

- **Pantalla de login**
  - Fondo:
    - Igual que la app: `bg-slate-950`, `min-h-screen`.
  - Card central:
    - `max-w-md`, `w-full`, `rounded-3xl`.
    - `border-white/10`, `bg-slate-900/80`.
    - `p-8`, `shadow-2xl`, `backdrop-blur`.
  - Logo:
    - `h-14 w-14`, `rounded-full`, `bg-gradient-to-br from-sky-500 to-indigo-500`.
    - Texto `text-xl`, `font-bold`, blanco.

---

## 8. Microdetalles de interacción

- **Transiciones**
  - Prácticamente todos los botones y elementos interactivos tienen:
    - `transition` sobre color, fondo, borde y sombra.
  - Pequeñas escalas en hover:
    - Botones primarios: `hover:scale-[1.01]`.
    - Chips de colores: `hover:scale-105` en la cuadrícula de paleta.

- **Etiquetas y microtexto**
  - Estilo común para secciones:
    - `text-xs`, `uppercase`.
    - `tracking-[0.3em]` para títulos de bloque (“TRABAJOS”, “SESIONES DEL MES”).
    - Color `text-white/40`.

- **Modal de navegación móvil**
  - Capa de fondo:
    - `fixed inset-0`, fondo `bg-black/60`, `backdrop-blur-sm`.
  - Panel:
    - Ver sección de navegación; se percibe como una tarjeta “flotante” con mucho blur y sombra.

---

## 9. Recomendaciones para replicar el estilo

- Mantén:
  - Fondo muy oscuro (`#020617`) con degradados radiales en cian, violeta y verde muy suaves (opacidades 0.08–0.12).
  - Tipografía Inter + Poppins con jerarquía clara (display vs body).
  - Uso intensivo de chips y paneles “glass” con bordes tenues y blur fuerte.
  - Paleta de objetivos como sistema de color principal: cada categoría con un hex pastel; reutiliza esos mismos valores para halos, bordes e indicadores.

- Al trasladar a otra app / web:
  - Reutiliza los estilos clave:
    - Contenedor principal tipo `.glass-panel`.
    - Botones `.btn-primary` y `.btn-secondary` con las mismas proporciones (altura 36–40px, radios full).
    - Campos `.input-field` con radios grandes, fondo translúcido y foco azul cian.
  - Respeta las jerarquías de opacidad:
    - Texto principal ≥ 80% de blanco.
    - Texto secundario 60%.
    - Bordes y líneas 5–15%.
    - Sombras con ligeros matices de azul/verdes para reforzar el “tema deportivo/energético”.

