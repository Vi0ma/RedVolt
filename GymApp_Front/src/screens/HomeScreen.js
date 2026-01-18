import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useFocusEffect } from '@react-navigation/native'; 
import axios from 'axios'; 
import { COLORS } from '../constants/theme';

const API_URL = 'http://10.109.232.202:3000';

export default function HomeScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]); 
  const [userData, setUserData] = useState({ name: 'CHAMPION', wallet: { balance: 0 }, sessionsCount: 0, totalPoints: 0 });
  const [upcomingClasses, setUpcomingClasses] = useState([]); 
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const userRes = await axios.get(`${API_URL}/users/profile`, config);
      setUserData(userRes.data);

      const classesRes = await axios.get(`${API_URL}/users/next-class`, config);
      setUpcomingClasses(classesRes.data);

      const challengeRes = await axios.get(`${API_URL}/challenges/list`, config);
      setChallenges(challengeRes.data);

    } catch (error) {
      console.log("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert("Annuler", "Veux-tu libérer ta place ?", [
      { text: "Non", style: "cancel" },
      { text: "Oui", style: 'destructive', onPress: async () => {
          try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${API_URL}/users/booking/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
              Alert.alert("Succès", "Réservation annulée.");
              fetchData(); 
          } catch (e) { Alert.alert("Erreur", "Impossible d'annuler"); }
      }}
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenue,</Text>
            <Text style={styles.username}>{userData.name?.toUpperCase()} !</Text>
          </View>
          <Text style={styles.appName}>RED<Text style={{color:'white'}}>VOLT</Text></Text>
        </View>

        {loading ? (
             <ActivityIndicator color={COLORS.primary} size="large" style={{marginVertical: 20}} />
        ) : (
            <View style={styles.card}>
                <Text style={styles.cardLabel}>MES PROCHAINS COURS</Text>

                {upcomingClasses.length > 0 ? (
                    upcomingClasses.map((item, index) => (
                        <View key={item.id} style={[
                            styles.classRowItem, 
                            index !== upcomingClasses.length - 1 && styles.borderBottom
                        ]}>
                            <View style={styles.timeBadge}>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>
                            <View style={{marginLeft: 15, flex: 1}}>
                                <Text style={styles.className}>{item.name}</Text>
                                <Text style={styles.classCoach}>avec {item.coach}</Text>
                                <Text style={styles.classDate}>{item.dateStr}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleCancelBooking(item.id)} style={styles.cancelBtn}>
                                <Ionicons name="close-circle" size={24} color="#FF4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={40} color="#AAA" />
                        <Text style={{color:'#CCC', marginTop: 10}}>Aucun cours réservé</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Planning')} style={{marginTop: 15}}>
                            <Text style={{color: 'white', fontWeight:'bold', textDecorationLine: 'underline'}}>Réserver maintenant ➔</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        )}

        <TouchableOpacity style={styles.storeCard} onPress={() => navigation.navigate('Shop')}>
             <View>
                <Text style={styles.storeTitle}>STORE & SHAKES</Text>
                <Text style={styles.storeSub}>Commande ta boisson ou ton équipement</Text>
             </View>
             <View style={styles.arrowButton}>
                 <Ionicons name="arrow-forward" size={24} color="black" />
             </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.leaderboardCard} onPress={() => navigation.navigate('Leaderboard')}>
             <View>
                <Text style={styles.leaderTitle}>CLASSEMENT CLUB 📊</Text>
                <Text style={styles.storeSub}>Voir le top 10</Text>
             </View>
             <View style={styles.chartButton}>
                 <Ionicons name="trending-up" size={24} color="black" />
             </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>MA PROGRESSION</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
             <Text style={styles.statNumber}>{userData.sessionsCount}</Text>
             <Text style={styles.statLabel}>Entraînements</Text>
          </View>
          <View style={styles.statBox}>
             <Text style={styles.statNumber}>{userData.totalPoints} pts</Text>
             <Text style={styles.statLabel}>Score Total</Text>
          </View>
        </View>

        <View style={styles.challengeContainer}>
            <View style={styles.challengeHeader}>
                <Text style={styles.sectionTitle}>DÉFIS FLASH ⚡</Text>
            </View>

            {challenges.length > 0 ? (
                challenges.map((challenge, index) => (
                    <TouchableOpacity 
                        key={challenge.id || index}
                        style={[styles.challengeBox, { marginBottom: 15 }]} 
                        onPress={() => {
                            Alert.alert(
                                "Validation du Défi", 
                                "Rends-toi à ton coach pour valider ce défi et récupérer tes points ! 🏋️‍♂️"
                            );
                        }}
                    >
                        <View style={{flex: 1, marginRight: 10}}>
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationText}>DURÉE : {challenge.duration}</Text>
                            </View>
                            <Text style={styles.challengeName}>{challenge.title}</Text>
                            <Text style={styles.challengeDesc}>{challenge.description}</Text>
                        </View>
                        <View style={styles.pointsCircle}>
                            <Text style={styles.pointsValue}>+{challenge.points}</Text>
                            <Text style={styles.pointsUnit}>PTS</Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={[styles.emptyState, { backgroundColor: '#111', borderRadius: 20 }]}>
                    <Ionicons name="trophy-outline" size={40} color="#333" />
                    <Text style={{color: '#666', marginTop: 10}}>Aucun défi disponible.</Text>
                </View>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 30, 
      marginTop: 50 
  },
  greeting: { color: '#888', fontSize: 16 },
  username: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  appName: { color: COLORS.primary, fontSize: 20, fontWeight: '900' },

  card: { 
      backgroundColor: '#2C0000', 
      borderRadius: 20, 
      padding: 20, 
      marginBottom: 20,
      borderWidth: 1,           
      borderColor: COLORS.primary 
  },
  cardLabel: { 
      color: COLORS.primary, 
      fontSize: 18,            
      fontWeight: 'bold', 
      textTransform: 'uppercase', 
      marginBottom: 15 
  },
  classRowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10
  },
  borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  timeBadge: { 
      backgroundColor: 'rgba(0,0,0,0.3)', 
      width: 50, height: 50, borderRadius: 15, 
      justifyContent: 'center', alignItems: 'center' 
  },
  timeText: { color: 'white', fontWeight: 'bold' },
  className: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  classCoach: { color: '#CCC', fontSize: 14 }, 
  classDate: { color: COLORS.primary, fontSize: 12, marginTop: 4 },
  cancelBtn: { padding: 5 },

  emptyState: { alignItems: 'center', paddingVertical: 20 },

  storeCard: {
      backgroundColor: '#1E1E1E',
      borderRadius: 20, padding: 20, marginBottom: 15,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  storeTitle: { 
      color: COLORS.primary, 
      fontWeight: 'bold', 
      fontSize: 18, 
      marginBottom: 5 
  },
  storeSub: { color: 'white', fontSize: 12, maxWidth: 200 },
  arrowButton: {
      backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center'
  },

  leaderboardCard: {
      backgroundColor: '#1E1E1E', 
      borderRadius: 20, 
      padding: 20, 
      marginBottom: 25,
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center'
  },
  leaderTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  chartButton: {
      backgroundColor: 'white', width: 40, height: 40, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center'
  },

  sectionTitle: { color: '#888', fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, alignItems: 'center' },
  statNumber: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 5 },
  challengeContainer: { marginBottom: 20 },
  challengeHeader: { marginBottom: 10 },
  challengeBox: {
      backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 20, padding: 20,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  durationBadge: { backgroundColor: '#333', alignSelf:'flex-start', paddingHorizontal:8, paddingVertical:4, borderRadius:5, marginBottom:10 },
  durationText: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  challengeName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  challengeDesc: { color: '#666', fontSize: 12 },
  pointsCircle: {
      backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 30,
      justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white'
  },
  pointsValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  pointsUnit: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});