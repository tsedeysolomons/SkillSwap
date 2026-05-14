import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Calendar, Clock, Video, User } from "lucide-react-native";
import { Session } from "@/types";
import { SkillSwapColors } from "@/constants/skillswap-colors";

interface SessionCardProps {
  session: Session;
  currentUserId: string;
  onPress: () => void;
  onJoinCall?: () => void;
}

export default function SessionCard({
  session,
  currentUserId,
  onPress,
  onJoinCall,
}: SessionCardProps) {
  const isTeacher = session.teacherId === currentUserId;
  const otherUser = isTeacher ? session.learner : session.teacher;
  const scheduledDate = new Date(session.scheduledAt);
  const isUpcoming = scheduledDate > new Date();
  const canJoinCall =
    session.status === "confirmed" &&
    Math.abs(scheduledDate.getTime() - new Date().getTime()) < 15 * 60 * 1000; // 15 minutes window

  const getStatusColor = () => {
    switch (session.status) {
      case "confirmed":
        return SkillSwapColors.success;
      case "pending":
        return SkillSwapColors.warning;
      case "completed":
        return SkillSwapColors.textSecondary;
      case "cancelled":
        return SkillSwapColors.error;
      default:
        return SkillSwapColors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "in-progress":
        return "In Progress";
      default:
        return session.status;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {otherUser?.avatar && (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{otherUser?.name}</Text>
            <Text style={styles.role}>
              {isTeacher ? "Learning from you" : "Teaching you"}
            </Text>
          </View>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.skillName}>{session.skill?.name}</Text>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Calendar size={16} color={SkillSwapColors.textSecondary} />
            <Text style={styles.detailText}>
              {scheduledDate.toLocaleDateString()} at{" "}
              {scheduledDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={styles.detail}>
            <Clock size={16} color={SkillSwapColors.textSecondary} />
            <Text style={styles.detailText}>{session.duration} minutes</Text>
          </View>

          <View style={styles.detail}>
            <User size={16} color={SkillSwapColors.textSecondary} />
            <Text style={styles.detailText}>
              {session.creditsAmount} credits
            </Text>
          </View>
        </View>

        {session.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            Note: {session.notes}
          </Text>
        )}

        {canJoinCall && onJoinCall && (
          <TouchableOpacity style={styles.joinButton} onPress={onJoinCall}>
            <Video size={16} color={SkillSwapColors.white} />
            <Text style={styles.joinButtonText}>Join Call</Text>
          </TouchableOpacity>
        )}
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
  role: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: SkillSwapColors.white,
  },
  content: {
    gap: 8,
  },
  skillName: {
    fontSize: 18,
    fontWeight: "bold",
    color: SkillSwapColors.text,
  },
  details: {
    gap: 6,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  notes: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: SkillSwapColors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  joinButtonText: {
    color: SkillSwapColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
