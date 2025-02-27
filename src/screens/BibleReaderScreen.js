import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import BibleApi from '../api/bibleLocalAPI';
import TranslationSelector from '../components/TranslationSelector';
import { getLanguageCodeForTranslation, cleanBibleTextForReading } from '../utils/speechUtils';

const BibleReaderScreen = ({ route, navigation }) => {
  const { book = 'GEN', chapter = '1', verse = null } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [totalChapters, setTotalChapters] = useState(0);
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPaused, setSpeechPaused] = useState(false);
  
  useEffect(() => {
    loadChapterContent();
  }, [book, chapter]);
  
  useEffect(() => {
    if (content && verse && scrollViewRef.current) {
      setTimeout(() => {
        const contentHeight = content.content.length;
        const approxVersePosition = (parseInt(verse) / 30) * contentHeight;
        
        scrollViewRef.current.scrollTo({ 
          y: approxVersePosition, 
          animated: true 
        });
      }, 500);
    }
  }, [content, verse]);
  
  const loadChapterContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get book details to know the chapter IDs
      const books = await BibleApi.getBooks();
      console.log("Available books:", books.map(b => `${b.id} - ${b.name}`)); // Debug log
      
      // Try to find the book by ID or abbreviation (case insensitive)
      let currentBook = books.find(b => 
        b.id?.toLowerCase() === book?.toLowerCase() || 
        b.abbreviation?.toLowerCase() === book?.toLowerCase()
      );
      
      // If not found by ID or abbreviation, try by name
      if (!currentBook) {
        currentBook = books.find(b => 
          b.name?.toLowerCase().includes(book?.toLowerCase())
        );
      }
      
      // Detailed logging for debugging
      if (!currentBook) {
        console.warn(`Book "${book}" not found`);
        console.log("Available books:", books.map(b => `${b.id}|${b.abbreviation}|${b.name}`));
        
        // Default to first book as fallback
        if (books.length > 0) {
          currentBook = books[0];
          console.log(`Defaulting to first book: ${currentBook.name} (${currentBook.id})`);
        }
      }
      
      setBookDetails(currentBook);
      
      // Get chapters for the current book
      const chapters = await BibleApi.getChapters(currentBook.id);
      setTotalChapters(chapters.length - 1); // -1 because the first item is usually an introduction
      
      // Find the correct chapter ID
      const chapterObj = chapters.find(c => c.number === chapter.toString());
      if (!chapterObj) {
        throw new Error(`Chapter ${chapter} not found in ${currentBook.name}`);
      }
      
      // Get the chapter content
      const chapterContent = await BibleApi.getChapterContent(currentBook.id, chapterObj.id);
      setContent(chapterContent);
    } catch (error) {
      console.error('Error loading Bible content:', error);
      setError(error.message || 'Failed to load Bible content');
    } finally {
      setLoading(false);
    }
  };
  
  const navigateToChapter = (offset) => {
    const currentChapter = parseInt(chapter);
    const nextChapter = currentChapter + offset;
    
    if (nextChapter > 0 && nextChapter <= totalChapters) {
      navigation.replace('BibleReader', { 
        book: book, 
        chapter: nextChapter.toString() 
      });
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: bookDetails?.name || 'Bible',
      headerRight: () => (
        <TranslationSelector 
          onTranslationChange={() => {
            // Reload current content with new translation
            loadChapterContent();
          }}
        />
      ),
    });
  }, [navigation, bookDetails]);

  const toggleSpeech = async () => {
    try {
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
      } else if (content?.content) {
        setIsSpeaking(true);
        
        // Get the correct language code based on current translation
        const currentTranslation = BibleApi.getCurrentTranslation();
        const languageCode = getLanguageCodeForTranslation(currentTranslation?.id);
        
        // Clean up the text before reading it
        const cleanText = cleanBibleTextForReading(content.content, languageCode.split('-')[0]);
        
        // Announce what we're about to read
        const title = `${bookDetails?.name || 'Chapter'} ${chapter}`;
        
        await Speech.speak(`Reading ${title}`, {
          language: languageCode,
          onDone: () => {
            // After announcing, read the cleaned content
            Speech.speak(cleanText, {
              language: languageCode,
              rate: speechRate,
              pitch: 1.0,
              onDone: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false),
            });
          }
        });
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };
  
  useEffect(() => {
    return () => {
      // Cleanup speech when component unmounts
      Speech.stop();
    };
  }, []);
  
  useEffect(() => {
    // Stop speech if content changes
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
  }, [content]);

  const pauseSpeech = async () => {
    if (isSpeaking && !speechPaused) {
      await Speech.pause();
      setSpeechPaused(true);
    } else if (speechPaused) {
      await Speech.resume();
      setSpeechPaused(false);
    }
  };

  const changeSpeechRate = (newRate) => {
    setSpeechRate(newRate);
    if (isSpeaking) {
      // Restart speech with new rate
      Speech.stop();
      Speech.speak(content.content, {
        language: getLanguageCodeForTranslation(BibleApi.getCurrentTranslation()?.id),
        rate: newRate,
        onDone: () => setIsSpeaking(false),
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Bible content...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadChapterContent}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
      >
        <View style={styles.chapterHeader}>
          <Text style={styles.bookTitle}>
            {bookDetails?.name || book}
          </Text>
          <Text style={styles.chapterTitle}>
            Chapter {chapter}
          </Text>
          
          <View style={styles.speechControls}>
            <TouchableOpacity
              style={styles.speechControlButton}
              onPress={() => changeSpeechRate(Math.max(0.5, speechRate - 0.1))}
            >
              <Ionicons name="remove" size={20} color="#3498db" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.speechButton}
              onPress={toggleSpeech}
            >
              <Ionicons 
                name={isSpeaking ? "stop-circle" : "volume-high"} 
                size={24} 
                color="#3498db" 
              />
              <Text style={styles.speechButtonText}>
                {isSpeaking ? "Stop" : "Read"}
              </Text>
            </TouchableOpacity>
            
            {isSpeaking && (
              <TouchableOpacity
                style={styles.speechControlButton}
                onPress={pauseSpeech}
              >
                <Ionicons 
                  name={speechPaused ? "play" : "pause"} 
                  size={20} 
                  color="#3498db" 
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.speechControlButton}
              onPress={() => changeSpeechRate(Math.min(1.5, speechRate + 0.1))}
            >
              <Ionicons name="add" size={20} color="#3498db" />
            </TouchableOpacity>
          </View>
        </View>
        
        {content?.content ? (
          <Text style={styles.content}>
            {content.content.replace(/<[^>]*>/g, ' ')}
          </Text>
        ) : (
          <Text style={styles.content}>No content available</Text>
        )}
      </ScrollView>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={[styles.navButton, parseInt(chapter) <= 1 && styles.disabledButton]}
          onPress={() => navigateToChapter(-1)}
          disabled={parseInt(chapter) <= 1}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, parseInt(chapter) >= totalChapters && styles.disabledButton]}
          onPress={() => navigateToChapter(1)}
          disabled={parseInt(chapter) >= totalChapters}
        >
          <Text style={styles.navButtonText}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chapterHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  chapterTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  speechButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  speechButtonText: {
    marginLeft: 8,
    color: '#3498db',
    fontWeight: '600',
  },
  speechControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speechControlButton: {
    padding: 5,
  },
});

export default BibleReaderScreen; 