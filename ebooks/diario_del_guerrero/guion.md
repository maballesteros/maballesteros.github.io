# GUÍA MAESTRA DE GENERACIÓN: DIARIO DEL GUERRERO

Esta guía contiene todas las instrucciones, plantillas y restricciones necesarias para generar el contenido completo del "Diario del Guerrero".
**Objetivo:** Crear un EPUB de 365 días + 12 introducciones mensuales que sirva como manual de entrenamiento interior para artistas marciales y líderes.

---

## 1. Definición del Proyecto

**Concepto:** Un diario de entrenamiento mental y filosófico. Cada día destila un principio atemporal, lo conecta con un referente histórico y lo traduce en acción.
**Promesa:** Claridad mental + Temple táctico + Hábitos mínimos accionables.
**Tono:**
*   **Directo y Marcial:** Sin retórica vacía, sin "fluff". Frases cortas y contundentes.
*   **Riguroso:** Las historias históricas deben ser precisas.
*   **Atemporal:** Evitar referencias a años concretos (2025) o días de la semana (Lunes/Martes). Usar fechas estándar en el título (ej. `01 Enero`).
*   **Estructura Semanal:** 6 días de Acción + 1 día de Silencio (Void). La última semana del mes se extiende hasta el final y el Silencio cierra el mes.

---

## 2. El Camino Anual (Los 12 Pilares)

El diario recorre 12 competencias fundamentales del guerrero, una por mes.

*   **Mes 01: Disciplina (El Cimiento).** La capacidad de actuar a pesar del estado de ánimo. Construcción de hábitos y rutinas.
*   **Mes 02: Autocontrol (La Fortaleza Interior).** Gestión de las emociones, la ira y el deseo. La ciudadela interior.
*   **Mes 03: Percepción (La Mirada Clara).** Ver la realidad tal como es, sin juicios ni sesgos. Objetividad radical.
*   **Mes 04: Acción (El Coraje).** La ejecución táctica. Superar la parálisis por análisis. Audacia y decisión.
*   **Mes 05: Resistencia (El Aguante).** Resiliencia física y mental. Soportar el dolor y la incomodidad. Antifragilidad.
*   **Mes 06: Estrategia (El Plan).** Pensamiento a largo plazo. Engaño, sorpresa y economía de fuerzas.
*   **Mes 07: Maestría (El Arte).** La búsqueda de la excelencia técnica. Aprendizaje profundo, repetición y *Shokunin*.
*   **Mes 08: Poder (El Liderazgo).** Influencia sobre otros. Responsabilidad extrema. Justicia y servicio.
*   **Mes 09: Entorno (La Adaptabilidad).** Fluir con las circunstancias (*Wu-wei*). Uso del terreno. Caos y orden.
*   **Mes 10: Ego (El Enemigo).** Humildad. Desapego de la fama y el reconocimiento. El servicio silencioso.
*   **Mes 11: Muerte (Memento Mori).** La consciencia de la finitud como motor de vida. Urgencia y legado.
*   **Mes 12: Integración (El Tao).** La unión de todos los principios. Balance, serenidad y sabiduría práctica.

---

## 3. Sistema de Archivos

Todo el contenido reside en `/ebooks/diario_del_guerrero/`.

### Estructura de Directorios
```
/ebooks/diario_del_guerrero/
  ├── build.json                 # Config del build (EPUB/PDF)
  ├── ebook_specs.md             # Estándares de calidad
  ├── guion.md                   # ESTE FICHERO (Guía Maestra)
  ├── mes_01_disciplina/         # Directorio del Mes 1
  │   ├── _indice_mes_01.md      # Guión del mes (no se incluye en el build)
  │   ├── 00_intro_mes_01.md     # Introducción del mes
  │   ├── 01_enero.md            # Contenido Día 1
  │   ├── ...
  │   └── 31_enero.md            # Contenido Día 31
  ├── mes_02_autocontrol/        # Directorio del Mes 2
  │   └── ...
  ├── images/                    # Assets (cover.png, ilustraciones)
  └── ... (hasta mes 12)
```

---

## 4. Flujo de Trabajo (Workflow)

Para generar un nuevo mes, sigue estrictamente este orden:

1.  **Crear Directorio:** `mkdir mes_XX_nombre`.
2.  **Generar Índice:** Crea `_indice_mes_XX.md` definiendo los temas y personajes para cada día del mes.
    *   *Restricción:* Asegura variedad total. No repetir personajes del mes anterior si es posible. Mezclar épocas (Antigüedad, Samurai, S.XX, Contemporáneo).
3.  **Generar Introducción:** Crea `00_intro_mes_XX.md` (1000+ palabras) sobre el foco del mes.
4.  **Generar Contenido Diario:** Crea un fichero `.md` por cada día del mes (`01_mes.md` a `31_mes.md`) siguiendo las plantillas.
5.  **Actualizar Build:** Asegura que el mes está listado en `build.json` dentro de `parts`.
6.  **Compilar (Sistema Estándar):** Ejecuta los scripts genéricos desde la raíz del repo.

---

## 5. Plantillas de Contenido

