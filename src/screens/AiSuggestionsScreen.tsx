import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from "react-native";
import { API_IP } from "@env";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AISuggestionsScreen() {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [generating, setGenerating] = useState(false);

  // ✅ Fetch logged-in user ID
  useEffect(() => {
    const fetchUserAndSuggestions = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        setUserId(user.id);

        // Fetch suggestions
        const res = await fetch(`${API_IP}/get-suggestions/${user.id}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Error fetching AI suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSuggestions();
  }, []);

  // 🧠 Generate new AI suggestion
  const handleGenerateSuggestion = async () => {
    if (!userId) return Alert.alert("Error", "User not found");
    setGenerating(true);

    try {
      const res = await fetch(`${API_IP}/generate-suggestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to generate suggestion");
        return;
      }

      Alert.alert("Success", "AI suggestion generated successfully!");

      // Refresh suggestions list
      const newRes = await fetch(`${API_IP}/get-suggestions/${userId}`);
      const newData = await newRes.json();
      setSuggestions(newData.suggestions || []);
    } catch (err) {
      console.error("Error generating AI suggestion:", err);
      Alert.alert("Error", "Something went wrong while generating suggestion");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading AI suggestions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 10 }}>
      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 90 }}>
      <LogoHeader />
      <Text style={[styles.header, { color: theme.text }]}>💡 AI Money-Saving Tips</Text>

      {/* Generate Suggestion Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: generating ? "#aaa" : theme.primary }]}
        onPress={handleGenerateSuggestion}
        disabled={generating}
      >
        <Text style={styles.buttonText}>
          {generating ? "Generating..." : "✨ Generate Suggestion"}
        </Text>
      </TouchableOpacity>

      {suggestions.length === 0 ? (
        <Text style={[styles.noData, { color: theme.text }]}>No suggestions yet.</Text>
      ) : (
        suggestions.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.tip}>{item.suggestion}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toDateString()}</Text>
          </View>
        ))
      )}
</ScrollView>
      <BottomNav />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tip: {
    fontSize: 16,
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
