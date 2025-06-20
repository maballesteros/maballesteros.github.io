
import { GoogleGenAI, GenerateImagesResponse, GenerateContentResponse } from "@google/genai";
import { GEMINI_IMAGE_MODEL, GEMINI_TEXT_MODEL } from '../constants'; // Needs text model for safer prompt

let ai: GoogleGenAI | null = null;

export const initialize = (apiKey: string): boolean => {
  if (apiKey && apiKey.trim() !== "") {
    try {
      ai = new GoogleGenAI({ apiKey });
      console.log("GeminiImageService inicializado con API Key.");
      return true;
    } catch (error) {
      console.error("Error al inicializar GeminiImageService con API Key:", error);
      ai = null;
      return false;
    }
  } else {
    console.warn("GeminiImageService: API Key no proporcionada o vacía. El servicio no se inicializará.");
    ai = null;
    return false;
  }
};

export const isApiAvailable = (): boolean => !!ai;

const getSaferImagePrompt = async (originalPrompt: string, failureReason: string): Promise<string> => {
  if (!isApiAvailable() || !ai) { // Added !ai check for type safety
    // This function might be called by an image generation function that already checked isApiAvailable for itself,
    // but the text model might rely on a different service instance or state.
    // For now, assume the same 'ai' instance is used for text capabilities if needed by image service.
    // If GeminiTextService is distinct, this would need to call GeminiTextService.isApiAvailable() and its generateContent.
    // For this implementation, we assume the 'ai' instance here has text capabilities if GEMINI_TEXT_MODEL is used.
    // A more robust solution might involve passing the text-capable AI instance to this function or having a shared, initialized AI core.
    // However, the current prompt asks this service (GeminiImageService) to generate text for safer prompt.
    // This means the 'ai' instance initialized for images MUST also be capable of text generation with GEMINI_TEXT_MODEL.
    // This is generally true for GoogleGenAI instances.
    throw new Error("API de Gemini no inicializada para obtener prompt más seguro (necesario para la funcionalidad de texto).");
  }


  const modelInstruction = `El siguiente prompt para generación de imágenes fue bloqueado o causó un error (razón: ${failureReason}). Prompt original: "${originalPrompt}". 
Por favor, reescribe este prompt para que sea más seguro y cumpla con las políticas de contenido para generación de imágenes. 
Evita explícitamente cualquier tema relacionado con "Adolescent themes implied" o cualquier contenido que pueda ser interpretado como tal, incluso si esto significa desviar ligeramente la intención artística original hacia algo más simbólico, abstracto o neutral.
Mantén la intención artística y el tema central originales lo más posible, pero modifica cualquier elemento que pudiera ser problemático. 
Enfócate en la estética y el concepto de forma más abstracta, simbólica o metafórica si es necesario para evitar problemas.
Devuelve SOLAMENTE el prompt modificado como un string. No añadas explicaciones ni ningún otro texto.`;
  
  try {
    console.log(`[GeminiImageService] Solicitando prompt más seguro para: "${originalPrompt}" (Fallo: ${failureReason})`);
    const response: GenerateContentResponse = await ai.models.generateContent({ 
        model: GEMINI_TEXT_MODEL, 
        contents: modelInstruction,
        config: { temperature: 0.5 } 
    });
    const saferPrompt = response.text.trim().replace(/^["']|["']$/g, ''); 
    if (!saferPrompt) {
        throw new Error("La IA no generó un prompt modificado.");
    }
    console.log(`[GeminiImageService] Original prompt: "${originalPrompt}". Safer prompt generado: "${saferPrompt}"`);
    return saferPrompt;
  } catch (error) {
    console.error("[GeminiImageService] Error generando prompt más seguro:", error);
    throw new Error(`No se pudo generar un prompt modificado. ${error instanceof Error ? error.message : String(error)}`);
  }
};


export const generateImageFromDescription = async (description: string, worldName: string, imageContext: string): Promise<string | null> => {
  if (!isApiAvailable() || !ai) {
    console.error(`[GeminiImageService generateImageFromDescription - ${imageContext}] API de Gemini no inicializada o no disponible.`);
    throw new Error("API de Gemini (imágenes) no inicializada o no disponible.");
  }
  
  const originalPrompt = `Una imagen evocadora y artística que represente: "${description}". Estilo: digital painting, adecuado al mundo de '${worldName}'. Contexto: ${imageContext}. Temática adolescente si es relevante. Evita primeros planos de rostros si es sobre un personaje, enfócate en la escena o simbolismo.`;
  let currentPrompt = originalPrompt;
  let firstAttemptFailureReason = "";

  try {
    console.log(`[GeminiImageService] Attempt 1 (${imageContext}). Prompt: "${currentPrompt}"`);
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: currentPrompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;

    if (imageBytes && imageBytes.trim() !== "") {
      return `data:image/jpeg;base64,${imageBytes}`;
    }
    firstAttemptFailureReason = `La primera generación de imagen para "${imageContext}" no produjo datos válidos o fue bloqueada.`;
    console.warn(`[GeminiImageService] ${imageContext} (Attempt 1) failed: ${firstAttemptFailureReason}. Prompt: "${originalPrompt}".`);
  } catch (error: any) {
    firstAttemptFailureReason = error instanceof Error ? error.message : String(error);
    console.warn(`[GeminiImageService] ${imageContext} (Attempt 1) THREW: ${firstAttemptFailureReason}. Prompt: "${originalPrompt}".`);
  }

  console.warn(`[GeminiImageService] ${imageContext} (Attempt 1) failed. Reason: ${firstAttemptFailureReason}. Attempting safer prompt.`);
  try {
    currentPrompt = await getSaferImagePrompt(originalPrompt, firstAttemptFailureReason);
  } catch (saferPromptError: any) {
    const message = saferPromptError instanceof Error ? saferPromptError.message : String(saferPromptError);
    console.error(`[GeminiImageService ${imageContext}] Attempt 1 failed, and failed to get safer prompt: ${message}. Original prompt: "${originalPrompt}"`);
    return null; // Return null if safer prompt generation fails
  }
  
  try {
    console.log(`[GeminiImageService] Attempt 2 (${imageContext} - Safer). Prompt: "${currentPrompt}"`);
    const retryResponse: GenerateImagesResponse = await ai.models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: currentPrompt, 
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    const retryImageBytes = retryResponse?.generatedImages?.[0]?.image?.imageBytes;

    if (retryImageBytes && retryImageBytes.trim() !== "") {
      return `data:image/jpeg;base64,${retryImageBytes}`;
    }
    
    const retryFailureMessageLog = `La segunda generación de imagen para "${imageContext}" (con prompt seguro) tampoco produjo datos válidos.`;
    console.error(`[GeminiImageService ${imageContext}] Attempt 2 (Safer) also failed: ${retryFailureMessageLog}. Original Prompt: "${originalPrompt}", Safer Prompt: "${currentPrompt}"`);
    return null;
  } catch (retryError: any) {
    const retryFailureReasonFromCatch = retryError instanceof Error ? retryError.message : String(retryError);
    console.error(`[GeminiImageService ${imageContext}] Attempt 2 (Safer) THREW: ${retryFailureReasonFromCatch}. Original Prompt: "${originalPrompt}", Safer Prompt: "${currentPrompt}"`);
    return null;
  }
};

export const generateChapterDreamImage = async (playerReflection: string, worldName: string): Promise<string | null> => {
    if (!isApiAvailable() || !ai) {
        console.error("[GeminiImageService generateChapterDreamImage] API de Gemini no inicializada o no disponible.");
        throw new Error("API de Gemini (imágenes) no inicializada o no disponible.");
    }

    const originalPrompt = `Una imagen evocadora y onírica que capture la esencia de este consejo o reflexión para un héroe adolescente: "${playerReflection}". Estilo artístico: surrealista, etéreo, digital painting, conectado al mundo de '${worldName}'. Evita primeros planos de rostros si es sobre un personaje, enfócate en la escena o simbolismo.`;
    let currentPrompt = originalPrompt;
    let firstAttemptFailureReason = "";

    try {
        console.log(`[GeminiImageService] Attempt 1 (Chapter Dream). Prompt: "${currentPrompt}"`);
        const response: GenerateImagesResponse = await ai.models.generateImages({
            model: GEMINI_IMAGE_MODEL,
            prompt: currentPrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });
        const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;

        if (imageBytes && imageBytes.trim() !== "") {
            return `data:image/jpeg;base64,${imageBytes}`;
        }
        firstAttemptFailureReason = "La primera generación de imagen de capítulo no produjo datos válidos o fue bloqueada.";
        console.warn(`[GeminiImageService] Chapter Dream (Attempt 1) failed: ${firstAttemptFailureReason}. Prompt: "${originalPrompt}".`);
    } catch (error: any) {
        firstAttemptFailureReason = error instanceof Error ? error.message : String(error);
        console.warn(`[GeminiImageService] Chapter Dream (Attempt 1) THREW: ${firstAttemptFailureReason}. Prompt: "${originalPrompt}".`);
    }
        
    console.warn(`[GeminiImageService] Chapter Dream (Attempt 1) failed. Reason: ${firstAttemptFailureReason}. Attempting safer prompt.`);
    try {
        currentPrompt = await getSaferImagePrompt(originalPrompt, firstAttemptFailureReason);
    } catch (saferPromptError: any) {
        const message = saferPromptError instanceof Error ? saferPromptError.message : String(saferPromptError);
        console.error(`[GeminiImageService Chapter Dream] Attempt 1 failed, and failed to get safer prompt: ${message}. Original prompt: "${originalPrompt}"`);
        return null; // Return null if safer prompt generation fails
    }
            
    try {
        console.log(`[GeminiImageService] Attempt 2 (Chapter Dream - Safer). Prompt: "${currentPrompt}"`);
        const retryResponse: GenerateImagesResponse = await ai.models.generateImages({
            model: GEMINI_IMAGE_MODEL,
            prompt: currentPrompt, 
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });
        const retryImageBytes = retryResponse?.generatedImages?.[0]?.image?.imageBytes;

        if (retryImageBytes && retryImageBytes.trim() !== "") {
            return `data:image/jpeg;base64,${retryImageBytes}`;
        }
        
        const retryFailureMessageLog = "La segunda generación de imagen de capítulo (con prompt seguro) tampoco produjo datos válidos.";
        console.error(`[GeminiImageService Chapter Dream] Attempt 2 (Safer) also failed: ${retryFailureMessageLog}. Original Prompt: "${originalPrompt}", Safer Prompt: "${currentPrompt}"`);
        return null;
    } catch (retryError: any) {
        const retryFailureReasonFromCatch = retryError instanceof Error ? retryError.message : String(retryError);
        console.error(`[GeminiImageService Chapter Dream] Attempt 2 (Safer) THREW: ${retryFailureReasonFromCatch}. Original Prompt: "${originalPrompt}", Safer Prompt: "${currentPrompt}"`);
        return null;
    }
};
