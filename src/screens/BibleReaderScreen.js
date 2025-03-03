import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions, Modal, FlatList, TouchableHighlight, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as BibleLocalAPI from '../api/bibleLocalAPI';
import TranslationSelector from '../components/TranslationSelector';
import { getLanguageCodeForTranslation, cleanBibleTextForReading } from '../utils/speechUtils';

const books = [
  { id: 'genesis', name: 'Génesis', chapters: 50 },
  { id: 'exodus', name: 'Éxodo', chapters: 40 },
  { id: 'leviticus', name: 'Levítico', chapters: 27 },
  // Add more books as needed
];

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
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [testamentFilter, setTestamentFilter] = useState('all'); // 'all', 'ot', or 'nt'
  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  
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
      const response = await BibleLocalAPI.getBooks();
      console.log("Books response structure:", response);
      
      const books = response.data || [];
      console.log("Books array:", books);
      
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
        console.log("Available books:", books.map(b => `${b.id}|${b.abbreviation}|${b.name}`).join(", "));
        
        // Default to first book as fallback
        if (books.length > 0) {
          currentBook = books[0];
          console.log(`Defaulting to first book: ${currentBook.name} (${currentBook.id})`);
        } else {
          throw new Error(`No books found in the Bible`);
        }
      }
      
      setBookDetails(currentBook);
      
      // Get chapters for the current book
      const chapters = await BibleLocalAPI.getChapters(currentBook.id);
      console.log("Chapters:", chapters);
      
      setTotalChapters(chapters.length);
      
      // Find the correct chapter ID
      const chapterObj = chapters.find(c => c.number === chapter.toString());
      if (!chapterObj) {
        throw new Error(`Chapter ${chapter} not found in ${currentBook.name}`);
      }
      
      // Get the chapter content
      const chapterContent = await BibleLocalAPI.getChapterContent(currentBook.id, chapterObj.id);
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
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color="#5c3a21" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={24} color="#5c3a21" />
          </TouchableOpacity>
          <TranslationSelector 
            onTranslationChange={() => {
              // Reload current content with new translation
              loadChapterContent();
            }}
          />
        </View>
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
        const currentTranslation = BibleLocalAPI.getCurrentTranslation();
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
        language: getLanguageCodeForTranslation(BibleLocalAPI.getCurrentTranslation()?.id),
        rate: newRate,
        onDone: () => setIsSpeaking(false),
      });
    }
  };

  const selectBook = (book) => {
    setSelectedBook(book);
    setSelectedChapter(1); // Reset to chapter 1 when book changes
    setBookModalVisible(false);
  };

  const selectChapter = (chapter) => {
    setSelectedChapter(chapter);
    setChapterModalVisible(false);
  };

  // Define Bible book categories
  const bibleBooks = {
    ot: [
      { id: 'GEN', name: 'Génesis', testament: 'ot', chapters: 50 },
      { id: 'EXO', name: 'Éxodo', testament: 'ot', chapters: 40 },
      { id: 'LEV', name: 'Levítico', testament: 'ot', chapters: 27 },
      { id: 'NUM', name: 'Números', testament: 'ot', chapters: 36 },
      { id: 'DEU', name: 'Deuteronomio', testament: 'ot', chapters: 34 },
      { id: 'JOS', name: 'Josué', testament: 'ot', chapters: 24 },
      { id: 'JDG', name: 'Jueces', testament: 'ot', chapters: 21 },
      { id: 'RUT', name: 'Rut', testament: 'ot', chapters: 4 },
      { id: '1SA', name: '1 Samuel', testament: 'ot', chapters: 31 },
      { id: '2SA', name: '2 Samuel', testament: 'ot', chapters: 24 },
      // Add more Old Testament books
    ],
    nt: [
      { id: 'MAT', name: 'San Mateo', testament: 'nt', chapters: 28 },
      { id: 'MRK', name: 'San Marcos', testament: 'nt', chapters: 16 },
      { id: 'LUK', name: 'San Lucas', testament: 'nt', chapters: 24 },
      { id: 'JHN', name: 'San Juan', testament: 'nt', chapters: 21 },
      { id: 'ACT', name: 'Hechos', testament: 'nt', chapters: 28 },
      { id: 'ROM', name: 'Romanos', testament: 'nt', chapters: 16 },
      { id: '1CO', name: '1 Corintios', testament: 'nt', chapters: 16 },
      { id: '2CO', name: '2 Corintios', testament: 'nt', chapters: 13 },
      // Add more New Testament books
    ]
  };

  // Function to navigate to selected book and chapter
  const navigateToBookChapter = (bookId, chapterNum) => {
    setBookModalVisible(false);
    setChapterModalVisible(false);
    
    navigation.replace('BibleReader', {
      book: bookId,
      chapter: chapterNum.toString()
    });
  };

  // Add Book Selection Modal component
  const renderBookSelectionModal = () => (
    <Modal
      visible={bookModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setBookModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Libro</Text>
          
          <View style={styles.testamentFilter}>
            <TouchableOpacity 
              style={[
                styles.testamentButton, 
                testamentFilter === 'all' && styles.activeTestamentButton
              ]}
              onPress={() => setTestamentFilter('all')}
            >
              <Text style={styles.testamentButtonText}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.testamentButton, 
                testamentFilter === 'ot' && styles.activeTestamentButton
              ]}
              onPress={() => setTestamentFilter('ot')}
            >
              <Text style={styles.testamentButtonText}>Antiguo Testamento</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.testamentButton, 
                testamentFilter === 'nt' && styles.activeTestamentButton
              ]}
              onPress={() => setTestamentFilter('nt')}
            >
              <Text style={styles.testamentButtonText}>Nuevo Testamento</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={testamentFilter === 'all' 
              ? [...bibleBooks.ot, ...bibleBooks.nt] 
              : bibleBooks[testamentFilter]
            }
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.bookItem}
                onPress={() => {
                  // Store selected book and show chapter selector
                  setSelectedBook(item);
                  setBookModalVisible(false);
                  setChapterModalVisible(true);
                }}
              >
                <Text style={styles.bookName}>{item.name}</Text>
                <Text style={styles.bookChapters}>{item.chapters} capítulos</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.bookSeparator} />}
          />
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setBookModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Add Chapter Selection Modal component
  const renderChapterSelectionModal = () => (
    <Modal
      visible={chapterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setChapterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Seleccionar Capítulo de {selectedBook?.name}
          </Text>
          
          <FlatList
            data={Array.from({ length: selectedBook?.chapters || 0 }, (_, i) => i + 1)}
            keyExtractor={(item) => item.toString()}
            numColumns={5}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.chapterItem}
                onPress={() => navigateToBookChapter(selectedBook.id, item)}
              >
                <Text style={styles.chapterNumber}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chapterGrid}
          />
          
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                setChapterModalVisible(false);
                setBookModalVisible(true);
              }}
            >
              <Text style={styles.backButtonText}>← Libros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setChapterModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Add translation selection modal
  const renderTranslationModal = () => (
    <Modal
      visible={translationModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setTranslationModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Traducción</Text>
          
          <FlatList
            data={[
              { id: 'RVR1960', name: 'Reina Valera 1960', abbreviation: 'RVR1960' },
              { id: 'NVI', name: 'Nueva Versión Internacional', abbreviation: 'NVI' },
              { id: 'LBLA', name: 'La Biblia de las Américas', abbreviation: 'LBLA' },
              { id: 'DHH', name: 'Dios Habla Hoy', abbreviation: 'DHH' },
              { id: 'TLA', name: 'Traducción en Lenguaje Actual', abbreviation: 'TLA' },
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.translationItem}
                onPress={() => {
                  // Handle translation selection
                  BibleLocalAPI.setCurrentTranslation(item);
                  setTranslationModalVisible(false);
                  // Reload content with new translation
                  loadChapterContent();
                }}
              >
                <Text style={styles.translationName}>{item.name}</Text>
                <Text style={styles.translationAbbrev}>{item.abbreviation}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.bookSeparator} />}
          />
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setTranslationModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
      <View style={styles.safeHeaderArea}>
        <View style={styles.header}>
          <View style={styles.leftControls}>
            <TouchableOpacity 
              style={styles.bookChapterButton}
              onPress={() => {
                if (bookDetails) {
                  setSelectedBook({
                    id: bookDetails.id,
                    name: bookDetails.name,
                    chapters: totalChapters
                  });
                  setChapterModalVisible(true);
                } else {
                  setBookModalVisible(true);
                }
              }}
            >
              <Text style={styles.bookChapterText}>
                {bookDetails?.name || 'Libro'} {chapter}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.translationButton}
              onPress={() => setTranslationModalVisible(true)}
            >
              <Text style={styles.translationText}>
                {BibleLocalAPI.getCurrentTranslation()?.abbreviation || 'RVR'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.rightControls}>
            <TouchableOpacity style={styles.fontSizeButton}>
              <Text style={styles.smallFontText}>A</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.fontSizeButton}>
              <Text style={styles.largeFontText}>A</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={22} color="#5c3a21" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.chapterTitle}>
          {bookDetails?.name || 'Libro'} {chapter}
        </Text>
        
        {content?.content ? (
          <View style={styles.bibleContentContainer}>
            {/* Process the content and render with better formatting */}
            {content.content
              .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
              .split(/(\d+)/)  // Split by verse numbers
              .filter(Boolean) // Remove empty parts
              .map((part, index) => {
                const isVerseNumber = /^\d+$/.test(part);
                
                if (isVerseNumber) {
                  // Check if this might be a chapter number at the beginning
                  if (index === 0 && parseInt(part) === 1) {
                    return null; // Skip rendering the first "1" if it's likely the chapter number
                  }
                  
                  return (
                    <View key={`verse-${index}`} style={styles.verseContainer}>
                      <Text style={styles.verseNumber}>{part}</Text>
                      {/* Don't add content here, it will be in the next part */}
                    </View>
                  );
                } else {
                  // Check if this part contains what looks like a title
                  const lines = part.trim().split('\n');
                  const processedLines = [];
                  
                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    
                    // Skip empty lines
                    if (!line) continue;
                    
                    // Simple heuristic: lines in all caps or with specific keywords might be titles
                    const isTitle = line.toUpperCase() === line || 
                                   /COMO|HUIDA|DICIENDO|OYENDO/.test(line);
                    
                    if (isTitle) {
                      processedLines.push(
                        <Text key={`title-${index}-${i}`} style={styles.sectionTitle}>
                          {line}
                        </Text>
                      );
                    } else {
                      processedLines.push(
                        <Text key={`text-${index}-${i}`} style={styles.verseText}>
                          {line}
                        </Text>
                      );
                    }
                  }
                  
                  return (
                    <View key={`content-${index}`} style={styles.textContainer}>
                      {processedLines}
                    </View>
                  );
                }
              })}
          </View>
        ) : (
          <Text style={styles.verseText}>No content available</Text>
        )}
      </ScrollView>

      {/* Audio controls - circular play button */}
      {content && (
        <View style={styles.audioButtonContainer}>
          <TouchableOpacity 
            style={styles.circularPlayButton}
            onPress={toggleSpeech}
          >
            <Ionicons 
              name={isSpeaking ? "pause" : "play"} 
              size={30} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Home and navigation buttons */}
      <View style={styles.bottomControls}>
        <View style={styles.navigationBar}>
          <TouchableOpacity 
            style={[styles.navButton, parseInt(chapter) <= 1 && styles.disabledButton]}
            onPress={() => navigateToChapter(-1)}
            disabled={parseInt(chapter) <= 1}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => {
              console.log('Home button pressed - using popToTop');
              navigation.popToTop();
            }}
          >
            <Ionicons name="home" size={24} color="white" />
            <Text style={styles.homeButtonText}>Home</Text>
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

      {renderBookSelectionModal()}
      {renderChapterSelectionModal()}
      {renderTranslationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f6f0', // Warm off-white background
  },
  safeHeaderArea: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#333', // Dark background for header area
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#333', // Dark background
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookChapterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#666',
    marginRight: 8,
  },
  bookChapterText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  translationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#666',
  },
  translationText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  fontSizeButton: {
    padding: 8,
    marginRight: 5,
  },
  smallFontText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  largeFontText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '500',
  },
  searchButton: {
    padding: 8,
  },
  translationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  translationName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  translationAbbrev: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom for controls
  },
  chapterTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5c3a21',
    marginBottom: 20,
    textAlign: 'center',
  },
  bibleContentContainer: {
    marginBottom: 40,
  },
  verseContainer: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f5539',
    marginRight: 5,
    lineHeight: 25,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5c3a21',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 28,
  },
  verseText: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  audioButtonContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    zIndex: 100,
  },
  circularPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7f5539',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7f5539', // Dark brown
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#7f5539', // Dark brown
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#c7b7a3', // Lighter brown for disabled state
    elevation: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e8d3a2',
    textAlign: 'center',
    marginBottom: 15,
  },
  testamentFilter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  testamentButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: '#e8d3a2',
  },
  activeTestamentButton: {
    backgroundColor: '#7f5539',
  },
  testamentButtonText: {
    color: '#5c3a21',
    fontWeight: '600',
    fontSize: 14,
  },
  bookItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bookName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  bookChapters: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  chapterItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 25,
    backgroundColor: '#e8d3a2',
  },
  chapterNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5c3a21',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  closeButton: {
    backgroundColor: '#7f5539',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#e8d3a2',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#5c3a21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f6f0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5c3a21',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f6f0',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BibleReaderScreen; 