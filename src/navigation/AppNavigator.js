// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import BibleReaderScreen from '../screens/BibleReaderScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GuidanceScreen from '../screens/GuidanceScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeScreen" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="BibleReader" 
      component={BibleReaderScreen}
      options={({ route }) => ({ 
        title: `${route.params?.book || 'Bible'} ${route.params?.chapter || ''}`,
        headerBackTitleVisible: false
      })}
    />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SearchScreen" 
      component={SearchScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="BibleReader" 
      component={BibleReaderScreen}
      options={({ route }) => ({ 
        title: `${route.params?.book || 'Bible'} ${route.params?.chapter || ''}`,
        headerBackTitleVisible: false
      })}
    />
  </Stack.Navigator>
);

const BookmarksStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="BookmarksScreen" 
      component={BookmarksScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="BibleReader" 
      component={BibleReaderScreen}
      options={({ route }) => ({ 
        title: `${route.params?.book || 'Bible'} ${route.params?.chapter || ''}`,
        headerBackTitleVisible: false
      })}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Search') {
          iconName = focused ? 'search' : 'search-outline';
        } else if (route.name === 'Bookmarks') {
          iconName = focused ? 'bookmark' : 'bookmark-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        } else if (route.name === 'Guidance') {
          iconName = focused ? 'compass' : 'compass-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3498db',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Search" component={SearchStack} />
    <Tab.Screen name="Bookmarks" component={BookmarksStack} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
    <Tab.Screen 
      name="Guidance" 
      component={GuidanceScreen} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="compass" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default MainNavigator;