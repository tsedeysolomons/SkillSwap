import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Search, Filter } from "lucide-react-native";
import { SkillSwapColors } from "@/constants/skillswap-colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  placeholder = "Search skills...",
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search
          size={20}
          color={SkillSwapColors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={SkillSwapColors.textSecondary}
        />
      </View>

      {onFilterPress && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Filter size={20} color={SkillSwapColors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SkillSwapColors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: SkillSwapColors.text,
  },
  filterButton: {
    backgroundColor: SkillSwapColors.backgroundSecondary,
    padding: 12,
    borderRadius: 12,
  },
});
