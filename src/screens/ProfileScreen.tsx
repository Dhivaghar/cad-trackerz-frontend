import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState({ name: "Demo User", email: "demo@email.com" });

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login"); // navigate back to login
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 15 }}>
        <LogoHeader />

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-outline" size={28} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.card || "#3333" }]}>
          <Text style={[styles.infoText, { color: theme.text }]}>Username: {user.name}</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>Email: {user.email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.primary }]}
          onPress={handleLogout}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  infoBox: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  infoText: { fontSize: 16, marginVertical: 4 },
  logoutBtn: {
    marginTop: 30,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
