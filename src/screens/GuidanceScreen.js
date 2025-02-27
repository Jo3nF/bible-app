import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import BibleApi from '../api/bibleLocalAPI';
import { guidanceTopics } from '../data/guidanceTopics';

// IMPORTANT: Replace this with your actual OpenAI API key
// In a production app, you would use a more secure method to store this
const OPENAI_API_KEY = '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';

const GuidanceScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the OpenAI API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a biblical guidance assistant for a Reina-Valera Spanish Bible app. When the user asks a question or describes a problem, provide 3-5 Bible verses that address their situation. Format your response as a JSON object with a 'verses' array containing objects with 'reference' (e.g., 'Juan 3:16'), 'text' (the verse text in Spanish), and 'reason' (brief explanation in English of why this verse is relevant). Use Spanish verse references."
            },
            {
              role: "user",
              content: query
            }
          ],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Parse JSON response
      const aiResponse = JSON.parse(response.data.choices[0].message.content);
      console.log("AI Response:", aiResponse);
      
      const verses = aiResponse.verses || [];
      setResults(verses);
    } catch (error) {
      console.error('Guidance error:', error);
      
      // Check if it's a rate limit error (429)
      if (error.response && error.response.status === 429) {
        // Fall back to local guidance on rate limit
        try {
          const matchingTopics = guidanceTopics.filter(topic => {
            return topic.topic.toLowerCase().includes(query.toLowerCase()) || 
                   topic.keywords.some(keyword => 
                     query.toLowerCase().includes(keyword.toLowerCase())
                   );
          });
          
          if (matchingTopics.length > 0) {
            // Use curated verses from the matching topic
            setResults(matchingTopics[0].verses);
            setError('OpenAI API rate limit reached. Using local guidance instead.');
            return;
          } else {
            // Fall back to Bible API search
            const searchResults = await BibleApi.searchBible(query);
            
            // Transform search results to match our format
            const formattedResults = (searchResults.verses || []).slice(0, 5).map(verse => ({
              reference: verse.reference,
              text: verse.text,
              reason: "Found based on keyword search"
            }));
            
            setResults(formattedResults);
            setError('OpenAI API rate limit reached. Using Bible search instead.');
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback guidance error:', fallbackError);
        }
        
        setError('OpenAI API rate limit reached. Please try again later or contact support.');
      } else {
        setError('Error finding guidance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
  
  const navigateToVerse = (verse) => {
    if (!verse.reference) return;
    
    // Parse the verse reference
    const parsedVerse = parseVerseReference(verse.reference);
    
    if (parsedVerse.bookId && parsedVerse.chapter) {
      navigation.navigate('BibleReader', {
        book: parsedVerse.bookId,
        chapter: parsedVerse.chapter,
        verse: parsedVerse.verse
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1499566727020-9e74997c16e4?q=80&w=2070' }} 
          style={styles.headerImage}
        />
        <View style={styles.overlay}>
          <Text style={styles.headerText}>AI Biblical Guidance</Text>
        </View>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>What are you seeking guidance about?</Text>
          <TextInput
            style={styles.questionInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Example: How to deal with anxiety?"
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Ask AI for Biblical Guidance</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loaderText}>Consultando la Palabra de Dios...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleSubmit}
            >
              <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {results.length > 0 ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Versículos para tu situación:</Text>
                {results.map((item, index) => (
                  <TouchableOpacity 
                    key={`verse-${index}`}
                    style={styles.resultItem}
                    onPress={() => navigateToVerse(item)}
                  >
                    <Text style={styles.verseReference}>{item.reference}</Text>
                    <Text style={styles.verseText}>{item.text}</Text>
                    <View style={styles.reasonContainer}>
                      <Text style={styles.reasonLabel}>Por qué esto ayuda:</Text>
                      <Text style={styles.reasonText}>{item.reason}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : query.length > 0 ? (
              <Text style={styles.emptyText}>No se encontró orientación. Intenta otra consulta.</Text>
            ) : (
              <View style={styles.initialStateContainer}>
                <Ionicons name="book-outline" size={80} color="#3498db" />
                <Text style={styles.initialStateText}>
                  Haz una pregunta para recibir orientación bíblica
                </Text>
                <Text style={styles.sampleQuestionsTitle}>Ejemplos de preguntas:</Text>
                <View style={styles.sampleQuestions}>
                  <TouchableOpacity
                    style={styles.sampleQuestion}
                    onPress={() => setQuery("¿Cómo manejar la ansiedad?")}
                  >
                    <Text style={styles.sampleQuestionText}>¿Cómo manejar la ansiedad?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sampleQuestion}
                    onPress={() => setQuery("¿Qué dice la Biblia sobre el perdón?")}
                  >
                    <Text style={styles.sampleQuestionText}>¿Qué dice sobre el perdón?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sampleQuestion}
                    onPress={() => setQuery("Versículos para momentos difíciles")}
                  >
                    <Text style={styles.sampleQuestionText}>Versículos para momentos difíciles</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    height: 150,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  questionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
    color: '#777',
    marginTop: 15,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
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
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
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
  reasonContainer: {
    backgroundColor: '#f5f9ff',
    padding: 10,
    borderRadius: 5,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
  },
  initialStateContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  initialStateText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    marginTop: 15,
    marginBottom: 30,
  },
  sampleQuestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  sampleQuestions: {
    width: '100%',
  },
  sampleQuestion: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  sampleQuestionText: {
    fontSize: 15,
    color: '#333',
  },
});

export default GuidanceScreen; 