import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const BookmarksScreen = ({ navigation }) => {
  // Placeholder bookmarks data
  const bookmarks = [
    { id: '1', reference: 'John 3:16', text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.', date: '2023-11-15' },
    { id: '2', reference: 'Psalm 23:1-3', text: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.', date: '2023-11-10' },
    { id: '3', reference: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.', date: '2023-11-05' },
    { id: '4', reference: 'Philippians 4:13', text: 'I can do all things through him who strengthens me.', date: '2023-10-28' },
  ];
  
  const renderBookmarkItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookmarkItem}
      onPress={() => {
        // Extract book and chapter from reference (simplified)
        const parts = item.reference.split(' ');
        const book = parts[0];
        const chapter = parseInt(parts[1].split(':')[0]);
        navigation.navigate('BibleReader', { book, chapter });
      }}
    >
      <View style={styles.bookmarkHeader}>
        <Text style={styles.bookmarkReference}>{item.reference}</Text>
        <Text style={styles.bookmarkDate}>{item.date}</Text>
      </View>
      <Text style={styles.bookmarkText}>{item.text}</Text>
      <View style={styles.bookmarkActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=1936' }} 
          style={styles.headerImage}
        />
        <View style={styles.overlay}>
          <Text style={styles.headerText}>My Bookmarks</Text>
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={styles.activeFilterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Favorites</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={bookmarks}
        renderItem={renderBookmarkItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.bookmarksList}
      />
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    color: '#333',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bookmarksList: {
    padding: 15,
  },
  bookmarkItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bookmarkReference: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#888',
  },
  bookmarkText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    lineHeight: 20,
  },
  bookmarkActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  actionText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default BookmarksScreen; 