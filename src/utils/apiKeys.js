import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPENAI_API_KEY, BIBLE_API_KEY } from '@env';

// Storage keys
const STORAGE_KEY_OPENAI = 'OPENAI_API_KEY';
const STORAGE_KEY_BIBLE = 'BIBLE_API_KEY';

// Get OpenAI API key with fallback to storage
export const getOpenAIKey = async () => {
  if (OPENAI_API_KEY) return OPENAI_API_KEY;
  
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_OPENAI);
  } catch (error) {
    console.error('Error retrieving OpenAI API key:', error);
    return null;
  }
};

// Get Bible API key with fallback to storage
export const getBibleApiKey = async () => {
  if (BIBLE_API_KEY) return BIBLE_API_KEY;
  
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_BIBLE);
  } catch (error) {
    console.error('Error retrieving Bible API key:', error);
    return null;
  }
};

// Save OpenAI API key to storage
export const saveOpenAIKey = async (key) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_OPENAI, key);
    return true;
  } catch (error) {
    console.error('Error saving OpenAI API key:', error);
    return false;
  }
};

// Save Bible API key to storage
export const saveBibleApiKey = async (key) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_BIBLE, key);
    return true;
  } catch (error) {
    console.error('Error saving Bible API key:', error);
    return false;
  }
}; 