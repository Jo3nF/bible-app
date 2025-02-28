loadTranslations = async () => {
  try {
    // Your existing code to load translations
    
    // Add validation step
    const selectedTranslationId = await AsyncStorage.getItem('selectedBibleId');
    
    if (selectedTranslationId) {
      // Verify the translation exists before using it
      const translationExists = availableTranslations.some(
        t => t.id === selectedTranslationId
      );
      
      if (!translationExists) {
        // If the saved translation doesn't exist, reset to default
        console.warn(`Saved translation ID ${selectedTranslationId} not found. Using default.`);
        await AsyncStorage.setItem('selectedBibleId', 'kjv');
        // Notify user if appropriate
      }
    }
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}; 