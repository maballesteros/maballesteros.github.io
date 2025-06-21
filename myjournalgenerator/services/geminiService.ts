

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PersonalizationOptions, JournalIndex, JournalEntryContent, JournalFormat, JournalTheme, CentralObjective, Tradition, LifeRole, JournalSubChapter, EntryContentType } from '../types';
import { GEMINI_TEXT_MODEL, AVAILABLE_ENTRY_CONTENT_TYPES, LOCAL_STORAGE_GEMINI_API_KEY } from '../constants';

// Retrieve API key override from localStorage or fallback to environment variable
const getApiKey = (): string | null => {
  try {
    const storedKey = localStorage.getItem(LOCAL_STORAGE_GEMINI_API_KEY);
    if (storedKey) {
      return storedKey;
    }
  } catch (err) {
    console.error("Error accessing localStorage for API key override:", err);
  }
  return process.env.API_KEY ?? null;
};

// Create a new GoogleGenAI client with the appropriate API key
const getAiClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API key is not set. Please set it in localStorage or environment variable.");
  }
  return new GoogleGenAI({ apiKey: apiKey! });
};

interface JournalEntryContentInternal {
  spark: {
    quote: string;
    author?: string;
  };
  entryContentType: EntryContentType;
  mainContent: string; // Expecting Markdown here
  journalQuestion: string;
  miniChallenge: string;
  brief_visual_description_for_illustration?: string;
}

const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return null;
  }
};

export const createFallbackJournalIndex = (options: PersonalizationOptions, cadenceDesc: string): JournalIndex => {
  const firstObjective = options.centralObjectives[0] || CentralObjective.PERSONAL_GROWTH;
  let fallbackTitle = `Guía Inicial para ${firstObjective}`;
  if (options.centralObjectives.length > 1) {
    fallbackTitle = `Guía Inicial para ${firstObjective} y más`;
  }
  
  let fallbackThemes: JournalTheme[] = [];

  if (options.journalFormat === JournalFormat.HERO_JOURNEY) {
    fallbackTitle = `Mi Primer Camino del Héroe: Aventura Inicial (Respaldo)`;
    fallbackThemes = [
      {
        theme: "Acto 1: El Comienzo",
        subChapters: [
          { title: "Paso 1: La Llamada Interior", description: "El héroe siente una inquietud y la necesidad de un cambio profundo." },
          { title: "Paso 2: Primeros Obstáculos", description: "Surgen los desafíos iniciales que ponen a prueba la determinación del héroe." },
          { title: "Paso 3: Encuentro con el Mentor", description: "Una figura sabia aparece para guiar al héroe en su camino." },
        ]
      },
      {
        theme: "Acto 2: Las Pruebas",
        subChapters: [
          { title: "Paso 4: Adentrándose en lo Desconocido", description: "El héroe abandona su zona de confort y enfrenta nuevas realidades." },
          { title: "Paso 5: Superando la Adversidad", description: "El héroe utiliza sus crecientes habilidades para superar un reto significativo." },
        ]
      }
    ];
    cadenceDesc = "Una travesía de 30 días siguiendo el Camino del Héroe (versión de respaldo).";
  } else {
    switch (firstObjective) {
      case CentralObjective.STRESS_MANAGEMENT:
        fallbackThemes = [
          {
            theme: "Primeros Pasos para Reducir el Estrés",
            subChapters: [
              { title: "Identifica Tus Disparadores", description: "Reconoce qué situaciones o pensamientos te generan estrés." },
              { title: "Técnica de Respiración Simple", description: "Aprende a usar la respiración para calmarte en momentos de tensión." },
            ]
          }
        ];
        break;
      default: 
        fallbackThemes = [
          {
            theme: `Tema Inicial de Respaldo para ${firstObjective}`,
            subChapters: [
              { title: "Introducción General", description: "Una bienvenida a tu diario personalizado enfocado en tus objetivos." },
              { title: "Reflexión Principal Inicial", description: "Un punto de partida para tu introspección hacia tus metas." }
            ]
          }
        ];
    }
  }


  return {
    title: fallbackTitle,
    themes: fallbackThemes,
    cadence: cadenceDesc,
  };
};


