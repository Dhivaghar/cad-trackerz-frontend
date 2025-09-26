import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

const LogoHeader = () => {
  const { theme, toggleTheme } = useTheme();

  // check if current theme is dark
  const isDark = theme.background === "#121212";
  const iconName = isDark ? "sunny" : "moon";

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <View style={styles.logoRow}>
        <Image source={require("../../assets/logo.png")} style={[styles.logo, { borderColor: theme.accent }]} />
        <Text style={[styles.appName, { color: theme.accent }]}>CAD TRACKERZ</Text>
      </View>
      <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
        <Ionicons name={iconName} size={28} color={theme.accent} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    gap: 10,
    borderRadius: 7
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  iconButton: {
    padding: 4,
  },
});

export default LogoHeader;
