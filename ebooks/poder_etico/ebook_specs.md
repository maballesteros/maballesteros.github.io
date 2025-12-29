# Especificaciones Editoriales y Pedagógicas (v3.0)

Este documento define el estándar de calidad para todas las entradas de *Poder Ético*.

## 1. Estructura de Capitular (Obligatoria)

### 1.1 Título y Objetivo
*   **Título**: `1.1 Habilidad + Beneficio` (≤70 caracteres).
*   **Objetivo**: En una caja `aside` o `blockquote` diferenciada.
    *   Formato: `> **Objetivo de aprendizaje**: [Qué logrará el lector hoy].`

### 1.2 Relato Inicial (300–400 palabras)
*   **Función**: Escenificar el conflicto y la solución como una **narrativa fluida y literaria**.
*   **Formato**: Prosa continua. **PROHIBIDO usar listas, bullets o esquemas numéricos** dentro del relato. Debe leerse como una novela, no como un manual.
*   **Marcas Técnicas**: Las palabras clave del diálogo que denotan la técnica usada deben ir en **negrita y entre corchetes**.
    *   *Ejemplo*: `—**[Contexto:]** veo que hay dudas. **[Propuesta:]** revisemos el plan.`

### 1.3 Especificaciones de Ilustración (Estricto - Protocolo de Fidelidad)
*   **Ubicación**: Inmediatamente **después** del apartado "Relato".
*   **Estilo Visual**: Manga Moderno / Seinen (Blanco y negro, tinta, alto contraste). Estilo serio y detallado.
*   **Formato de Panel**: Composición de página completa (Manga Page Layout).
    *   **Flexibilidad**: Entre **4 y 8 viñetas** por imagen.
    *   **Ritmo Visual**: Se deben usar viñetas grandes para momentos clave (clímax/revelación) y viñetas pequeñas para detalles o diálogos rápidos.
    *   **Disposición**: No forzar filas horizontales idénticas. Usar cortes verticales, superposiciones o viñetas a página completa si la narrativa lo pide.
*   **Densidad de Texto (Crítico)**:
    *   **Prioridad**: El texto es tan importante como el dibujo. Las imágenes deben leerse como un cómic real.
    *   **Bocadillos Grandes**: Los "speech bubbles" deben ser grandes, blancos y legibles, ocupando espacio significativo (hasta el 30% de la viñeta si es necesario).
    *   **Diálogo Verbatim**: Usar las frases exactas del relato. Si son largas, dividirlas en varios bocadillos conectados.
*   **Protocolo de Fidelidad Narrativa**:
    *   **Cero Alucinaciones**: La imagen no puede inventar elementos no descritos (si es una cocina, es una cocina, no una nave espacial).
    *   **Traducción de Matices**: Si el texto dice "sonrisa de aprobación", el prompt debe especificar "small, subtle upward curve of lips, eyes crinkling warmly".
    *   **Texto Literal**: Los bocadillos deben contener el diálogo *exacto* del relato, resumido si es necesario, pero manteniendo las palabras clave (las marcas técnicas).
*   **Prompting**: El prompt debe ser un guion técnico detallado de cada viñeta.
    *   *Panel 1*: [Acción] + [Expresión Facial] + [Texto].
    *   *Panel 2*: ...

### 1.3.1 Protocolo Técnico de Generación (Scripting)
*   **Script**: Usar siempre `ebooks/scripts/generate_image.js`.
*   **Directorio de Ejecución**: Ejecutar desde `ebooks/scripts/` para cargar correctamente el `.env`.
*   **Modelo Obligatorio**: Usar `--model "gemini-3-pro-image-preview"` (o superior). **NO USAR** modelos antiguos como `gemini-pro-image`.
    *   *Comando Tipo*: `node generate_image.js --promptFile "../poder_etico/prompts/X_X.txt" --output "../poder_etico/images/X_X.png" --model "gemini-3-pro-image-preview"`

### 1.3.2 Protocolo de Portada (Cover Design)
*   **Estilo**: High Concept / Arte Conceptual Simbólico.
    *   **Diferencia**: NO usar estilo Manga (reservado para el interior). La portada debe parecer un *bestseller* de no-ficción moderno (estilo "48 Laws of Power" o "Atomic Habits" pero más artístico).
    *   **Vibe**: Serio, Premium, Misterioso pero Elegante.
*   **Paleta de Color**:
    *   **Dominantes**: Azul Marino Profundo (Autoridad), Negro (Misterio).
    *   **Acentos**: Dorado/Oro (Poder/Ética), Blanco (Claridad).