export const generateJournalIndex = async (options: PersonalizationOptions): Promise<JournalIndex> => {
  let cadenceDesc: string;
  let numEntries: number;
  let themeStructurePrompt: string;
  let entryNamingConvention: string;
  let themeNamingConvention: string;
  let jsonExampleStructure: string;
  
  const objectivesString = options.centralObjectives.map(o => `"${o}"`).join(" y ");
  const traditionsString = options.traditions.map(t => `"${t}"`).join(", ");
  const heroProfileContext = options.heroProfile ? `\n    - Perfil del Héroe: ${options.heroProfile}` : "";

  if (options.journalFormat === JournalFormat.DAILY_MICRO) {
    numEntries = 30;
    cadenceDesc = "un viaje de 30 días con reflexiones diarias cortas";
    themeStructurePrompt = `El índice debe organizarse en 4 o 5 macro-temas principales. Cada macro-tema representará aproximadamente una semana o una agrupación lógica de varios días. Distribuye un total EXACTO de ${numEntries} subcapítulos (entradas diarias) entre estos macro-temas.`;
    themeNamingConvention = "Semana [NÚMERO]: [Nombre Descriptivo del Tema]";
    entryNamingConvention = "Día [NÚMERO GLOBAL]: [Título Descriptivo de la Entrada]";
    jsonExampleStructure = `{
      "title": "Mi Viaje de 30 Días enfocado en ${objectivesString}",
      "themes": [
        {
          "theme": "Semana 1: Comprendiendo Mis Fundamentos",
          "subChapters": [
            { "title": "Día 1: Reconociendo el Punto de Partida", "description": "Breve descripción del propósito de este subcapítulo." },
            { "title": "Día 2: Definiendo Mis Valores Clave", "description": "Breve descripción del propósito de este subcapítulo." }
          ]
        }
      ],
      "cadence": "${cadenceDesc}"
    }`;
  } else if (options.journalFormat === JournalFormat.WEEKLY_LONG) {
    numEntries = 12;
    cadenceDesc = "un programa de 12 semanas con entradas semanales más profundas";
    themeStructurePrompt = `El índice debe organizarse en 3 o 4 macro-temas principales. Cada macro-tema agrupará varias entradas semanales. Distribuye un total EXACTO de ${numEntries} subcapítulos (entradas semanales) entre estos macro-temas.`;
    themeNamingConvention = "Módulo [NÚMERO]: [Nombre Descriptivo del Tema]";
    entryNamingConvention = "Semana [NÚMERO GLOBAL]: [Título Descriptivo de la Entrada]";
    jsonExampleStructure = `{
      "title": "Mi Programa de 12 Semanas enfocado en ${objectivesString}",
      "themes": [
        {
          "theme": "Módulo 1: Estableciendo las Bases",
          "subChapters": [
            { "title": "Semana 1: Introducción y Autoevaluación", "description": "Breve descripción del propósito de este subcapítulo." },
            { "title": "Semana 2: Principios Clave Aplicados", "description": "Breve descripción del propósito de este subcapítulo." }
          ]
        }
      ],
      "cadence": "${cadenceDesc}"
    }`;
  } else if (options.journalFormat === JournalFormat.HERO_JOURNEY) {
    numEntries = 30;
    cadenceDesc = "una travesía de 30 días siguiendo el Camino del Héroe, superando desafíos y dominando principios clave.";
    themeStructurePrompt = `El índice debe narrar una historia cohesiva a lo largo de EXACTAMENTE ${numEntries} entradas (subcapítulos). Organiza estas 30 entradas en 4-5 Actos o Fases principales (macro-temas) que representen etapas significativas del viaje del héroe (ej: La Llamada, El Umbral, Pruebas y Aliados, La Crisis, La Transformación, El Retorno).
    Cada subcapítulo ('Paso') es un momento en la historia. Su 'title' debe ser el nombre del paso o desafío (ej: 'Paso 1: El Despertar de la Inquietud', 'Paso 15: El Enfrentamiento con la Sombra').
    La 'description' de cada subcapítulo es CRUCIAL: debe actuar como una breve sinopsis de ese punto de la historia (2-3 frases), conectando con la entrada anterior y preparando la siguiente, manteniendo el hilo argumental. Debe mostrar la progresión del héroe.`;
    themeNamingConvention = "Acto [NÚMERO]: [Nombre del Acto/Fase]";
    entryNamingConvention = "Paso [NÚMERO GLOBAL]: [Título del Paso del Héroe]";
    jsonExampleStructure = `{
      "title": "El Camino del Héroe: [Título temático breve basado en objetivos y perfil del héroe]",
      "themes": [
        {
          "theme": "Acto 1: La Partida",
          "subChapters": [
            { "title": "Paso 1: El Mundo Ordinario de [Nombre del Héroe]", "description": "Presentación de [Nombre del Héroe] en su contexto, tal como se describe en el perfil. Siente una creciente insatisfacción o un presagio de cambio relacionado con los objetivos centrales." },
            { "title": "Paso 2: La Llamada a la Aventura", "description": "[Nombre del Héroe] se enfrenta a un desafío o revelación (conectado a los objetivos) que perturba su rutina y le obliga a considerar un nuevo camino. Se exploran las primeras dudas." }
          ]
        },
        {
          "theme": "Acto 2: Las Pruebas Iniciales",
          "subChapters": [
            { "title": "Paso 3: El Rechazo de la Llamada o la Aceptación Vacilante", "description": "El héroe duda ante lo desconocido, pero finalmente (o tras un empujón) decide aceptar el desafío, motivado por [un aspecto de los objetivos]." },
            { "title": "Paso 4: Cruzando el Primer Umbral", "description": "El héroe se compromete con el viaje, dejando atrás su mundo conocido. Se encuentra con su primer aliado o mentor que le introduce a un principio clave de [una de las tradiciones]." }
          ]
        }
      ],
      "cadence": "${cadenceDesc}"
    }`;
  } else { // JournalFormat.YEARLY_FULL_365_DAYS
    numEntries = 365;
    cadenceDesc = "un recorrido de 365 días con una entrada para cada día del año";
    themeStructurePrompt = `El índice debe organizarse en EXACTAMENTE 12 macro-temas, uno por cada mes del año (Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre). Distribuye un total EXACTO de ${numEntries} subcapítulos (entradas diarias) entre estos meses, respetando el número de días de cada mes (considera un año no bisiesto: Enero 31, Febrero 28, Marzo 31, Abril 30, Mayo 31, Junio 30, Julio 31, Agosto 31, Septiembre 30, Octubre 31, Noviembre 30, Diciembre 31).`;
    themeNamingConvention = "[Nombre del Mes]"; // e.g., "Enero", "Febrero"
    entryNamingConvention = "[Día] de [Nombre del Mes]: [Título Descriptivo de la Entrada]"; // e.g., "1 de enero: Nuevo Comienzo"
    jsonExampleStructure = `{
      "title": "Mi Diario Anual: 365 Días de Crecimiento enfocado en ${objectivesString}",
      "themes": [
        {
          "theme": "Enero",
          "subChapters": [
            { "title": "1 de enero: Reflexión del Amanecer", "description": "Iniciando el año con intención." },
            { "title": "31 de enero: Cierre del Primer Mes", "description": "Balance y aprendizajes de enero." }
          ]
        }
      ],
      "cadence": "${cadenceDesc}"
    }`;
  }

  const heroJourneySpecifics = options.journalFormat === JournalFormat.HERO_JOURNEY 
    ? `La narrativa debe mostrar la evolución de este héroe a lo largo de los ${numEntries} pasos, enfrentando y superando dificultades basadas en su perfil y relacionadas con los objetivos centrales (${objectivesString}), aplicando principios de las tradiciones (${traditionsString}). Las descripciones de los subcapítulos deben contar esta historia progresiva, como una sinopsis continua.`
    : "";


  const prompt = `
    Por favor, genera un índice para un diario personalizado con las siguientes características:
    - Tradiciones/Filosofías: ${traditionsString}
    - Rol Vital: ${options.lifeRole}
    - Formato Preferido: ${options.journalFormat} (${cadenceDesc})
    - Objetivos Centrales: ${objectivesString}${heroProfileContext}

    Estructura del Índice:
    - Título General: Debe ser relevante para los objetivos centrales, el formato y el número de entradas. ${options.journalFormat === JournalFormat.HERO_JOURNEY ? "Si hay un perfil de héroe, el título puede reflejar su viaje." : ""}
    - ${themeStructurePrompt}
    - Nomenclatura de Temas: Sigue el formato: "${themeNamingConvention}".
    - Nomenclatura de Subcapítulos: Cada subcapítulo (entrada) debe seguir: "${entryNamingConvention}".
    - Contenido de Subcapítulos: Puntos de reflexión, conceptos clave, ejercicios prácticos (o hitos narrativos para Camino del Héroe), distintos y con progresión.
    - Descripción de Subcapítulos: "title" y "description" (1-3 frases concisas). ${options.journalFormat === JournalFormat.HERO_JOURNEY ? "Para el Camino del Héroe, la descripción es una sinopsis que avanza la historia." : ""}
    ${heroJourneySpecifics}

    Responde ÚNICAMENTE con un objeto JSON que siga la estructura del ejemplo. Asegúrate de que el JSON sea válido.
    El número total de subcapítulos en TODO el JSON DEBE SER EXACTAMENTE ${numEntries}.
    ${options.journalFormat === JournalFormat.YEARLY_FULL_365_DAYS ? 'Debe haber EXACTAMENTE 12 temas (meses).' : ''}
    Ejemplo de estructura JSON (contenido original y adaptado al formato):
    ${jsonExampleStructure}
    No incluyas texto fuera del JSON.
  `;

  try {
    const response: GenerateContentResponse = await getAiClient().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    
    const journalIndex = parseJsonFromText<JournalIndex>(response.text);
    
    if (!journalIndex) {
        console.warn("AI response for index was not valid JSON. AI Response:", response.text);
        throw new Error("La respuesta de la IA para el índice no pudo ser interpretada como JSON válido. Original: " + response.text.substring(0,100) + "...");
    }

    if (!journalIndex.title || typeof journalIndex.title !== 'string' || journalIndex.title.trim() === "") {
        console.warn("Generated index is missing a valid title. AI Response:", response.text, "Parsed:", journalIndex);
        throw new Error("El índice generado por la IA no tiene un título válido.");
    }

    if (!journalIndex.themes || !Array.isArray(journalIndex.themes) || journalIndex.themes.length === 0 ||
        journalIndex.themes.some(theme => 
            !theme || typeof theme.theme !== 'string' || theme.theme.trim() === '' ||
            !theme.subChapters || !Array.isArray(theme.subChapters) || theme.subChapters.length === 0 ||
            theme.subChapters.some((sc: JournalSubChapter) => !sc || typeof sc.title !== 'string' || sc.title.trim() === '' || (sc.description && typeof sc.description !== 'string') || (options.journalFormat === JournalFormat.HERO_JOURNEY && (!sc.description || sc.description.trim() === '')))
        )) {
        console.warn("Generated index has invalid themes or subchapters structure. AI Response:", response.text, "Parsed:", journalIndex);
        let errorDetail = "El índice generado por la IA está incompleto o mal estructurado (faltan temas, subcapítulos o sus títulos/descripciones son inválidos).";
        if (options.journalFormat === JournalFormat.HERO_JOURNEY) {
            errorDetail += " Para el 'Camino del Héroe', cada paso debe tener una descripción (sinopsis).";
        }
        throw new Error(errorDetail);
    }
    
    if (options.journalFormat === JournalFormat.YEARLY_FULL_365_DAYS) {
        if (journalIndex.themes.length !== 12) {
            console.warn(`Generated yearly index has ${journalIndex.themes.length} themes, but 12 were expected. AI Response:`, response.text, "Parsed:", journalIndex);
            throw new Error(`El diario anual debe tener 12 temas (meses), pero se generaron ${journalIndex.themes.length}.`);
        }
    }

    const totalSubChapters = journalIndex.themes.reduce((acc, theme) => acc + (theme.subChapters?.length || 0), 0);
    if (totalSubChapters !== numEntries) {
        console.warn(`Generated index has ${totalSubChapters} subChapters, but ${numEntries} were expected. AI Response:`, response.text, "Parsed:", journalIndex);
        throw new Error(`El índice generado por la IA tiene un número incorrecto de entradas (${totalSubChapters} en lugar de ${numEntries}).`);
    }
    
    if (typeof journalIndex.cadence !== 'string' || journalIndex.cadence.trim() === '') {
        console.warn("Generated index is missing a cadence description. AI Response:", response.text, "Parsed:", journalIndex);
        journalIndex.cadence = cadenceDesc;
    }


    return journalIndex;

  } catch (error: any) {
    console.error("Error in generateJournalIndex:", error);
    const specificMessage = error.message || "No se proporcionaron detalles específicos del error.";
    if (error.message && (error.message.startsWith("La respuesta de la IA") || error.message.startsWith("El índice generado por la IA") || error.message.startsWith("El diario anual debe tener"))) {
        throw error; 
    }
    throw new Error(`Error de comunicación o procesamiento con la IA al generar el índice: ${specificMessage}`);
  }
};

