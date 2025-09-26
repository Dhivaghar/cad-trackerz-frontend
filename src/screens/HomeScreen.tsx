import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import LogoHeader from "../components/LogoHeader";
import BottomNav from "../components/BottomNav";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { theme } = useTheme();
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    fetchUser();
  }, []);

  const handleAddExpense = () => {
    if (!amount) return alert("Enter an amount");
    const newExpense = { category, amount };
    setExpenses([...expenses, newExpense]);
    setAmount("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <LogoHeader />

        <Text style={[styles.title, { color: theme.text }]}>Hi, {user.name}</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Salary: ₹{user.salary}</Text>

        <Text style={[styles.label, { color: theme.text }]}>Add Expense</Text>

        <View style={[styles.pickerContainer, { borderColor: theme.primary }]}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={{ color: theme.text }}
            dropdownIconColor={theme.text}
          >
            <Picker.Item label="Rent / Housing" value="Rent / Housing" />
            <Picker.Item label="Utilities (Electricity, Water, Gas)" value="Utilities" />
            <Picker.Item label="Groceries" value="Groceries" />
            <Picker.Item label="Transportation (Fuel, Bus, Train, Taxi)" value="Transportation" />
            <Picker.Item label="Insurance (Health, Vehicle, Home)" value="Insurance" />
            <Picker.Item label="Loan / EMI Payments" value="Loan / EMI Payments" />
            <Picker.Item label="Medical & Healthcare" value="Medical & Healthcare" />
            <Picker.Item label="Childcare / Education Fees" value="Childcare / Education Fees" />
            <Picker.Item label="Phone & Internet Bills" value="Phone & Internet Bills" />

            <Picker.Item label="Dining Out / Restaurants" value="Dining Out / Restaurants" />
            <Picker.Item label="Entertainment (Movies, Concerts, Subscriptions)" value="Entertainment" />
            <Picker.Item label="Shopping (Clothes, Gadgets, Accessories)" value="Shopping" />
            <Picker.Item label="Travel & Vacation" value="Travel & Vacation" />
            <Picker.Item label="Fitness (Gym, Sports, Hobbies)" value="Fitness" />
            <Picker.Item label="Gifts & Celebrations" value="Gifts & Celebrations" />
            <Picker.Item label="Home Décor / Luxury Items" value="Home Décor / Luxury Items" />
            <Picker.Item label="Emergency Repair (Appliances, Vehicle)" value="Emergency Repair" />
            
            <Picker.Item label="Emergency Fund" value="Emergency Fund" />
            <Picker.Item label="FD / RD" value="FD / RD" />
            <Picker.Item label="Mutual Funds / SIP" value="Mutual Funds / SIP" />
            <Picker.Item label="Stock Market Investments" value="Stock Market Investments" />
            <Picker.Item label="Retirement Fund" value="Retirement Fund" />
            <Picker.Item label="Insurance Savings Plan" value="Insurance Savings Plan" />
            <Picker.Item label="Gold / Real Estate" value="Gold / Real Estate" />
            <Picker.Item label="Debt Repayment" value="Debt Repayment" />
            <Picker.Item label="Digital Wallet / Savings Account" value="Digital Wallet / Savings Account" />
          </Picker>
        </View>

        <TextInput
          style={[styles.input, { borderColor: theme.primary, color: theme.text }]}
          placeholder="Enter Expense"
          placeholderTextColor={theme.text}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleAddExpense}
        >
          <Text style={[styles.btnText, { color: theme.accent }]}>Add</Text>
        </TouchableOpacity>

        {/* Budget Circulars */}
        <View style={styles.budgetContainer}>
          {[50, 30, 20].map((percent, i) => (
            <View key={i} style={styles.budgetItem}>
              <Text style={[styles.budgetLabel, { color: theme.text }]}>{percent}%</Text>
              <Text style={[styles.budgetLabel, { color: theme.text }]}>
                {percent === 50 ? "Basic Needs" : percent === 30 ? "Lifestyle" : "Savings"}
              </Text>
              <Text style={[styles.budgetAmount, { color: theme.text }]}>
                ₹{(user.salary * (percent / 100)).toFixed(0)}
              </Text>
              <AnimatedCircularProgress
                size={80}
                width={8}
                fill={percent}
                tintColor={percent === 50 ? "#005370" : percent === 30 ? "#f39c12" : "#27ae60"}
                backgroundColor="#e0e0e0"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom navigation stays fixed at bottom */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  subtitle: { fontSize: 18, marginVertical: 10 },
  label: { fontSize: 16, marginTop: 20, fontWeight: "600" },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  btn: { padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { fontSize: 16, fontWeight: "600" },
  budgetContainer: { flexDirection: "row", justifyContent: "space-between", marginVertical: 20 },
  budgetItem: { alignItems: "center", flex: 1 },
  budgetLabel: { fontSize: 14, fontWeight: "600", marginBottom: 4, textAlign: "center" },
  budgetAmount: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
});
