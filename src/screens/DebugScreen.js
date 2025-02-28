import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedBibleApi from '../api/bibleLocalAPI';

const DebugScreen = () => {
  const [debug, setDebug] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      setLoading(true);
      
      // Get various state information
      const asyncKeys = await AsyncStorage.getAllKeys();
      const asyncItems = {};
      
      for (const key of asyncKeys) {
        asyncItems[key] = await AsyncStorage.getItem(key);
      }
      
      // Bible API info
      const apiInfo = {
        translations: EnhancedBibleApi.getAvailableTranslations(),
        currentTranslation: EnhancedBibleApi.getCurrentTranslation(),
      };
      
      setDebug({
        asyncStorage: asyncItems,
        bibleApi: apiInfo,
        device: {
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Debug info error:', error);
      setDebug({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetApp = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Set default Bible ID
      await AsyncStorage.setItem('selectedBibleId', '592420522e16049f-01');
      
      // Reload debug info
      await loadDebugInfo();
      
      alert('App data reset successfully');
    } catch (error) {
      console.error('Reset error:', error);
      alert('Error resetting app: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bible App Debug</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={loadDebugInfo}
      >
        <Text style={styles.buttonText}>Refresh Debug Info</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.dangerButton]}
        onPress={resetApp}
      >
        <Text style={styles.buttonText}>Reset App Data</Text>
      </TouchableOpacity>
      
      {loading ? (
        <Text style={styles.loadingText}>Loading debug information...</Text>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Debug Information:</Text>
          <Text style={styles.codeText}>
            {JSON.stringify(debug, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

export default DebugScreen; 