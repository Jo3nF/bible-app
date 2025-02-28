import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BibleVerse from '../components/BibleVerse';
import BibleApi from '../api/bibleLocalAPI';

const VerseDetailScreen = ({ route, navigation }) => {
  const { reference } = route.params;
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchVerseDetails();
    checkIfBookmarked();
  }, [reference]);

  const fetchVerseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parse the reference to get book, chapter, verse
      const parts = reference.split(' ');
      const bookName = parts[0];
      
      if (parts.length >= 2) {
        const chapterVerse = parts[1].split(':');
        const chapter = parseInt(chapterVerse[0]);
        const verseNum = chapterVerse.length > 1 ? parseInt(chapterVerse[1]) : 1;
        
        // Get verse data from your Bible API
        // This is a placeholder - implement your actual API call
        const verseData = await BibleApi.getVerse(bookName, chapter, verseNum);
        setVerse(verseData);
      }
    } catch (err) {
      console.error('Error fetching verse:', err);
      setError('Failed to load verse details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfBookmarked = async () => {
    // Implement your bookmark checking logic
    // For example, check AsyncStorage for bookmark data
    try {
      // Placeholder for actual bookmark checking
      setIsBookmarked(false);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  };

  const toggleBookmark = async () => {
    try {
      // Implement your bookmark toggle logic
      setIsBookmarked(!isBookmarked);
      // Save to AsyncStorage or your database
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const shareVerse = async () => {
    if (!verse) return;
    
    try {
      await Share.share({
        message: `${reference}: "${verse.text}" - Shared from Bible App`,
      });
    } catch (err) {
      console.error('Error sharing verse:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading verse...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchVerseDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {verse ? (
        <View style={styles.contentContainer}>
          <Text style={styles.reference}>{reference}</Text>
          <Text style={styles.verseText}>{verse.text}</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={toggleBookmark}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color="#3498db" 
              />
              <Text style={styles.actionText}>
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={shareVerse}
            >
              <Ionicons name="share-outline" size={24} color="#3498db" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BibleReader', {
                book: verse.book,
                chapter: verse.chapter,
                verse: verse.verseNumber
              })}
            >
              <Ionicons name="book-outline" size={24} color="#3498db" />
              <Text style={styles.actionText}>Read Chapter</Text>
            </TouchableOpacity>
          </View>
          
          {verse.crossReferences && verse.crossReferences.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cross References</Text>
              {verse.crossReferences.map((ref, index) => (
                <TouchableOpacity 
                  key={`ref-${index}`}
                  onPress={() => navigation.replace('VerseDetail', { reference: ref.reference })}
                >
                  <Text style={styles.crossReference}>{ref.reference}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {verse.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Study Notes</Text>
              <Text style={styles.noteText}>{verse.notes}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.notFoundText}>Verse not found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  reference: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
    color: '#34495e',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#3498db',
  },
  section: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  crossReference: {
    fontSize: 16,
    color: '#3498db',
    padding: 8,
    marginVertical: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#7f8c8d',
  },
  notFoundText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#7f8c8d',
  },
});

export default VerseDetailScreen; 