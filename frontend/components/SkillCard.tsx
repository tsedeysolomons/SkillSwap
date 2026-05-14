import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Star, Clock, Users } from "lucide-react-native";
import { Skill } from "@/types";
import { SkillSwapColors } from "@/constants/skillswap-colors";

interface SkillCardProps {
  skill: Skill;
  onPress: () => void;
}

export default function SkillCard({ skill, onPress }: SkillCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {skill.user?.avatar && (
            <Image source={{ uri: skill.user.avatar }} style={styles.avatar} />
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{skill.user?.name}</Text>
            <Text style={styles.userLocation}>{skill.user?.location}</Text>
          </View>
        </View>
        <View style={styles.creditsContainer}>
          <Text style={styles.credits}>{skill.creditsPerHour}</Text>
          <Text style={styles.creditsLabel}>credits/hr</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{skill.level}</Text>
          </View>
        </View>

        <Text style={styles.category}>{skill.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {skill.description}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Star
              size={14}
              color={SkillSwapColors.accent}
              fill={SkillSwapColors.accent}
            />
            <Text style={styles.statText}>{skill.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.stat}>
            <Users size={14} color={SkillSwapColors.textSecondary} />
            <Text style={styles.statText}>{skill.totalSessions} sessions</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SkillSwapColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: SkillSwapColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: SkillSwapColors.text,
  },
  userLocation: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
    marginTop: 2,
  },
  creditsContainer: {
    alignItems: "center",
  },
  credits: {
    fontSize: 18,
    fontWeight: "bold",
    color: SkillSwapColors.primary,
  },
  creditsLabel: {
    fontSize: 12,
    color: SkillSwapColors.textSecondary,
  },
  content: {
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillName: {
    fontSize: 18,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    flex: 1,
  },
  levelBadge: {
    backgroundColor: SkillSwapColors.backgroundTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: SkillSwapColors.primary,
  },
  category: {
    fontSize: 14,
    color: SkillSwapColors.secondary,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
});
