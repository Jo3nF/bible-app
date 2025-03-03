// src/screens/HomeScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Gold theme colors
const GOLD_PRIMARY = '#d4af37';
const GOLD_SECONDARY = '#f2d27a';
const GOLD_DARK = '#8b6b2e';
const BROWN_TEXT = '#4d2600';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [dailyVerse, setDailyVerse] = useState({
    reference: 'Juan 3:16',
    text: '"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."',
  });
  
  const [recentReadings, setRecentReadings] = useState([
    {
      id: '1',
      reference: 'Salmos 23',
      preview: 'Jehová es mi pastor...',
      imageUrl: 'https://images.unsplash.com/photo-1575467678930-c7acd65d2c8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '2',
      reference: 'Proverbios 3',
      preview: 'Confía en Jehová con todo tu corazón...',
      imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '3',
      reference: 'Filipenses 4',
      preview: 'Regocijaos en el Señor siempre...',
      imageUrl: 'https://images.unsplash.com/photo-1529568337823-d3f77818a613?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    },
  ]);

  const navigateToChapter = (reference) => {
    navigation.navigate('VerseDetail', { reference });
  };

  const navigateToPsalm = () => {
    navigation.navigate('PsalmReader');
  };

  const navigateToBookmarks = () => {
    navigation.navigate('Bookmarks');
  };

  const navigateToReader = () => {
    navigation.navigate('BibleReader');
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container}>
        {/* Header with Gold Pattern */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Reina-Valera
          </Text>
          <Text style={styles.headerSubtitle}>
            La Palabra de Dios
          </Text>
        </View>

        {/* Daily Verse with Background */}
        <TouchableOpacity
          onPress={() => navigateToChapter(dailyVerse.reference)}
          activeOpacity={0.9}
        >
          <View style={styles.dailyVerseContainer}>
            <View style={styles.dailyVerseContent}>
              <Text style={styles.dailyVerseTitle}>Versículo del Día</Text>
              <Text style={styles.dailyVerseText}>{dailyVerse.text}</Text>
              <View style={styles.dailyVerseReference}>
                <Text style={styles.dailyVerseReferenceText}>
                  {dailyVerse.reference}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Access Section */}
        <View style={styles.quickAccessContainer}>
          <View style={styles.quickAccessHeader}>
            <Text style={styles.quickAccessTitle}>Acceso Rápido</Text>
          </View>

          <View style={styles.quickAccessContent}>
            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={navigateToReader}
            >
              <View style={[styles.quickAccessImage, {backgroundColor: GOLD_PRIMARY, justifyContent: 'center', alignItems: 'center'}]}>
                <Icon name="book" size={30} color="#fff" />
              </View>
              <View style={styles.quickAccessButton}>
                <Text style={styles.quickAccessButtonText}>Leer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={navigateToPsalm}
            >
              <View style={[styles.quickAccessImage, {backgroundColor: GOLD_PRIMARY, justifyContent: 'center', alignItems: 'center'}]}>
                <Icon name="musical-notes" size={30} color="#fff" />
              </View>
              <View style={styles.quickAccessButton}>
                <Text style={styles.quickAccessButtonText}>Leer Salmo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={navigateToBookmarks}
            >
              <View style={[styles.quickAccessImage, {backgroundColor: GOLD_PRIMARY, justifyContent: 'center', alignItems: 'center'}]}>
                <Icon name="bookmark" size={30} color="#fff" />
              </View>
              <View style={styles.quickAccessButton}>
                <Text style={styles.quickAccessButtonText}>Marcadores</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Reading Section */}
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Lectura Reciente</Text>
          </View>

          {recentReadings.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              onPress={() => navigateToChapter(item.reference)}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.recentImage}
              />
              <View style={styles.recentContent}>
                <Text style={styles.recentReference}>{item.reference}</Text>
                <Text style={styles.recentPreview}>{item.preview}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Reina-Valera 1960</Text>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: GOLD_PRIMARY,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BROWN_TEXT,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: BROWN_TEXT,
    marginTop: 5,
  },
  dailyVerseContainer: {
    height: 230,
    marginBottom: 20,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: GOLD_DARK,
  },
  dailyVerseContent: {
    width: '100%',
  },
  dailyVerseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GOLD_SECONDARY,
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  dailyVerseText: {
    fontSize: 18,
    lineHeight: 26,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  dailyVerseReference: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  dailyVerseReferenceText: {
    fontSize: 16,
    color: GOLD_SECONDARY,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  quickAccessContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  quickAccessHeader: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: GOLD_PRIMARY,
  },
  quickAccessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BROWN_TEXT,
  },
  quickAccessContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  quickAccessItem: {
    width: width / 3.8,
    alignItems: 'center',
  },
  quickAccessImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: GOLD_PRIMARY,
  },
  quickAccessButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: GOLD_PRIMARY,
  },
  quickAccessButtonText: {
    color: BROWN_TEXT,
    fontWeight: 'bold',
    fontSize: 14,
  },
  recentContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recentHeader: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: GOLD_PRIMARY,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BROWN_TEXT,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentReference: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BROWN_TEXT,
    marginBottom: 5,
  },
  recentPreview: {
    fontSize: 14,
    color: '#777',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: GOLD_PRIMARY,
  },
  footerText: {
    color: BROWN_TEXT,
    fontWeight: 'bold',
  },
});

export default HomeScreen;