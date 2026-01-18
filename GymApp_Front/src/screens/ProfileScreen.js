import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/theme';

const API_URL = 'http://10.109.232.202:3000/users/profile'; 

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Erreur profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], 
      });
    } catch (e) {
      console.error("Erreur déconnexion", e);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{paddingHorizontal: 20, paddingTop: 10}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={30} color={COLORS.primary} />
          </TouchableOpacity>
      </View>

      <View style={{alignItems: 'center', marginVertical: 20}}>
        <View style={styles.avatarPlaceholder}>
          <Text style={{color: '#fff', fontSize: 30, fontWeight: 'bold'}}>
            {user ? getInitials(user.name) : '??'}
          </Text>
        </View>
        
        <Text style={styles.username}>{user?.name || "Utilisateur"}</Text>
        
        <Text style={styles.textDim}>
            Membre depuis {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
        </Text>
      </View>

      <View style={styles.statsRow}>
          <View style={styles.statBox}>
              <Text style={styles.statValue}>{user?.wallet?.balance || 0} DH</Text>
              <Text style={styles.statLabel}>Solde</Text>
          </View>
          <View style={[styles.statBox, {borderLeftWidth: 1, borderLeftColor: '#333'}]}>
              <Text style={[styles.statValue, {color: COLORS.primary}]}>{user?.totalPoints || 0} PTS</Text>
              <Text style={styles.statLabel}>Score</Text>
          </View>
      </View>

      <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ff4444" style={{marginRight: 10}} />
            <Text style={{color: '#ff4444', fontWeight: 'bold', fontSize: 16}}>Se Déconnecter</Text>
          </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 30 },
  textDim: { color: COLORS.textDim, marginTop: 5 },
  username: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 10 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderWidth: 2, borderColor: COLORS.primary },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20, backgroundColor: COLORS.card, marginHorizontal: 20, padding: 15, borderRadius: 15 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: COLORS.textDim, fontSize: 12 },
  
  menuContainer: { marginTop: 30, paddingHorizontal: 20 },
  logoutButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 15, 
      backgroundColor: 'rgba(255, 68, 68, 0.1)',
      borderRadius: 15,
      borderWidth: 2,
      borderColor: '#ff4444',
      marginBottom: 30
  },
});