import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const BibleVerse = ({ reference, text, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(reference)}
    >
      <Text style={styles.reference}>{reference}</Text>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  reference: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
  },
});

export default BibleVerse; 