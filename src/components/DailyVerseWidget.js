import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BibleApi from '../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Sample verses for daily inspiration
const DAILY_VERSES = [
  { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { reference: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' },
  { reference: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { reference: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { reference: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
];

const DailyVerseWidget = () => {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDailyVerse();
  }, []);
  
  useEffect(() => {
    if (verse) {
      checkIfFavorite();
    }
  }, [verse]);

  const fetchDailyVerse = async () => {
    try {
      setLoading(true);
      
      // Check if we already have today's verse
      const today = new Date().toISOString().split('T')[0];
      const savedVerse = await AsyncStorage.getItem(`daily_verse_${today}`);
      
      if (savedVerse) {
        setVerse(JSON.parse(savedVerse));
      } else {
        // In a real app, you might fetch from an API
        // For now, we'll use a random verse from our sample array
        const randomIndex = Math.floor(Math.random() * DAILY_VERSES.length);
        const todaysVerse = DAILY_VERSES[randomIndex];
        
        // Parse reference
        const parts = todaysVerse.reference.split(' ');
        const book = parts[0];
        let chapter, verse;
        
        if (parts[1].includes(':')) {
          [chapter, verse] = parts[1].split(':');
        } else {
          chapter = parts[1];
          verse = null;
        }
        
        // Try to fetch actual text from API if available
        try {
          // Using your existing Bible API
          const verseContent = await BibleApi.getVerse(`${book}.${chapter}.${verse}`);
          if (verseContent && verseContent.text) {
            todaysVerse.text = verseContent.text;
          }
        } catch (error) {
          console.log('Error fetching verse from API, using default text');
        }
        
        // Save today's verse
        await AsyncStorage.setItem(`daily_verse_${today}`, JSON.stringify(todaysVerse));
        setVerse(todaysVerse);
      }
    } catch (error) {
      console.error('Error fetching daily verse:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!verse) return;
    
    try {
      const favorites = await AsyncStorage.getItem('favorite_verses');
      if (favorites) {
        const parsedFavorites = JSON.parse(favorites);
        setIsFavorite(parsedFavorites.some(fav => fav.reference === verse.reference));
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorite_verses');
      let parsedFavorites = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        // Remove from favorites
        parsedFavorites = parsedFavorites.filter(fav => fav.reference !== verse.reference);
      } else {
        // Add to favorites
        parsedFavorites.push(verse);
      }
      
      await AsyncStorage.setItem('favorite_verses', JSON.stringify(parsedFavorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleVersePress = () => {
    if (!verse) return;
    
    // Parse reference to navigate to Bible view
    const parts = verse.reference.split(' ');
    if (parts.length >= 2) {
      const book = parts[0];
      let chapter, verseNum;
      
      if (parts[1].includes(':')) {
        [chapter, verseNum] = parts[1].split(':');
      } else {
        chapter = parts[1];
        verseNum = null;
      }
      
      navigation.navigate('Bible', {
        book,
        chapter: parseInt(chapter),
        verse: verseNum ? parseInt(verseNum) : null
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#0073e6" />
      </View>
    );
  }

  if (!verse) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Couldn't load today's verse</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleVersePress}>
      <View style={styles.header}>
        <Text style={styles.title}>Verse of the Day</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#e74c3c" : "#666"}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.verseText}>"{verse.text}"</Text>
      <Text style={styles.reference}>{verse.reference}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0073e6',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  reference: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});

export default DailyVerseWidget; 