import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import BibleApi from '../api/bibleLocalAPI';
import { guidanceTopics } from '../data/guidanceTopics';
import { useNavigation } from '@react-navigation/native';

// IMPORTANT: Replace this with your actual OpenAI API key
// In a production app, you would use a more secure method to store this
const OPENAI_API_KEY = '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';

// Updated URL - ensure this points to your deployed Vercel API
const API_URL = 'https://bible-api-proxy.vercel.app/api/bible-guidance';

const GuidanceScreen = () => {
  const [query, setQuery] = useState('');
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  
  const getGuidance = async () => {
    if (!query.trim()) {
      Alert.alert('Please enter a question or topic');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending request to:', API_URL);
      console.log('Query:', query);
      
      const response = await axios.post(API_URL, {
        query: query.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // Increase timeout to 30 seconds
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.choices && response.data.choices[0]) {
        try {
          // Parse the content if it's in JSON format
          const content = response.data.choices[0].message.content;
          const parsedContent = JSON.parse(content);
          setGuidance(parsedContent);
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          // If parsing fails, use the raw content
          setGuidance({
            verses: [{
              reference: "Error",
              text: "Could not parse the response. Please try again."
            }]
          });
        }
      } else {
        setError('Unexpected response format. Please try again.');
      }
    } catch (err) {
      console.error('Guidance error:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Error finding guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setGuidance(null);
  };
  
  const parseVerseReference = (reference) => {
    if (!reference) return {};
    
    // Split into components - handle formats like "San Lucas 2:1"
    const parts = reference.split(':');
    let bookChapterPart, verseNum;
    
    // Handle book name and chapter
    if (parts.length >= 1) {
      bookChapterPart = parts[0]; // "San Lucas 2"
      if (parts.length >= 2) {
        verseNum = parts[1];     // "1"
      }
    }
    
    // Further split to find the chapter
    let bookName = '';
    let chapter = '';
    
    if (bookChapterPart) {
      // Find the last space in the string (assuming the chapter is at the end)
      const lastSpaceIndex = bookChapterPart.lastIndexOf(' ');
      if (lastSpaceIndex !== -1) {
        bookName = bookChapterPart.substring(0, lastSpaceIndex).trim();
        chapter = bookChapterPart.substring(lastSpaceIndex + 1).trim();
      }
    }
    
    // Map of Spanish book names to standard IDs
    const bookNameToId = {
      'Génesis': 'GEN',
      'Éxodo': 'EXO',
      'Levítico': 'LEV',
      'Números': 'NUM',
      'Deuteronomio': 'DEU',
      'Josué': 'JOS',
      'Jueces': 'JDG',
      'Rut': 'RUT',
      '1 Samuel': '1SA',
      '2 Samuel': '2SA',
      '1 Reyes': '1KI',
      '2 Reyes': '2KI',
      '1 Crónicas': '1CH',
      '2 Crónicas': '2CH',
      'Esdras': 'EZR',
      'Nehemías': 'NEH',
      'Ester': 'EST',
      'Job': 'JOB',
      'Salmos': 'PSA',
      'Proverbios': 'PRO',
      'Eclesiastés': 'ECC',
      'Cantares': 'SNG',
      'Isaías': 'ISA',
      'Jeremías': 'JER',
      'Lamentaciones': 'LAM',
      'Ezequiel': 'EZK',
      'Daniel': 'DAN',
      'Oseas': 'HOS',
      'Joel': 'JOL',
      'Amós': 'AMO',
      'Abdías': 'OBA',
      'Jonás': 'JON',
      'Miqueas': 'MIC',
      'Nahúm': 'NAM',
      'Habacuc': 'HAB',
      'Sofonías': 'ZEP',
      'Hageo': 'HAG',
      'Zacarías': 'ZEC',
      'Malaquías': 'MAL',
      'San Mateo': 'MAT',
      'San Marcos': 'MRK', 
      'San Lucas': 'LUK',
      'San Juan': 'JHN',
      'Mateo': 'MAT',
      'Marcos': 'MRK',
      'Lucas': 'LUK',
      'Juan': 'JHN',
      'Hechos': 'ACT',
      'Romanos': 'ROM',
      '1 Corintios': '1CO',
      '2 Corintios': '2CO',
      'Gálatas': 'GAL',
      'Efesios': 'EPH',
      'Filipenses': 'PHP',
      'Colosenses': 'COL',
      '1 Tesalonicenses': '1TH',
      '2 Tesalonicenses': '2TH',
      '1 Timoteo': '1TI',
      '2 Timoteo': '2TI',
      'Tito': 'TIT',
      'Filemón': 'PHM',
      'Hebreos': 'HEB',
      'Santiago': 'JAS',
      '1 Pedro': '1PE',
      '2 Pedro': '2PE',
      '1 Juan': '1JN',
      '2 Juan': '2JN',
      '3 Juan': '3JN',
      'Judas': 'JUD',
      'Apocalipsis': 'REV'
    };
    
    // Look up the book ID
    let bookId = bookNameToId[bookName];
    
    if (!bookId) {
      console.log(`Book name "${bookName}" not found in the lookup table`);
      // Try partial matching as a fallback
      for (const [key, value] of Object.entries(bookNameToId)) {
        if (key.includes(bookName) || bookName.includes(key)) {
          bookId = value;
          console.log(`Found partial match: "${key}" -> ${value}`);
          break;
        }
      }
    }
    
    return { bookId, chapter, verse: verseNum };
  };
  
  const navigateToVerse = (reference) => {
    // Navigate to the verse detail screen
    navigation.navigate('VerseDetail', { reference });
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Biblical Guidance</Text>
      </View>
      
      {!guidance && !loading && !error && (
        <View style={styles.form}>
          <Text style={styles.label}>What are you seeking guidance about?</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Enter your question or concern..."
            multiline
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={getGuidance}
          >
            <Text style={styles.buttonText}>Ask AI for Biblical Guidance</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Finding relevant guidance...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={resetForm}
          >
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {guidance && !loading && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Biblical Guidance</Text>
          
          {guidance.verses && guidance.verses.map((verse, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.verseCard}
              onPress={() => navigateToVerse(verse.reference)}
            >
              <Text style={styles.verseReference}>{verse.reference}</Text>
              <Text style={styles.verseText}>{verse.text}</Text>
            </TouchableOpacity>
          ))}
          
          {guidance.reflection && (
            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionTitle}>Reflection</Text>
              <Text style={styles.reflectionText}>{guidance.reflection}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.newQueryButton}
            onPress={resetForm}
          >
            <Text style={styles.newQueryButtonText}>New Question</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#666',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    margin: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  verseCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  verseReference: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  reflectionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  reflectionText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  newQueryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newQueryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GuidanceScreen; 