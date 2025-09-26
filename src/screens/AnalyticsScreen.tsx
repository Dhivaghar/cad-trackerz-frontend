import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const [total, setTotal] = useState(0);
  const [byCategory, setByCategory] = useState({});

  useEffect(() => {
    const fetchExpenses = async () => {
      const stored = await AsyncStorage.getItem("expenses");
      if (stored) {
        const parsed = JSON.parse(stored);

        // Total amount
        const totalAmount = parsed.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        setTotal(totalAmount);

        // Category-wise amount
        const catSummary = {};
        parsed.forEach((exp) => {
          if (!catSummary[exp.category]) catSummary[exp.category] = 0;
          catSummary[exp.category] += parseFloat(exp.amount);
        });
        setByCategory(catSummary);
      }
    };
    fetchExpenses();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
        <LogoHeader />

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="stats-chart-outline" size={28} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
        </View>

        <Text style={[styles.totalText, { color: theme.text }]}>Total Spent: ₹{total}</Text>

        <View style={styles.section}>
          {Object.keys(byCategory).length === 0 ? (
            <Text style={{ color: theme.text }}>No expenses yet</Text>
          ) : (
            Object.entries(byCategory).map(([cat, amt], idx) => (
              <Text key={idx} style={{ color: theme.text, fontSize: 16, marginVertical: 4 }}>
                {cat}: ₹{amt}
              </Text>
            ))
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  totalText: { fontSize: 18, marginVertical: 10 },
  section: { marginTop: 15 },
});
