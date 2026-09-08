import { SkillSwapColors, gradients } from "@/constants/skillswap-colors";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, EyeOff, Lock, Mail, MapPin, User, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Gender = "male" | "female" | "other" | "prefer-not-to-say";
type Role = "teacher" | "student" | "both";
type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    bio: "",
    gender: "" as Gender | "",
    role: "" as Role | "",
    ageRange: "" as AgeRange | "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const { register, isLoading } = useSkillSwap();

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.location ||
      !formData.gender ||
      !formData.role ||
      !formData.ageRange
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: formData.location,
        bio: formData.bio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        skillsWanted: [],
        languages: ["English"],
        gender: formData.gender,
        role: formData.role,
        ageRange: formData.ageRange,
      });
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradients.hero}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Join SkillSwap</Text>
            <Text style={styles.subtitle}>
              Start your journey of learning and teaching
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User
                size={20}
                color={SkillSwapColors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full name *"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={formData.name}
                onChangeText={(value) => updateFormData("name", value)}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={SkillSwapColors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email address *"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <MapPin
                size={20}
                color={SkillSwapColors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Location (e.g., San Francisco, CA) *"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={formData.location}
                onChangeText={(value) => updateFormData("location", value)}
                autoCapitalize="words"
              />
            </View>

            {/* Gender Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Gender *</Text>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.gender === "male" && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFormData("gender", "male")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.gender === "male" && styles.optionTextActive,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.gender === "female" && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFormData("gender", "female")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.gender === "female" && styles.optionTextActive,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.gender === "other" && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFormData("gender", "other")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.gender === "other" && styles.optionTextActive,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.gender === "prefer-not-to-say" && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFormData("gender", "prefer-not-to-say")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.gender === "prefer-not-to-say" && styles.optionTextActive,
                    ]}
                  >
                    Prefer not to say
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>I want to *</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === "teacher" && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFormData("role", "teacher")}
                >
                  <Users size={20} color={formData.role === "teacher" ? SkillSwapColors.white : SkillSwapColors.primary} />
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === "teacher" && styles.optionTextActive,
                    ]}
                  >
                    Teach Only
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === "student" && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFormData("role", "student")}
                >
                  <User size={20} color={formData.role === "student" ? SkillSwapColors.white : SkillSwapColors.primary} />
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === "student" && styles.optionTextActive,
                    ]}
                  >
                    Learn Only
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === "both" && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFormData("role", "both")}
                >
                  <Users size={20} color={formData.role === "both" ? SkillSwapColors.white : SkillSwapColors.primary} />
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === "both" && styles.optionTextActive,
                    ]}
                  >
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Age Range Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Age Range *</Text>
              <View style={styles.optionsGrid}>
                {(["18-24", "25-34", "35-44", "45-54", "55+"] as AgeRange[]).map((age) => (
                  <TouchableOpacity
                    key={age}
                    style={[
                      styles.optionButton,
                      formData.ageRange === age && styles.optionButtonActive,
                    ]}
                    onPress={() => updateFormData("ageRange", age)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.ageRange === age && styles.optionTextActive,
                      ]}
                    >
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={SkillSwapColors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password *"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={formData.password}
                onChangeText={(value) => updateFormData("password", value)}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={SkillSwapColors.textSecondary} />
                ) : (
                  <Eye size={20} color={SkillSwapColors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={SkillSwapColors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm password *"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  updateFormData("confirmPassword", value)
                }
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={SkillSwapColors.textSecondary} />
                ) : (
                  <Eye size={20} color={SkillSwapColors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about yourself (optional)"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={formData.bio}
                onChangeText={(value) => updateFormData("bio", value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: SkillSwapColors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: SkillSwapColors.white,
    opacity: 0.9,
    textAlign: "center",
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SkillSwapColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: SkillSwapColors.text,
  },
  eyeIcon: {
    padding: 4,
  },
  textAreaContainer: {
    backgroundColor: SkillSwapColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textArea: {
    fontSize: 16,
    color: SkillSwapColors.text,
    minHeight: 80,
  },
  sectionContainer: {
    backgroundColor: SkillSwapColors.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: SkillSwapColors.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: SkillSwapColors.backgroundSecondary,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonActive: {
    backgroundColor: SkillSwapColors.primary,
    borderColor: SkillSwapColors.primary,
  },
  optionText: {
    fontSize: 14,
    color: SkillSwapColors.text,
    fontWeight: "500",
  },
  optionTextActive: {
    color: SkillSwapColors.white,
    fontWeight: "600",
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: SkillSwapColors.backgroundSecondary,
    borderWidth: 2,
    borderColor: "transparent",
  },
  roleText: {
    fontSize: 14,
    color: SkillSwapColors.text,
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: SkillSwapColors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: SkillSwapColors.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: SkillSwapColors.white,
    opacity: 0.9,
  },
  footerLink: {
    fontSize: 16,
    fontWeight: "600",
    color: SkillSwapColors.white,
  },
});
