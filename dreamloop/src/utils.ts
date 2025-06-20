// src/utils.ts

export const toRoman = (num: number): string => {
  if (num < 1 || num > 3999) return num.toString(); // Basic validation for typical use
  const romanNumerals: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let result = '';
  for (const key in romanNumerals) {
    while (num >= romanNumerals[key]) {
      result += key;
      num -= romanNumerals[key];
    }
  }
  return result;
};

export const formatChapterTitleForDisplay = (rawTitle: string | undefined, entryNumber: number): string => {
  const romanNumeral = toRoman(entryNumber);
  // Remove any existing "Capítulo N: " or "Capítulo N " prefixes, case-insensitive
  let cleanTitle = rawTitle 
    ? rawTitle.replace(/^Capítulo \d+:\s*/i, '').replace(/^Capítulo \d+\s*/i, '') 
    : '';
  
  // If after cleaning, the title is empty (e.g., it was only "Capítulo 5"), provide a fallback.
  if (!cleanTitle.trim()) {
    cleanTitle = `Entrada ${entryNumber}`; // Fallback if no specific title part was present
  }
  
  return `Capítulo ${romanNumeral}: ${cleanTitle}`;
};
