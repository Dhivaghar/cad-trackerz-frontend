import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../context/ThemeContext";
import LogoHeader from "../components/LogoHeader";
import BottomNav from "../components/BottomNav";
import { API_IP } from "@env";

const screenWidth = Dimensions.get("window").width - 30;

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const [total, setTotal] = useState(0);
  const [byCategory, setByCategory] = useState({});
  const [dailyExpenses, setDailyExpenses] = useState({});
  const [timeInterval, setTimeInterval] = useState("weekly"); // default weekly
  const [lineData, setLineData] = useState({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        const response = await fetch(`${API_IP}/expenses/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch expenses");

        const data = await response.json();
        if (data.length === 0) return;

        // Total spending
        const totalAmount = data.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        setTotal(totalAmount);

        // By category
        const catSummary = {};
        data.forEach((e) => {
          if (!catSummary[e.category]) catSummary[e.category] = 0;
          catSummary[e.category] += parseFloat(e.amount);
        });
        setByCategory(catSummary);

        // Daily expenses
        const dailySummary = {};
        data.forEach((e) => {
          if (!e.date) return;
          const date = e.date.split("T")[0]; // YYYY-MM-DD
          if (!dailySummary[date]) dailySummary[date] = 0;
          dailySummary[date] += parseFloat(e.amount);
        });

        setDailyExpenses(dailySummary);
      } catch (err) {
        console.error("Error loading analytics:", err);
      }
    };

    fetchData();
  }, []);

  // Aggregate expenses based on selected interval
  useEffect(() => {
    const aggregateExpenses = () => {
      const entries = Object.entries(dailyExpenses);
      if (entries.length === 0) {
        setLineData({ labels: ["No Data"], datasets: [{ data: [0] }] });
        return;
      }

      const aggregated = {};

      entries.forEach(([date, amount]) => {
        const d = new Date(date);
        let key;
        switch (timeInterval) {
          case "weekly": {
            const firstDay = new Date(d);
            firstDay.setDate(d.getDate() - d.getDay()); // Sunday
            key = firstDay.toISOString().slice(0, 10);
            break;
          }
          case "monthly":
            key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
            break;
          case "yearly":
            key = `${d.getFullYear()}`;
            break;
        }
        aggregated[key] = (aggregated[key] || 0) + amount;
      });

      const sortedKeys = Object.keys(aggregated).sort((a, b) => new Date(a) - new Date(b));
      const dataValues = sortedKeys.map((k) => aggregated[k]);

      // Ensure at least 2 points for chart rendering
      if (dataValues.length === 1) {
        sortedKeys.push(""); // dummy label
        dataValues.push(0);  // dummy value
      }

      setLineData({ labels: sortedKeys, datasets: [{ data: dataValues }] });
    };

    aggregateExpenses();
  }, [dailyExpenses, timeInterval]);

  // Pie chart data
  const pieData = Object.entries(byCategory).map(([category, amount], i) => ({
    name: category,
    amount,
    color: chartColors[i % chartColors.length],
    legendFontColor: theme.text,
    legendFontSize: 9,
  }));

  // Top 3 categories for bar chart
  const top3 = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const barData = {
    labels: top3.map(([category]) => category),
    datasets: [{ data: top3.map(([_, amount]) => amount) }],
  };

  const barChartWidth = Math.max(screenWidth, top3.length * 120);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 90 }}>
        <LogoHeader />

        <View style={styles.header}>
          <Ionicons name="stats-chart-outline" size={28} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
        </View>

        <Text style={[styles.totalText, { color: theme.text }]}>
          Total Spent: ₹{total.toFixed(2)}
        </Text>

        {/* Pie Chart */}
        {pieData.length > 0 ? (
          <>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Category Distribution</Text>
            <PieChart
              data={pieData.map((p) => ({
                name: p.name,
                population: p.amount,
                color: p.color,
                legendFontColor: theme.text,
                legendFontSize: 9,
              }))}
              width={screenWidth}
              height={160}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              chartConfig={{
                color: () => theme.primary,
                labelColor: () => theme.text,
              }}
            />
          </>
        ) : (
          <Text style={{ color: theme.text, marginTop: 20 }}>No data to display</Text>
        )}

        {/* Top 3 Bar Chart */}
        {barData.labels.length > 0 && (
          <>
            <Text style={[styles.chartTitle, { color: theme.text, marginTop: 30 }]}>
              Top 3 Category-wise Spending
            </Text>
            <ScrollView horizontal contentContainerStyle={{ paddingBottom: 60 }}>
              <BarChart
                data={barData}
                width={barChartWidth}
                height={600}
                fromZero
                showValuesOnTopOfBars
                withHorizontalLabels={false} 
                withInnerLines={false} 
                chartConfig={{
                  backgroundGradientFrom: theme.background,
                  backgroundGradientTo: theme.background,
                  color: () => theme.primary,
                  labelColor: () => theme.text,
                  decimalPlaces: 0,
                }}
                verticalLabelRotation={90}
                style={{ borderRadius: 6 }}
              />
            </ScrollView>
          </>
        )}

        {/* Line Chart with Interval Picker */}
        {Object.keys(dailyExpenses).length > 0 && (
          <>
            <Text style={[styles.chartTitle, { color: theme.text, marginTop: 30 }]}>
              Spending Over Time
            </Text>

            <View style={{ borderWidth: 1, borderColor: theme.primary, borderRadius: 6, marginBottom: 10 }}>
              <Picker
                selectedValue={timeInterval}
                onValueChange={(value) => setTimeInterval(value)}
                style={{ color: theme.text }}
              >
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Yearly" value="yearly" />
              </Picker>
            </View>

            <ScrollView horizontal contentContainerStyle={{ paddingBottom: 60 }}>
              <LineChart
                data={lineData}
                width={Math.max(screenWidth, lineData.labels.length * 50)}
                height={220}
                fromZero
                chartConfig={{
                  backgroundGradientFrom: theme.background,
                  backgroundGradientTo: theme.background,
                  color: () => theme.primary,
                  labelColor: () => theme.text,
                  decimalPlaces: 0,
                }}
                style={{ borderRadius: 6 }}
              />
            </ScrollView>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const chartColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#F7464A",
  "#46BFBD",
  "#FDB45C",
  "#949FB1",
  "#4D5360",
];

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  totalText: { fontSize: 18, marginVertical: 8 },
  chartTitle: { fontSize: 16, fontWeight: "600", marginVertical: 10 },
});
