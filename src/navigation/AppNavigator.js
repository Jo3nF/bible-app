// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import VerseDetailScreen from '../screens/VerseDetailScreen';
import GuidanceScreen from '../screens/GuidanceScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PsalmReaderScreen from '../screens/PsalmReaderScreen';
import BibleReaderScreen from '../screens/BibleReaderScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Guidance') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Guidance" component={GuidanceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth screens - Include Main here too for unauthenticated access
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="BibleReader" component={BibleReaderScreen} />
          <Stack.Screen name="VerseDetail" component={VerseDetailScreen} />
        </>
      ) : (
        // Main app screens
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="BibleReader" component={BibleReaderScreen} />
          <Stack.Screen name="VerseDetail" component={VerseDetailScreen} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PsalmReader" component={PsalmReaderScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;