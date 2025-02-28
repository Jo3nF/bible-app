import React, { useState } from 'react';
import { View, Text } from 'react-native';

const [translationError, setTranslationError] = useState(false);

const loadTranslations = async () => {
  try {
    // Existing code...
    setTranslationError(false);
  } catch (error) {
    console.error('Error loading translations:', error);
    setTranslationError(true);
  }
};

{translationError && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>
      There was a problem loading Bible translations. Using default translation instead.
    </Text>
  </View>
)} 