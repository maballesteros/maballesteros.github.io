
// src/services/ApiKeyManager.ts

const API_KEY_STORAGE_KEY = 'dreamloop_gemini_api_key';

export const saveApiKey = (apiKey: string): void => {
  if (apiKey && apiKey.trim() !== "") {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
  } else {
    // If an empty key is provided, effectively clear it
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
};

export const loadApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const getApiKeyFromEnv = (): string | null => {
  // Access the API_KEY from the global window.process.env object set by env.js
  // Ensure robust checking in case window.process or window.process.env is not defined
  if (typeof window !== 'undefined' && 
      (window as any).process && 
      (window as any).process.env && 
      (window as any).process.env.API_KEY) {
    return (window as any).process.env.API_KEY;
  }
  return null;
};
