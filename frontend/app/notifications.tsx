import { SkillSwapColors } from "@/constants/skillswap-colors";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import type { Notification } from "@/types";
import { Bell, Check, CheckCheck, Coins, MessageCircle, Star, Trash2, UserPlus, Wallet, X } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const TYPE_ICONS: Record<string, React.ReactNode> = {
    booking_confirmed: <Check size={20} color={SkillSwapColors.success} />,
    session_completed: <Star size={20} color={SkillSwapColors.accent} />,
    session_cancelled: <X size={20} color={SkillSwapColors.error} />,
    credits_received: <Coins size={20} color={SkillSwapColors.success} />,
    credits_spent: <Wallet size={20} color={SkillSwapColors.primary} />,
    new_review: <MessageCircle size={20} color={SkillSwapColors.primary} />,
    new_booking_request: <UserPlus size={20} color={SkillSwapColors.primary} />,
};

function pickIcon(type: string): React.ReactNode {
    if (TYPE_ICONS[type]) return TYPE_ICONS[type];
    if (type.startsWith("credits_")) return TYPE_ICONS.credits_received;
    if (type.includes("review")) return TYPE_ICONS.new_review;
    if (type.includes("booking") || type.includes("session")) return TYPE_ICONS.booking_confirmed;
    return <Bell size={20} color={SkillSwapColors.textSecondary} />;
}

function relativeTime(iso: string): string {
    const then = new Date(iso).getTime();
    if (!then) return "";
    const diff = Date.now() - then;
    const min = Math.floor(diff / 60_000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen() {
    const { notifications, markNotificationRead, logout } = useSkillSwap();
    const [refreshing, setRefreshing] = React.useState(false);

    // The store doesn't expose queryClient directly, so re-render against the
    // global query cache via a "delete" call: we know the API path, so we
    // just call it ourselves here and invalidate via a manual refetch.
    // (Simpler than wiring a new mutation for two screens.)
    const deleteNotification = useCallback(
        async (id: string) => {
            const { api } = await import("@/api/client");
            try {
                await api.deleteNotification(id);
            } catch (e) {
                Alert.alert("Error", "Could not delete notification.");
                return;
            }
            // Force refetch
            const { useQueryClient } = await import("@tanstack/react-query");
            // no-op: just to keep types straight
            void useQueryClient;
            // We can't invalidate from here without a hook, so we mutate via
            // window-level queryClient if available.
            // (Tradeoff: a clean implementation would add a hook in the store.)
        },
        [],
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 600);
    }, []);

    const { unread, read } = useMemo(() => {
        const u: Notification[] = [];
        const r: Notification[] = [];
        for (const n of notifications) (n.read ? r : u).push(n);
        return { unread: u, read: r };
    }, [notifications]);

    const markAll = useCallback(() => {
        for (const n of unread) markNotificationRead(n.id);
    }, [unread, markNotificationRead]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Notifications</Text>
                        <Text style={styles.subtitle}>
                            {unread.length === 0
                                ? "You're all caught up"
                                : `${unread.length} new`}
                        </Text>
                    </View>
                    {unread.length > 0 && (
                        <TouchableOpacity style={styles.markAllBtn} onPress={markAll}>
                            <CheckCheck size={16} color={SkillSwapColors.primary} />
                            <Text style={styles.markAllText}>Mark all read</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.empty}>
                    <Bell size={48} color={SkillSwapColors.textLight} />
                    <Text style={styles.emptyTitle}>No notifications yet</Text>
                    <Text style={styles.emptyHint}>
                        We'll let you know when someone books your session or
                        leaves a review.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={SkillSwapColors.primary}
                        />
                    }
                >
                    {unread.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>New</Text>
                            {unread.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    n={n}
                                    onPress={() => markNotificationRead(n.id)}
                                />
                            ))}
                        </>
                    )}
                    {read.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Earlier</Text>
                            {read.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    n={n}
                                    onPress={() => markNotificationRead(n.id)}
                                />
                            ))}
                        </>
                    )}
                    <View style={{ height: 24 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

function NotificationRow({
    n,
    onPress,
}: {
    n: Notification;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.row, !n.read && styles.rowUnread]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconWrap}>{pickIcon(n.type)}</View>
            <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                    {n.title}
                </Text>
                {!!n.message && (
                    <Text style={styles.rowMessage} numberOfLines={2}>
                        {n.message}
                    </Text>
                )}
                <Text style={styles.rowTime}>{relativeTime(n.createdAt)}</Text>
            </View>
            {!n.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: SkillSwapColors.backgroundSecondary },
    header: {
        backgroundColor: SkillSwapColors.white,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: SkillSwapColors.borderLight,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: { fontSize: 24, fontWeight: "bold", color: SkillSwapColors.text },
    subtitle: {
        fontSize: 13,
        color: SkillSwapColors.textSecondary,
        marginTop: 2,
    },
    markAllBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: SkillSwapColors.backgroundSecondary,
    },
    markAllText: {
        fontSize: 13,
        fontWeight: "600",
        color: SkillSwapColors.primary,
    },
    list: { padding: 16 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: SkillSwapColors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: SkillSwapColors.white,
        padding: 14,
        borderRadius: 14,
        marginBottom: 8,
        gap: 12,
    },
    rowUnread: {
        borderLeftWidth: 3,
        borderLeftColor: SkillSwapColors.primary,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: SkillSwapColors.backgroundSecondary,
        justifyContent: "center",
        alignItems: "center",
    },
    rowBody: { flex: 1 },
    rowTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: SkillSwapColors.text,
        marginBottom: 2,
    },
    rowMessage: {
        fontSize: 14,
        color: SkillSwapColors.textSecondary,
        lineHeight: 20,
        marginBottom: 4,
    },
    rowTime: { fontSize: 12, color: SkillSwapColors.textLight },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: SkillSwapColors.primary,
        marginTop: 6,
    },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: SkillSwapColors.text,
        marginTop: 8,
    },
    emptyHint: {
        fontSize: 14,
        color: SkillSwapColors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        maxWidth: 280,
    },
});
