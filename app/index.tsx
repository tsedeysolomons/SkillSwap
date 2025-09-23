import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { SkillSwapColors } from "@/constants/skillswap-colors";

export default function IndexScreen() {
  const { isAuthenticated, currentUser } = useSkillSwap();

  useEffect(() => {
    // Small delay to prevent flash
    const timer = setTimeout(() => {
      if (isAuthenticated && currentUser) {
        router.replace("../(tabs)/discover");
      } else {
        router.replace("../auth/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, currentUser]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: SkillSwapColors.primary,
      }}
    >
      <ActivityIndicator size="large" color={SkillSwapColors.white} />
    </View>
  );
}
