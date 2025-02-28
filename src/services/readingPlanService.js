import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample reading plans
const READING_PLANS = [
  {
    id: 'plan-1',
    title: 'New Testament in 90 Days',
    description: 'Read through the entire New Testament in just 90 days',
    days: 90,
    readings: [
      { day: 1, reference: 'Matthew 1-3', completed: false },
      { day: 2, reference: 'Matthew 4-6', completed: false },
      // More readings...
    ]
  },
  {
    id: 'plan-2',
    title: 'Psalms & Proverbs in 31 Days',
    description: 'A month-long journey through wisdom literature',
    days: 31,
    readings: [
      { day: 1, reference: 'Psalm 1-5', completed: false },
      { day: 2, reference: 'Psalm 6-10', completed: false },
      // More readings...
    ]
  }
];

export const getAvailablePlans = () => {
  return READING_PLANS;
};

export const startPlan = async (planId) => {
  try {
    const plan = READING_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Reading plan not found');
    
    // Mark as started with today's date
    const startDate = new Date().toISOString();
    const activePlan = {
      ...plan,
      startDate,
      lastCompleted: 0
    };
    
    // Save to storage
    await AsyncStorage.setItem(`reading_plan_${planId}`, JSON.stringify(activePlan));
    return activePlan;
  } catch (error) {
    console.error('Error starting reading plan:', error);
    throw error;
  }
};

export const getActivePlans = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const planKeys = keys.filter(key => key.startsWith('reading_plan_'));
    
    if (planKeys.length === 0) return [];
    
    const plans = await Promise.all(
      planKeys.map(async (key) => {
        const value = await AsyncStorage.getItem(key);
        return JSON.parse(value);
      })
    );
    
    return plans;
  } catch (error) {
    console.error('Error getting active reading plans:', error);
    return [];
  }
};

export const markReadingComplete = async (planId, day) => {
  try {
    const planData = await AsyncStorage.getItem(`reading_plan_${planId}`);
    if (!planData) throw new Error('Reading plan not found');
    
    const plan = JSON.parse(planData);
    
    // Update the readings array
    const updatedReadings = plan.readings.map(reading => {
      if (reading.day === day) {
        return { ...reading, completed: true };
      }
      return reading;
    });
    
    // Update the plan
    const updatedPlan = {
      ...plan,
      readings: updatedReadings,
      lastCompleted: Math.max(plan.lastCompleted, day)
    };
    
    await AsyncStorage.setItem(`reading_plan_${planId}`, JSON.stringify(updatedPlan));
    return updatedPlan;
  } catch (error) {
    console.error('Error marking reading as complete:', error);
    throw error;
  }
}; 