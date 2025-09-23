import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { SkillSwapColors, gradients } from "@/constants/skillswap-colors";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("sarah@example.com");
  const [password, setPassword] = useState<string>("password");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, isLoading } = useSkillSwap();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Invalid credentials"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradients.hero}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue learning and teaching
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={SkillSwapColors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
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
                placeholder="Password"
                placeholderTextColor={SkillSwapColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
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

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Accounts:</Text>
              <Text style={styles.demoText}>sarah@example.com (Teacher)</Text>
              <Text style={styles.demoText}>carlos@example.com (Student)</Text>
              <Text style={styles.demoText}>yuki@example.com (Expert)</Text>
              <Text style={styles.demoNote}>Password: password</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("../auth/register")}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
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
  loginButton: {
    backgroundColor: SkillSwapColors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: SkillSwapColors.primary,
  },
  demoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: SkillSwapColors.white,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: SkillSwapColors.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  demoNote: {
    fontSize: 12,
    color: SkillSwapColors.white,
    opacity: 0.7,
    marginTop: 4,
    fontStyle: "italic",
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
