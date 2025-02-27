import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Logo = ({ size = 'medium', horizontal = false }) => {
  // Size variations
  const getSize = () => {
    switch(size) {
      case 'small': return 24;
      case 'large': return 48;
      default: return 36; // medium
    }
  };
  
  const fontSize = getSize();
  const iconSize = fontSize * 1.2;
  
  return (
    <View style={[
      styles.container, 
      horizontal ? styles.horizontal : styles.vertical
    ]}>
      <View style={styles.iconContainer}>
        <Ionicons name="book" size={iconSize} color="#1E3A5F" />
        <Ionicons 
          name="bookmark" 
          size={iconSize * 0.6} 
          color="#E6B325" 
          style={styles.overlayIcon} 
        />
      </View>
      <Text style={[
        styles.logoText, 
        { fontSize: fontSize },
        horizontal ? styles.horizontalText : null
      ]}>
        BIBLIA
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  vertical: {
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
  },
  horizontalText: {
    marginLeft: 12,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  overlayIcon: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [
      { translateX: -12 },
      { translateY: -12 }
    ],
  },
  logoText: {
    fontWeight: 'bold',
    color: '#1E3A5F',
    letterSpacing: 2,
    fontFamily: 'System',
  },
});

export default Logo; 