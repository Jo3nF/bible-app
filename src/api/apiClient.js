// src/api/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// You'll need to sign up for an API key from a Bible API provider
// Some options include:
// - API.Bible (https://scripture.api.bible/)
// - Bible API (https://bible-api.com/)
// - ESV API (https://api.esv.org/)

// Replace with your actual API key
const API_KEY = '1658ecd46c975dfb1eaca77265742f98'; // Your current key may have expired

// Base URL for the API
const BASE_URL = 'https://api.scripture.api.bible/v1';

// Available Bible translations
export const BIBLE_TRANSLATIONS = [
  { id: '592420522e16049f-01', name: 'Reina-Valera 1909', language: 'Spanish', abbreviation: 'RVR1909' },
  { id: '55ec3a9cb2b8fa31-01', name: 'King James Version', language: 'English', abbreviation: 'KJV' },
  { id: '06125adad2d5898a-01', name: 'La Bible du Semeur', language: 'French', abbreviation: 'BDS' },
  { id: '5e27207271ceb79d-01', name: 'Schlachter 2000', language: 'German', abbreviation: 'SCH2000' },
  { id: '13e2cdc533f5ff7f-01', name: 'Riveduta 1927', language: 'Italian', abbreviation: 'RIV1927' },
  { id: '23051dca5d3102fe-01', name: 'João Ferreira de Almeida Atualizada', language: 'Portuguese', abbreviation: 'JFA' },
  { id: '40072c4a5aba4022-01', name: 'Библия Синодальный перевод', language: 'Russian', abbreviation: 'SYNOD' },
  { id: '4a9effd4b16d4757-01', name: '中文和合本', language: 'Chinese', abbreviation: 'CUV' },
  { id: '7142879509583d59-01', name: '한국어 성경', language: 'Korean', abbreviation: 'KLB' },
  { id: '5b4f56b38e10bf3d-01', name: 'Almeida Revista e Corrigida', language: 'Portuguese', abbreviation: 'ARC' },
  { id: 'c315fa9f71d4af3a-01', name: 'Nueva Versión Internacional', language: 'Spanish', abbreviation: 'NVI' },
];

// Default to Reina-Valera 1909
let CURRENT_BIBLE_ID = '592420522e16049f-01';

// Create an axios instance for Bible API requests
const bibleApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'api-key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// Cache control
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Cache helpers
const cacheData = async (key, data) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

