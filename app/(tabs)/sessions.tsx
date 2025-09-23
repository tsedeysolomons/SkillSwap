import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Calendar, Clock, Plus } from "lucide-react-native";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { SkillSwapColors } from "@/constants/skillswap-colors";
import SessionCard from "@/components/SessionCard";
import { Session } from "@/types";

export default function SessionsScreen() {
  const { currentUser, sessions } = useSkillSwap();

  const { upcomingSessions, pastSessions } = useMemo(() => {
    const now = new Date();
    const upcoming: Session[] = [];
    const past: Session[] = [];

    sessions.forEach((session : any) => {
      const sessionDate = new Date(session.scheduledAt);
      if (sessionDate > now && session.status !== "cancelled") {
        upcoming.push(session);
      } else {
        past.push(session);
      }
    });

    // Sort upcoming by date (earliest first)
    upcoming.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    // Sort past by date (most recent first)
    past.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

    return { upcomingSessions: upcoming, pastSessions: past };
  }, [sessions]);

  const handleJoinCall = (session: Session) => {
    // In a real app, this would open the video call
    router.push(`../video-call/${session.id}`);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <SessionCard
      session={item}
      currentUserId={currentUser?.id || ""}
      onPress={() => console.log("Session details")}
      onJoinCall={() => handleJoinCall(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Calendar size={64} color={SkillSwapColors.textLight} />
      <Text style={styles.emptyTitle}>No sessions yet</Text>
      <Text style={styles.emptySubtitle}>
        Start learning by booking your first session!
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/")}
      >
        <Plus size={20} color={SkillSwapColors.white} />
        <Text style={styles.browseButtonText}>Browse Skills</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>
        {count} session{count !== 1 ? "s" : ""}
      </Text>
    </View>
  );

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Sessions</Text>
        </View>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Sessions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/")}
        >
          <Plus size={20} color={SkillSwapColors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pastSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {upcomingSessions.length > 0 &&
              renderSectionHeader("Upcoming", upcomingSessions.length)}
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={currentUser?.id || ""}
                onPress={() => console.log("Session details")}
                onJoinCall={() => handleJoinCall(session)}
              />
            ))}

            {pastSessions.length > 0 &&
              renderSectionHeader("Past Sessions", pastSessions.length)}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SkillSwapColors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: SkillSwapColors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: SkillSwapColors.text,
  },
  addButton: {
    backgroundColor: SkillSwapColors.backgroundSecondary,
    padding: 8,
    borderRadius: 12,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: SkillSwapColors.text,
  },
  sectionCount: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: SkillSwapColors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: SkillSwapColors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  browseButtonText: {
    color: SkillSwapColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