*   **Composición**:
    *   Format vertical (2:3).
    *   Espacio negativo para el título.
    *   Tipografía integrada (si el modelo lo permite) o espacio limpio para ponerla después.
*   **Concepto Visual**: Metafórico. (ej. Caos vs Orden, Piezas de ajedrez abstractas, Redes invisibles).



### 1.4 Explicación Profunda y Teoría (500–700 palabras)
*   **Estilo**: Narrativa expositiva rica y detallada. **Cero bullets**.
*   **Contenido**:
    *   Desarrollar la teoría detrás de la habilidad.
    *   Integrar las **ideas clave de TPM** de forma orgánica en la prosa.
    *   Explicar el *porqué* psicológico o social de lo que ocurre en el relato.
    *   No quedarse en la superficie; ir al fondo de la dinámica de poder.

### 1.4 Síntesis de Ideas Clave
*   **Función**: Resumen esquemático *post-explicación*.
*   **Formato**: Lista de bullets con referencias a TPM.
    *   *Ejemplo*: `* **Concepto**: Definición breve.`

### 1.5 Ejemplos Prácticos (Variantes de Contexto)
*   Desarrollar **3 casos de uso** obligatorios para asegurar la utilidad transversal:
    1.  **Entorno Profesional** (Oficina, clientes, jerarquía).
    2.  **Entorno Familiar / Educativo** (Padres-hijos, aula, hermanos).
    3.  **Entorno Social / Pares** (Amigos, pareja, adolescencia).
*   Formato para cada uno:
    1.  **[Técnica] en [Contexto]**
        *   *Situación*: Breve descripción.
        *   *Acción*: Qué hacer específicamente.
        *   *Frase*: `"La frase literal entre comillas"`.
        *   *Por qué funciona*: Breve justificación.

### 1.6 Señales de Progreso (Unificado con Rúbrica)
*   Listado de 3 indicadores observables de mejora.
*   Formato híbrido: **Pregunta de auto-chequeo** + **Explicación del beneficio**.
    *   *Formato*: `**1. [Nombre]**: ¿[Pregunta de autoevaluación]? Explicación de por qué esto indica mejora...`

### 1.7 Errores Habituales (Ampliado)
*   3-4 errores comunes detallados.
*   Para cada uno, incluir **varios ejemplos** de cómo se ve el error y la **alternativa** correcta.

### 1.9 Práctica Deliberada (Juegos Recomendados)
*   **Encabezado**: `## Práctica Deliberada`
*   **Propósito**: Conectar la teoría con la práctica. Indicar qué juego ayuda a entrenar esta habilidad específica.
*   **Formato**:
    *   `Ficha: [Nombre del Juego](url_relativa)`
    *   `Por qué ayuda`: Breve explicación de la conexión.

### 1.10 Referencias y Lecturas Relacionadas (Web TPM)
*   **Encabezado**: `## Referencias`
*   **Contenido**: 2-3 enlaces a artículos de *ThePowerMoves*.
*   **Formato**: Lista con el título del artículo enlazado (Markdown) + frase explicativa de su relevancia.
    *   *Ejemplo*: `* [Título del Artículo](url): Explica a fondo el concepto de...`

---

## 2. Plantilla de Capítulo (Para Copiar/Pegar)

```markdown
# 1.1 Título

> **Objetivo de aprendizaje**: [Texto del objetivo]

## Relato
[Texto del relato con marcas en negrita y corchetes]

## Explicación Profunda
[Narrativa extensa explicando la dinámica, integrando conceptos TPM, sin bullets]

## Síntesis de Ideas Clave
* **Concepto**: Definición.
* **Concepto**: Definición.

## Ejemplos Prácticos

### 1. [Técnica] en Entorno Profesional
* **Situación**: ...
* **Acción**: ...
* **Frase**: "..."
* **Por qué funciona**: ...

### 2. [Técnica] en Entorno Familiar (Niños/Casa)
* **Situación**: ...
* **Acción**: ...
* **Frase**: "..."

### 3. [Técnica] en Entorno Social (Amigos/Pareja)
...

## Señales de Progreso

1. **[Nombre Señal 1]**: ¿[Pregunta de control]? [Explicación del beneficio].
2. **[Nombre Señal 2]**: ...
3. **[Nombre Señal 3]**: ...

## Errores Habituales

* **[Error 1]**: Descripción.
  * *Se ve así*: "..." / "..."
  * *Alternativa*: "..."
* **[Error 2]**: ...

## Conclusiones
[Reflexión final ética y de cierre]

## Práctica Deliberada

* **Ficha**: [Link al Juego](../juegos/juego_XX.md).
* **Por qué ayuda**: [Explicación de qué mecánica entrena esta habilidad].

## Referencias

* [Título Artículo 1](URL): Por qué leerlo / qué añade.
* [Título Artículo 2](URL): Por qué leerlo / qué añade.
```

