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
*   **Atemporal:** Evitar referencias a años concretos o días de la semana (Lunes/Martes). Usar "Día 1", "Día 2", etc.
*   **Estructura Cíclica:** 5 días de Acción + 1 día de Revisión + 1 día de Silencio.

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
  ├── diario_estructura.md       # ESTE FICHERO (Guía Maestra)
  ├── build/                     # Scripts de generación
  │   └── build.js               # Script Node.js para montar el EPUB
  ├── mes_01_disciplina/         # Directorio del Mes 1
  │   ├── indice_mes_01.md       # Guión del mes
  │   ├── intro_mes_01.md        # Introducción del mes
  │   ├── 01_enero.md            # Contenido Día 1
  │   ├── ...
  │   └── 31_enero.md            # Contenido Día 31
  ├── mes_02_serenidad/          # Directorio del Mes 2
  │   └── ...
  └── ... (hasta mes 12)
```

---

## 4. Flujo de Trabajo (Workflow)

Para generar un nuevo mes, sigue estrictamente este orden:

1.  **Crear Directorio:** `mkdir mes_XX_nombre`.
2.  **Generar Índice (Script):** Crea `indice_mes_XX.md` definiendo los temas y personajes para cada día del mes.
    *   *Restricción:* Asegura variedad total. No repetir personajes del mes anterior si es posible. Mezclar épocas (Antigüedad, Samurai, S.XX, Contemporáneo).
3.  **Generar Introducción:** Crea `intro_mes_XX.md` (~1000 palabras) sobre el foco del mes.
4.  **Generar Contenido Diario:** Crea un fichero `.md` por cada día del mes (`01_mes.md` a `31_mes.md`) siguiendo las plantillas.
5.  **Actualizar Build:** Añade los nuevos ficheros al array `days` en `build/build.js`.
6.  **Compilar:** Ejecuta `node build.js` en el directorio `build/`.

---

## 5. Plantillas de Contenido

### A. Plantilla del Índice (`indice_mes_XX.md`)
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
**Extensión:** ~800-1000 palabras.
**Estructura:**
1.  Título: `Enero: Disciplina (El Cimiento)` (Sin "Introducción" en el título).
2.  Cita de apertura potente.
3.  Desarrollo del concepto: Por qué es vital para el guerrero.
4.  Desglose de las 4 semanas/dimensiones del mes.
5.  Llamada a la acción final.

### C. Plantilla Día de Acción (Días 1-5 del ciclo)
**Extensión:** 800-1000 palabras. (IMPORTANTE: Calidad Premium. La historia debe ser inmersiva y detallada).
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
*   **Tamaño del fichero:** Un día de acción bien desarrollado debe ocupar **entre 5KB y 6KB** (aprox. 800-1000 palabras).
*   **Señal de Alerta:** Si un fichero generado pesa menos de **4KB**, es probable que la historia sea demasiado superficial o resumida. **Revisar y expandir.**
*   **Profundidad:** Compara siempre con los primeros días de Enero (`01_enero.md`, `02_enero.md`) como "Gold Standard".

### D. Plantilla Día de Revisión (Día 6 del ciclo)
**Extensión:** 300-500 palabras.
```markdown
# [DD] [Mes]: Revisión Táctica (Semana X)

> *"[Cita sobre análisis/mejora/honestidad]"*

Día de revisión.

[Breve resumen de los temas de la semana].

**1. El Análisis**
[Pregunta provocadora sobre el desempeño de la semana].

**2. La Auditoría**
[Checklist o pregunta binaria sobre el cumplimiento de las prácticas].

**3. Ajuste de Rumbo**
[Espacio para definir una corrección inmediata].

**La Misión para la Semana [X+1]:**
[Teaser de lo que viene].
```

### E. Plantilla Día de Silencio (Día 7 del ciclo)
**Extensión:** 200-300 palabras.
```markdown
# [DD] [Mes]: Silencio

> *"[Cita sobre silencio/vacío/naturaleza]"*

Día del Vacío Fértil.

[Breve justificación de por qué parar es estratégico].

**La Práctica de Hoy:**

[Instrucción simple de desconexión. Ej: Caminar sin móvil, mirar una pared, ayuno de dopamina].
```

### F. Plantilla Resumen Semanal e Infografía (`DD_resumen_semana_X.md`)
**Nombre del fichero:** Debe usar el **mismo número de día** que el último día de la semana para que se ordene justo después (ej: `07_resumen.md` va después de `07_enero.md`).

**Contenido del Markdown:**
1.  **Encabezado:** `# Resumen Semana X: [Título Temático]`
2.  **Imagen:** `![Infografía Semana X](../images/resumen_semana_XX.png)`
3.  **Cita Central:** La misma que aparece en la infografía.
4.  **Los 7 Pilares (Desglose):** Breve explicación de cada día, alineada con los niveles de la infografía.
5.  **Arco Narrativo:** Un párrafo final que explique la transición de la semana (de dónde venimos y a dónde vamos).