const getCachedData = async (key) => {
  try {
    const cachedItem = await AsyncStorage.getItem(key);
    if (!cachedItem) return null;
    
    const { data, timestamp } = JSON.parse(cachedItem);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
    
    return isExpired ? null : data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

// API Functions
const BibleApi = {
  // Get available translations
  getAvailableTranslations: () => {
    return BIBLE_TRANSLATIONS;
  },
  
  // Get current translation
  getCurrentTranslation: () => {
    return BIBLE_TRANSLATIONS.find(translation => translation.id === CURRENT_BIBLE_ID);
  },
  
  // Set translation by ID
  setBibleId: async (bibleId) => {
    // Verify the Bible ID is valid
    const isValidBible = BIBLE_TRANSLATIONS.some(translation => translation.id === bibleId);
    if (!isValidBible) {
      console.error(`Invalid Bible ID: ${bibleId}`);
      return false;
    }
    
    CURRENT_BIBLE_ID = bibleId;
    
    // Save the preference
    try {
      await AsyncStorage.setItem('PREFERRED_BIBLE_ID', bibleId);
    } catch (error) {
      console.error('Error saving Bible preference:', error);
    }
    
    return true;
  },
  
  // Initialize with saved preferences
  initializePreferences: async () => {
    try {
      const savedBibleId = await AsyncStorage.getItem('PREFERRED_BIBLE_ID');
      if (savedBibleId) {
        CURRENT_BIBLE_ID = savedBibleId;
      }
    } catch (error) {
      console.error('Error loading Bible preferences:', error);
    }
  },
  
  // Get all books in the Bible
  getBooks: async () => {
    const cacheKey = `bible_books_${CURRENT_BIBLE_ID}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) return cachedData;
    
    try {
      const response = await bibleApi.get(`/bibles/${CURRENT_BIBLE_ID}/books`);
      const books = response.data.data;
      console.log("API Books Response:", books);
      await cacheData(cacheKey, books);
      return books;
    } catch (error) {
      console.error('Error fetching Bible books:', error);
      throw error;
    }
  },
  
  // Get all chapters for a specific book
  getChapters: async (bookId) => {
    const cacheKey = `bible_chapters_${CURRENT_BIBLE_ID}_${bookId}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) return cachedData;
    
    try {
      const response = await bibleApi.get(`/bibles/${CURRENT_BIBLE_ID}/books/${bookId}/chapters`);
      const chapters = response.data.data;
      await cacheData(cacheKey, chapters);
      return chapters;
    } catch (error) {
      console.error(`Error fetching chapters for book ${bookId}:`, error);
      throw error;
    }
  },
  
  // Get content of a specific chapter
  getChapterContent: async (bookId, chapterId) => {
    const cacheKey = `bible_content_${CURRENT_BIBLE_ID}_${bookId}_${chapterId}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) return cachedData;
    
    try {
      const response = await bibleApi.get(
        `/bibles/${CURRENT_BIBLE_ID}/chapters/${chapterId}`, 
        { params: { 'content-type': 'text' } }
      );
      const content = response.data.data;
      await cacheData(cacheKey, content);
      return content;
    } catch (error) {
      console.error(`Error fetching content for chapter ${chapterId}:`, error);
      throw error;
    }
  },
  
  // Search the Bible for specific terms
  searchBible: async (query) => {
    if (!query || query.trim() === '') return { verses: [] };
    
    try {
      // First, try an exact word search
      const exactResponse = await bibleApi.get(
        `/bibles/${CURRENT_BIBLE_ID}/search`,
        { 
          params: { 
            query: `"${query}"`,  // Add quotes for exact phrase search
            limit: 20
          } 
        }
      );
      
      // If we get enough exact results, use those
      if (exactResponse.data.data.verses && exactResponse.data.data.verses.length >= 3) {
        return exactResponse.data.data;
      }
      
      // Otherwise, do a regular search but improve filtering
      const response = await bibleApi.get(
        `/bibles/${CURRENT_BIBLE_ID}/search`,
        { params: { query, limit: 20 } }
      );
      
      const results = response.data.data;
      
      // Filter out poor matches - look for matches where query words appear as whole words
      if (results.verses && results.verses.length > 0) {
        const queryWords = query.toLowerCase().split(/\s+/);
        
        // Create a simple relevance score
        results.verses = results.verses.map(verse => {
          // Check for whole word matches
          const lowerText = verse.text.toLowerCase();
          let relevanceScore = 0;
          
          queryWords.forEach(word => {
            // Look for word boundaries around the query term
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(lowerText)) {
              relevanceScore += 10; // Whole word match is worth more
            } else if (lowerText.includes(word)) {
              relevanceScore += 1;  // Partial match is worth less
            }
          });
          
          return { ...verse, relevanceScore };
        });
        
        // Filter out very poor matches and sort by relevance
        results.verses = results.verses
          .filter(verse => verse.relevanceScore > 0)
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
      
      return results;
    } catch (error) {
      console.error('Bible search error:', error);
      // Return empty results instead of throwing
      return { verses: [] };
    }
  },
  
  // Get a specific verse
  getVerse: async (verseId) => {
    const cacheKey = `bible_verse_${CURRENT_BIBLE_ID}_${verseId}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) return cachedData;
    
    try {
      const response = await bibleApi.get(
        `/bibles/${CURRENT_BIBLE_ID}/verses/${verseId}`,
        { params: { 'content-type': 'text' } }
      );
      const verse = response.data.data;
      await cacheData(cacheKey, verse);
      return verse;
    } catch (error) {
      console.error(`Error fetching verse ${verseId}:`, error);
      throw error;
    }
  },
  
  // Add this method to handle API failures gracefully
  handleApiError: async (error, fallbackData = null) => {
    console.error('Bible API error:', error);
    
    if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 403) {
        console.warn('API key may be invalid or expired. Please check your API key.');
      } else if (error.response.status === 429) {
        console.warn('Rate limit exceeded. Please try again later.');
      }
    }
    
    // Return fallback data if provided
    return fallbackData;
  },
};

// Initialize preferences when app starts
BibleApi.initializePreferences();

export default BibleApi;