---

## 3. Estructura de Entradas de Juegos (Obligatoria)

### 3.1 Título y Objetivo
*   **Título**: `Juego X: [Nombre Creativo]`.
*   **Objetivo**: En una caja `aside` o `blockquote` diferenciada.
    *   Formato: `> **Objetivo**: [Qué se consigue jugando].`

### 3.2 Jugadores y Roles
*   **Formato**: Lista con los participantes necesarios.

### 3.3 Mecánica (Paso a paso)
*   **Encabezado**: `## Mecánica`
*   **Pasos**: Lista numerada clara.

### 3.4 Debriefing
*   **Encabezado**: `## Debriefing (Preguntas de cierre)`
*   **Contenido**: Preguntas reflexivas para afianzar el aprendizaje.

### 3.5 Variante / Pro Tip
*   **Encabezado**: `### Variante` o `### Pro Tip`

### 3.6 Conceptos Relacionados
*   **Encabezado**: `### Entrena esta teoría`
*   **Contenido**: Enlaces a las entradas teóricas relacionadas.
*   **Formato**: Lista markdown.
    *   *Ejemplo*: `* [Capítulo X: Nombre Entrada](../parte_XX/X_X.md)`

---

## 4. Plantilla de Juego (Para Copiar/Pegar)

```markdown
# Juego X: [Nombre]

> **Objetivo**: [Texto del objetivo]

## Jugadores y Roles
* Rol A: ...
* Rol B: ...

## Mecánica
1. Paso 1...
2. Paso 2...

## Debriefing (Preguntas de cierre)
* ¿Cómo te has sentido cuando...?
* ¿Qué pasaría si...?

### Variante / Pro Tip
[Texto variante]

### Entrena esta teoría
* [Capítulo X.X: Título Entrada](../parte_XX/X_X.md)
```

---

## 5. Control de Calidad (Checklist QC)

Antes de dar una entrada por cerrada, verifica estos puntos.

### 5.1 QC para Diario de Aprendizaje

**Estructura Visual**
* [ ] El **Objetivo** está dentro de un bloque `> quote`.
* [ ] Los encabezados usan la jerarquía correcta (`## Secciones`, `### Ejemplos`).
* [ ] Las **marcas técnicas** en el relato están en **negrita y [entre corchetes]**.

**Contenido Narrativo**
* [ ] La **Explicación Profunda** es narrativa (sin bullets) y enlaza el relato con la teoría.
* [ ] Se incluyen **3 Ejemplos Prácticos** diferenciados: Profesional, Familiar/Educativo, Social/Pares.
* [ ] Las **Señales de Progreso** siguen el formato "¿Pregunta? + Explicación".

**Calidad y Ética**
* [ ] Las fuentes TPM son citadas en la sección final.
* [ ] **Práctica Deliberada**: Se incluye referencia a un Juego específico para entrenar la habilidad.
* [ ] Los ejemplos cubren variantes de edad/contexto.
* [ ] El tono es asertivo y constructivo, nunca manipulador.

**Control de Calidad de Imágenes (Crítico)**
* [ ] **Prompt Escrito**: Existe un archivo `prompts/X_X.txt`.
* [ ] **Estilo Manga**: El prompt define paneles, diálogos y estilo "Manga Seinen". No es una ilustración conceptual.
* [ ] **Generación**: Se ha ejecutado el script y la imagen `images/X_X.png` existe.
* [ ] **Verificación Visual**: La imagen generada contiene texto/bocadillos legibles (si aplica) y respeta la composición de página.

### 5.2 QC para Juegos

**Claridad Mecánica**
* [ ] El **Objetivo** define claramente qué habilidad se entrena.
* [ ] Los **Roles** están bien definidos.
* [ ] La **Mecánica** se puede seguir paso a paso sin dudas.
* [ ] Hay preguntas de **Debriefing** para reflexionar después de jugar.
* [ ] Incluye sección **"Entrena esta teoría"** con enlaces a las entradas del diario.
