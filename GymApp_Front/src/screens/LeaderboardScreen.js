import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://10.109.232.202:3000';
const { width } = Dimensions.get('window');

const formatName = (fullName) => {
  if (!fullName) return "Membre";
  const parts = fullName.trim().split(' ');
  
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  }
  return parts[0];
};

export default function LeaderboardScreen({ navigation }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      let myId = null;
      if (token) {
          const profileRes = await axios.get(`${API_URL}/users/profile`, {
               headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(profileRes.data);
          myId = profileRes.data.id;
      }

      const lbRes = await axios.get(`${API_URL}/users/leaderboard`);
      
      let currentRank = 1;
      const formattedData = lbRes.data.map((user, index) => {
          if (index > 0) {
              const previousUser = lbRes.data[index - 1];
              if (user.totalPoints < previousUser.totalPoints) {
                  currentRank = index + 1; 
              }
          }

          return {
              ...user,
              rank: currentRank, // Le rang calculé
              isMe: user.id === myId,
              avatar: `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&bold=true`
          };
      });
      
      setLeaderboard(formattedData);

    } catch (error) {
      console.error("Erreur leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const renderItem = ({ item, index }) => {
    if (index < 3) return null; // Les 3 premiers sont dans le podium

    return (
      <View style={[styles.rankRow, item.isMe && styles.myRankRow]}>
        <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>{item.rank}</Text>
        </View>
        <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, item.isMe && {color: COLORS.primary}]}>
              {formatName(item.name)} {item.isMe ? '(Moi)' : ''}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="barbell-outline" size={12} color={COLORS.textDim} />
            <Text style={styles.userSessions}> {item.sessionsCount} Séances</Text>
          </View>
        </View>
        
        <View style={{alignItems: 'flex-end'}}>
            <Text style={styles.points}>{item.totalPoints}</Text>
            <Text style={styles.ptsLabel}>PTS</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (leaderboard.length === 0) return null;

    const first = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    return (
        <View style={styles.headerContainer}>
        <Text style={styles.seasonText}>Le Top 3 du Club 🔥</Text>
        
        <View style={styles.podiumContainer}>
            {second && (
                <View style={[styles.podiumStep, {marginTop: 40}]}>
                    <Image source={{ uri: second.avatar }} style={styles.podiumAvatarSmall} />
                    <Text style={styles.podiumName} numberOfLines={1}>{formatName(second.name)}</Text>
                    <View style={[styles.bar, {height: 80, backgroundColor: '#C0C0C0'}]}>
                        <Text style={styles.podiumRank}>{second.rank}</Text>
                    </View>
                    <Text style={styles.podiumPoints}>{second.totalPoints} pts</Text>
                </View>
            )}

            {first && (
                <View style={[styles.podiumStep, {zIndex: 10}]}>
                    <Ionicons name="trophy" size={30} color="#FFD700" style={styles.crown} />
                    <Image source={{ uri: first.avatar }} style={styles.podiumAvatarBig} />
                    <Text style={styles.podiumName} numberOfLines={1}>{formatName(first.name)}</Text>
                    <View style={[styles.bar, {height: 110, backgroundColor: '#FFD700'}]}>
                        <Text style={styles.podiumRank}>{first.rank}</Text>
                    </View>
                    <Text style={styles.podiumPoints}>{first.totalPoints} pts</Text>
                </View>
            )}

            {third && (
                <View style={[styles.podiumStep, {marginTop: 60}]}>
                    <Image source={{ uri: third.avatar }} style={styles.podiumAvatarSmall} />
                    <Text style={styles.podiumName} numberOfLines={1}>{formatName(third.name)}</Text>
                    <View style={[styles.bar, {height: 60, backgroundColor: '#CD7F32'}]}>
                        <Text style={styles.podiumRank}>{third.rank}</Text>
                    </View>
                    <Text style={styles.podiumPoints}>{third.totalPoints} pts</Text>
                </View>
            )}

        </View>
        <Text style={styles.sectionTitle}>LE RESTE DU CLASSEMENT</Text>
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 10}}>
              <Ionicons name="arrow-back" size={30} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>CLASSEMENT CLUB 📊</Text>
      </View>

      {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
          <FlatList
            data={leaderboard}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{paddingBottom: 100}}
            ListEmptyComponent={
                <Text style={{color: '#555', textAlign: 'center', marginTop: 20}}>Aucun membre classé pour le moment.</Text>
            }
          />
      )}

      {currentUser && (
        <View style={styles.myFixedBar}>
            <View style={{flex: 1}}>
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                    {formatName(currentUser.name)}
                </Text>
                <Text style={{color: COLORS.textDim, fontSize: 12}}>
                    Tu as <Text style={{color: COLORS.primary, fontWeight:'bold'}}>{currentUser.totalPoints} PTS</Text> et {currentUser.sessionsCount} sessions.
                </Text>
                <View style={{height: 4, backgroundColor: '#333', borderRadius: 2, width: '100%', marginTop: 8}}>
                    <View style={{height: 4, backgroundColor: COLORS.primary, borderRadius: 2, width: '60%'}} />
                </View>
            </View>
            
            <View style={styles.circleRank}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                    #{leaderboard.find(u => u.isMe)?.rank || '?'}
                </Text>
            </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 30 },
  header: { paddingHorizontal: 20, marginBottom: 10 },
  screenTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  headerContainer: { padding: 20, alignItems: 'center' },
  seasonText: { color: COLORS.primary, fontSize: 14, marginBottom: 30, fontWeight: 'bold' },
  podiumContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', width: '100%', marginBottom: 30 },
  podiumStep: { alignItems: 'center', marginHorizontal: 8, width: width * 0.25 },
  bar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 5, opacity: 0.9 },
  podiumAvatarBig: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#FFD700', backgroundColor: '#333' },
  podiumAvatarSmall: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#333' },
  crown: { marginBottom: -10, zIndex: 20 },
  podiumRank: { color: 'rgba(0,0,0,0.4)', fontSize: 30, fontWeight: 'bold' },
  podiumName: { color: 'white', fontWeight: 'bold', fontSize: 11, marginTop: 5, textAlign: 'center', height: 30 },
  podiumPoints: { color: COLORS.textDim, fontWeight: 'bold', fontSize: 10 },
  sectionTitle: { alignSelf: 'flex-start', color: COLORS.textDim, fontWeight: 'bold', marginBottom: 15, fontSize: 12, textTransform: 'uppercase' },
  rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 15, borderRadius: 15, marginBottom: 10 },
  myRankRow: { borderWidth: 1, borderColor: COLORS.primary, backgroundColor: '#2a1a1a' },
  rankBadge: { width: 30, alignItems: 'center', marginRight: 10 },
  rankNumber: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  listAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15, backgroundColor: '#333' },
  userInfo: { flex: 1 },
  userName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  userSessions: { color: COLORS.textDim, fontSize: 12 },
  points: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  ptsLabel: { color: COLORS.textDim, fontSize: 10, textAlign: 'right' },
  myFixedBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E1E1E', padding: 20, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', shadowColor: "#000", shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.3, shadowRadius: 5, elevation: 20 },
  circleRank: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 20 }
});