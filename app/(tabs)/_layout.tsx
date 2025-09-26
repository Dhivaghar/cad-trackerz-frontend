// app/_layout.tsx
import { ThemeProvider } from "../../src/context/ThemeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />   {/* SignUp */}
        <Stack.Screen name="login" />   {/* Login */}
      </Stack>
    </ThemeProvider>
  );
}
