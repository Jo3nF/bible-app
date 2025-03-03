import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

// Define Bible translations
export const BIBLE_TRANSLATIONS = [
  { id: '592420522e16049f-01', name: 'Reina-Valera 1909', language: 'Spanish', abbreviation: 'RVR1909' },
];

// Hardcoded Bible ID - no need to change this
const BIBLE_ID = '592420522e16049f-01';

// Current translation ID
let CURRENT_BIBLE_ID = BIBLE_ID;

// Get current translation
export const getCurrentTranslation = () => {
  return BIBLE_TRANSLATIONS.find(translation => translation.id === CURRENT_BIBLE_ID);
};

// Set translation by ID
export const setBibleId = (bibleId) => {
  CURRENT_BIBLE_ID = bibleId;
  return true;
};

// Create simpler Bible API - do NOT use default export inside an object
// Export each function individually instead
export const initialize = async () => {
  console.log('Initializing Bible API (simplified)');
  return true;
};

// Simple cache
export const cache = {
  books: {},
  chapters: {},
  verses: {},
};

// Make API requests directly with full URLs
export const makeApiRequest = async (endpoint, params = {}) => {
  try {
    // Build a direct URL that exactly matches what works in the browser
    let url = `https://bible-api-proxy.vercel.app/api/bibles?path=${endpoint}`;
    
    // Log request details
    console.log(`API Request: ${url}`);
    console.log('Params:', params);
    
    // Make the request
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// Get books (renamed to match the expected function name)
export const getBooks = async () => {
  try {
    console.log("Getting Bible books...");
    const response = await makeApiRequest(`bibles/${CURRENT_BIBLE_ID}/books`);
    console.log("Raw books response:", response);
    
    // Make sure to return the data array in a consistent format
    const books = response.data || [];
    
    // Log the actual data we're returning
    console.log(`Found ${books.length} books`);
    
    return {
      data: books
    };
  } catch (error) {
    console.error('Error fetching Bible books:', error.message);
    return { data: [] };
  }
};

// Alias for getBibleBooks for backward compatibility
export const getBibleBooks = async () => {
  return getBooks();
};

// Added the missing getChapters function
export const getChapters = async (bookId) => {
  try {
    console.log(`Getting chapters for book: ${bookId}`);
    const response = await makeApiRequest(`bibles/${CURRENT_BIBLE_ID}/books/${bookId}/chapters`);
    
    const chapters = response.data || [];
    console.log(`Found ${chapters.length} chapters for book ${bookId}`);
    
    return chapters;
  } catch (error) {
    console.error(`Error fetching chapters for book ${bookId}:`, error.message);
    return [];
  }
};

// Get verses (simplified)
export const getChapterVerses = async (chapterId) => {
  try {
    const data = await makeApiRequest(`bibles/${CURRENT_BIBLE_ID}/chapters/${chapterId}/verses`);
    return data;
  } catch (error) {
    console.error('Error fetching verses:', error.message);
    return { data: [] };
  }
};

// Get verse content (simplified)
export const getVerseContent = async (verseId) => {
  try {
    const data = await makeApiRequest(`bibles/${CURRENT_BIBLE_ID}/verses/${verseId}`);
    return data;
  } catch (error) {
    console.error('Error fetching verse content:', error.message);
    return { data: {} };
  }
};

// Get chapter content
export const getChapterContent = async (bookId, chapterId) => {
  try {
    console.log(`Getting content for chapter: ${chapterId}`);
    const response = await makeApiRequest(`bibles/${CURRENT_BIBLE_ID}/chapters/${chapterId}`);
    
    return response.data || {};
  } catch (error) {
    console.error(`Error fetching chapter content: ${chapterId}`, error.message);
    return {};
  }
};

// Search Bible (fixed)
export const searchBible = async (query, bibleId = CURRENT_BIBLE_ID) => {
  try {
    console.log(`Searching for: "${query}" in Bible ${bibleId}`);
    
    // Build the URL with the query parameter directly (not nested in params)
    const url = `https://bible-api-proxy.vercel.app/api/bibles`;
    
    const response = await axios.get(url, {
      params: {
        path: `bibles/${bibleId}/search`,
        query: query, // Pass query directly as a parameter
        limit: 20
      }
    });
    
    console.log(`Found ${response.data?.data?.verses?.length || 0} results`);
    return response.data.data;
  } catch (error) {
    console.error('Bible search error:', error);
    throw error;
  }
};

// Export all functions as named exports AND as a default export to support both import styles
const api = {
  initialize,
  cache,
  makeApiRequest,
  getBooks,
  getBibleBooks,
  getChapters,
  getChapterVerses,
  getVerseContent,
  getChapterContent,
  searchBible,
  getCurrentTranslation,
  setBibleId
};

// Export both ways to maximize compatibility
export default api; 