const getMainContentPrompt = (contentType: EntryContentType, subChapterTitle: string, lifeRole: LifeRole | string, subChapterDescription?: string, heroProfile?: string): string => {
  const descriptionContext = subChapterDescription ? ` Basado en la descripción/sinopsis: "${subChapterDescription}".` : "";
  const heroContext = heroProfile ? ` El héroe es: "${heroProfile}".` : "";
  let contentSpecificInstruction = "";

  switch (contentType) {
    case EntryContentType.INSPIRATIONAL_NARRATIVE:
      contentSpecificInstruction = `Una narrativa inspiradora (fábula, cuento, parábola moderna) de aprox. 400-800 palabras, relacionada con '${subChapterTitle}'${descriptionContext}${heroContext} y relevante para ${lifeRole}. Si es parte de un 'Camino del Héroe', la narrativa debe avanzar la historia del héroe.`;
      break;
    case EntryContentType.HISTORICAL_ANECDOTE:
      contentSpecificInstruction = `Una anécdota histórica (o anécdotas relacionadas) relevante, amena, e inspiradora (aprox. 400-800 palabras) que ilustre principios o lecciones sobre '${subChapterTitle}'${descriptionContext}${heroContext}, aplicable a ${lifeRole}.`;
      break;
    case EntryContentType.PHILOSOPHICAL_EXPLORATION:
      contentSpecificInstruction = `Una exploración filosófica un profunda (aprox. 400-800 palabras) sobre '${subChapterTitle}'${descriptionContext}${heroContext}, ofreciendo perspectivas o reflexiones que conecten con ${lifeRole} y las tradiciones del diario.`;
      break;
    case EntryContentType.CONCISE_COMMENTARY:
    default:
      contentSpecificInstruction = `Un micro-comentario de aprox. 120-150 palabras, conectando la "chispa" o '${subChapterTitle}'${descriptionContext}${heroContext} con la vida diaria del rol vital ('${lifeRole}'). Si es 'Camino del Héroe', debe reflejar el estado o aprendizaje del héroe en ese paso.`;
  }
  return `"mainContent": "${contentSpecificInstruction} El contenido debe estar formateado usando Markdown (negritas con **, itálicas con *, listas con - o * al inicio de línea, y párrafos separados por doble salto de línea)."`;
};

