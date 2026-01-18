import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.109.232.202:3000/auth';

export default function LoginScreen({ navigation }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (isRegistering && !name) {
      Alert.alert('Erreur', 'Le nom est obligatoire pour l\'inscription');
      return;
    }

    setLoading(true);
    const endpoint = isRegistering ? '/register' : '/login';
    const payload = isRegistering 
      ? { email, password, name } 
      : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
            Alert.alert('Succès', 'Compte créé ! Connectez-vous maintenant.');
            setIsRegistering(false); 
        } else {
            await AsyncStorage.setItem('userToken', data.access_token);
            if (data.user) {
              await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
            }
            navigation.replace('MainApp');
        }
      } else {
        if (response.status === 403) {
            Alert.alert(
                "⏳ Compte en attente", 
                "Merci de ton inscription ! Un membre du staff doit valider que tu es bien abonné au Gym avant de t'activer l'accès."
            );
        } else {
            Alert.alert('Erreur', data.message || 'Une erreur est survenue');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur Réseau', 'Impossible de joindre le serveur. Vérifie ton IP et que le Backend tourne.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="barbell" size={60} color={COLORS.primary} />
          <Text style={styles.title}>RED<Text style={{color: 'white'}}>VOLT</Text></Text>
          <Text style={styles.subtitle}>{isRegistering ? 'Rejoins le clan' : 'Ravis de vous revoir !'}</Text>
        </View>

        <View style={styles.form}>
          {isRegistering && (
            <TextInput
              placeholder="Nom Complet"
              placeholderTextColor="#666"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          )}
          
          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor="#666"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={loading}>
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.authButtonText}>{isRegistering ? "S'INSCRIRE" : "SE CONNECTER"}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {isRegistering ? "J'ai déjà un compte ? " : "Pas encore membre ? "}
            <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
              {isRegistering ? "Se connecter" : "Créer un compte"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 40, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 2 },
  subtitle: { color: COLORS.textDim, marginTop: 10, fontSize: 16 },
  form: { marginBottom: 30 },
  input: { backgroundColor: COLORS.card, color: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  authButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  authButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchButton: { alignItems: 'center' },
  switchText: { color: COLORS.textDim },
});