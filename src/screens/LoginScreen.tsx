import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "../context/ThemeContext";
import LogoHeader from "../components/LogoHeader";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("http://192.168.254.193:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(data);
      
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      if (res.ok) {
        Alert.alert("Success", data.message);
        router.replace("/home");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err: any) {
      Alert.alert("Error", "Network issue: " + err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <LogoHeader />

      {/* LOGIN FORM */}
      <View style={styles.loginBox}>
        <Text style={[styles.title, { color: theme.text }]}>Login</Text>

        {/* EMAIL */}
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
          placeholder="Email"
          placeholderTextColor={theme.primary}
          keyboardType="email-address"
          autoCapitalize="none"
          selectionColor={theme.primary}
          value={email}
          onChangeText={setEmail}
        />

        {/* PASSWORD with eye icon */}
        <View style={[styles.inputContainer, { borderColor: theme.primary }]}>
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0, color: theme.text, height: "100%" }]}
            placeholder="Password"
            placeholderTextColor={theme.primary}
            selectionColor={theme.primary}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>Login</Text>
        </TouchableOpacity>

        {/* SIGNUP LINK */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
          <Text style={{ color: theme.text }}>Don’t have an account? </Text>
          <Text
            style={{ color: theme.primary, fontWeight: "bold" }}
            onPress={() => router.replace("/")}
          >
            SignUp
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loginBox: { justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15, textAlign: "center" },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 45,
  },
  button: { padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});