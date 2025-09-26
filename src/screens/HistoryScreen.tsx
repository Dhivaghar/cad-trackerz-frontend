import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryPage() {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      const stored = await AsyncStorage.getItem("expenses");
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpenses(parsed);
        filterExpenses(parsed, fromDate, toDate);
      }
    };
    fetchExpenses();
  }, []);

  const filterExpenses = (data, from, to) => {
    const filteredData = data.filter((exp) => {
      const expDate = new Date(exp.date);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
        <LogoHeader />

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="time-outline" size={28} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Expense History</Text>
        </View>

        {/* Date Range */}
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

        {/* Expense List */}
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card || "#fff" }]}>
              <Text style={[styles.category, { color: theme.text }]}>{item.category}</Text>
              <Text style={{ color: theme.text }}>₹{item.amount}</Text>
              <Text style={{ color: theme.text, fontSize: 12 }}>
                {new Date(item.date).toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: theme.text }}>No expenses found</Text>}
        />
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  dateBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  category: { fontSize: 16, fontWeight: "600" },
});
