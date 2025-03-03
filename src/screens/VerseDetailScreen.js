import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const VerseDetailScreen = ({ route, navigation }) => {
  const { reference } = route.params;
  const [loading, setLoading] = useState(true);
  const [verse, setVerse] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Set the screen title to the verse reference
    navigation.setOptions({
      title: reference,
    });

    // Simulate loading verse data
    setTimeout(() => {
      setVerse({
        reference: reference,
        text: reference === 'Juan 3:16' 
          ? '"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."'
          : "Este es un versículo de ejemplo para la referencia " + reference,
        context: "Este versículo se encuentra en el contexto de...",
      });
      setLoading(false);
    }, 1000);
  }, [reference, navigation]);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, you would save this to your bookmarks storage
  };

  const shareVerse = async () => {
    try {
      await Share.share({
        message: `${verse.text} - ${verse.reference} (Reina-Valera 1960)`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.verseContainer}>
        <Text style={styles.verseText}>{verse.text}</Text>
        <Text style={styles.reference}>{verse.reference} (Reina-Valera 1960)</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleBookmark}>
          <Icon 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color="#d4af37" 
          />
          <Text style={styles.actionText}>
            {isBookmarked ? "Guardado" : "Guardar"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={shareVerse}>
          <Icon name="share-social-outline" size={24} color="#d4af37" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contextContainer}>
        <Text style={styles.contextTitle}>Contexto</Text>
        <Text style={styles.contextText}>{verse.context}</Text>
      </View>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  verseContainer: {
    padding: 20,
    backgroundColor: '#f9f7f0',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 16,
    color: '#333',
  },
  reference: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    color: '#666',
  },
  contextContainer: {
    padding: 16,
  },
  contextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4d2600',
  },
  contextText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default VerseDetailScreen; 