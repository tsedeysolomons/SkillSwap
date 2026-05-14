import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Calendar,
  MessageCircle,
} from "lucide-react-native";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { SkillSwapColors } from "@/constants/skillswap-colors";

export default function SkillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { skills, currentUser, bookSession, isLoading } = useSkillSwap();
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  const skill = skills.find((s) => s.id === id);

  if (!skill || !skill.user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Skill not found</Text>
      </View>
    );
  }

  const durations = [30, 60, 90, 120];
  const creditsRequired = Math.ceil(
    (selectedDuration / 60) * skill.creditsPerHour
  );
  const canAfford = (currentUser?.credits || 0) >= creditsRequired;

  const handleBookSession = async () => {
    if (!currentUser) {
      Alert.alert("Error", "Please log in to book a session");
      return;
    }

    if (!canAfford) {
      Alert.alert(
        "Insufficient Credits",
        `You need ${creditsRequired} credits but only have ${currentUser.credits}`
      );
      return;
    }

    try {
      // In a real app, this would show a date/time picker
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1); // Tomorrow
      scheduledAt.setHours(14, 0, 0, 0); // 2 PM

      await bookSession(
        skill.userId,
        skill.id,
        scheduledAt.toISOString(),
        selectedDuration
      );

      Alert.alert(
        "Session Booked!",
        "Your session request has been sent. You will be notified when the teacher confirms.",
        [{ text: "OK", onPress: () => router.push("./(tabs)/sessions") }]
      );
    } catch (error) {
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.skillInfo}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.category}>{skill.category}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{skill.level}</Text>
          </View>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.credits}>{skill.creditsPerHour}</Text>
          <Text style={styles.creditsLabel}>credits/hr</Text>
        </View>
      </View>

      <View style={styles.teacherSection}>
        <View style={styles.teacherInfo}>
          <Image source={{ uri: skill.user.avatar }} style={styles.avatar} />
          <View style={styles.teacherDetails}>
            <Text style={styles.teacherName}>{skill.user.name}</Text>
            <View style={styles.teacherLocation}>
              <MapPin size={14} color={SkillSwapColors.textSecondary} />
              <Text style={styles.locationText}>{skill.user.location}</Text>
            </View>
            <View style={styles.teacherStats}>
              <View style={styles.stat}>
                <Star
                  size={14}
                  color={SkillSwapColors.accent}
                  fill={SkillSwapColors.accent}
                />
                <Text style={styles.statText}>
                  {skill.user.rating.toFixed(1)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Users size={14} color={SkillSwapColors.textSecondary} />
                <Text style={styles.statText}>
                  {skill.user.totalSessions} sessions
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.messageButton}>
          <MessageCircle size={20} color={SkillSwapColors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this skill</Text>
        <Text style={styles.description}>{skill.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About the teacher</Text>
        <Text style={styles.description}>{skill.user.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Duration</Text>
        <View style={styles.durationOptions}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationOption,
                selectedDuration === duration && styles.selectedDurationOption,
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Clock
                size={16}
                color={
                  selectedDuration === duration
                    ? SkillSwapColors.white
                    : SkillSwapColors.textSecondary
                }
              />
              <Text
                style={[
                  styles.durationText,
                  selectedDuration === duration && styles.selectedDurationText,
                ]}
              >
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bookingSection}>
        <View style={styles.bookingInfo}>
          <Text style={styles.totalCredits}>{creditsRequired} credits</Text>
          <Text style={styles.totalDuration}>{selectedDuration} minutes</Text>
          {!canAfford && (
            <Text style={styles.insufficientCredits}>
              Insufficient credits (you have {currentUser?.credits || 0})
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!canAfford || isLoading) && styles.bookButtonDisabled,
          ]}
          onPress={handleBookSession}
          disabled={!canAfford || isLoading}
        >
          <Calendar size={20} color={SkillSwapColors.white} />
          <Text style={styles.bookButtonText}>
            {isLoading ? "Booking..." : "Book Session"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SkillSwapColors.backgroundSecondary,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: SkillSwapColors.white,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 24,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: SkillSwapColors.secondary,
    fontWeight: "500",
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: SkillSwapColors.backgroundTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
    color: SkillSwapColors.primary,
  },
  creditsContainer: {
    alignItems: "center",
  },
  credits: {
    fontSize: 28,
    fontWeight: "bold",
    color: SkillSwapColors.primary,
  },
  creditsLabel: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  teacherSection: {
    backgroundColor: SkillSwapColors.white,
    padding: 20,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "600",
    color: SkillSwapColors.text,
    marginBottom: 4,
  },
  teacherLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  teacherStats: {
    flexDirection: "row",
    gap: 16,
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
  messageButton: {
    backgroundColor: SkillSwapColors.backgroundSecondary,
    padding: 12,
    borderRadius: 12,
  },
  section: {
    backgroundColor: SkillSwapColors.white,
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: SkillSwapColors.textSecondary,
    lineHeight: 24,
  },
  durationOptions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  durationOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SkillSwapColors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  selectedDurationOption: {
    backgroundColor: SkillSwapColors.primary,
  },
  durationText: {
    fontSize: 14,
    fontWeight: "500",
    color: SkillSwapColors.textSecondary,
  },
  selectedDurationText: {
    color: SkillSwapColors.white,
  },
  bookingSection: {
    backgroundColor: SkillSwapColors.white,
    padding: 20,
    marginTop: 16,
  },
  bookingInfo: {
    marginBottom: 16,
  },
  totalCredits: {
    fontSize: 20,
    fontWeight: "bold",
    color: SkillSwapColors.primary,
    marginBottom: 4,
  },
  totalDuration: {
    fontSize: 16,
    color: SkillSwapColors.textSecondary,
  },
  insufficientCredits: {
    fontSize: 14,
    color: SkillSwapColors.error,
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: SkillSwapColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonDisabled: {
    backgroundColor: SkillSwapColors.textLight,
  },
  bookButtonText: {
    color: SkillSwapColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: SkillSwapColors.error,
    textAlign: "center",
    marginTop: 50,
  },
});
