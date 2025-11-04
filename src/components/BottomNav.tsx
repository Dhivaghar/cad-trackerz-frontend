// components/BottomNav.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useRouter, usePathname } from "expo-router";

export default function BottomNav() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname(); // current active path

  const navItems = [
    { name: "Home", icon: "home-outline", route: "/home" },
    { name: "History", icon: "time-outline", route: "/history" },
    { name: "Analytics", icon: "stats-chart-outline", route: "/analytics" },
    { name: "Notifications", icon: "notifications-outline", route: "/notification" },
    { name: "Profile", icon: "person-outline", route: "/profile" },
    { name: "AI Suggestions", icon: "bulb-outline", route: "/aisuggestions" },
    
  ];

  return (
    <View style={[styles.bottomNav, { borderTopColor: theme.primary, backgroundColor: theme.background }]}>
      {navItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => router.replace(item.route)} // prevent stacking
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? theme.primary : theme.text}
            />
            <Text
              style={{
                color: isActive ? theme.primary : theme.text,
                fontSize: 12,
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  navItem: { alignItems: "center" },
});
