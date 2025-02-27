import React from 'react';
import { View, StyleSheet } from 'react-native';
import Logo from './Logo';

const Header = () => {
  return (
    <View style={styles.header}>
      <Logo size="small" horizontal={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default Header; 