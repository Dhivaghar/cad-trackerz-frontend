import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import LogoHeader from "../components/LogoHeader";
import { useTheme } from "../context/ThemeContext";

function NotificationScreen() {
    const { theme } = useTheme();
  return(
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding:10 }}>
        <LogoHeader />
        <View>
            <Text>Notification page</Text>
        </View>
        <BottomNav />
    </SafeAreaView>
  );
}

export default NotificationScreen;