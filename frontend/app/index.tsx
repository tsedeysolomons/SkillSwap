import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { SkillSwapColors } from "@/constants/skillswap-colors";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useSkillSwap();

  useEffect(() => {
    // Wait until the stored session has been read back from device storage.
    if (isLoading) return;

    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? "../(tabs)/discover" : "../auth/login");
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

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
