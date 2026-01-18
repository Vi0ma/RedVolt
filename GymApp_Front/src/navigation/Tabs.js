import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanScreen from '../screens/ScanScreen'; 
import BookingScreen from '../screens/BookingScreen';
import WalletScreen from '../screens/WalletScreen';
import ShopScreen from '../screens/ShopScreen';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 5
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Planning') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Shop') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Accès') iconName = 'qr-code-outline'; 
          else if (route.name === 'Leaderboard') iconName = focused ? 'podium' : 'podium-outline';
          else if (route.name === 'Wallet') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';

          if (route.name === 'Accès') {
            return (
              <View style={styles.customButtonShadow}>
                 <View style={styles.customButton}>
                    <Ionicons name="qr-code" size={30} color="white" />
                 </View>
              </View>
            );
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
      >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Planning" component={BookingScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen 
        name="Accès" 
        component={ScanScreen} 
        options={{ tabBarLabel: () => null }} 
      />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
    customButtonShadow: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    customButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    }
});