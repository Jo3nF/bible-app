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
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=2070' }} 
            style={styles.headerImage}
          />
          <View style={styles.overlay}>
            <Text style={styles.headerText}>Settings</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#d0d0d0', true: '#81b0ff' }}
              thumbColor={darkMode ? '#3498db' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <View style={styles.fontSizeButtons}>
              <TouchableOpacity 
                style={[styles.fontSizeButton, fontSize === 'small' && styles.selectedFontSize]}
                onPress={() => setFontSize('small')}
              >
                <Text style={[styles.fontSizeText, fontSize === 'small' && styles.selectedFontText]}>Small</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.fontSizeButton, fontSize === 'medium' && styles.selectedFontSize]}
                onPress={() => setFontSize('medium')}
              >
                <Text style={[styles.fontSizeText, fontSize === 'medium' && styles.selectedFontText]}>Medium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.fontSizeButton, fontSize === 'large' && styles.selectedFontSize]}
                onPress={() => setFontSize('large')}
              >
                <Text style={[styles.fontSizeText, fontSize === 'large' && styles.selectedFontText]}>Large</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Daily Verse</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#d0d0d0', true: '#81b0ff' }}
              thumbColor={notifications ? '#3498db' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bible Version</Text>
          
          <TouchableOpacity style={styles.versionItem}>
            <Text style={styles.versionName}>English Standard Version (ESV)</Text>
            <Text style={styles.versionSelected}>Selected</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.versionItem}>
            <Text style={styles.versionName}>King James Version (KJV)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.versionItem}>
            <Text style={styles.versionName}>New International Version (NIV)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bible Translation</Text>
        <View style={{height: 300}}>
          <FlatList
            data={BIBLE_TRANSLATIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.translationItem,
                  currentTranslation.id === item.id && styles.selectedItem
                ]}
                onPress={() => handleSelectTranslation(item)}
              >
                <View>
                  <Text style={styles.translationName}>{item.name}</Text>
                  <Text style={styles.translationLanguage}>{item.language} • {item.abbreviation}</Text>
                </View>
                
                {currentTranslation.id === item.id && (
                  <Ionicons name="checkmark" size={24} color="#3498db" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutItemText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutItemText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutItemText}>App Version: 1.0.0</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={verifyTranslations}
        disabled={loading}
      >
        <Text style={styles.actionButtonText}>
          {loading ? 'Checking...' : 'Verify Translations'}
        </Text>
      </TouchableOpacity>
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
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 5,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  fontSizeButtons: {
    flexDirection: 'row',
  },
  fontSizeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFontSize: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  fontSizeText: {
    color: '#333',
  },
  selectedFontText: {
    color: 'white',
  },
  versionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  versionName: {
    fontSize: 16,
    color: '#333',
  },
  versionSelected: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  aboutItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  aboutItemText: {
    fontSize: 16,
    color: '#333',
  },
  translationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  translationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  translationLanguage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 15,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 