export const generateJournalEntry = async (
  options: PersonalizationOptions,
  themeTitle: string,
  subChapterTitle: string,
  subChapterDescription?: string 
): Promise<JournalEntryContent | null> => {
  
  const entryContentType = options.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;
  const mainContentInstruction = getMainContentPrompt(entryContentType, subChapterTitle, options.lifeRole, subChapterDescription, options.heroProfile);
  const traditionsString = options.traditions.map(t => `"${t}"`).join(", ");
  const objectivesString = options.centralObjectives.map(o => `"${o}"`).join(", ");
  const heroContextForPrompt = options.journalFormat === JournalFormat.HERO_JOURNEY && options.heroProfile 
    ? `\n    - Perfil del Héroe: ${options.heroProfile}. La entrada debe reflejar su progreso y estado en este punto de su viaje.` 
    : "";


  let jsonStructureExample = `
    {
      "spark": {
        "quote": "Cita inspiradora...",
        "author": "Autor de la cita (opcional)"
      },
      "entryContentType": "${entryContentType}",
      "mainContent": "Texto principal aquí usando **Markdown**. Por ejemplo, un párrafo.\\n\\nOtro párrafo con *texto en itálica*.\\n- Un elemento de lista.\\n- Otro elemento.",
      "journalQuestion": "¿Pregunta de reflexión...?",
      "miniChallenge": "Mini-reto práctico..."
    }`;

  let illustrationPromptPart = "";
  if (options.generateIllustrations) {
    illustrationPromptPart = `
    6.  "brief_visual_description_for_illustration": Una descripción concisa (máximo 20-25 palabras) para generar una imagen de acompañamiento visualmente atractiva y conceptualmente relevante para '${subChapterTitle}'. Ejemplo: "un camino iluminado ascendiendo una montaña brumosa al amanecer, estilo pintura digital evocadora". Esta descripción NO debe ser una pregunta, sino una directiva para un generador de imágenes.`;
    
    jsonStructureExample = `
    {
      "spark": {
        "quote": "Cita inspiradora...",
        "author": "Autor de la cita (opcional)"
      },
      "entryContentType": "${entryContentType}",
      "mainContent": "Texto principal en **Markdown**...",
      "journalQuestion": "¿Pregunta de reflexión...?",
      "miniChallenge": "Mini-reto práctico...",
      "brief_visual_description_for_illustration": "Descripción concisa para la ilustración (ej. 'persona meditando bajo un árbol florido, estilo acuarela suave')."
    }`;
  }
  
  const prompt = `
    Por favor, genera el contenido para una entrada de diario personalizada con las siguientes características:
    - Tradiciones/Filosofías base: ${traditionsString}
    - Rol Vital del usuario: ${options.lifeRole}
    - Objetivos Centrales del diario: ${objectivesString}
    - Formato General: ${options.journalFormat}
    - Tema Actual: ${themeTitle}
    - Subcapítulo/Entrada Específica: ${subChapterTitle}
    ${subChapterDescription ? `- Descripción/Sinopsis del Subcapítulo: ${subChapterDescription}` : ''}${heroContextForPrompt}
    - Tipo de Contenido Principal Solicitado: ${entryContentType}
    - Incluir ilustración: ${options.generateIllustrations ? 'Sí' : 'No'}

    La entrada debe incluir los siguientes bloques, manteniendo coherencia con el tema, los objetivos, las tradiciones y, si aplica, la narrativa del héroe.
    1.  "spark": Una cita inspiradora (quote) y opcionalmente su autor (author).
    2.  "entryContentType": Debe ser exactamente "${entryContentType}".
    3.  ${mainContentInstruction}
    4.  "journalQuestion": Una pregunta de diario introspectiva, conectada con el mainContent y el subcapítulo.
    5.  "miniChallenge": Un mini-reto práctico o ejercicio breve y accionable, relacionado.
    ${illustrationPromptPart}

    Responde ÚNICAMENTE con un objeto JSON que siga esta estructura:
    ${jsonStructureExample}
    Asegúrate de que el JSON sea válido y completo. No incluyas explicaciones adicionales fuera del JSON.
  `;

  const fallbackEntryContent: JournalEntryContent = {
    spark: { quote: "La adaptabilidad es clave.", author: "Sabiduría Universal (Fallback)" },
    entryContentType: entryContentType,
    mainContent: `En tu rol de ${options.lifeRole}, enfrentar '${subChapterTitle.toLowerCase()}'${subChapterDescription ? ` (descrito como '${subChapterDescription.toLowerCase()}')` : ''} requiere flexibilidad. Considera cómo pequeños ajustes en tu perspectiva o acciones pueden alinearse mejor con tus objetivos de ${options.centralObjectives.join(', ')}. (Contenido de respaldo para tipo: ${entryContentType})`,
    journalQuestion: `¿Cómo puedes aplicar el concepto de '${subChapterTitle}' a un desafío específico que enfrentas como ${options.lifeRole} esta semana/día, en relación a tus objetivos?`,
    miniChallenge: `Dedica 5 minutos hoy a planificar conscientemente cómo abordarás un aspecto de '${subChapterTitle}'.`,
    illustrationUrl: undefined,
    isFallbackContent: true, 
  };

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const textResponse: GenerateContentResponse = await getAiClient().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      const parsedInternalContent = parseJsonFromText<JournalEntryContentInternal>(textResponse.text);

      if (!parsedInternalContent || !parsedInternalContent.spark || !parsedInternalContent.mainContent || !parsedInternalContent.journalQuestion || !parsedInternalContent.miniChallenge || !parsedInternalContent.entryContentType) {
          console.warn(`Attempt ${attempt + 1}/${MAX_RETRIES}: Generated entry content is invalid or incomplete. AI Response:`, textResponse.text, "Parsed:", parsedInternalContent);
          if (attempt + 1 >= MAX_RETRIES) {
            console.error("All retry attempts failed for parsing/validation. Using fallback.");
            return { ...fallbackEntryContent, isFallbackContent: true };
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500 + Math.random() * 500));
          continue; 
      }
      
      if (parsedInternalContent.entryContentType !== entryContentType) {
          console.warn(`AI returned type ${parsedInternalContent.entryContentType} but ${entryContentType} was requested. Correcting.`);
          parsedInternalContent.entryContentType = entryContentType; 
      }

      let finalEntryContent: JournalEntryContent = {
          spark: parsedInternalContent.spark,
          entryContentType: parsedInternalContent.entryContentType,
          mainContent: parsedInternalContent.mainContent, 
          journalQuestion: parsedInternalContent.journalQuestion,
          miniChallenge: parsedInternalContent.miniChallenge,
          illustrationUrl: undefined,
          isFallbackContent: false, 
      };

      if (options.generateIllustrations && parsedInternalContent.brief_visual_description_for_illustration) {
        try {
          const imageResponse = await getAiClient().models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: parsedInternalContent.brief_visual_description_for_illustration,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
          });
          
          if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
            finalEntryContent.illustrationUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
          } else {
            console.warn("Image generation did not return any images for prompt:", parsedInternalContent.brief_visual_description_for_illustration);
          }
        } catch (imageError) {
          console.error(`Attempt ${attempt + 1}/${MAX_RETRIES}: Error generating image:`, imageError, "Prompt:", parsedInternalContent.brief_visual_description_for_illustration);
        }
      }
      return finalEntryContent; 

    } catch (error: any) {
      attempt++;
      console.error(`Attempt ${attempt}/${MAX_RETRIES} failed for generateJournalEntry text content (error type: ${error.name || 'UnknownError'}):`, error.message || error);
      
      if (attempt >= MAX_RETRIES) {
        console.error("All retry attempts failed. Using fallback content.");
        return { 
            ...fallbackEntryContent, 
            spark: { quote: "El progreso, no la perfección, es la meta.", author: "Proverbio (Fallback)" },
            mainContent: `Al trabajar en '${subChapterTitle}' como ${options.lifeRole}, recuerda que cada paso cuenta. No te desanimes por los contratiempos. (Contenido de respaldo para tipo: ${entryContentType} tras ${MAX_RETRIES} intentos fallidos)`,
            isFallbackContent: true,
        };
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500 + Math.random() * 500));
    }
  }
  console.error("Exited retry loop unexpectedly. Using fallback.");
  return { ...fallbackEntryContent, isFallbackContent: true }; 
};


