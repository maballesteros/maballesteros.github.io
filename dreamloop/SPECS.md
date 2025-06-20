
# DreamLoop: Especificaciones Técnico-Funcionales

## 1. Visión General del Proyecto

DreamLoop es una aplicación web de narración interactiva. Permite a los usuarios crear historias personalizadas en mundos predefinidos o personalizados. A través de un proceso de onboarding guiado por IA, se define un protagonista y un tema central. La IA luego genera un título, un preámbulo narrativo y una imagen de sueño inicial. Los usuarios progresan a través de capítulos generados por IA, influenciados por sus reflexiones, con el objetivo de completar una saga de 30 capítulos. La aplicación utiliza la API de Gemini para la generación de texto e imágenes, cuya API Key puede ser configurada por el usuario.

---

## 2. Arquitectura Funcional

### 2.1. Flujo Principal del Usuario

1.  **Inicio (Home):**
    *   Visualizar historias existentes.
    *   Iniciar la creación de una nueva historia.
    *   Acceder a la pantalla de Configuración.
2.  **Configuración (Settings):**
    *   **Gestión de API Key:** Introducir, guardar y limpiar la API Key de Gemini. La clave se almacena en `localStorage`.
    *   **Importar Historias:** Cargar historias desde un archivo JSON.
    *   **Exportar Historias:** Descargar todas las historias actuales a un archivo JSON.
3.  **Creación de Nueva Historia (Onboarding):**
    *   ... (resto del flujo igual)
4.  **Visualización de Detalles de la Historia:**
    *   ... (resto del flujo igual)
5.  **Generación y Visualización de Capítulos:**
    *   ... (resto del flujo igual)

### 2.2. Gestión de Estado de la Aplicación

*   **`GameStep` (Enum):** Controla la pantalla/vista actual de la aplicación (ej: `HOME`, `SETTINGS`, `WORLD_SELECTION`, `CHAPTER_VIEW`).
*   **React `useState` Hooks:** Se utilizan extensivamente para gestionar:
    *   `currentApiKey` (string | null): La API Key de Gemini activa.
    *   ... (resto de estados igual)

### 2.3. Modelo de Datos
    *   ... (sin cambios significativos en los modelos principales de Story/Chapter)

### 2.4. Servicios de IA (Gemini API)

Se utiliza el SDK `@google/genai`. Los servicios (`GeminiTextService`, `GeminiImageService`) son inicializados dinámicamente con la API Key activa.

*   **`ApiKeyManager.ts` (Nuevo):**
    *   `saveApiKey(key)`: Guarda la API Key en `localStorage`.
    *   `loadApiKey()`: Carga la API Key desde `localStorage`.
    *   `clearApiKey()`: Elimina la API Key de `localStorage`.
    *   `getApiKeyFromEnv()`: Intenta leer la API Key desde `window.process.env.API_KEY` (configurado por `env.js`).
*   **Servicios Gemini (`GeminiTextService.ts`, `GeminiImageService.ts`):**
    *   Función `initialize(apiKey: string)`: Crea la instancia de `GoogleGenAI` con la clave proporcionada.
    *   Función `isApiAvailable()`: Verifica si la instancia de `GoogleGenAI` está inicializada.
    *   ... (resto de funciones de generación de contenido igual, pero dependen de que `isApiAvailable()` sea `true`)

### 2.5. Persistencia de Datos

*   **`StoryManager.ts`**:
    *   ... (sin cambios)
*   **API Key:** Se persiste en `localStorage` a través de `ApiKeyManager.ts`.

### 2.6. Importación/Exportación de Datos

*   Accesible desde la pantalla de Configuración.
*   ... (funcionalidad de import/export igual)

---

## 3. Interfaz de Usuario (UI) y Experiencia de Usuario (UX)

### 3.1. Pantallas Principales

*   **`HomeScreen`**: ... (sin cambios)
*   **`SettingsScreen` (Nueva)**:
    *   Campo para introducir/ver (oculta) la API Key de Gemini.
    *   Botones para Guardar y Limpiar la API Key.
    *   Indicador de estado de la API Key.
    *   Botones para Importar y Exportar historias.
*   **`WorldSelectionScreen`**: ... (sin cambios)
*   ... (resto de pantallas igual)

### 3.2. Elementos Reutilizables

*   **`Header.tsx`**: Encabezado global con el título de la app, botón para ir a inicio y botón para ir a Configuración. Los botones de Importar/Exportar se han movido a `SettingsScreen`.
*   ... (resto de componentes igual)

### 3.3. Interacciones Específicas

*   **Configuración de API Key:** El usuario puede pegar su API Key y guardarla. Esto reinicializa los servicios de IA.
*   ... (resto de interacciones igual)

---

## 4. Flujos de Generación de Contenido (Detallado)
    *   ... (sin cambios en la lógica de generación una vez que la API está disponible)

---

## 5. Consideraciones Técnicas

### 5.1. Stack Tecnológico
    *   ... (sin cambios)

### 5.2. Gestión de API Key

*   **Prioridad:**
    1.  Clave guardada por el usuario en `localStorage` (a través de la pantalla de Configuración).
    2.  Clave proporcionada por `env.js` (leída al inicio si no hay clave en `localStorage`).
*   Si ninguna clave está disponible, las funcionalidades de IA se desactivan y se informa al usuario, sugiriendo ir a Configuración.
*   Los servicios de Gemini son inicializados/re-inicializados por `App.tsx` cuando la API Key se carga o cambia.

### 5.3. Modelos de IA Usados
    *   ... (sin cambios)

### 5.4. Limitaciones Actuales / Áreas de Futura Mejora
    *   ... (la gestión de API Key vía `env.js` es ahora un fallback)
