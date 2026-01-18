import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/theme';

const API_URL = 'http://10.109.232.202:3000'; 

export default function WalletScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]); 
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const resBalance = await fetch(`${API_URL}/wallet`, { headers });
      const dataBalance = await resBalance.json();
      if (resBalance.ok) setBalance(dataBalance.balance);

      const resHistory = await fetch(`${API_URL}/wallet/history`, { headers });
      const dataHistory = await resHistory.json();
      if (resHistory.ok) setHistory(dataHistory);

    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 10}}>
              <Ionicons name="arrow-back" size={30} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>MON WALLET</Text>
      </View>
      
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceValue}>{balance.toFixed(2)} <Text style={{fontSize: 20}}>DH</Text></Text>
          
          <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={COLORS.textDim} />
              <Text style={styles.infoText}>
                  Pour recharger votre compte, veuillez vous présenter à l'accueil du club.
              </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DERNIÈRES TRANSACTIONS</Text>
        
        {history.length === 0 ? (
            <View style={{alignItems: 'center', marginTop: 30, opacity: 0.5}}>
                <Ionicons name="receipt-outline" size={50} color={COLORS.textDim} />
                <Text style={{color: COLORS.textDim, marginTop: 10}}>Aucune transaction récente</Text>
            </View>
        ) : (
            history.map((item) => (
                <View key={item.id} style={styles.transactionItem}>
                    <View style={[styles.iconBox, { backgroundColor: item.type === 'CREDIT' ? '#1a3300' : '#330000' }]}>
                        <Ionicons 
                            name={item.type === 'CREDIT' ? "arrow-down" : "cart"} 
                            size={20} 
                            color={item.type === 'CREDIT' ? "#4CAF50" : "#ff4444"}
                        />
                    </View>
                    <View style={{flex:1}}>
                        <Text style={styles.tTitle}>{item.description}</Text>
                        <Text style={styles.tDate}>
                            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString().slice(0,5)}
                        </Text>
                    </View>
                    <Text style={[styles.tAmount, {color: item.type === 'CREDIT' ? '#4CAF50' : '#ff4444'}]}>
                        {item.type === 'CREDIT' ? '+' : '-'}{item.amount} DH
                    </Text>
                </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 30, paddingHorizontal: 20 },
  header: { marginBottom: 20 }, // Espace sous le bloc header
  screenTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  balanceCard: { backgroundColor: COLORS.card, padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#333' },
  balanceLabel: { color: COLORS.textDim, fontSize: 16, textTransform: 'uppercase' },
  balanceValue: { color: COLORS.primary, fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
  infoBox: { flexDirection: 'row', marginTop: 15, padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, alignItems: 'center' },
  infoText: { color: COLORS.textDim, marginLeft: 10, fontSize: 12, flex: 1, lineHeight: 18 },
  sectionTitle: { color: COLORS.textDim, fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 15, borderRadius: 15, marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  tTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  tDate: { color: COLORS.textDim, fontSize: 12 },
  tAmount: { fontWeight: 'bold', fontSize: 16 },
});