export interface CoverImageDetails {
  title: string;
  traditions: (Tradition | string)[];
  lifeRole: LifeRole | string;
  centralObjectives: (CentralObjective | string)[];
  heroProfile?: string; 
  journalFormat?: JournalFormat;
}

export const generateCoverImageForJournal = async (details: CoverImageDetails): Promise<string | undefined> => {
  const traditionsString = details.traditions.map(t => `"${t}"`).join(", ");
  const objectivesString = details.centralObjectives.map(o => `"${o}"`).join(", ");
  const heroContext = details.heroProfile && details.journalFormat === JournalFormat.HERO_JOURNEY 
    ? `\n    - Perfil del Héroe: ${details.heroProfile}` 
    : "";
  const formatContext = details.journalFormat ? `\n    - Formato: ${details.journalFormat}` : "";


  const promptForImageDescription = `
    Eres un asistente creativo especializado en generar prompts para un modelo de IA de generación de imágenes.
    Tu tarea es crear una descripción visual concisa (15-25 palabras) para la portada de un diario personalizado.
    La imagen debe ser simbólica, estéticamente agradable y reflejar la esencia del diario sin incluir texto.
    Debe ser adecuada para el modelo 'imagen-3.0-generate-002'.

    Detalles del diario:
    - Título: "${details.title}"
    - Tradiciones/Filosofías: ${traditionsString}
    - Rol Vital: ${details.lifeRole}
    - Objetivos Centrales: ${objectivesString}${formatContext}${heroContext}

    Ejemplos de descripciones visuales:
    - "Un sendero serpenteante iluminado por el sol naciente entre montañas neblinosas, arte digital evocador."
    - "Un árbol solitario pero robusto con raíces profundas bajo un cielo estrellado, estilo pintura al óleo."
    - "Manos sosteniendo una brújula brillante que apunta hacia un horizonte de infinitas posibilidades, acuarela suave."
    ${details.journalFormat === JournalFormat.HERO_JOURNEY ? `- "Un héroe/heroína silueteado en la cima de una montaña, mirando un vasto paisaje al amanecer, estilo épico fantástico."` : ""}
    Genera ÚNICAMENTE la descripción visual para la portada. No incluyas saludos, explicaciones, ni la palabra "descripción".
  `;

  try {
    const descriptionResponse: GenerateContentResponse = await getAiClient().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: promptForImageDescription,
    });
    const imagePrompt = descriptionResponse.text.trim();

    if (!imagePrompt) {
      console.warn("Could not generate an image prompt for the cover.");
      return undefined;
    }
     console.log("Generated cover image prompt:", imagePrompt);

    const imageResponse = await getAiClient().models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: imagePrompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
      const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.warn("Cover image generation did not return any images for prompt:", imagePrompt);
      return undefined;
    }
  } catch (error) {
    console.error("Error generating cover image for journal:", error);
    return undefined;
  }
};

