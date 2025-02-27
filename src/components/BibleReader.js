// src/components/BibleReader.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { bibleApi } from '../api/apiClient';

const BibleReader = ({ versionId, bookId, chapter }) => {
  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const response = await bibleApi.getChapter(versionId, bookId, chapter);
        setChapterData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch chapter', err);
        setError('Unable to load this chapter. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [versionId, bookId, chapter]);

  const handleVersePress = (verse) => {
    // Handle verse selection (highlight, bookmark, share, etc.)
    console.log('Verse selected:', verse);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.bookTitle}>
          {chapterData?.book.name} {chapterData?.chapter}
        </Text>
      </View>
      
      <View style={styles.versesContainer}>
        {chapterData?.verses.map((verse) => (
          <TouchableOpacity 
            key={verse.number} 
            onPress={() => handleVersePress(verse)}
          >
            <View style={styles.verseContainer}>
              <Text style={styles.verseNumber}>{verse.number}</Text>
              <Text style={styles.verseText}>{verse.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  versesContainer: {
    padding: 16,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verseNumber: {
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8,
    color: '#666',
    width: 20,
    textAlign: 'right',
    lineHeight: 20,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BibleReader;