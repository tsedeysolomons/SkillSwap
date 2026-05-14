import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SkillSwapProvider } from "@/hooks/use-skillswap-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      <Stack.Screen name="skill/[id]" options={{ title: "Skill Details" }} />
      <Stack.Screen
        name="session/[id]"
        options={{ title: "Session Details" }}
      />
      <Stack.Screen
        name="video-call/[id]"
        options={{ title: "Video Call", presentation: "fullScreenModal" }}
      />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="profile/edit" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SkillSwapProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </SkillSwapProvider>
    </QueryClientProvider>
  );
}
