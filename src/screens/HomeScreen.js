// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070' }} 
          style={styles.headerImage}
        />
        <View style={styles.overlay}>
          <Text style={styles.headerText}>Daily Verse</Text>
          <Text style={styles.verseText}>
            "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
          </Text>
          <Text style={styles.verseReference}>John 3:16</Text>
        </View>
      </View>
      
      <View style={styles.quickAccess}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => navigation.navigate('BibleReader', { book: 'GEN', chapter: 1 })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1581600140682-79c5fe8828b6?q=80&w=1888' }} 
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Read Genesis 1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => navigation.navigate('BibleReader', { book: 'PSA', chapter: 23 })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1583361704493-d4d4d1b1d70a?q=80&w=1887' }} 
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Read Psalm 23</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => navigation.navigate('Bookmarks')}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=2070' }} 
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Bookmarks</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.recentReading}>
        <Text style={styles.sectionTitle}>Recent Reading</Text>
        <TouchableOpacity 
          style={styles.recentItem}
          onPress={() => navigation.navigate('BibleReader', { book: 'Psalms', chapter: 23 })}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073' }} 
            style={styles.recentImage}
          />
          <View style={styles.recentInfo}>
            <Text style={styles.recentTitle}>Psalms 23</Text>
            <Text style={styles.recentSubtitle}>The Lord is my shepherd...</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.recentItem}
          onPress={() => navigation.navigate('BibleReader', { book: 'Proverbs', chapter: 3 })}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1499566727020-881da110a0b0?q=80&w=2070' }} 
            style={styles.recentImage}
          />
          <View style={styles.recentInfo}>
            <Text style={styles.recentTitle}>Proverbs 3</Text>
            <Text style={styles.recentSubtitle}>Trust in the Lord with all your heart...</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 200,
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
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  verseText: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  verseReference: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'flex-end',
  },
  quickAccess: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    width: '30%',
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonImage: {
    width: '100%',
    height: '70%',
  },
  buttonText: {
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#3498db',
    color: 'white',
    fontWeight: 'bold',
  },
  recentReading: {
    padding: 20,
  },
  recentItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  recentImage: {
    width: 80,
    height: 80,
  },
  recentInfo: {
    padding: 10,
    flex: 1,
  },
  recentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  recentSubtitle: {
    color: '#666',
    fontSize: 14,
  },
});

export default HomeScreen;