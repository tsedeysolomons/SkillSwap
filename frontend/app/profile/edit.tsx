import { SkillSwapColors } from "@/constants/skillswap-colors";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import type { User } from "@/types";
import { router } from "expo-router";
import { ChevronLeft, Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TIMEZONES = [
    "UTC",
    "Africa/Nairobi",
    "Africa/Lagos",
    "Africa/Cairo",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Paris",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
];

const GENDERS: NonNullable<User["gender"]>[] = [
    "male",
    "female",
    "other",
    "prefer-not-to-say",
];
const ROLES: NonNullable<User["role"]>[] = ["teacher", "student", "both"];
const AGES: NonNullable<User["ageRange"]>[] = [
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55+",
];

function ChipGroup<T extends string>({
    options,
    value,
    onChange,
}: {
    options: readonly T[];
    value: T | undefined;
    onChange: (v: T) => void;
}) {
    return (
        <View style={styles.chipGroup}>
            {options.map((opt) => {
                const active = opt === value;
                return (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => onChange(opt)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                active && styles.chipTextActive,
                            ]}
                        >
                            {opt}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function EditProfileScreen() {
    const { currentUser, updateProfile, isLoading } = useSkillSwap();

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [timezone, setTimezone] = useState<string>("UTC");
    const [gender, setGender] = useState<User["gender"] | undefined>();
    const [role, setRole] = useState<User["role"] | undefined>();
    const [ageRange, setAgeRange] = useState<User["ageRange"] | undefined>();
    const [languages, setLanguages] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        setName(currentUser.name ?? "");
        setBio(currentUser.bio ?? "");
        setLocation(currentUser.location ?? "");
        setTimezone(currentUser.timezone || "UTC");
        setGender(currentUser.gender);
        setRole(currentUser.role);
        setAgeRange(currentUser.ageRange);
        setLanguages((currentUser.languages ?? []).join(", "));
    }, [currentUser]);

    if (!currentUser) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={SkillSwapColors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const onSave = async () => {
        if (!name.trim()) {
            Alert.alert("Validation", "Name cannot be empty.");
            return;
        }
        setSaving(true);
        try {
            await updateProfile({
                name: name.trim(),
                bio: bio.trim(),
                location: location.trim(),
                timezone,
                gender,
                role,
                ageRange,
                languages: languages
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
            });
            Alert.alert("Saved", "Your profile has been updated.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (e: any) {
            Alert.alert(
                "Could not save",
                e?.message || "Please try again in a moment.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.headerBar}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <ChevronLeft size={22} color={SkillSwapColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity
                        style={[
                            styles.saveBtn,
                            (saving || isLoading) && { opacity: 0.6 },
                        ]}
                        onPress={onSave}
                        disabled={saving || isLoading}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Save size={16} color="#fff" />
                                <Text style={styles.saveText}>Save</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Field label="Display name" required>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholder="Your name"
                            placeholderTextColor={SkillSwapColors.textLight}
                            autoCapitalize="words"
                        />
                    </Field>

                    <Field label="Bio">
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            style={[styles.input, styles.multiline]}
                            placeholder="Tell people about yourself"
                            placeholderTextColor={SkillSwapColors.textLight}
                            multiline
                            numberOfLines={4}
                            maxLength={300}
                        />
                        <Text style={styles.hint}>{bio.length}/300</Text>
                    </Field>

                    <Field label="Location">
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                            placeholder="City, Country"
                            placeholderTextColor={SkillSwapColors.textLight}
                        />
                    </Field>

                    <Field label="Timezone">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 4 }}
                        >
                            <ChipGroup
                                options={TIMEZONES}
                                value={timezone}
                                onChange={setTimezone}
                            />
                        </ScrollView>
                    </Field>

                    <Field label="I mainly">
                        <ChipGroup
                            options={ROLES}
                            value={role}
                            onChange={setRole}
                        />
                    </Field>

                    <Field label="Gender (optional)">
                        <ChipGroup
                            options={GENDERS}
                            value={gender}
                            onChange={setGender}
                        />
                    </Field>

                    <Field label="Age range (optional)">
                        <ChipGroup
                            options={AGES}
                            value={ageRange}
                            onChange={setAgeRange}
                        />
                    </Field>

                    <Field label="Languages">
                        <TextInput
                            value={languages}
                            onChangeText={setLanguages}
                            style={styles.input}
                            placeholder="English, Swahili, …"
                            placeholderTextColor={SkillSwapColors.textLight}
                            autoCapitalize="words"
                        />
                        <Text style={styles.hint}>
                            Comma-separated. Used to match you with peers.
                        </Text>
                    </Field>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>
                {label}
                {required ? <Text style={styles.required}> *</Text> : null}
            </Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: SkillSwapColors.backgroundSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },

    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: SkillSwapColors.white,
        borderBottomWidth: 1,
        borderBottomColor: SkillSwapColors.borderLight,
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 17, fontWeight: "600", color: SkillSwapColors.text },
    saveBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: SkillSwapColors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        minWidth: 78,
        justifyContent: "center",
    },
    saveText: { color: "#fff", fontWeight: "600", fontSize: 14 },

    content: { padding: 16, paddingBottom: 32 },
    field: { marginBottom: 20 },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: SkillSwapColors.textSecondary,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    required: { color: SkillSwapColors.error },
    input: {
        backgroundColor: SkillSwapColors.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: SkillSwapColors.text,
        borderWidth: 1,
        borderColor: SkillSwapColors.border,
    },
    multiline: { minHeight: 96, textAlignVertical: "top" },
    hint: {
        fontSize: 12,
        color: SkillSwapColors.textLight,
        marginTop: 4,
        textAlign: "right",
    },

    chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: SkillSwapColors.white,
        borderWidth: 1,
        borderColor: SkillSwapColors.border,
    },
    chipActive: {
        backgroundColor: SkillSwapColors.primary,
        borderColor: SkillSwapColors.primary,
    },
    chipText: { fontSize: 14, color: SkillSwapColors.text },
    chipTextActive: { color: "#fff", fontWeight: "600" },
});
