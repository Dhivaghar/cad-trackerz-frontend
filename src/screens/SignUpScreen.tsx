import React, { useState, useRef,useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity,ActivityIndicator } from "react-native";
import { useTheme } from "../context/ThemeContext";
import LogoHeader from "../components/LogoHeader";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from '@react-native-async-storage/async-storage';

// import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";
// import LoginScreen from './src/screens/LoginScreen';
import Constants from 'expo-constants';
const API_IP = Constants.expoConfig?.extra?.API_IP || "127.0.0.1";

export default function SignUpScreen() {
  const { theme } = useTheme();
  const [showOtp, setShowOtp] = useState(false);
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
      async function checkUser(){
        const user=await AsyncStorage.getItem("user");
        if(user){
          setLoading(false)
          router.replace("/home")
        }
        else{
          setLoading(false)
        }
      }
      checkUser()
  },[])

  // const navigation = useNavigation();
  const router = useRouter();
  // form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP refs
const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpRefs = Array(4).fill(null).map(() => useRef<TextInput>(null));

  const handleGetOtp = async () => {
  if (!fullName || !email || !salary || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch(`http://${API_IP}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const text = await res.text(); // always get raw response first
    console.log("Server response:", text);

    // try parse JSON only if it looks like JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON from server: " + text);
    }

    alert(data.message);
    setShowOtp(true);

  } catch (err) {
    console.log("Error sending OTP:", err);
    alert("Error sending OTP: " + err.message);
  }
}; // <-- This closing brace was missing



const handleSubmitOtp = async () => {
  try {
    const otp = otpDigits.join("");
    const res = await fetch(`${API_IP}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, salary, password, otp }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      // Navigate to Login screen
      router.replace("login"); // "Login" is the screen name in Stack.Navigator
    }

  } catch (err) {
    console.log(err);
    alert("Error verifying OTP");
  }
};

if(loading){
  return(
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <ActivityIndicator size="large" color="#007BFF" />
    </View>
    
  )
}


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <LogoHeader />

      {/* SIGNUP FORM */}
      <View style={styles.signUp}>
        <Text style={[styles.title, { color: theme.text }]}>SignUp</Text>

        {/* INPUTS */}
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full Name"
          placeholderTextColor={theme.primary}
          selectionColor={theme.primary}
          style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email ID"
          placeholderTextColor={theme.primary}
          selectionColor={theme.primary}
          keyboardType="email-address"
          style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
        />
        <TextInput
          value={salary}
          onChangeText={setSalary}
          placeholder="Salary"
          placeholderTextColor={theme.primary}
          selectionColor={theme.primary}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
        />

        {/* PASSWORD FIELD WITH EYE */}
        <View style={[styles.inputContainer, { borderColor: theme.primary }]}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.primary}
            selectionColor={theme.primary}
            secureTextEntry={!showPassword}
            style={[styles.input, { color: theme.text, flex: 1, borderWidth: 0, height: "100%" }]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={15} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* CONFIRM PASSWORD FIELD WITH EYE */}
        <View style={[styles.inputContainer, { borderColor: theme.primary }]}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor={theme.primary}
            selectionColor={theme.primary}
            secureTextEntry={!showConfirm}
            style={[styles.input, { color: theme.text, flex: 1, borderWidth: 0, height: "100%" }]}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Feather name={showConfirm ? "eye" : "eye-off"} size={15} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* GET OTP BUTTON */}
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleGetOtp}>
          <Text style={[styles.buttonText, { color: theme.background }]}>Get OTP</Text>
        </TouchableOpacity>

        {/* OTP SECTION */}
        {showOtp && (
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3].map((i) => (
              <TextInput
                key={i}
                ref={otpRefs[i]}
                style={[styles.otpBox, { color: theme.text, borderColor: theme.primary }]}
                keyboardType="numeric"
                selectionColor={theme.primary}
                maxLength={1}
                onChangeText={(val) => {
                  const newDigits = [...otpDigits];
                  newDigits[i] = val;
                  setOtpDigits(newDigits);
                  if (val && i < 3) otpRefs[i + 1].current?.focus();
                }}
              />
            ))}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary, marginTop: 10 }]}
              onPress={handleSubmitOtp}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
        <Text style={{ color: theme.text }}>Already registered? </Text>
        <Text
          style={{ color: theme.primary, fontWeight: "bold" }}
          onPress={() => router.replace("login")}
        >
          Login
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  signUp: { justifyContent: "center" },
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
  buttonText: { fontSize: 16, fontWeight: "bold" },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 15, gap: 10, flexWrap: "wrap" },
  otpBox: { borderWidth: 1, padding: 12, borderRadius: 8, textAlign: "center", flex: 1, fontSize: 18 },
});