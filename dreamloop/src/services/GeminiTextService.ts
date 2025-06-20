
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Story, NarrativeProfileData, Question as GameQuestion, ExtendedChapterGenerationOutput } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

let ai: GoogleGenAI | null = null;

export const initialize = (apiKey: string): boolean => {
  if (apiKey && apiKey.trim() !== "") {
    try {
      ai = new GoogleGenAI({ apiKey });
      console.log("GeminiTextService inicializado con API Key.");
      return true;
    } catch (error) {
      console.error("Error al inicializar GeminiTextService con API Key:", error);
      ai = null;
      return false;
    }
  } else {
    console.warn("GeminiTextService: API Key no proporcionada o vacía. El servicio no se inicializará.");
    ai = null;
    return false;
  }
};

export const isApiAvailable = (): boolean => !!ai;

export const generateOnboardingQuestions = async (
  worldName: string,
  customWorldDescription?: string
): Promise<GameQuestion[] | null> => {
  if (!isApiAvailable() || !ai) { // Added !ai check for type safety
    throw new Error("API de Gemini (texto) no inicializada o no disponible.");
  }

  const prompt = `
Eres un diseñador de juegos narrativos especializado en crear experiencias para adolescentes (13-18 años). Tu tarea es generar 3 preguntas de opción múltiple para un juego interactivo. Estas preguntas ayudarán a definir los cimientos de la historia del protagonista en un mundo específico.

El mundo es: "${worldName}".
${customWorldDescription ? `Contexto adicional sobre este mundo (definido por el usuario): "${customWorldDescription}"` : ""}

Instrucciones para las preguntas:
1.  Genera EXACTAMENTE 3 preguntas.
2.  Cada pregunta debe ofrecer 3 respuestas posibles.
3.  Las preguntas y respuestas deben ser relevantes para adolescentes, explorando temas como identidad, amistad, presiones sociales, dilemas éticos, sueños, miedos, desafíos en el contexto de "${worldName}". Evita ser condescendiente. Usa un lenguaje que resuene con jóvenes.
4.  El tono debe ser intrigante, empático y provocar reflexión.
5.  PARA LA TERCERA PREGUNTA (Y SOLO PARA LA TERCERA), cada una de sus 3 respuestas DEBE incluir un campo "descriptor" (string). Este descriptor será una frase corta (3-7 palabras) que capture la esencia o el valor fundamental de esa respuesta específica (ej: "la búsqueda de la autenticidad", "la fuerza de los lazos inesperados", "el coraje de alzar la voz", "la sabiduría de la discreción", "la rebeldía con causa"). Este descriptor se usará para generar una imagen de un sueño.

Formato de salida OBLIGATORIO:
Devuelve SOLAMENTE un array de objetos JSON. Cada objeto representa una pregunta y debe tener la siguiente estructura:
{
  "id": "qN", // N es el número de pregunta (q1, q2, q3)
  "text": "Texto de la pregunta...",
  "answers": [
    // Para q1 y q2, la estructura es:
    // { "text": "Texto de la respuesta 1", "value": "qNa1_identificador_unico" },
    // { "text": "Texto de la respuesta 2", "value": "qNa2_identificador_unico" },
    // { "text": "Texto de la respuesta 3", "value": "qNa3_identificador_unico" }
    // Para q3, CADA respuesta DEBE tener "descriptor":
    { "text": "Texto de la respuesta 1 para q3", "value": "q3a1_identificador_unico", "descriptor": "Descriptor para q3a1" },
    { "text": "Texto de la respuesta 2 para q3", "value": "q3a2_identificador_unico", "descriptor": "Descriptor para q3a2" },
    { "text": "Texto de la respuesta 3 para q3", "value": "q3a3_identificador_unico", "descriptor": "Descriptor para q3a3" }
  ]
}

Asegúrate de que los "value" de las respuestas sean únicos y descriptivos (puedes usar el formato q[NumPregunta]a[NumRespuesta]_palabraClave).
No incluyas explicaciones adicionales, comentarios, ni la palabra "json" o los delimitadores \`\`\`json \`\`\` fuera del array JSON. Solo el array.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({ // ai is now guaranteed to be non-null by isApiAvailable()
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    let jsonStr = String(response.text).trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as GameQuestion[];

    if (Array.isArray(parsedData) && parsedData.length === 3 &&
        parsedData.every(q => q.id && q.text && Array.isArray(q.answers) && q.answers.length === 3 &&
                           q.answers.every(a => a.text && a.value))) {
        const lastQ = parsedData[2];
        if (!lastQ.answers.every(a => typeof a.descriptor === 'string' && a.descriptor.length > 0)) {
            console.error("Error: Descriptors faltantes o inválidos en la última pregunta generada por IA.", lastQ.answers);
            throw new Error("La IA no generó los descriptores requeridos para la última pregunta.");
        }
        return parsedData;
    }
    console.error("Respuesta JSON de preguntas de onboarding incompleta o mal formada:", parsedData);
    throw new Error("La IA no generó las preguntas en el formato esperado.");

  } catch (error) {
    console.error("Error generando preguntas de onboarding:", error);
    if (error instanceof Error) throw error;
    throw new Error ("Error desconocido al generar preguntas de onboarding.");
  }
};


export const generateNarrativeProfile = async (
  worldName: string,
  answeredQuestions: Array<{ questionText: string, answerText: string }>,
  valueDescriptorForDream: string, 
  protagonistGender: string 
): Promise<NarrativeProfileData | null> => {
  if (!isApiAvailable() || !ai) {
    throw new Error("API de Gemini (texto) no inicializada o no disponible.");
  }

  const answeredQuestionsFormatted = answeredQuestions
    .map(qa => `- Pregunta: "${qa.questionText}"\n  Respuesta del jugador: "${qa.answerText}"`)
    .join('\n');

  const prompt = `
Eres un diseñador narrativo experto creando historias para adolescentes. Basado en las siguientes elecciones de un jugador, genera un nombre de protagonista, un breve arquetipo de protagonista, un tema central para su aventura, un texto de preámbulo, y una descripción y leyenda para su sueño inicial.

Mundo elegido para la historia: "${worldName}"
Género del protagonista elegido por el jugador: "${protagonistGender}"

El jugador respondió a las siguientes preguntas iniciales de la siguiente manera:
${answeredQuestionsFormatted}

La elección clave del jugador que inspirará su primer sueño se resume en esta idea o valor: "${valueDescriptorForDream}".

Basado en todo esto, define:
1.  **Nombre del protagonista**: Un nombre (solo el nombre, sin apellidos) adecuado para un personaje adolescente de género '${protagonistGender}' en el contexto del mundo de "${worldName}". Asegúrate de que el nombre sea coherente con el género proporcionado.
2.  **Arquetipo del protagonista**: Describe al protagonista (considerando su nombre y género '${protagonistGender}') en 10-20 palabras (ej: "Alex, artista idealista en busca de su lugar", "Sam, detective cínique con un secreto", "Elena, líder reticente con gran potencial"). Debe resonar con un público adolescente y el mundo de '${worldName}'.
3.  **Tema central**: Resume el núcleo temático de la aventura en 5-15 palabras (ej: "La lucha por la autenticidad en un mundo de apariencias", "El poder de la amistad contra la adversidad", "Descubrir quién eres cuando todo cambia").
4.  **Texto de Preámbulo**: Escribe un párrafo de 100-150 palabras que introduzca al protagonista. Este preámbulo debe estar escrito en PRIMERA PERSONA por el protagonista (usando "yo", "mi", etc.), utilizando su nombre generado y refiriéndose a sí mismo con el género '${protagonistGender}' de forma natural en la narración. Debe conectar con su arquetipo, el tema, y las respuestas del jugador, y ajustarse al tono del mundo de '${worldName}'.
5.  **Descripción para la Imagen del Sueño Inicial (initialDreamImageDescription)**: Una descripción concisa (1-2 frases, 30-50 palabras) para una IMAGEN que represente el sueño inicial del protagonista. Esta imagen debe estar inspirada principalmente por '${valueDescriptorForDream}' y ambientada en el mundo de '${worldName}'. Esta descripción es para un generador de imágenes, así que debe ser visualmente rica y evocadora, evitando mostrar directamente al protagonista si es posible (más simbólico).
6.  **Leyenda para la Imagen del Sueño Inicial (initialDreamImageCaption)**: Una LEYENDA CORTA Y ATRACTIVA (1 frase, MÁXIMO 15 palabras) para la imagen del sueño inicial. Esta leyenda SÍ se mostrará al usuario. Debe ser poética o intrigante y complementar la imagen.

Devuelve la respuesta SOLAMENTE como un objeto JSON con las claves "protagonistName" (string), "protagonistArchetype" (string), "centralTheme" (string), "preambleText" (string), "initialDreamImageDescription" (string), y "initialDreamImageCaption" (string). No incluyas explicaciones adicionales fuera del JSON. Asegúrate que "protagonistName" solo contenga el nombre.`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    let jsonStr = String(response.text).trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
    const parsedData = JSON.parse(jsonStr) as NarrativeProfileData;
    if (parsedData.protagonistName && 
        parsedData.protagonistArchetype && 
        parsedData.centralTheme && 
        parsedData.preambleText &&
        parsedData.initialDreamImageDescription &&
        parsedData.initialDreamImageCaption) {
      return parsedData;
    }
    console.error("Respuesta JSON del perfil incompleta:", parsedData);
    throw new Error("La IA no generó el perfil narrativo completo (incluyendo descripción/leyenda de imagen inicial) en el formato esperado.");
  } catch (error) {
    console.error("Error generando perfil narrativo y preámbulo:", error);
    if (error instanceof Error) throw error;
    throw new Error ("Error desconocido al generar perfil narrativo.");
  }
};

export const generateStoryTitle = async (worldName: string, archetype: string, theme: string): Promise<string | null> => {
  if (!isApiAvailable() || !ai) {
    throw new Error("API de Gemini (texto) no inicializada o no disponible.");
  }
  const prompt = `Eres un escritor creativo experto en generar títulos llamativos para historias adolescentes.
Dado el mundo de la historia: '${worldName}'
El arquetipo del protagonista: '${archetype}'
Y el tema central de la aventura: '${theme}'

Por favor, genera 1 (UN SOLO) título conciso, evocador y atractivo para esta historia. El título debe tener entre 3 y 7 palabras. Debe ser intrigante para un público adolescente.
Devuelve SOLAMENTE el string del título, sin comillas adicionales ni texto explicativo.`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    const titleText = response.text.trim();
    if (titleText) {
      return titleText.replace(/^["']|["']$/g, '');
    }
    console.error("No se generó el título.");
    throw new Error("La IA no generó un título para la historia.");
  } catch (error) {
    console.error("Error generando el título de la historia:", error);
    if (error instanceof Error) throw error;
    throw new Error ("Error desconocido al generar título de la historia.");
  }
};


export const generateFirstChapterText = async (story: Story): Promise<ExtendedChapterGenerationOutput | null> => {
    if (!isApiAvailable() || !ai) {
        throw new Error("API de Gemini (texto) no inicializada o no disponible.");
    }
    if (!story.protagonistName || !story.protagonistGender || !story.protagonistArchetype || !story.centralTheme || !story.preambleText) {
        console.error("Faltan datos de la historia para generar primer capítulo (nombre, género, arquetipo, tema o preámbulo).");
        throw new Error("Datos insuficientes para generar el primer capítulo.");
    }
    const prompt = `
Eres un novelista de ficción interactiva para un público adolescente. Escribe el primer capítulo (aproximadamente 1000-1500 palabras) de una historia ambientada en '${story.worldName}'.
Título de la historia: '${story.title}'
Nombre del protagonista: '${story.protagonistName}'
Género del protagonista: '${story.protagonistGender}'
Arquetipo del protagonista: '${story.protagonistArchetype}'
Tema central: '${story.centralTheme}'
Preámbulo/Introducción ya establecida (narrada en primera persona por ${story.protagonistName}): '${story.preambleText}'

El capítulo debe ser narrado en PRIMERA PERSONA por ${story.protagonistName} (género: ${story.protagonistGender}), usando un lenguaje y tono que conecten con adolescentes. Desarrolla la escena inicial, establece su personalidad basada en el arquetipo y el preámbulo, e introduce los primeros elementos del tema central. Haz que ${story.protagonistName} reflexione o actúe de manera coherente con el preámbulo y su género. El tono debe ser inmersivo y capturar la atmósfera de '${story.worldName}'.
Concluye el capítulo dejando una ligera intriga o un punto de partida para el siguiente.

Devuelve SOLAMENTE un objeto JSON con las siguientes claves:
- "title": (string) un título evocador y único para este capítulo (3-8 palabras, NO incluyas "Capítulo N").
- "text": (string) el texto completo del capítulo.
- "imageDescription": (string) una descripción concisa (1-2 frases) para una IMAGEN que represente una escena clave o el ambiente general de este capítulo. Esta descripción es para generar una imagen, así que debe ser visualmente descriptiva.
- "imageCaption": (string) una LEYENDA CORTA Y ATRACTIVA (1-2 frases, MÁXIMO 20 palabras) para la imagen generada a partir de "imageDescription". Esta leyenda SÍ se mostrará al usuario junto a la imagen. Debe ser intrigante y complementar la imagen y el texto del capítulo.

No incluyas explicaciones adicionales fuera del JSON ni la palabra "json" o los delimitadores \`\`\`json \`\`\`.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let jsonStr = String(response.text).trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) jsonStr = match[2].trim();
        
        const parsedData = JSON.parse(jsonStr) as ExtendedChapterGenerationOutput;

        if (parsedData && parsedData.title && parsedData.text && parsedData.imageDescription && parsedData.imageCaption) {
            return parsedData;
        }
        console.error("AI no devolvió el título, texto, descripción de imagen y/o leyenda de imagen del primer capítulo en el formato esperado:", parsedData);
        throw new Error("La IA no generó el título, texto, descripción de imagen y/o leyenda de imagen del primer capítulo en el formato esperado.");

    } catch (error) {
        console.error("Error generando contenido del primer capítulo:", error);
        if (error instanceof Error) throw error;
        throw new Error ("Error desconocido al generar contenido del primer capítulo.");
    }
};

export const generateSubsequentChapterText = async (
    story: Story, 
    chapterIndexToGenerate: number, 
    playerReflection: string | null | undefined, 
    previousChaptersSummary: string
): Promise<ExtendedChapterGenerationOutput | null> => {
    if (!isApiAvailable() || !ai) {
        throw new Error("API de Gemini (texto) no inicializada o no disponible.");
    }
    if (!story.protagonistName || !story.protagonistGender || !story.protagonistArchetype || !story.centralTheme) {
        console.error("Faltan datos de la historia para generar capítulo subsiguiente (nombre, género, arquetipo o tema).");
        throw new Error("Datos insuficientes para generar el capítulo.");
    }

    const prompt = `
Eres un novelista de ficción interactiva para adolescentes, continuando una historia.
Mundo de la historia: '${story.worldName}'
Nombre del protagonista: '${story.protagonistName}'
Género del protagonista: '${story.protagonistGender}'
Protagonista (Arquetipo): '${story.protagonistArchetype}'
Tema Central: '${story.centralTheme}'

Contexto de la historia hasta ahora (resumen de capítulos anteriores en orden, narrados por ${story.protagonistName}):
${previousChaptersSummary}
---
Al final del capítulo anterior, ${story.protagonistName} recibió un "sueño" o consejo del lector que es: "${playerReflection || `${story.protagonistName} reflexionó por su cuenta.`}"

Escribe el siguiente capítulo (Capítulo ${chapterIndexToGenerate + 1}, aproximadamente 1000-1500 palabras) narrado en PRIMERA PERSONA por ${story.protagonistName} (género: ${story.protagonistGender}), con un tono adolescente.
${story.protagonistName} debe recordar o ser influenciado sutilmente por el "sueño" o consejo recibido ("${playerReflection || "sus propias meditaciones nocturnas"}") en momentos clave de este capítulo. Sus acciones, pensamientos o diálogos deben reflejar esta influencia y ser coherentes con su género.
Continúa la trama, desarrolla al personaje (${story.protagonistName}) y el tema central. Mantén la coherencia con los eventos previos y el tono de '${story.worldName}'.
Concluye el capítulo dejando una ligera intriga o un punto de partida para el siguiente.

Devuelve SOLAMENTE un objeto JSON con las siguientes claves:
- "title": (string) un título evocador y único para este capítulo (3-8 palabras, NO incluyas "Capítulo N"). Debe reflejar su contenido y la influencia del sueño.
- "text": (string) el texto completo del capítulo.
- "imageDescription": (string) una descripción concisa (1-2 frases) para una IMAGEN que represente una escena clave o el ambiente general de este capítulo, influenciada también por el sueño/consejo. Esta descripción es para generar una imagen, así que debe ser visualmente descriptiva.
- "imageCaption": (string) una LEYENDA CORTA Y ATRACTIVA (1-2 frases, MÁXIMO 20 palabras) para la imagen generada a partir de "imageDescription". Esta leyenda SÍ se mostrará al usuario junto a la imagen. Debe ser intrigante y complementar la imagen y el texto del capítulo.

No incluyas explicaciones adicionales fuera del JSON ni la palabra "json" o los delimitadores \`\`\`json \`\`\`.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let jsonStr = String(response.text).trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) jsonStr = match[2].trim();
        
        const parsedData = JSON.parse(jsonStr) as ExtendedChapterGenerationOutput;

        if (parsedData && parsedData.title && parsedData.text && parsedData.imageDescription && parsedData.imageCaption) {
             return parsedData;
        }
        console.error(`AI no devolvió el título, texto, descripción de imagen y/o leyenda de imagen del capítulo ${chapterIndexToGenerate + 1} en el formato esperado:`, parsedData);
        throw new Error(`La IA no generó el título, texto, descripción de imagen y/o leyenda de imagen del capítulo ${chapterIndexToGenerate + 1} en el formato esperado.`);
        
    } catch (error) {
        console.error(`Error generando contenido del capítulo ${chapterIndexToGenerate + 1}:`, error);
        if (error instanceof Error) throw error;
        throw new Error (`Error desconocido al generar contenido del capítulo ${chapterIndexToGenerate + 1}.`);
    }
};
