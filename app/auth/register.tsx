import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { User, Mail, Lock, MapPin, Eye, EyeOff } from "lucide-react-native";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { SkillSwapColors, gradients } from "@/constants/skillswap-colors";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    bio: "",
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
      !formData.location
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
        location: formData.location,
        bio: formData.bio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        skillsWanted: [],
        languages: ["English"],
      });
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
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
