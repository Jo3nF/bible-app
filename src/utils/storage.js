import AsyncStorage from '@react-native-async-storage/async-storage';

export const setHasSeenIntro = async () => {
  try {
    await AsyncStorage.setItem('hasSeenIntro', 'true');
    return true;
  } catch (error) {
    console.error('Error saving intro state:', error);
    return false;
  }
};

export const getHasSeenIntro = async () => {
  try {
    const value = await AsyncStorage.getItem('hasSeenIntro');
    return value === 'true';
  } catch (error) {
    console.error('Error getting intro state:', error);
    return false;
  }
}; 