import axios from 'axios';

// Create a configured instance of axios for Bible API via the Vercel proxy
const bibleApi = axios.create({
  // Point to your Vercel deployment instead of directly to Scripture API
  baseURL: 'bible-api-proxy.vercel.app/api/bibles',
  // No API key needed here - it's handled by the proxy
});

// Add response interceptor for better error handling
bibleApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle rate limiting
    if (error.response && error.response.status === 429) {
      console.warn('API rate limit reached. Consider implementing caching.');
    }
    
    // Handle authentication errors
    if (error.response && error.response.status === 403) {
      console.error('API authorization error. Check the proxy configuration.');
    }
    
    return Promise.reject(error);
  }
);

// Get all available Bible translations
export const getBibleTranslations = async () => {
  try {
    const response = await bibleApi.get('', { 
      params: { path: 'bibles' }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Bible translations:', error);
    throw error;
  }
};

// Get all books for a specific Bible translation
export const getBibleBooks = async (bibleId) => {
  try {
    const response = await bibleApi.get('', {
      params: { path: `bibles/${bibleId}/books` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching books for Bible ${bibleId}:`, error);
    throw error;
  }
};

// Get a specific chapter
export const getChapter = async (bibleId, bookId, chapterId) => {
  try {
    const response = await bibleApi.get('', {
      params: { path: `bibles/${bibleId}/books/${bookId}/chapters/${chapterId}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching chapter ${chapterId}:`, error);
    throw error;
  }
};

// Get a verse
export const getVerse = async (bibleId, verseId) => {
  try {
    const response = await bibleApi.get('', {
      params: { path: `bibles/${bibleId}/verses/${verseId}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching verse ${verseId}:`, error);
    throw error;
  }
};

// Search the Bible - Fixed version
export const searchBible = async (bibleId, query, limit = 20) => {
  try {
    const response = await bibleApi.get('', {
      params: { 
        path: `bibles/${bibleId}/search`,
        query, // Send the search query as a plain parameter
        limit  // Include the limit parameter
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error searching Bible ${bibleId}:`, error);
    throw error;
  }
};

export default bibleApi; 