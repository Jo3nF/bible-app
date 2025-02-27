import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BibleApi, { BIBLE_TRANSLATIONS } from '../api/apiClient';

const TranslationSelector = ({ onTranslationChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState(BibleApi.getCurrentTranslation());
  
  const handleSelectTranslation = async (translation) => {
    const success = await BibleApi.setBibleId(translation.id);
    if (success) {
      setCurrentTranslation(translation);
      if (onTranslationChange) {
        onTranslationChange(translation);
      }
    }
    setModalVisible(false);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.currentTranslation}>{currentTranslation.abbreviation}</Text>
        <Ionicons name="chevron-down" size={16} color="#777" />
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bible Translation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={BibleApi.getAvailableTranslations()}
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
                    <Text style={styles.translationLanguage}>{item.language}</Text>
                  </View>
                  
                  {currentTranslation.id === item.id && (
                    <Ionicons name="checkmark" size={24} color="#3498db" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentTranslation: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  translationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f7ff',
  },
  translationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  translationLanguage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default TranslationSelector; 