import AsyncStorage from '@react-native-async-storage/async-storage';
import BibleApi from '../api/apiClient';

// Structure for sample devotionals (you could expand this with a backend)
const DEVOTIONALS = [
  {
    id: 'dev-1',
    title: 'God\'s Faithfulness',
    verse: 'Lamentations 3:22-23',
    content: 'The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.',
    reflection: 'Take time today to reflect on God\'s faithfulness in your life. Even in difficult seasons, His mercies are renewed each day.',
    prayer: 'Lord, thank you for your unwavering faithfulness. Help me to trust in your promises and remember your goodness every morning.',
    date: '2023-05-01'
  },
  // More devotionals...
];

export const getTodayDevotional = async () => {
  try {
    // Check if we have a devotional for today
    const today = new Date().toISOString().split('T')[0];
    const cachedDevo = await AsyncStorage.getItem(`devotional_${today}`);
    
    if (cachedDevo) {
      return JSON.parse(cachedDevo);
    }
    
    // For a real app, fetch from API
    // For demo, just get a random one from our samples
    const randomIndex = Math.floor(Math.random() * DEVOTIONALS.length);
    const devotional = DEVOTIONALS[randomIndex];
    
    // Cache it for today
    await AsyncStorage.setItem(`devotional_${today}`, JSON.stringify(devotional));
    
    // Pre-fetch the verse content
    const verseRef = devotional.verse;
    try {
      // Parse reference and fetch content
      const [book, chapterVerse] = verseRef.split(' ');
      const [chapter, verse] = chapterVerse.split(':');
      
      // Only fetch if it's a single verse, not a range
      if (!verse.includes('-')) {
        const verseContent = await BibleApi.getVerse(`${book}.${chapter}.${verse}`);
        devotional.verseContent = verseContent;
      }
    } catch (error) {
      console.log('Error fetching verse for devotional:', error);
    }
    
    return devotional;
  } catch (error) {
    console.error('Error getting devotional:', error);
    return null;
  }
};

export const getDevotionalHistory = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const devotionalKeys = keys.filter(key => key.startsWith('devotional_'));
    const devotionals = await Promise.all(
      devotionalKeys.map(async (key) => {
        const value = await AsyncStorage.getItem(key);
        return JSON.parse(value);
      })
    );
    
    return devotionals.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error getting devotional history:', error);
    return [];
  }
}; 