// Map Bible translation IDs to language codes for speech
export const getLanguageCodeForTranslation = (translationId) => {
  const languageMap = {
    // Spanish translations
    '592420522e16049f-01': 'es-ES', // Reina-Valera 1909
    '5e26f90e7c5a4d2d-01': 'es-ES', // Nueva Versión Internacional
    
    // English translations
    '55ec3a9cb2b8fa31-01': 'en-US', // King James Version
    '9879dbb7cfe39e4d-01': 'en-US', // English Standard Version
    '151c3503dd6c6abc-01': 'en-US', // New Living Translation
    
    // Default to Spanish if unknown
    'default': 'es-ES',
  };
  
  return languageMap[translationId] || languageMap.default;
};

// Optional: Check if speech is available in the user's language
export const checkSpeechSupport = async (languageCode) => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some(voice => voice.language === languageCode);
  } catch (error) {
    console.error('Error checking speech support:', error);
    return true; // Assume support if we can't check
  }
};

// Add this to your speechUtils.js file
export const cleanBibleTextForReading = (text, language = 'es') => {
  if (!text) return '';
  
  // Base cleaning for all languages
  let cleanedText = text
    // Remove verse numbers like [1], [2], etc.
    .replace(/\[\d+\]/g, '')
    
    // Remove excessive whitespace and line breaks
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Language-specific cleaning
  if (language.startsWith('es')) {
    // Spanish-specific patterns
    cleanedText = cleanedText
      // Remove Spanish chapter headers (e.g., "Salmo de David.")
      .replace(/^([A-ZÁÉÍÓÚÑ][a-záéíóúüñ\s]+)\./gm, '')
      
      // Handle Spanish-specific abbreviations and formatting
      .replace(/([A-Z]\.)\s/g, '$1') // Fix abbreviations with periods
      .replace(/(\w+):(\w+)/g, '$1, $2'); // Replace colons with commas for better speech flow
  } 
  else if (language.startsWith('en')) {
    // English-specific patterns
    cleanedText = cleanedText
      // Remove English chapter headers (e.g., "A Psalm of David.")
      .replace(/^(A|The) [A-Z][a-z\s]+ of [A-Z][a-z]+\./gm, '')
      
      // Handle English-specific patterns
      .replace(/([A-Z]\.)\s/g, '$1');
  }
  
  return cleanedText;
}; 