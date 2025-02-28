import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAvailablePlans, getActivePlans, startPlan, markReadingComplete } from '../services/readingPlanService';
import { useNavigation } from '@react-navigation/native';

const ReadingPlanScreen = () => {
  const [activePlans, setActivePlans] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const active = await getActivePlans();
      const available = getAvailablePlans();
      
      setActivePlans(active);
      setAvailablePlans(available);
    } catch (error) {
      console.error('Error loading reading plans:', error);
    }
  };

  const handleStartPlan = async (planId) => {
    try {
      const newPlan = await startPlan(planId);
      setActivePlans([...activePlans, newPlan]);
      setShowPlanModal(false);
    } catch (error) {
      console.error('Error starting plan:', error);
    }
  };

  const handleMarkComplete = async (planId, day) => {
    try {
      const updatedPlan = await markReadingComplete(planId, day);
      setActivePlans(activePlans.map(plan => 
        plan.id === planId ? updatedPlan : plan
      ));
    } catch (error) {
      console.error('Error marking reading as complete:', error);
    }
  };

  const handlePlanPress = (plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handleReadingPress = (reference) => {
    // Navigate to the Bible reading screen with this reference
    // You'll need to parse the reference to get book, chapter
    const parts = reference.split(' ');
    if (parts.length >= 2) {
      const book = parts[0];
      const chapterRange = parts[1].split('-')[0]; // Just take first chapter if it's a range
      
      navigation.navigate('Bible', {
        book: book,
        chapter: parseInt(chapterRange)
      });
    }
  };

  const renderActivePlan = ({ item }) => {
    // Calculate progress
    const completedReadings = item.readings.filter(r => r.completed).length;
    const progress = Math.round((completedReadings / item.readings.length) * 100);
    
    // Get next reading (first incomplete one)
    const nextReading = item.readings.find(r => !r.completed);

    return (
      <View style={styles.planCard}>
        <Text style={styles.planTitle}>{item.title}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>
        
        {nextReading && (
          <View style={styles.nextReadingContainer}>
            <Text style={styles.nextReadingLabel}>Next Reading:</Text>
            <TouchableOpacity 
              style={styles.nextReading}
              onPress={() => handleReadingPress(nextReading.reference)}
            >
              <Text style={styles.nextReadingText}>Day {nextReading.day}: {nextReading.reference}</Text>
              <Ionicons name="arrow-forward" size={18} color="#0073e6" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleMarkComplete(item.id, nextReading.day)}
            >
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reading Plans</Text>
      
      {activePlans.length > 0 ? (
        <FlatList
          data={activePlans}
          keyExtractor={(item) => item.id}
          renderItem={renderActivePlan}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You don't have any active reading plans</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowPlanModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Start New Plan</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showPlanModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPlan ? `Plan Details` : `Choose a Reading Plan`}
              </Text>
              <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedPlan ? (
              <ScrollView>
                <Text style={styles.planDetailTitle}>{selectedPlan.title}</Text>
                <Text style={styles.planDescription}>{selectedPlan.description}</Text>
                <Text style={styles.planDuration}>{selectedPlan.days} Days</Text>
                
                <Text style={styles.readingsHeader}>Readings:</Text>
                {selectedPlan.readings.slice(0, 7).map((reading) => (
                  <Text key={reading.day} style={styles.readingItem}>
                    Day {reading.day}: {reading.reference}
                  </Text>
                ))}
                {selectedPlan.readings.length > 7 && (
                  <Text style={styles.moreReadings}>And {selectedPlan.readings.length - 7} more...</Text>
                )}
                
                <TouchableOpacity 
                  style={styles.startPlanButton}
                  onPress={() => handleStartPlan(selectedPlan.id)}
                >
                  <Text style={styles.startPlanButtonText}>Start This Plan</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <FlatList
                data={availablePlans}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.planOption}
                    onPress={() => handlePlanPress(item)}
                  >
                    <Text style={styles.planOptionTitle}>{item.title}</Text>
                    <Text style={styles.planOptionDuration}>{item.days} Days</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 20,
  },
  nextReadingContainer: {
    marginTop: 12,
  },
  nextReadingLabel: {
    fontSize: 14,
    color: '#666',
  },
  nextReading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nextReadingText: {
    fontSize: 16,
    color: '#0073e6',
  },
  completeButton: {
    backgroundColor: '#4caf50',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#0073e6',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  planOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planOptionDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  planDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    marginBottom: 12,
    color: '#444',
  },
  planDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  readingsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  readingItem: {
    fontSize: 14,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  moreReadings: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  startPlanButton: {
    backgroundColor: '#0073e6',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  startPlanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReadingPlanScreen; 