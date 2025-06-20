
# DreamLoop - Tus Aventuras Oníricas

DreamLoop es una aplicación web de narración interactiva donde tus reflexiones diarias dan forma a una aventura personalizada de 30 días, guiando a un héroe a través de elecciones y crecimiento. Utiliza la API de Gemini para generar dinámicamente el contenido de la historia, incluyendo narrativas, perfiles de personajes e imágenes.

## Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Configuración de la API Key de Gemini](#configuración-de-la-api-key-de-gemini)
    - [Método Principal: A través de la Aplicación](#método-principal-a-través-de-la-aplicación)
    - [Método Alternativo/Fallback: Archivo `env.js`](#método-alternativofallback-archivo-envjs)
- [Instalación y Ejecución Local](#instalación-y-ejecución-local)
    - [Usando Makefile (Recomendado)](#usando-makefile-recomendado)
    - [Pasos Manuales (Alternativa)](#pasos-manuales-alternativa)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Características Principales](#características-principales)
- [Stack Tecnológico y API](#stack-tecnológico-y-api)
- [Solución de Problemas](#solución-de-problemas)

## Prerrequisitos

*   Un navegador web moderno (Chrome, Firefox, Edge, Safari).
*   **Node.js y npm (o yarn/pnpm):** Necesarios para `npx` (usado por `npx serve`) y para instalar `typescript` si aún no lo tienes globalmente.
*   **TypeScript Compiler (`tsc`):** Necesario para compilar el código. Puedes instalarlo globalmente con `npm install -g typescript`.
*   **`make`:** La utilidad `make` debe estar disponible en tu sistema si deseas usar el `Makefile` (común en Linux y macOS, puede requerir instalación en Windows).
*   Una API Key de Google Gemini. Puedes obtener una desde [Google AI Studio](https://aistudio.google.com/app/apikey).

## Configuración de la API Key de Gemini

La aplicación requiere una API Key de Google Gemini para funcionar. Tienes dos formas de configurarla:

### Método Principal: A través de la Aplicación (Recomendado)

1.  Abre la aplicación DreamLoop en tu navegador.
2.  Haz clic en el icono de **Configuración** (engranaje) en el encabezado.
3.  En la sección "Gestión de API Key de Gemini", introduce tu API Key en el campo correspondiente.
4.  Haz clic en "Guardar Clave API".
    *   La clave se guardará de forma segura en el almacenamiento local (`localStorage`) de tu navegador para esta aplicación.
    *   Esta clave tendrá prioridad sobre cualquier otra configuración.

### Método Alternativo/Fallback: Archivo `env.js`

Este método puede usarse si prefieres no introducir la clave por la UI o como un valor inicial si la clave no está en `localStorage`.

1.  **Crea un archivo `env.js`**: En la raíz de tu proyecto (junto a `index.html`), crea un archivo llamado `env.js`.
2.  **Añade tu API Key al archivo**: Pega el siguiente código en `env.js`, reemplazando `'YOUR_GEMINI_API_KEY'` con tu clave real:
    ```javascript
    // env.js
    window.process = {
      env: {
        API_KEY: 'YOUR_GEMINI_API_KEY' // ¡Reemplaza esto con tu API Key real!
      }
    };
    ```
3.  **Inclusión en `index.html`**: El archivo `index.html` ya está configurado para cargar `env.js`.
4.  **Añade `env.js` a `.gitignore`**: Si estás usando Git, **es crucial** que añadas `env.js` a tu archivo `.gitignore`.

**Nota Importante:** Nunca compartas tu API Key públicamente ni la incluyas directamente en el código fuente que se sube a repositorios. La clave guardada en `localStorage` es específica de tu navegador y no se sincroniza.

## Instalación y Ejecución Local

### Usando Makefile (Recomendado)

El `Makefile` proporcionado automatiza los pasos de compilación y ejecución.

1.  **Configura tu API Key:** Sigue las instrucciones en [Configuración de la API Key de Gemini](#configuración-de-la-api-key-de-gemini) (preferiblemente el método de `env.js` para la primera ejecución si aún no has accedido a la app).
2.  **Asegúrate de tener `typescript` instalado:** Si no, instálalo globalmente: `npm install -g typescript`.
3.  **Compilar la aplicación:**
    Abre tu terminal en la raíz del proyecto y ejecuta:
    ```bash
    make build
    ```
4.  **Iniciar el servidor de desarrollo:**
    ```bash
    make serve
    ```
    Esto primero ejecutará `make build` (si es necesario) y luego iniciará un servidor local (usualmente en `http://localhost:3000`). Abre esta URL en tu navegador.
5.  **Limpiar archivos compilados (opcional):**
    ```bash
    make clean
    ```

### Pasos Manuales (Alternativa)

#### Paso 1: Obtener los Archivos del Proyecto
Asegúrate de tener todos los archivos del proyecto en una carpeta local.

#### Paso 2: Configurar tu API Key (Manual)
Sigue las instrucciones en [Configuración de la API Key de Gemini](#configuración-de-la-api-key-de-gemini), usando el método de `env.js` si es la primera vez.

#### Paso 3: Configurar TypeScript y Compilar (Manual)
Los archivos `.tsx` y `.ts` deben ser compilados a JavaScript.
1.  **Instalar TypeScript (si no lo tienes globalmente):** `npm install -g typescript`.
2.  **Crear/Verificar `tsconfig.json`:** Asegúrate de tener el archivo `tsconfig.json` proporcionado en la raíz del proyecto.
3.  **Compilar el proyecto:** Ejecuta `tsc` en la terminal desde la raíz de tu proyecto.

#### Paso 4: Iniciar un Servidor HTTP Local (Manual)
Después de compilar, sirve los archivos desde la raíz del proyecto:
```bash
npx serve .
```
Abre `http://localhost:3000` (o el puerto que indique `npx serve`) en tu navegador.

## Estructura del Proyecto
```
.
├── Makefile                  # Para automatizar build y serve.
├── index.html                # Punto de entrada HTML.
├── index.tsx                 # Script de entrada original de React (TypeScript).
├── index.js                  # Script de entrada COMPILADO (JavaScript).
├── metadata.json             # Metadatos de la aplicación.
├── SPECS.md                  # Especificaciones técnico-funcionales.
├── README.md                 # Este archivo.
├── tsconfig.json             # Configuración del compilador de TypeScript.
├── env.js                    # (Creado localmente) Para la API Key (método fallback).
└── src/
    ├── App.css                 # Estilos globales.
    ├── App.tsx                 # Componente principal (TypeScript).
    ├── App.js                  # Componente principal COMPILADO (JavaScript).
    ├── constants.ts            # Constantes (TypeScript).
    ├── constants.js            # Constantes COMPILADAS (JavaScript).
    ├── types.ts                # Definiciones de tipos.
    ├── utils.ts                # Funciones de utilidad (TypeScript).
    ├── utils.js                # Funciones de utilidad COMPILADAS (JavaScript).
    ├── components/             # Componentes UI (con sus .tsx, .js compilados, y .css).
    │   └── SettingsScreen.tsx  # Nueva pantalla de configuración.
    │   └── SettingsScreen.css  # Estilos para SettingsScreen.
    └── services/               # Lógica de negocio y APIs (con sus .ts y .js compilados).
        └── ApiKeyManager.ts    # Nuevo servicio para gestionar la API Key.
```

## Características Principales

*   **Configuración de API Key en la App:** Permite al usuario introducir y gestionar su API Key de Gemini directamente.
*   Creación de Historias Personalizadas y Onboarding Dinámico con IA.
*   Generación de Protagonistas, Narrativa, Preámbulo e Imágenes por IA.
*   Progresión por Capítulos influenciada por Reflexiones del Jugador.
*   **Importar/Exportar historias (JSON):** Ahora accesible desde la pantalla de Configuración.
*   Regeneración de Imágenes.

## Stack Tecnológico y API

*   **Frontend:** React 19, TypeScript.
*   **Módulos ES6:** Cargados vía `importmap` desde `esm.sh`.
*   **API de IA:** Google Gemini API (`@google/genai` SDK).
    *   Texto: `gemini-2.5-pro` (configurable en `src/constants.ts`).
    *   Imágenes: `imagen-3.0-generate-002` (configurable en `src/constants.ts`).
*   **Estilos:** CSS modular y global.
*   **Build:** `tsc` (TypeScript Compiler).
*   **Server Local:** `npx serve`.

## Solución de Problemas

*   **Modal "Advertencia de API Key":**
    Ve a la pantalla de Configuración (icono de engranaje en el encabezado) e introduce tu API Key. Si persiste, verifica la consola del navegador (F12) para más detalles.
*   **Funciones de IA no disponibles:**
    Asegúrate de haber guardado una API Key válida en Configuración.
*   **Resto de problemas:** Consulta la guía original en el `README.md` anterior.
