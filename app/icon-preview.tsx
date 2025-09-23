import { Stack } from "expo-router";
import React, { useMemo } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";

const ICON_URL =
  "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/4w6w3irlv71skp0b2a8sm";

export default function IconPreview() {
  const sizes = useMemo(() => [64, 96, 128, 180, 256, 512], []);
  return (
    <View style={styles.root} testID="icon-preview-screen">
      <Stack.Screen options={{ title: "Icon Preview" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.caption} testID="icon-preview-caption">
          Previewing provided image as app icon
        </Text>
        <View style={styles.grid}>
          {sizes.map((s) => (
            <View
              key={s}
              style={[
                styles.iconWrap,
                { width: s, height: s, borderRadius: Math.round(s * 0.22) },
              ]}
              testID={`icon-size-${s}`}
            >
              <Image
                source={{ uri: ICON_URL }}
                style={styles.icon}
                resizeMode="contain"
                onError={(e) => {
                  // eslint-disable-next-line no-console
                  console.log(
                    "Icon load error",
                    Platform.OS,
                    e.nativeEvent?.error
                  );
                }}
                onLoad={() => {
                  // eslint-disable-next-line no-console
                  console.log("Icon loaded", s);
                }}
              />
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <View style={styles.badge} testID="platform-ios">
            <Text style={styles.badgeText}>iOS</Text>
          </View>
          <View style={styles.badge} testID="platform-android">
            <Text style={styles.badgeText}>Android</Text>
          </View>
          <View style={styles.badge} testID="platform-web">
            <Text style={styles.badgeText}>Web</Text>
          </View>
        </View>
        <Text style={styles.hint} testID="icon-preview-hint">
          If this looks good, I will update the app icon configuration.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 24, alignItems: "center" },
  caption: { color: "#e2e8f0", fontSize: 16, marginBottom: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16 as unknown as number,
    justifyContent: "center",
  },
  iconWrap: {
    backgroundColor: "#ffffff",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  icon: { width: "80%", height: "80%" },
  row: { flexDirection: "row", gap: 8 as unknown as number, marginTop: 24 },
  badge: {
    backgroundColor: "#1e293b",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: "#93c5fd", fontWeight: "600" as const },
  hint: { color: "#94a3b8", marginTop: 16 },
});
