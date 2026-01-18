import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const API_URL_SCAN = 'http://10.109.232.202:3000/users/scan'; 

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
        requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const cleanData = data.trim();

    if (cleanData === "GYM_ENTRANCE_SECRET" || cleanData.includes("qr-codes.io")) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.post(API_URL_SCAN, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert(
                "Succès ! 🏋️‍♂️", 
                "Entrée validée (+100 Points)",
                [
                    { 
                        text: "Génial", 
                        onPress: () => navigation.navigate('Accueil') 
                    }
                ]
            );

        } catch (error) {
            const message = error.response?.data?.message || "Erreur de connexion";
            Alert.alert(
                "Oups ✋", 
                message,
                [ { text: "Compris", onPress: () => setScanned(false) } ]
            );
        }
    } else {
        Alert.alert(
            "Invalide", 
            "Ce QR Code n'est pas celui de la salle.",
            [
                { text: "Réessayer", onPress: () => setScanned(false) }
            ]
        );
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{color:'white', textAlign:'center'}}>Besoin de la caméra</Text>
        <Button onPress={requestPermission} title="Autoriser" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
            <Text style={styles.instructionText}>Scanne le QR Code à l'entrée</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topOverlay: { position: 'absolute', top: 150, backgroundColor: 'rgba(0,0,0,0.7)', padding: 15, borderRadius: 10 },
  instructionText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  backButton: { 
      position: 'absolute', 
      top: 50, 
      left: 20, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      borderRadius: 20, 
      padding: 5 
  }
});