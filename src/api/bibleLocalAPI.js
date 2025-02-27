import AsyncStorage from '@react-native-async-storage/async-storage';
import BibleApi from './apiClient'; // Import the existing API

// Curated list of Bible translations (Spanish and English)
export const BIBLE_TRANSLATIONS = [
  { id: '592420522e16049f-01', name: 'Reina-Valera 1909', language: 'Spanish', abbreviation: 'RVR1909' },
  { id: '5e26f90e7c5a4d2d-01', name: 'Nueva Versión Internacional', language: 'Spanish', abbreviation: 'NVI' },
  { id: '55ec3a9cb2b8fa31-01', name: 'King James Version', language: 'English', abbreviation: 'KJV' },
  { id: '9879dbb7cfe39e4d-01', name: 'English Standard Version', language: 'English', abbreviation: 'ESV' },
  { id: '151c3503dd6c6abc-01', name: 'New Living Translation', language: 'English', abbreviation: 'NLT' }
];

// Map of Bible IDs to their working status
// We'll start by assuming only Reina-Valera 1909 is known to work
const WORKING_BIBLE_IDS = {
  '592420522e16049f-01': true, // Reina-Valera 1909 is confirmed working
};

// Enhanced Bible API with fallback mechanisms
const EnhancedBibleApi = {
  // Keep track of which translations work
  translationStatus: {},
  
  // Get available translations (only return verified working ones)
  getAvailableTranslations: () => {
    // Filter to only show translations that have been verified to work
    return BIBLE_TRANSLATIONS.filter(translation => 
      WORKING_BIBLE_IDS[translation.id] === true
    );
  },
  
  // Get all translations for admin/testing purposes
  getAllTranslations: () => {
    return BIBLE_TRANSLATIONS;
  },
  
  // Verify if a translation works and mark it as working
  verifyTranslation: async (bibleId) => {
    try {
      // Set the Bible ID temporarily
      await BibleApi.setBibleId(bibleId);
      
      // Try to fetch books - if this succeeds, the translation works
      await BibleApi.getBooks();
      
      // Mark as working
      WORKING_BIBLE_IDS[bibleId] = true;
      console.log(`Translation ${bibleId} verified and working`);
      return true;
    } catch (error) {
      console.warn(`Translation ${bibleId} failed verification:`, error);
      WORKING_BIBLE_IDS[bibleId] = false;
      return false;
    } finally {
      // Revert to a known working translation
      for (const id in WORKING_BIBLE_IDS) {
        if (WORKING_BIBLE_IDS[id]) {
          await BibleApi.setBibleId(id);
          break;
        }
      }
    }
  },
  
  // Automatically verify all translations
  verifyAllTranslations: async () => {
    console.log("Starting translation verification...");
    const results = {};
    
    for (const translation of BIBLE_TRANSLATIONS) {
      results[translation.id] = await EnhancedBibleApi.verifyTranslation(translation.id);
    }
    
    console.log("Translation verification complete:", results);
    
    // Save verification results
    try {
      await AsyncStorage.setItem('VERIFIED_TRANSLATIONS', JSON.stringify(WORKING_BIBLE_IDS));
    } catch (error) {
      console.error('Error saving verification results:', error);
    }
    
    return results;
  },
  
  // Get current translation
  getCurrentTranslation: () => {
    const currentTranslation = BibleApi.getCurrentTranslation();
    if (currentTranslation && WORKING_BIBLE_IDS[currentTranslation.id]) {
      return currentTranslation;
    }
    
    // If current translation isn't working, return the first working one
    for (const translation of BIBLE_TRANSLATIONS) {
      if (WORKING_BIBLE_IDS[translation.id]) {
        return translation;
      }
    }
    
    // Fallback to the first translation in the list
    return BIBLE_TRANSLATIONS[0];
  },
  
  // Set translation by ID with validation
  setBibleId: async (bibleId) => {
    // Only allow setting translations that are known to work
    if (WORKING_BIBLE_IDS[bibleId]) {
      return await BibleApi.setBibleId(bibleId);
    } else {
      console.warn(`Cannot set translation ${bibleId} as it is not verified to work`);
      return false;
    }
  },
  
  // Initialize preferences
  initializePreferences: async () => {
    // First, load any saved verification results
    try {
      const savedResults = await AsyncStorage.getItem('VERIFIED_TRANSLATIONS');
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        Object.assign(WORKING_BIBLE_IDS, parsedResults);
      }
    } catch (error) {
      console.error('Error loading translation verification results:', error);
    }
    
    await BibleApi.initializePreferences();
    
    // Get current translation and verify it works
    const currentTranslation = BibleApi.getCurrentTranslation();
    if (currentTranslation && !WORKING_BIBLE_IDS[currentTranslation.id]) {
      try {
        await EnhancedBibleApi.verifyTranslation(currentTranslation.id);
      } catch (error) {
        // If current translation doesn't work, switch to a known working one
        for (const id in WORKING_BIBLE_IDS) {
          if (WORKING_BIBLE_IDS[id]) {
            await BibleApi.setBibleId(id);
            break;
          }
        }
      }
    }
  },
  
  // Get all books with error handling
  getBooks: async () => {
    try {
      const books = await BibleApi.getBooks();
      // If we successfully got books, mark this translation as working
      const currentTranslation = BibleApi.getCurrentTranslation();
      if (currentTranslation) {
        WORKING_BIBLE_IDS[currentTranslation.id] = true;
        EnhancedBibleApi.translationStatus[currentTranslation.id] = { status: 'working' };
      }
      return books;
    } catch (error) {
      // Mark this translation as failed
      const currentTranslation = BibleApi.getCurrentTranslation();
      if (currentTranslation) {
        EnhancedBibleApi.translationStatus[currentTranslation.id] = { status: 'failed', error };
      }
      
      // Try to switch to a working translation
      let switched = false;
      for (const id in WORKING_BIBLE_IDS) {
        if (WORKING_BIBLE_IDS[id]) {
          await BibleApi.setBibleId(id);
          switched = true;
          break;
        }
      }
      
      if (switched) {
        // Try again with the new translation
        return await BibleApi.getBooks();
      } else {
        throw new Error('No working Bible translations found');
      }
    }
  },
  
  // Get all chapters for a specific book
  getChapters: async (bookId) => {
    try {
      return await BibleApi.getChapters(bookId);
    } catch (error) {
      console.error(`Error fetching chapters for book ${bookId}:`, error);
      
      // If this is a new API error, try switching translations
      const currentTranslation = BibleApi.getCurrentTranslation();
      if (currentTranslation && 
          (EnhancedBibleApi.translationStatus[currentTranslation.id]?.status !== 'failed')) {
        
        EnhancedBibleApi.translationStatus[currentTranslation.id] = { status: 'failed', error };
        
        // Try to switch to a working translation
        for (const id in WORKING_BIBLE_IDS) {
          if (WORKING_BIBLE_IDS[id]) {
            await BibleApi.setBibleId(id);
            
            // Try again with new translation
            const books = await BibleApi.getBooks();
            const matchingBook = books.find(b => 
              b.id.toLowerCase() === bookId.toLowerCase() ||
              b.name.toLowerCase().includes(bookId.toLowerCase())
            );
            
            if (matchingBook) {
              return await BibleApi.getChapters(matchingBook.id);
            }
            
            break;
          }
        }
      }
      
      // If all else fails, return empty array instead of throwing
      return [];
    }
  },
  
  // Passthrough methods with error handling
  getChapterContent: async (bookId, chapterId) => {
    try {
      return await BibleApi.getChapterContent(bookId, chapterId);
    } catch (error) {
      console.error(`Error fetching content for chapter ${chapterId}:`, error);
      return { content: "Sorry, this content is not available." };
    }
  },
  
  searchBible: async (query) => {
    try {
      return await BibleApi.searchBible(query);
    } catch (error) {
      console.error('Bible search error:', error);
      return { verses: [] };
    }
  },
  
  getVerse: async (verseId) => {
    try {
      return await BibleApi.getVerse(verseId);
    } catch (error) {
      console.error(`Error fetching verse ${verseId}:`, error);
      return { text: "Verse not available" };
    }
  }
};

// Initialize preferences when app starts
EnhancedBibleApi.initializePreferences();

// Add auto-verification on load
setTimeout(() => {
  EnhancedBibleApi.verifyAllTranslations();
}, 2000); // Delay by 2 seconds to not block app startup

export default EnhancedBibleApi; 