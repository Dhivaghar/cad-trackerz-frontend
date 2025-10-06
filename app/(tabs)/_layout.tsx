// app/_layout.tsx
import { ThemeProvider } from "../../src/context/ThemeContext";
import { UserProvider } from "../../src/context/UserContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />   {/* SignUp */}
        <Stack.Screen name="login" />   {/* Login */}
      </Stack>
      </UserProvider>
    </ThemeProvider>
  );
}