**Especificaciones de la Infografía (Prompt Visual):**
*   **Estrategia de Generación:** Debido a la longitud y detalle requeridos, **SIEMPRE** se debe generar un fichero de texto con el prompt completo antes de llamar al script.
*   **Ubicación de Prompts:** `ebooks/diario_del_guerrero/prompts/prompt_mes_XX_semana_X.txt`. **NO BORRAR** estos ficheros; sirven de referencia y documentación.
*   **Estilo Visual:** "Sumi-e Fantástico". Estética oriental y marcial, tinta negra con acentos de color vibrante (estilo acuarela/tinta). Alto contraste, dinámico, místico.
*   **Formato:** Vertical (Portrait, 9:16).
*   **Paleta:** Fondo claro/luna/papel arroz, tinta negra fuerte, acentos vibrantes (rojo sangre, azul eléctrico, dorado, violeta) según el tema.
*   **Tipografía (en la imagen):** Títulos en caligrafía vertical. **IMPORTANTE:** Incluir bloques de texto breve (1-2 frases) en letra más pequeña y legible (tipo manuscrito o máquina de escribir antigua) acompañando a cada elemento visual para explicar el concepto.
*   **Estructura Visual:**
    1.  **Composición Vertical:** Elementos apilados o fluyendo de abajo a arriba.
    2.  **Metáfora Central:** Una escena única integrada.
    3.  **Texto Integrado:** El texto explicativo debe flotar en el espacio negativo o estar inscrito en pergaminos/piedras dentro de la escena.
*   **Referencia:** Ver **Anexo A** al final de este documento para un ejemplo actualizado.

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
    *   **IMPORTANTE:** El script de build (`build.js`) elimina automáticamente la primera línea del contenido (el título) para evitar duplicados en el lector. **Mantén el título en la primera línea del MD**, el script se encarga del resto.

---

## 7. Instrucciones de Compilación

Para generar el EPUB final:

1.  Asegúrate de tener node instalado.
2.  Ve al directorio de build: `cd ebooks/diario_del_guerrero/build`.
3.  Instala dependencias (solo la primera vez): `npm install`.
4.  Ejecuta el script: `node build.js`.
5.  El fichero se generará en: `ebooks/diario_del_guerrero/draft_mes_XX.epub`.

---

## Anexo A: Ejemplo de Prompt Detallado para Infografía

Este es el estándar de calidad y detalle esperado para la generación de los prompts de las infografías semanales.

### Título de la Infografía: CRÓNICAS DEL GUERRERO: LA SEMANA DE CIMENTACIÓN

**Estilo Visual General:**
Estilo artístico oriental y marcial, fusionando la técnica tradicional Sumi-e (tinta negra) con elementos de fantasía moderna y colores vibrantes (acuarela/digital). La composición es VERTICAL (9:16). La atmósfera es mística, dinámica y poderosa. Fondo sugerido de papel de arroz o luz de luna. Trazos de tinta negra fuertes y expresivos que se disuelven en partículas o humo.

### Estructura y Secciones de la Infografía

#### 1. La Escena Central (Metáfora Integrada)
En lugar de niveles rígidos, una escena vertical fluida.

*   **Fondo:** Un cielo nocturno con una luna gigante pálida o un sol rojo naciente, textura de papel antiguo.
*   **Figura Central:** Un guerrero samurai o monje en una postura de poder/meditación, o una estructura simbólica (templo, montaña) emergiendo de la niebla.
*   **Elementos Integrados (Los 7 Pilares):** Los conceptos de la semana se integran como objetos o espíritus alrededor de la figura central.
    *   *Barco en llamas:* En la base, tinta negra y fuego rojo.
    *   *Cama/Orden:* Líneas geométricas limpias cerca de la base.
    *   *Engranaje:* Un mandala mecánico sutil en el fondo.
    *   *Plomada/Auditoría:* Una línea vertical dorada perfecta que cruza la imagen.
    *   *Casco/Silencio:* El foco de la cabeza de la figura, en blanco negativo.
    *   *Hielo/Incomodidad:* Cristales azules rompiéndose alrededor de los puños.
    *   *Muro/Persistencia:* Una barrera de tinta negra que la figura está atravesando.

#### 2. Texto y Tipografía (Integrado)
**CRÍTICO:** La imagen **DEBE** incluir bloques de texto breve y legible integrados en el diseño.
*   **Título Principal:** Caligrafía vertical (Kanji o Pincel).
*   **Textos Explicativos:** Bloques de 1-2 frases cortas acompañando a cada elemento visual clave.
    *   *Ejemplo:* Junto al barco en llamas -> "EL COMPROMISO: Quemar las naves para no tener retirada."
*   **Estilo:** Letra tipo manuscrito antiguo, grabado o máquina de escribir, flotando en el espacio negativo o sobre pergaminos.
