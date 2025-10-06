import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_IP = Constants.expoConfig?.extra?.API_IP || "127.0.0.1";

export default function ProfilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [salary, setSalary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!user) {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.salary) setSalary(String(user.salary));
  }, [user]);

  const handleSaveSalary = async () => {
    if (!salary || isNaN(Number(salary))) {
      Alert.alert("Error", "Please enter a valid salary");
      return;
    }

    Alert.alert(
      "Save Salary",
      "Are you sure you want to update your salary?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          style: "default",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${API_IP}/user/update-salary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, salary: Number(salary) }),
              });
              const result = await response.json();
              if (response.ok) {
                setUser({ ...user, salary: Number(salary) });
                Alert.alert("Success", "Salary updated!");
              } else {
                Alert.alert("Error", result.message || "Failed to update salary");
              }
            } catch (err) {
              Alert.alert("Error", "Network error");
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  const handleReloadSalary = async () => {
  Alert.alert(
    "Reload Salary",
    "This will reset your salary progress and start a new salary cycle. Continue?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reload",
        onPress: async () => {
          try {
            const response = await fetch(`${API_IP}/user/reload-salary`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: user.id }),
            });
            const result = await response.json();
            if (response.ok) {
              // Optionally update user context or AsyncStorage if needed
              Alert.alert("Success", "Salary has been reloaded successfully!");
            } else {
              Alert.alert("Error", result.message || "Failed to reload salary");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to reload salary");
          }
        },
      },
    ]
  );
};


  const handleCreateAccount = () => router.replace("/signup");

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
    router.replace("/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>User not logged in</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 15 }}>
        <LogoHeader />

        <View style={styles.header}>
          <Ionicons name="person-outline" size={28} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.background || "#fff", shadowColor: theme.mode === "dark" ? "#f9c73f" : "#000" }]}>
          <Text style={[styles.infoText, { color: theme.text }]}>Username: {user.name}</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>Email: {user.email}</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>Salary:</Text>
          <TextInput
            style={[styles.salaryInput, { color: theme.text, borderColor: theme.primary }]}
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSaveSalary}
            disabled={loading}
          >
            <Text style={{ color: theme.background, fontSize: 16 }}>Save Salary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reloadBtn, { backgroundColor: theme.accent }]}
            onPress={handleReloadSalary}
            disabled={loading}
          >
            <Ionicons name="reload" size={18} color={theme.text} />
            <Text style={{ color: theme.text, fontSize: 15, marginLeft: 6 }}>Reload Salary</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.createBtn, { backgroundColor: theme.primary }]} onPress={handleCreateAccount}>
          <Text style={{ color: theme.background, fontSize: 16 }}>Create New Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.primary }]} onPress={handleLogout}>
          <Text style={{ color: theme.background, fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </View>

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
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
  },
  infoText: { fontSize: 16, marginVertical: 4 },
  salaryInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 8 },
  saveBtn: { padding: 10, borderRadius: 8, alignItems: "center", marginVertical: 5 },
  reloadBtn: { flexDirection: "row", padding: 10, borderRadius: 8, alignItems: "center", justifyContent: "center", marginVertical: 5 },
  createBtn: { padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 10 },
  logoutBtn: { padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 5 },
});
