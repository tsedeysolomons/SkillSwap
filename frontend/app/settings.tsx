import { SkillSwapColors } from "@/constants/skillswap-colors";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import type { User } from "@/types";
import { router } from "expo-router";
import {
    AlertTriangle,
    Bell,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Info,
    LogOut,
    Mail,
    Shield,
    Trash2,
} from "lucide-react-native";
import React from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const NOTIFICATION_TOGGLES = [
    { key: "booking", label: "Booking updates", desc: "When someone books or cancels your session" },
    { key: "messages", label: "Messages", desc: "Direct messages from peers" },
    { key: "reviews", label: "Reviews", desc: "When someone leaves you a review" },
    { key: "tips", label: "Tips & product updates", desc: "Occasional product news from SkillSwap" },
] as const;

export default function SettingsScreen() {
    const { currentUser, logout } = useSkillSwap();
    const [prefs, setPrefs] = React.useState<Record<string, boolean>>({
        booking: true,
        messages: true,
        reviews: true,
        tips: false,
    });

    const handleLogout = () => {
        Alert.alert("Sign out?", "You'll need to sign back in to use SkillSwap.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign out",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/auth/login");
                },
            },
        ]);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete account?",
            "This will permanently remove your profile, skills, sessions, and credits. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                        Alert.alert(
                            "Not implemented yet",
                            "Account deletion is queued for a future release. Please contact support in the meantime.",
                        ),
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <ChevronLeft size={22} color={SkillSwapColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Account */}
                <Section title="Account">
                    <Row
                        icon={<Mail size={20} color={SkillSwapColors.textSecondary} />}
                        label="Email"
                        value={currentUser?.email || "—"}
                    />
                    <Row
                        icon={<Shield size={20} color={SkillSwapColors.textSecondary} />}
                        label="Password"
                        value="Change"
                        onPress={() =>
                            Alert.alert(
                                "Coming soon",
                                "Password change is wired up on the backend (PUT /api/users/me) but the reset-email flow isn't built yet.",
                            )
                        }
                    />
                </Section>

                {/* Notifications */}
                <Section title="Notifications">
                    {NOTIFICATION_TOGGLES.map((t) => (
                        <View key={t.key} style={styles.toggleRow}>
                            <View style={styles.toggleIcon}>
                                <Bell size={20} color={SkillSwapColors.textSecondary} />
                            </View>
                            <View style={styles.toggleBody}>
                                <Text style={styles.toggleLabel}>{t.label}</Text>
                                <Text style={styles.toggleDesc}>{t.desc}</Text>
                            </View>
                            <Switch
                                value={prefs[t.key]}
                                onValueChange={(v) =>
                                    setPrefs((p) => ({ ...p, [t.key]: v }))
                                }
                            />
                        </View>
                    ))}
                </Section>

                {/* Support */}
                <Section title="Support">
                    <Row
                        icon={<HelpCircle size={20} color={SkillSwapColors.textSecondary} />}
                        label="Help & FAQ"
                        chevron
                        onPress={() =>
                            Alert.alert("Help", "Visit skillswap.example.com/help")
                        }
                    />
                    <Row
                        icon={<Info size={20} color={SkillSwapColors.textSecondary} />}
                        label="About SkillSwap"
                        value="v0.1.0"
                    />
                </Section>

                {/* Danger zone */}
                <Section title="Account actions" danger>
                    <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
                        <View style={styles.toggleIcon}>
                            <LogOut size={20} color={SkillSwapColors.error} />
                        </View>
                        <Text style={[styles.toggleLabel, { color: SkillSwapColors.error }]}>
                            Sign out
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionRow} onPress={handleDelete}>
                        <View style={styles.toggleIcon}>
                            <Trash2 size={20} color={SkillSwapColors.error} />
                        </View>
                        <Text style={[styles.toggleLabel, { color: SkillSwapColors.error }]}>
                            Delete account
                        </Text>
                    </TouchableOpacity>
                </Section>

                <View style={styles.footnote}>
                    <AlertTriangle size={14} color={SkillSwapColors.textLight} />
                    <Text style={styles.footnoteText}>
                        Notification preferences are stored locally for now; they
                        will sync to your account in the next release.
                    </Text>
                </View>
                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function Section({
    title,
    children,
    danger,
}: {
    title: string;
    children: React.ReactNode;
    danger?: boolean;
}) {
    return (
        <View style={styles.section}>
            <Text
                style={[
                    styles.sectionTitle,
                    danger && { color: SkillSwapColors.error },
                ]}
            >
                {title}
            </Text>
            <View style={styles.card}>{children}</View>
        </View>
    );
}

function Row({
    icon,
    label,
    value,
    chevron,
    onPress,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    chevron?: boolean;
    onPress?: () => void;
}) {
    const Wrapper: any = onPress ? TouchableOpacity : View;
    return (
        <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.toggleIcon}>{icon}</View>
            <Text style={styles.toggleLabel}>{label}</Text>
            {value ? <Text style={styles.rowValue}>{value}</Text> : null}
            {chevron ? (
                <ChevronRight size={18} color={SkillSwapColors.textLight} />
            ) : null}
        </Wrapper>
    );
}

function Switch({
    value,
    onValueChange,
}: {
    value: boolean;
    onValueChange: (v: boolean) => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.switch, value && styles.switchOn]}
            onPress={() => onValueChange(!value)}
            activeOpacity={0.8}
        >
            <View style={[styles.knob, value && styles.knobOn]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: SkillSwapColors.backgroundSecondary },
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

    content: { padding: 16, paddingBottom: 32 },

    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: SkillSwapColors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        backgroundColor: SkillSwapColors.white,
        borderRadius: 14,
        overflow: "hidden",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SkillSwapColors.borderLight,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 16,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SkillSwapColors.borderLight,
        gap: 12,
    },
    toggleIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: SkillSwapColors.backgroundSecondary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    toggleBody: { flex: 1 },
    toggleLabel: { fontSize: 15, color: SkillSwapColors.text, fontWeight: "500" },
    toggleDesc: { fontSize: 12, color: SkillSwapColors.textSecondary, marginTop: 2 },
    rowValue: { fontSize: 14, color: SkillSwapColors.textSecondary, marginRight: 6 },

    switch: {
        width: 44,
        height: 26,
        borderRadius: 13,
        backgroundColor: SkillSwapColors.border,
        padding: 3,
        justifyContent: "center",
    },
    switchOn: { backgroundColor: SkillSwapColors.primary },
    knob: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    knobOn: { alignSelf: "flex-end" },

    footnote: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
        paddingHorizontal: 6,
        marginTop: 8,
    },
    footnoteText: {
        flex: 1,
        fontSize: 12,
        color: SkillSwapColors.textLight,
        lineHeight: 16,
    },
});
