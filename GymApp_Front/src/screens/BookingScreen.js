import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://10.109.232.202:3000'; 

export default function BookingScreen({ navigation }) {
  const [classes, setClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const [selectedDay, setSelectedDay] = useState('Lun');

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/classes`);
      const data = await response.json();
      if (response.ok) setClasses(data);
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  const handleBook = async (classId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("Oups", "Connecte-toi pour réserver !");
        return;
      }
      const response = await fetch(`${API_URL}/classes/${classId}/book`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Succès", "Place réservée ! 🔥");
        fetchClasses(); 
      } else {
        Alert.alert("Erreur", data.message || "Impossible de réserver");
      }
    } catch (error) {
      Alert.alert("Erreur", "Problème de connexion");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchClasses();
    }, [])
  );

  const getDayFromDate = (dateString) => {
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const map = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 0: 'Dim' };
    return map[dayIndex];
  };

  const filteredClasses = classes.filter(item => getDayFromDate(item.date) === selectedDay);

  const renderClassItem = ({ item }) => {
    const isFull = item.booked >= item.capacity;
    const date = new Date(item.date);
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.classItem}>
        <View style={styles.timeBox}>
            <Text style={styles.timeText}>{time}</Text>
        </View>
        <View style={styles.classContent}>
          <Text style={styles.classTitle}>{item.title}</Text>
          <Text style={styles.classCoach}>{item.coach} • {item.duration} min</Text>
          <View style={styles.progressContainer}>
             <View style={[styles.progressBar, { width: `${(item.booked / item.capacity) * 100}%` }]} />
          </View>
          <Text style={styles.placesText}>{item.capacity - item.booked} places dispo</Text>
        </View>
        <TouchableOpacity 
            style={[styles.bookButton, isFull && styles.bookButtonDisabled]} 
            onPress={() => handleBook(item.id)}
            disabled={isFull}
        >
          <Text style={styles.bookButtonText}>{isFull ? 'COMPLET' : 'RÉSERVER'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{paddingHorizontal: 20, marginBottom: 10}}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 10}}>
              <Ionicons name="arrow-back" size={30} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>PLANNING</Text>
      </View>

      <View style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity 
            key={day} 
            style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredClasses} 
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 50}}>
                <Ionicons name="calendar-outline" size={50} color={COLORS.textDim} />
                <Text style={{color: COLORS.textDim, marginTop: 10}}>Aucun cours ce {selectedDay}.</Text>
                <Text style={{color: '#444', fontSize: 10}}>Change de jour pour voir !</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 30 },
  screenTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  daySelector: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginBottom: 10 },
  dayBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 20, backgroundColor: COLORS.card },
  dayBtnActive: { backgroundColor: COLORS.primary }, 
  dayText: { color: COLORS.textDim, fontWeight: 'bold', fontSize: 12 },
  dayTextActive: { color: 'white' },
  classItem: { flexDirection: 'row', backgroundColor: COLORS.card, padding: 15, marginHorizontal: 20, marginBottom: 15, borderRadius: 12, alignItems: 'center' },
  timeBox: { alignItems: 'center', marginRight: 15, backgroundColor: '#333', padding: 10, borderRadius: 10, minWidth: 60 },
  timeText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  classContent: { flex: 1 },
  classTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  classCoach: { color: COLORS.textDim, fontSize: 12, marginBottom: 5 },
  progressContainer: { height: 4, backgroundColor: '#444', borderRadius: 2, overflow: 'hidden', marginVertical: 4, width: '90%' },
  progressBar: { height: '100%', backgroundColor: COLORS.primary },
  placesText: { color: COLORS.textDim, fontSize: 10 },
  bookButton: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  bookButtonDisabled: { backgroundColor: '#555' },
  bookButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});