import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Image, FlatList, SectionList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BibleApi, { BIBLE_TRANSLATIONS } from '../api/bibleLocalAPI';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [selectedTranslation, setSelectedTranslation] = useState('592420522e16049f-01'); // Default to Reina-Valera 1909
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTranslation, setCurrentTranslation] = useState(BibleApi.getCurrentTranslation());
  
  useEffect(() => {
    // Load the saved translation setting
    const loadSettings = async () => {
      try {
        const savedTranslation = await AsyncStorage.getItem('selectedTranslation');
        if (savedTranslation) {
          setSelectedTranslation(savedTranslation);
        }
        setTranslations(BIBLE_TRANSLATIONS);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const changeTranslation = async (id) => {
    try {
      setSelectedTranslation(id);
      await AsyncStorage.setItem('selectedTranslation', id);
      // Update the Bible ID in the API client
      BibleApi.setBibleId(id);
    } catch (error) {
      console.error('Error saving translation setting:', error);
    }
  };

  const handleSelectTranslation = async (translation) => {
    const success = await BibleApi.setBibleId(translation.id);
    if (success) {
      setCurrentTranslation(translation);
    }
  };
  
  const verifyTranslations = async () => {
    setLoading(true);
    try {
      const results = await BibleApi.verifyAllTranslations();
      
      // Update the state to show only working translations
      setTranslations(BibleApi.getAvailableTranslations());
      
      // Show verification results 
      alert(`Verification complete. ${
        Object.values(results).filter(Boolean).length
      } out of ${BIBLE_TRANSLATIONS.length} translations are working.`);
      
    } catch (error) {
      console.error('Error verifying translations:', error);
      alert('Failed to verify translations.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bible Version</Text>
        <View style={styles.option}>
          <Text style={styles.optionText}>Reina-Valera (1960)</Text>
          <Text style={styles.activeIndicator}>✓</Text>
        </View>
        <Text style={styles.noteText}>This app exclusively uses the Reina-Valera 1960 Spanish translation</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Bible App v1.0{'\n'}
          A simple Bible application featuring the Reina-Valera Spanish translation.{'\n\n'}
          © 2023 All Rights Reserved
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
  activeIndicator: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  noteText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default SettingsScreen; 