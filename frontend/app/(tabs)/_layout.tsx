import { SkillSwapColors } from "@/constants/skillswap-colors";
import {
  useSkillSwap,
  useUnreadNotifications,
} from "@/hooks/use-skillswap-store";
import { Tabs } from "expo-router";
import { Calendar, Home, User, Wallet } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

function TabBarBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        right: -6,
        top: -3,
        backgroundColor: SkillSwapColors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: SkillSwapColors.white,
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated } = useSkillSwap();
  const unreadNotifications = useUnreadNotifications();

  if (!isAuthenticated) {
    return null; // Will be handled by auth flow
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: SkillSwapColors.primary,
        tabBarInactiveTintColor: SkillSwapColors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SkillSwapColors.white,
          borderTopColor: SkillSwapColors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Home stroke={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <View>
              <User color={color} size={size} />
              <TabBarBadge count={unreadNotifications.length} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
