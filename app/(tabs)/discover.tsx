import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import SkillCard from "@/components/SkillCard";
import { SkillSwapColors, gradients } from "@/constants/skillswap-colors";
import { useFilteredSkills, useSkillSwap } from "@/hooks/use-skillswap-store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Star, TrendingUp, Users } from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function DiscoverScreen() {
  const {
    currentUser,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    isAuthenticated,
  } = useSkillSwap();
  const filteredSkills = useFilteredSkills();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("../auth/login");
    }
  }, [isAuthenticated]);

  const categories = useMemo(() => {
    const allCategories = new Set(
      filteredSkills.map((skill: any) => skill.category)
    );
    return Array.from(allCategories).sort();
  }, [filteredSkills]);

  const stats = useMemo(() => {
    return {
      totalSkills: filteredSkills.length,
      totalTeachers: new Set(filteredSkills.map((skill: any) => skill.userId))
        .size,
      averageRating:
        filteredSkills.reduce((sum: any, skill: any) => sum + skill.rating, 0) /
          filteredSkills.length || 0,
    };
  }, [filteredSkills]);

  const renderSkill = ({ item }: { item: (typeof filteredSkills)[0] }) => (
    <SkillCard
      skill={item}
      onPress={() => router.push(`../skill/${item.id}`)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={gradients.hero}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.welcomeText}>
          Welcome back, {currentUser?.name?.split(" ")[0]}!
        </Text>
        <Text style={styles.heroTitle}>Discover Amazing Skills</Text>
        <Text style={styles.heroSubtitle}>
          Connect with experts worldwide and exchange knowledge
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <TrendingUp size={20} color={SkillSwapColors.white} />
            <Text style={styles.statNumber}>{stats.totalSkills}</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.stat}>
            <Users size={20} color={SkillSwapColors.white} />
            <Text style={styles.statNumber}>{stats.totalTeachers}</Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.stat}>
            <Star size={20} stroke={SkillSwapColors.white} />
            <Text style={styles.statNumber}>
              {stats.averageRating.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search skills, teachers, or categories..."
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "All" ? "All Skills" : selectedCategory}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {filteredSkills.length} skill{filteredSkills.length !== 1 ? "s" : ""}{" "}
          available
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredSkills}
        renderItem={renderSkill}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 20,
  },
  heroSection: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: SkillSwapColors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: SkillSwapColors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: SkillSwapColors.white,
    opacity: 0.9,
    marginBottom: 24,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  stat: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: SkillSwapColors.white,
  },
  statLabel: {
    fontSize: 12,
    color: SkillSwapColors.white,
    opacity: 0.8,
  },
  searchSection: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: SkillSwapColors.textSecondary,
  },
});
