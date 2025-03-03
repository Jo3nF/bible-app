import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BookmarksScreen = () => {
  const navigation = useNavigation();
  const [bookmarks, setBookmarks] = useState([
    { id: '1', reference: 'Juan 3:16', text: '"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."' },
    { id: '2', reference: 'Salmos 23:1', text: 'Jehová es mi pastor; nada me faltará.' },
    { id: '3', reference: 'Proverbios 3:5-6', text: 'Confía en Jehová con todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.' },
    { id: '4', reference: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' },
  ]);

  const handleBookmarkPress = (reference) => {
    navigation.navigate('VerseDetail', { reference });
  };

  const removeBookmark = (id) => {
    Alert.alert(
      'Eliminar Marcador',
      '¿Estás seguro de que deseas eliminar este marcador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
          }
        },
      ]
    );
  };

  const renderBookmarkItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookmarkItem}
      onPress={() => handleBookmarkPress(item.reference)}
    >
      <View style={styles.bookmarkContent}>
        <Text style={styles.bookmarkReference}>{item.reference}</Text>
        <Text style={styles.bookmarkText} numberOfLines={2}>{item.text}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeBookmark(item.id)}
      >
        <Icon name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmarkItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="bookmark-outline" size={80} color="#d4af37" />
          <Text style={styles.emptyText}>No tienes marcadores guardados</Text>
          <Text style={styles.emptySubtext}>
            Agrega marcadores mientras lees la Biblia para encontrarlos aquí
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  bookmarkItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookmarkContent: {
    flex: 1,
  },
  bookmarkReference: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#4d2600',
  },
  bookmarkText: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#4d2600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default BookmarksScreen; 