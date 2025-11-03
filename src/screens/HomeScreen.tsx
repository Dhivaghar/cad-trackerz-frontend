import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import LogoHeader from "../components/LogoHeader";
import BottomNav from "../components/BottomNav";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useIsFocused } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

// ✅ Notification handler (always at top)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const API_IP = Constants.expoConfig?.extra?.API_IP || "http://127.0.0.1:5000";

export default function HomeScreen() {
  const { theme } = useTheme();
  const [category, setCategory] = useState("Groceries");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState<any>({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  // ✅ Ask notification permission once (INSIDE component)
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Enable notifications for alerts.");
      }
    })();
  }, []);

  // 🟩 Fetch user + expenses
  const fetchData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        const response = await fetch(`${API_IP}/expenses/${parsedUser.id}`);
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  // ➕ Add Expense
  const handleAddExpense = async () => {
  if (!amount) return Alert.alert("Error", "Please enter an amount");

  const enteredAmount = Number(amount);
  if (isNaN(enteredAmount) || enteredAmount <= 0)
    return Alert.alert("Error", "Please enter a valid positive number");

  const group = getGroup(category);
  const remainingBudget = getRemainingBudget(group);

  if (enteredAmount > remainingBudget) {
    return Alert.alert(
      "Budget Limit Exceeded 🚫",
      `You only have ₹${remainingBudget.toFixed(0)} remaining for ${
        group === "basic"
          ? "Basic Needs"
          : group === "lifestyle"
          ? "Lifestyle"
          : "Savings"
      }.\nReduce the expense amount to stay within your budget.`
    );
  }

  try {
    const expenseData = {
      user_id: user.id,
      amount: enteredAmount,
      category,
      note,
      budget_type: getBudgetType(category),
      expense_date: new Date().toISOString().split("T")[0],
    };

    const response = await fetch(`${API_IP}/expenses/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    });

    const result = await response.json();

    if (response.ok) {
      Alert.alert("Success", "Expense added successfully");
      setExpenses([...expenses, expenseData]);
      setAmount("");
      setNote("");

      // ✅ Local notification for expense added
      // await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: "Expense Added 💸",
      //     body: `₹${enteredAmount} spent on ${category}`,
      //   },
      //   trigger: null,
      // });

      // 🧮 Check for near-limit budgets
      ["basic", "lifestyle", "savings"].forEach(async (grp) => {
        const remaining = getRemainingBudget(grp);
        const percent =
          grp === "basic" ? 0.5 : grp === "lifestyle" ? 0.3 : 0.2;
        const allocated = user.salary * percent;
        const remainingPercent = (remaining / allocated) * 100;

        if (remainingPercent <= 10) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚠️ Budget Almost Used",
              body:
                grp === "basic"
                  ? "Your Basic Needs budget is almost exhausted!"
                  : grp === "lifestyle"
                  ? "Your Lifestyle budget is nearly complete!"
                  : "Your Savings allocation is about to finish!",
            },
            trigger: null,
          });
        }
      });
    } else {
      Alert.alert("Error", result.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to connect to server");
  }
};



  // 🧠 Helpers
  const getBudgetType = (category: string) => {
    const basicNeeds = [
      "Rent / Housing",
      "Utilities",
      "Groceries",
      "Transportation",
      "Insurance",
      "Loan / EMI Payments",
      "Medical & Healthcare",
      "Childcare / Education Fees",
      "Phone & Internet Bills",
    ];
    const lifestyle = [
      "Dining Out / Restaurants",
      "Entertainment",
      "Shopping",
      "Travel & Vacation",
      "Fitness",
      "Gifts & Celebrations",
      "Home Décor / Luxury Items",
      "Emergency Repair",
    ];
    const savings = [
      "Emergency Fund",
      "FD / RD",
      "Mutual Funds / SIP",
      "Stock Market Investments",
      "Retirement Fund",
      "Insurance Savings Plan",
      "Gold / Real Estate",
      "Debt Repayment",
      "Digital Wallet / Savings Account",
    ];

    if (basicNeeds.includes(category)) return "50% - Basic Needs";
    if (lifestyle.includes(category)) return "30% - Lifestyle";
    if (savings.includes(category)) return "20% - Savings";
    return "Other";
  };

  const getGroup = (category: string) => {
    const basicNeeds = [
      "Rent / Housing",
      "Utilities",
      "Groceries",
      "Transportation",
      "Insurance",
      "Loan / EMI Payments",
      "Medical & Healthcare",
      "Childcare / Education Fees",
      "Phone & Internet Bills",
    ];
    const lifestyle = [
      "Dining Out / Restaurants",
      "Entertainment",
      "Shopping",
      "Travel & Vacation",
      "Fitness",
      "Gifts & Celebrations",
      "Home Décor / Luxury Items",
      "Emergency Repair",
    ];
    const savings = [
      "Emergency Fund",
      "FD / RD",
      "Mutual Funds / SIP",
      "Stock Market Investments",
      "Retirement Fund",
      "Insurance Savings Plan",
      "Gold / Real Estate",
      "Debt Repayment",
      "Digital Wallet / Savings Account",
    ];

    if (basicNeeds.includes(category)) return "basic";
    if (lifestyle.includes(category)) return "lifestyle";
    if (savings.includes(category)) return "savings";
    return "other";
  };

  const getRemainingSalary = () => {
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    return user.salary ? user.salary - totalSpent : 0;
  };

  const getRemainingBudget = (group: string) => {
    if (!user.salary) return 0;
    let percent =
      group === "basic" ? 0.5 : group === "lifestyle" ? 0.3 : group === "savings" ? 0.2 : 0;
    const allocated = user.salary * percent;
    const spent = expenses
      .filter((exp) => getGroup(exp.category) === group)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
    return allocated - spent;
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <LogoHeader />
        <Text style={[styles.title, { color: theme.text }]}>Hi, {user.name}</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Salary: ₹{user.salary}</Text>
        <Text style={[styles.subtitle, { color: theme.text, marginTop: 10 }]}>
          Remaining Salary: ₹{getRemainingSalary().toFixed(0)}
        </Text>

        {/* Add Expense */}
        <Text style={[styles.label, { color: theme.text }]}>Add Expense</Text>
        <View style={[styles.pickerContainer, { borderColor: theme.primary }]}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={{ color: theme.text }}
            dropdownIconColor={theme.text}
          >
            {/* 🏠 Basic Needs */}
            <Picker.Item label="🏠 Rent / Housing" value="Rent / Housing" />
            <Picker.Item label="💡 Utilities (Water, Electricity)" value="Utilities" />
            <Picker.Item label="🛒 Groceries" value="Groceries" />
            <Picker.Item label="🚌 Transportation" value="Transportation" />
            <Picker.Item label="🩺 Medical & Healthcare" value="Medical & Healthcare" />
            <Picker.Item label="📞 Phone & Internet Bills" value="Phone & Internet Bills" />
            <Picker.Item label="💳 Loan / EMI Payments" value="Loan / EMI Payments" />
            <Picker.Item label="👶 Childcare / Education Fees" value="Childcare / Education Fees" />
            <Picker.Item label="🧾 Insurance" value="Insurance" />

            {/* 💃 Lifestyle */}
            <Picker.Item label="🍽 Dining Out / Restaurants" value="Dining Out / Restaurants" />
            <Picker.Item label="🎬 Entertainment" value="Entertainment" />
            <Picker.Item label="🛍 Shopping" value="Shopping" />
            <Picker.Item label="✈️ Travel & Vacation" value="Travel & Vacation" />
            <Picker.Item label="🏋️‍♂️ Fitness / Gym" value="Fitness" />
            <Picker.Item label="🎁 Gifts & Celebrations" value="Gifts & Celebrations" />
            <Picker.Item label="🏡 Home Décor / Luxury Items" value="Home Décor / Luxury Items" />
            <Picker.Item label="🔧 Emergency Repair" value="Emergency Repair" />

            {/* 💰 Savings */}
            <Picker.Item label="💵 Emergency Fund" value="Emergency Fund" />
            <Picker.Item label="🏦 FD / RD" value="FD / RD" />
            <Picker.Item label="📈 Mutual Funds / SIP" value="Mutual Funds / SIP" />
            <Picker.Item label="📊 Stock Market Investments" value="Stock Market Investments" />
            <Picker.Item label="👴 Retirement Fund" value="Retirement Fund" />
            <Picker.Item label="🛡 Insurance Savings Plan" value="Insurance Savings Plan" />
            <Picker.Item label="🏠 Gold / Real Estate" value="Gold / Real Estate" />
            <Picker.Item label="💸 Debt Repayment" value="Debt Repayment" />
            <Picker.Item label="💳 Digital Wallet / Savings Account" value="Digital Wallet / Savings Account" />
          </Picker>
        </View>

        <TextInput
          style={[styles.input, { borderColor: theme.primary, color: theme.text }]}
          placeholder="Enter Expense in Rs."
          placeholderTextColor={theme.text}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={[styles.input, { height: 80, borderColor: theme.primary, color: theme.text }]}
          placeholder="Enter Note (optional)"
          placeholderTextColor={theme.text}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleAddExpense}
        >
          <Text style={[styles.btnText, { color: theme.accent }]}>Add+</Text>
        </TouchableOpacity>

        {/* Budget Circles */}
        <View style={styles.budgetContainer}>
          {[{ percent: 50, group: "basic" }, { percent: 30, group: "lifestyle" }, { percent: 20, group: "savings" }].map(
            ({ percent, group }, i) => {
              if (!user.salary) return null;
              const allocated = user.salary * (percent / 100);
              const remaining = getRemainingBudget(group);
              const fillValue =
                allocated > 0
                  ? Math.max(0, Math.min((remaining / allocated) * 100, 100))
                  : 0;

              return (
                <View key={i} style={styles.budgetItem}>
                  <Text style={[styles.budgetLabel, { color: theme.text }]}>
                    {percent}% - {percent === 50 ? "Basic Needs" : percent === 30 ? "Lifestyle" : "Savings"}
                  </Text>
                  <Text style={[styles.budgetAmount, { color: theme.text }]}>
                    Remaining: ₹{remaining.toFixed(0)} / ₹{allocated.toFixed(0)}
                  </Text>
                  <View style={{ width: 100, alignItems: "center", marginTop: 10 }}>
                    <AnimatedCircularProgress
                      size={80}
                      width={8}
                      fill={Number(fillValue)}
                      rotation={0}
                      tintColor={percent === 50 ? "#005370" : percent === 30 ? "#f39c12" : "#27ae60"}
                      backgroundColor="#e0e0e0"
                      lineCap="round"
                    >
                      {() => (
                        <Text style={{ color: theme.text, fontWeight: "bold" }}>
                          {fillValue.toFixed(0)}%
                        </Text>
                      )}
                    </AnimatedCircularProgress>
                  </View>
                </View>
              );
            }
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  subtitle: { fontSize: 18, marginVertical: 10 },
  label: { fontSize: 16, marginTop: 20, fontWeight: "600", textAlign: "center" },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  btn: { padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { fontSize: 16, fontWeight: "600" },
  budgetContainer: { flexDirection: "row", justifyContent: "space-between", marginVertical: 20 },
  budgetItem: { alignItems: "center", flex: 1 },
  budgetLabel: { fontSize: 14, fontWeight: "600", marginBottom: 4, textAlign: "center" },
  budgetAmount: { fontSize: 16, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
});
