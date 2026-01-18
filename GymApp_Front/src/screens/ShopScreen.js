import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://10.109.232.202:3000'; 

export default function ShopScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      if (response.ok) setProducts(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de charger le shop");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = async (product) => {
    Alert.alert(
      "Confirmation",
      `Acheter ${product.name} pour ${product.price} DH ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "ACHETER", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) return Alert.alert("Erreur", "Connecte-toi d'abord");

              const response = await fetch(`${API_URL}/products/order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ productId: product.id })
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert("Commande Envoyée ! ✅", "Récupère ton produit au comptoir.");
              } else {
                Alert.alert("❌ Oups", data.message || "Erreur inconnue");
              }
            } catch (e) {
              Alert.alert("Erreur", "Problème de connexion");
            }
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const renderProduct = ({ item }) => {
    const imageSource = item.image && item.image.startsWith('http')
        ? { uri: item.image } 
        : { uri: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=1000' };

    const isAvailable = item.stock > 0;

    return (
      <View style={styles.card}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
        
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price} DH</Text>
          
          <Text style={{color: COLORS.textDim, fontSize: 12, marginTop: 5}}>
            {item.category}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.buyButton, !isAvailable && styles.disabledButton]}
          onPress={() => handleBuy(item)}
          disabled={!isAvailable} 
        >
          <Text style={styles.buyText}>
            {isAvailable ? 'ACHETER' : 'ÉPUISÉ'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => {
                    setShowSearch(!showSearch);
                    if (showSearch) setSearchQuery('');
                }}
                style={styles.searchIconBtn}
            >
                <Ionicons name={showSearch ? "close" : "search"} size={26} color="white" />
            </TouchableOpacity>
        </View>

        {!showSearch && (
            <View>
                <Text style={styles.title}>SHOP</Text>
                <Text style={styles.subtitle}>Dépense ton solde ici !</Text>
            </View>
        )}

        {showSearch && (
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textDim} style={{marginRight: 10}} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Chercher un produit..."
                    placeholderTextColor={COLORS.textDim}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={true}
                />
            </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
              <Text style={{color: COLORS.textDim, textAlign: 'center', marginTop: 50}}>
                  Aucun produit trouvé pour "{searchQuery}".
              </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 30 },
  header: { paddingHorizontal: 20, marginBottom: 10 },
  
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { color: COLORS.textDim, fontSize: 14 },
  searchIconBtn: { padding: 5, backgroundColor: '#333', borderRadius: 20 },
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginTop: 15,
      borderWidth: 1,
      borderColor: '#444'
  },
  searchInput: {
      flex: 1,
      color: 'white',
      fontSize: 16
  },
  card: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.card, 
    borderRadius: 15, 
    marginBottom: 15, 
    padding: 15, 
    alignItems: 'center' 
  },
  image: { width: 80, height: 80, marginRight: 15, borderRadius: 10, backgroundColor: 'white' },
  info: { flex: 1 },
  name: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  price: { color: COLORS.primary, fontWeight: 'bold', fontSize: 18 },
  
  buyButton: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
  disabledButton: { backgroundColor: '#444' },
  buyText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});