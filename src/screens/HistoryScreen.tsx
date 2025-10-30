import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_IP } from "@env";

const categoryIcons = {
  Groceries: "cart-outline",
  "Dining Out / Restaurants": "fast-food-outline",
  Entertainment: "film-outline",
  Shopping: "pricetag-outline",
  "Travel & Vacation": "airplane-outline",
  "Medical & Healthcare": "medkit-outline",
  Utilities: "flash-outline",
  "Rent / Housing": "home-outline",
  Transportation: "car-outline",
  Insurance: "shield-outline",
  "Loan / EMI Payments": "cash-outline",
  "Childcare / Education Fees": "school-outline",
  "Phone & Internet Bills": "call-outline",
  "Emergency Fund": "alert-outline",
  "FD / RD": "wallet-outline",
  "Mutual Funds / SIP": "trending-up-outline",
  "Stock Market Investments": "stats-chart-outline",
  "Retirement Fund": "hourglass-outline",
  "Gifts & Celebrations": "gift-outline",
  "Home Décor / Luxury Items": "color-palette-outline",
  "Debt Repayment": "remove-circle-outline",
  "Digital Wallet / Savings Account": "card-outline",
  Fitness: "barbell-outline",
  Other: "ellipsis-horizontal-outline",
};

function groupByDate(expenses) {
  const groups = {};
  expenses.forEach((exp) => {
    const dateStr = new Date(exp.expense_date || exp.date).toDateString();
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(exp);
  });
  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((date) => ({ title: date, data: groups[date] }));
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const response = await fetch(`${API_IP}/expenses/all/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch expenses");
        const data = await response.json();
        setExpenses(data);
        filterExpenses(data, fromDate, toDate);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
        setExpenses([]);
        setFiltered([]);
      }
    };
    fetchExpenses();
  }, []);

  const filterExpenses = (data, from, to) => {
    const filteredData = data.filter((exp) => {
      const expDate = new Date(exp.expense_date || exp.date);
      return expDate >= from && expDate <= to;
    });
    setFiltered(filteredData);
  };

  const handleFromChange = (event, selectedDate) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
      filterExpenses(expenses, selectedDate, toDate);
    }
  };

  const handleToChange = (event, selectedDate) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
      filterExpenses(expenses, fromDate, selectedDate);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding:10 }}>
      <LogoHeader />

      <View style={styles.header}>
        <Ionicons name="time-outline" size={28} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>Expense History</Text>
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity
          style={[styles.dateBtn, { borderColor: theme.primary }]}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={{ color: theme.text }}>From: {fromDate.toDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateBtn, { borderColor: theme.primary }]}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={{ color: theme.text }}>To: {toDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker value={fromDate} mode="date" display="default" onChange={handleFromChange} />
      )}
      {showToPicker && (
        <DateTimePicker value={toDate} mode="date" display="default" onChange={handleToChange} />
      )}

      <SectionList
        sections={groupByDate(filtered)}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: theme.primary }]}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.background || "#fff",
            shadowColor: theme.mode === "dark" ? "#fff" : "#000",
           }]}>
            <View style={styles.cardRow}>
              <Ionicons
                name={categoryIcons[item.category] || categoryIcons["Other"]}
                size={32}
                color={theme.primary}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.category, { color: theme.text }]}>{item.category}</Text>
                {item.note ? (
                  <Text style={[styles.note, { color: theme.text }]} numberOfLines={1}>
                    {item.note}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.amount, { color: theme.primary }]}>₹{item.amount}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: theme.text, textAlign: "center", marginTop: 30 }}>No expenses found</Text>}
        contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
      />

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15, justifyContent:"center" },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  dateBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    marginVertical: 4,
    // shadowColor: theme.background === "#000" ? "#fff" : "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: { fontSize: 16, fontWeight: "600" },
  note: { fontSize: 13, opacity: 0.7 },
  amount: { fontSize: 17, fontWeight: "bold", marginLeft: 10 },
});