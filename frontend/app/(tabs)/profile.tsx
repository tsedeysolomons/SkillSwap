import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import {
  Edit,
  MapPin,
  Globe,
  Star,
  Users,
  Award,
  Settings,
  Bell,
  LogOut,
} from "lucide-react-native";
import {
  useSkillSwap,
  useUnreadNotifications,
} from "@/hooks/use-skillswap-store";
import { SkillSwapColors } from "@/constants/skillswap-colors";

export default function ProfileScreen() {
  const { currentUser, logout } = useSkillSwap();
  const unreadNotifications = useUnreadNotifications();

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    router.replace("../auth/login");
  };

  const menuItems = [
    {
      icon: <Edit size={20} color={SkillSwapColors.textSecondary} />,
      title: "Edit Profile",
      onPress: () => console.log("Edit Profile"),
    },
    {
      icon: <Bell size={20} color={SkillSwapColors.textSecondary} />,
      title: "Notifications",
      badge: unreadNotifications.length,
      onPress: () => console.log("Notifications"),
    },
    {
      icon: <Settings size={20} color={SkillSwapColors.textSecondary} />,
      title: "Settings",
      onPress: () => console.log("Settings"),
    },
    {
      icon: <LogOut size={20} color={SkillSwapColors.error} />,
      title: "Sign Out",
      onPress: handleLogout,
      textColor: SkillSwapColors.error,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {currentUser.avatar ? (
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.name}>{currentUser.name}</Text>
            <Text style={styles.email}>{currentUser.email}</Text>

            <View style={styles.locationContainer}>
              <MapPin size={16} color={SkillSwapColors.textSecondary} />
              <Text style={styles.location}>{currentUser.location}</Text>
            </View>

            {currentUser.bio && (
              <Text style={styles.bio}>{currentUser.bio}</Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Star size={20} color={SkillSwapColors.accent} />
              <Text style={styles.statNumber}>
                {currentUser.rating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.stat}>
              <Users size={20} color={SkillSwapColors.primary} />
              <Text style={styles.statNumber}>{currentUser.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.stat}>
              <Award size={20} color={SkillSwapColors.secondary} />
              <Text style={styles.statNumber}>
                {currentUser.skillsOffered.length}
              </Text>
              <Text style={styles.statLabel}>Skills</Text>
            </View>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills I Offer</Text>
          {currentUser.skillsOffered.length > 0 ? (
            <View style={styles.skillsList}>
              {currentUser.skillsOffered.map((skill: any) => (
                <TouchableOpacity
                  key={skill.id}
                  style={styles.skillCard}
                  onPress={() => router.push(`../skill/${skill.id}`)}
                >
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillCategory}>{skill.category}</Text>
                  <View style={styles.skillStats}>
                    <View style={styles.skillStat}>
                      <Star
                        size={12}
                        color={SkillSwapColors.accent}
                        fill={SkillSwapColors.accent}
                      />
                      <Text style={styles.skillStatText}>
                        {skill.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.skillCredits}>
                      {skill.creditsPerHour} credits/hr
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptySkills}>
              <Text style={styles.emptySkillsText}>No skills added yet</Text>
              <TouchableOpacity style={styles.addSkillButton}>
                <Text style={styles.addSkillButtonText}>
                  Add Your First Skill
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.languagesSection}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languagesList}>
            {currentUser.languages.map((language : any , index : any) => (
              <View key={index} style={styles.languageTag}>
                <Globe size={14} color={SkillSwapColors.primary} />
                <Text style={styles.languageText}>{language}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text
                  style={[
                    styles.menuItemText,
                    item.textColor && { color: item.textColor },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              {item.badge && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 24,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SkillSwapColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: SkillSwapColors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: SkillSwapColors.textSecondary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  bio: {
    fontSize: 16,
    color: SkillSwapColors.text,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  stat: {
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: SkillSwapColors.text,
  },
  statLabel: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  skillsSection: {
    backgroundColor: SkillSwapColors.white,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    marginBottom: 16,
  },
  skillsList: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: SkillSwapColors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: "600",
    color: SkillSwapColors.text,
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 14,
    color: SkillSwapColors.secondary,
    marginBottom: 8,
  },
  skillStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  skillStatText: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  skillCredits: {
    fontSize: 14,
    fontWeight: "600",
    color: SkillSwapColors.primary,
  },
  emptySkills: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptySkillsText: {
    fontSize: 16,
    color: SkillSwapColors.textSecondary,
    marginBottom: 16,
  },
  addSkillButton: {
    backgroundColor: SkillSwapColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addSkillButtonText: {
    color: SkillSwapColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  languagesSection: {
    backgroundColor: SkillSwapColors.white,
    marginTop: 16,
    padding: 20,
  },
  languagesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SkillSwapColors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  languageText: {
    fontSize: 14,
    color: SkillSwapColors.text,
  },
  menuSection: {
    backgroundColor: SkillSwapColors.white,
    marginTop: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: SkillSwapColors.text,
  },
  badge: {
    backgroundColor: SkillSwapColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: SkillSwapColors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});
