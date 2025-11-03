import { ThemeProvider } from "../../src/context/ThemeContext";
import { UserProvider } from "../../src/context/UserContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// 📢 Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  // 📱 Ask for notification permission once (when app starts)
  useEffect(() => {
    const requestPermission = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          alert("Permission for notifications not granted!");
        }
      } else {
        alert("Must use a physical device for notifications.");
      }
    };
    requestPermission();
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> {/* SignUp */}
          <Stack.Screen name="login" /> {/* Login */}
        </Stack>
      </UserProvider>
    </ThemeProvider>
  );
}