interface IllustrationDescriptionResponse {
    brief_visual_description_for_illustration: string;
}

export const generateIllustrationFromEntryContent = async (
    entryData: { mainContent: string, subChapterTitle: string, themeTitle: string },
    options: PersonalizationOptions
): Promise<{ illustrationUrl?: string }> => {
    const traditionsString = options.traditions.map(t => `"${t}"`).join(", ");
    const objectivesString = options.centralObjectives.map(o => `"${o}"`).join(", ");
    const heroContext = options.heroProfile && options.journalFormat === JournalFormat.HERO_JOURNEY 
    ? `\n    - Perfil del Héroe (para contexto de la ilustración): ${options.heroProfile}` 
    : "";
    
    const promptForVisualDesc = `
    Basado en el siguiente contenido de una entrada de diario, su título y tema, genera una descripción visual concisa (15-25 palabras) para una ilustración.
    La descripción debe ser adecuada para un modelo de generación de imágenes como 'imagen-3.0-generate-002'.
    Debe ser simbólica y conceptualmente relevante. NO debe ser una pregunta.
    
    Detalles de la Entrada:
    - Título de la Entrada: "${entryData.subChapterTitle}"
    - Tema General: "${entryData.themeTitle}"
    - Contenido Principal de la Entrada (puede ser Markdown): """${entryData.mainContent}"""
    
    Contexto del Diario:
    - Rol Vital del Usuario: ${options.lifeRole}
    - Objetivos Centrales: ${objectivesString}
    - Tradiciones/Filosofías: ${traditionsString}
    - Formato del Diario: ${options.journalFormat}${heroContext}

    Ejemplos de descripciones visuales:
    - "Una persona alcanzando una estrella brillante en un cielo nocturno sereno, arte digital evocador."
    - "Un libro antiguo abierto con luz emanando de sus páginas, sobre un escritorio de madera rústico."
    - "Un delicado brote verde surgiendo de tierra agrietada, simbolizando esperanza y renovación."
    ${options.journalFormat === JournalFormat.HERO_JOURNEY ? `- "La silueta de [descripción breve del héroe si está en el perfil] enfrentando [un elemento del subcapítulo], estilo fantasía conceptual."` : ""}

    Responde ÚNICAMENTE con un objeto JSON que siga esta estructura:
    {
      "brief_visual_description_for_illustration": "Tu descripción concisa aquí..."
    }
    No incluyas explicaciones adicionales fuera del JSON.
    `;

    try {
        const descriptionResponseGen: GenerateContentResponse = await getAiClient().models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: promptForVisualDesc,
            config: { responseMimeType: "application/json" },
        });

        const parsedDesc = parseJsonFromText<IllustrationDescriptionResponse>(descriptionResponseGen.text);

        if (!parsedDesc || !parsedDesc.brief_visual_description_for_illustration) {
            console.warn("Could not generate a visual description for the illustration. AI Response:", descriptionResponseGen.text);
            return { illustrationUrl: undefined };
        }

        const imagePrompt = parsedDesc.brief_visual_description_for_illustration;
        console.log("Generated visual description for illustration:", imagePrompt);

        const imageResponse = await getAiClient().models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: imagePrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
            return { illustrationUrl: `data:image/jpeg;base64,${base64ImageBytes}` };
        } else {
            console.warn("Illustration generation (from entry content) did not return any images for prompt:", imagePrompt);
            return { illustrationUrl: undefined };
        }

    } catch (error) {
        console.error("Error generating illustration from entry content:", error);
        return { illustrationUrl: undefined };
    }
};
