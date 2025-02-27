import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BibleApi from '../api/bibleLocalAPI';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await BibleApi.searchBible(query);
      setResults(searchResults.verses || []);
    } catch (error) {
      console.error('Search error:', error);
      setError('Error performing search. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const navigateToVerse = (verse) => {
    console.log("Navigating to verse:", verse); // Debug log
    
    if (!verse.reference) return;
    
    // Handle formats like "San Lucas 2:1" - need special handling for book names with spaces
    const parts = verse.reference.split(':');
    let bookChapterPart, verseNum;
    
    // Handle the book name and chapter
    if (parts.length >= 1) {
      bookChapterPart = parts[0]; // "San Lucas 2"
      if (parts.length >= 2) {
        verseNum = parts[1];      // "1"
      }
    }
    
    // Further split to find where the number (chapter) starts
    let bookName = '';
    let chapter = '';
    
    if (bookChapterPart) {
      // Find the last space in the string, assuming the number is at the end
      const lastSpaceIndex = bookChapterPart.lastIndexOf(' ');
      if (lastSpaceIndex !== -1) {
        bookName = bookChapterPart.substring(0, lastSpaceIndex).trim();  // "San Lucas"
        chapter = bookChapterPart.substring(lastSpaceIndex + 1).trim();  // "2"
      }
    }
    
    console.log(`Parsed reference: Book=${bookName}, Chapter=${chapter}, Verse=${verseNum}`);
    
    // Map from Spanish book names to book IDs
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
      // Add the "San" prefixed names
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
      console.warn(`Book name "${bookName}" not found in the lookup table`);
      
      // Try to find a partial match by iterating through the keys
      for (const [key, value] of Object.entries(bookNameToId)) {
        if (key.includes(bookName) || bookName.includes(key)) {
          bookId = value;
          console.log(`Found partial match: "${key}" -> ${value}`);
          break;
        }
      }
      
      // If still not found, pass the name as is
      if (!bookId) bookId = bookName;
    }
    
    console.log(`Navigating to: Book ID=${bookId}, Chapter=${chapter}, Verse=${verseNum}`);
    
    if (bookId && chapter) {
      navigation.navigate('BibleReader', {
        book: bookId,
        chapter: chapter,
        verse: verseNum
      });
    } else {
      console.error("Could not parse reference:", verse.reference);
    }
  };
  
  const highlightMatches = (text, query) => {
    if (!query) return '';
    
    const words = query.trim().split(/\s+/);
    let highlightedText = text;
    
    words.forEach(word => {
      if (word.length < 3) return; // Skip very short words
      
      const regex = new RegExp(`(\\b${word}\\w*\\b)`, 'gi');
      highlightedText = highlightedText.replace(regex, '**$1**');
    });
    
    return highlightedText;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2090' }} 
          style={styles.headerImage}
        />
        <View style={styles.overlay}>
          <Text style={styles.headerText}>Search the Bible</Text>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search the Bible..."
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `result-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.resultItem}
              onPress={() => navigateToVerse(item)}
            >
              <Text style={styles.verseReference}>{item.reference}</Text>
              <Text style={styles.verseText}>{item.text}</Text>
              
              <Text style={styles.highlightInfo}>
                {highlightMatches(item.text, query)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                {query.length > 0 
                  ? `No se encontraron resultados para "${query}". Intente con otra búsqueda.` 
                  : 'Ingrese un término para buscar en la Biblia.'}
              </Text>
              
              {query.length > 0 && (
                <Text style={styles.emptySubtext}>
                  Sugerencias:
                  • Use palabras completas
                  • Pruebe con sinónimos
                  • Verifique la ortografía
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  verseReference: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  verseText: {
    fontSize: 14,
    color: '#333',
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  highlightInfo: {
    fontSize: 14,
    color: '#333',
  },
});

export default SearchScreen;
