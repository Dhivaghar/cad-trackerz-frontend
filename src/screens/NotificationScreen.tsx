import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { useTheme } from "../context/ThemeContext";
import Constants from "expo-constants";

const API_IP = Constants.expoConfig?.extra?.API_IP || "https://cad-trackerz-backend.onrender.com/api";
console.log("Backend URL:", API_IP);


export default function NotificationScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const response = await fetch(`${API_IP}/notifications/${user.id}`);
      const data = await response.json();
      setNotifications(data);
    };
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 10 }}>
      <LogoHeader />
      <Text style={[styles.header, { color: theme.text }]}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.background || "#fff",
            shadowColor: theme.mode === "dark" ? "#fff" : "#000", }]}>
            <Text style={[styles.title, { color: theme.primary }]}>{item.title}</Text>
            <Text style={[styles.message, { color: theme.text }]}>{item.message}</Text>
            <Text style={[styles.time, { color: theme.text }]}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: theme.text, textAlign: "center" }}>No notifications yet</Text>}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: { padding: 15, borderRadius: 10, marginVertical: 6, elevation: 3 },
  title: { fontSize: 16, fontWeight: "bold" },
  message: { fontSize: 14, marginTop: 4 },
  time: { fontSize: 12, opacity: 0.6, marginTop: 6 },
});
