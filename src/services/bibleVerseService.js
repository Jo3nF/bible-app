// Simplified Bible verse service that only uses Reina-Valera
export const fetchVerse = async (reference) => {
  try {
    // Use a Bible API that provides Reina-Valera text
    // Example: https://bible-api.com/john+3:16?translation=rvr1960
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=rvr1960`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch verse');
    }
    
    const data = await response.json();
    return {
      reference: data.reference,
      text: data.text,
      translation: 'Reina-Valera 1960'
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    throw error;
  }
}; 