### A. Plantilla del Índice (`_indice_mes_XX.md`)
Debe planificar el mes completo.
```markdown
# Mes XX: [Nombre del Foco]

**Foco del Mes:** [Descripción breve]

## Semana 1: [Foco Semanal]
- **01 Mes:** [Título del Día].
    - *Fuente:* [Tradición/Disciplina].
    - *Personaje:* [Nombre].
    - *Chispa:* [Idea central].
...
```

### B. Plantilla de Introducción (`intro_mes_XX.md`)
**Extensión:** 1000+ palabras.
**Estructura:**
1.  Título: `Enero: Disciplina (El Cimiento)` (Sin "Introducción" en el título).
2.  Cita de apertura potente.
3.  Desarrollo del concepto: Por qué es vital para el guerrero.
4.  Desglose de las 4 semanas/dimensiones del mes.
5.  Llamada a la acción final.

### C. Plantilla Día de Acción (Días 1-6 del ciclo)
**Extensión:** 800-1000 palabras (Gold Premium). La historia debe ser inmersiva y detallada.
```markdown
# [DD] [Mes]: [Título del Día]

> *"[Cita célebre corta y potente]"*
> — **[Autor]**, *[Obra/Contexto]*

**Fuente/Tradición:** [Ej: Estoicismo / Estrategia Militar / Psicología / Sun Tzu / Taoísmo / Filosofía Moderna]

**La Historia: [Título de la Historia]**

[Cuerpo de la historia. NO RESUMIR. Narrar con detalle cinematográfico.
- Contexto sensorial: ¿Qué se ve, se huele, se siente?
- Tensión dramática: ¿Qué está en juego?
- Desarrollo: No cuentes solo el final, cuenta la lucha.
- Diálogo interno: ¿Qué piensa el protagonista?
- Extensión mínima de la historia: 600-800 palabras.]

**La Lección:**

[Explicación táctica. Conecta la historia con el problema moderno.
- Profundiza en el "por qué".
- Desmonta excusas comunes.
- Usa un tono de autoridad pero empático.]

**Reflexión Final:**

1.  **[Pregunta 1]:** [Pregunta de introspección directa].
2.  **[Pregunta 2]:** [Pregunta sobre el entorno/obstáculos].
3.  **La Práctica de Hoy:** [Una sola acción concreta, micro, realizable en el día].
```

### D. Control de Calidad (Heurística)
Para asegurar la homogeneidad y la calidad "Premium" en todo el diario, usa la siguiente referencia rápida:
*   **Tamaño del fichero:** Un día de acción bien desarrollado debe ocupar **aprox. 800-1000 palabras**.
*   **Señal de Alerta:** Si un fichero generado pesa menos de **4KB**, es probable que la historia sea demasiado superficial o resumida. **Revisar y expandir.**
*   **Profundidad:** Compara siempre con los primeros días de Enero (`01_enero.md`, `02_enero.md`) como "Gold Standard".



### E. Plantilla Día de Silencio (Día 7 del ciclo)
**Extensión:** 400-500 palabras.
```markdown
# [DD] [Mes]: Silencio ([Coletilla])

> *"[Cita sobre silencio/vacío/naturaleza]"*

Día del Vacío Fértil.

[Breve justificación de por qué parar es estratégico, conectando con el foco de los 6 días previos (sin “resumen semanal”)].

**La Práctica de Hoy:**

[Una práctica principal narrada (10–40 min), integrada en prosa: describe el gesto, el contexto, y el “por qué” sin convertirlo en checklist].

[Cierre breve: una o dos frases para orientar el día siguiente, sin listas ni preguntas tipo examen].
```

---

## 6. Restricciones y Reglas de Calidad

1.  **Variedad de Fuentes:**
    *   No usar a Miyamoto Musashi más de 1 vez por mes.
    *   No usar a Marco Aurelio/Séneca más de 2 veces por mes.
    *   **Obligatorio:** Incluir fuentes modernas (David Goggins, Jocko Willink, Atletas Olímpicos) y fuentes no marciales (Artistas, Científicos, Exploradores) para demostrar la universalidad de los principios.

2.  **Cero Dogma:**
    *   No predicar. No decir "debes hacer esto". Decir "el guerrero hace esto" o "la estrategia dicta esto".
    *   Basarse en principios, no en moralina.

3.  **Formato EPUB:**
    *   Los títulos de los ficheros `.md` (`# Título`) se convierten en entradas de la Tabla de Contenidos (TOC).
    *   **IMPORTANTE:** El build estándar elimina automáticamente la primera línea del contenido (el título) para evitar duplicados en el lector. **Mantén el título en la primera línea del MD**, el build se encarga del resto.

4.  **Resúmenes Semanales e Infografías (Legacy):**
    *   No forman parte del producto final. Si existen en el repo, no deben incluirse en el EPUB/PDF y se consideran contenido a limpiar.

---

## 7. Instrucciones de Compilación

Para generar el EPUB final:

1.  Asegúrate de tener Node instalado.
2.  Generar EPUB: `node ebooks/scripts/build_epub.js ebooks/diario_del_guerrero`
3.  (Opcional) Generar PDF: `node ebooks/scripts/build_pdf.js ebooks/diario_del_guerrero`
4.  Los ficheros se generan dentro de `ebooks/diario_del_guerrero/` según `build.json` (`epubFilename` / `pdfFilename`).
