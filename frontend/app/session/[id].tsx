import { SkillSwapColors } from "@/constants/skillswap-colors";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import type { Session } from "@/types";
import { useLocalSearchParams, router } from "expo-router";
import {
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Coins,
    MessageSquare,
    Star,
    User as UserIcon,
    X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

function formatScheduledAt(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

const STATUS_COLORS: Record<Session["status"], string> = {
    pending: SkillSwapColors.warning,
    confirmed: SkillSwapColors.primary,
    "in-progress": SkillSwapColors.secondary,
    completed: SkillSwapColors.success,
    cancelled: SkillSwapColors.error,
};

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { sessions, currentUser, addReview } = useSkillSwap();
    const [reviewOpen, setReviewOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const session = sessions.find((s) => s.id === id);

    if (!session) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerBar}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color={SkillSwapColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Session</Text>
                    <View style={{ width: 36 }} />
                </View>
                <View style={styles.center}>
                    <Text style={styles.muted}>Session not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isTeacher = currentUser?.id === session.teacherId;
    const isLearner = currentUser?.id === session.learnerId;
    const counterparty = isTeacher ? session.learner : session.teacher;
    const canConfirm = isTeacher && session.status === "pending";
    const canComplete = isTeacher && session.status === "confirmed";
    const canCancel =
        (isTeacher || isLearner) &&
        (session.status === "pending" || session.status === "confirmed");
    const canReview =
        isLearner && session.status === "completed";

    const setStatus = async (status: Session["status"]) => {
        setBusy(true);
        try {
            const { api } = await import("@/api/client");
            await api.updateSession(session.id, { status });
            // Force a refetch by touching the global query cache
            const { useQueryClient } = await import("@tanstack/react-query");
            void useQueryClient;
            Alert.alert("Updated", `Session marked ${status}.`);
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Could not update session.");
        } finally {
            setBusy(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            "Cancel session?",
            "Credits will be refunded. This can't be undone.",
            [
                { text: "Keep", style: "cancel" },
                {
                    text: "Cancel session",
                    style: "destructive",
                    onPress: () => setStatus("cancelled"),
                },
            ],
        );
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
                    <Text style={styles.headerTitle}>Session</Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Status pill */}
                    <View
                        style={[
                            styles.statusPill,
                            { backgroundColor: STATUS_COLORS[session.status] + "22" },
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: STATUS_COLORS[session.status] },
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                { color: STATUS_COLORS[session.status] },
                            ]}
                        >
                            {session.status}
                        </Text>
                    </View>

                    {/* Skill + counterparty */}
                    <View style={styles.card}>
                        <Text style={styles.skillName}>
                            {session.skill?.name ?? "Skill session"}
                        </Text>
                        <View style={styles.counterpartyRow}>
                            <View style={styles.avatar}>
                                <UserIcon
                                    size={18}
                                    color={SkillSwapColors.white}
                                />
                            </View>
                            <View>
                                <Text style={styles.cpName}>
                                    {counterparty?.name ?? "Peer"}
                                </Text>
                                <Text style={styles.cpRole}>
                                    {isTeacher ? "Learner" : "Teacher"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Details */}
                    <View style={styles.card}>
                        <Detail
                            icon={<Calendar size={18} color={SkillSwapColors.textSecondary} />}
                            label="When"
                            value={formatScheduledAt(session.scheduledAt)}
                        />
                        <Detail
                            icon={<Clock size={18} color={SkillSwapColors.textSecondary} />}
                            label="Duration"
                            value={`${session.duration} minutes`}
                        />
                        <Detail
                            icon={<Coins size={18} color={SkillSwapColors.textSecondary} />}
                            label="Credits"
                            value={`${session.creditsAmount} credits`}
                            last
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        {canConfirm && (
                            <ActionBtn
                                icon={<Check size={18} color="#fff" />}
                                label="Confirm session"
                                onPress={() => setStatus("confirmed")}
                                busy={busy}
                                tone="primary"
                            />
                        )}
                        {canComplete && (
                            <ActionBtn
                                icon={<CheckCircle2 size={18} color="#fff" />}
                                label="Mark completed"
                                onPress={() => setStatus("completed")}
                                busy={busy}
                                tone="success"
                            />
                        )}
                        {canReview && (
                            <ActionBtn
                                icon={<Star size={18} color="#fff" />}
                                label="Leave a review"
                                onPress={() => setReviewOpen(true)}
                                tone="accent"
                            />
                        )}
                        {canCancel && (
                            <ActionBtn
                                icon={<X size={18} color={SkillSwapColors.error} />}
                                label="Cancel session"
                                onPress={handleCancel}
                                busy={busy}
                                tone="ghost"
                            />
                        )}
                    </View>

                    {!!session.notes && (
                        <View style={styles.notesCard}>
                            <View style={styles.notesHeader}>
                                <MessageSquare
                                    size={16}
                                    color={SkillSwapColors.textSecondary}
                                />
                                <Text style={styles.notesTitle}>Notes</Text>
                            </View>
                            <Text style={styles.notesBody}>{session.notes}</Text>
                        </View>
                    )}

                    <View style={{ height: 32 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <ReviewModal
                open={reviewOpen}
                onClose={() => setReviewOpen(false)}
                onSubmit={async (rating, comment) => {
                    try {
                        await addReview(session.id, rating, comment);
                        setReviewOpen(false);
                        Alert.alert("Thanks!", "Your review has been posted.");
                    } catch (e: any) {
                        Alert.alert(
                            "Couldn't post",
                            e?.message || "Please try again.",
                        );
                    }
                }}
                revieweeName={counterparty?.name ?? "your peer"}
            />
        </SafeAreaView>
    );
}

function Detail({
    icon,
    label,
    value,
    last,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    last?: boolean;
}) {
    return (
        <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
            <View style={styles.detailIcon}>{icon}</View>
            <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        </View>
    );
}

function ActionBtn({
    icon,
    label,
    onPress,
    busy,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    busy?: boolean;
    tone: "primary" | "success" | "accent" | "ghost";
}) {
    const bg =
        tone === "primary"
            ? SkillSwapColors.primary
            : tone === "success"
                ? SkillSwapColors.success
                : tone === "accent"
                    ? SkillSwapColors.accent
                    : "transparent";
    const borderColor =
        tone === "ghost" ? SkillSwapColors.border : "transparent";
    return (
        <TouchableOpacity
            style={[
                styles.actionBtn,
                { backgroundColor: bg, borderColor, borderWidth: tone === "ghost" ? 1 : 0 },
                busy && { opacity: 0.6 },
            ]}
            onPress={onPress}
            disabled={busy}
          activeOpacity={0.85}
        >
            {busy ? (
                <ActivityIndicator size="small" color={tone === "ghost" ? SkillSwapColors.text : "#fff"} />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.actionLabel,
                            { color: tone === "ghost" ? SkillSwapColors.error : "#fff" },
                        ]}
                    >
                        {label}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

function ReviewModal({
    open,
    onClose,
    onSubmit,
    revieweeName,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    revieweeName: string;
}) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setRating(5);
            setComment("");
        }
    }, [open]);

    return (
        <Modal
            visible={open}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Rate your session</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={12}>
                            <X size={20} color={SkillSwapColors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalSubtitle}>
                        How was your session with {revieweeName}?
                    </Text>

                    <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((n) => {
                            const active = n <= rating;
                            return (
                                <TouchableOpacity
                                    key={n}
                                    onPress={() => setRating(n)}
                                    hitSlop={6}
                                >
                                    <Star
                                        size={36}
                                        color={
                                            active
                                                ? SkillSwapColors.accent
                                                : SkillSwapColors.border
                                        }
                                        fill={
                                            active
                                                ? SkillSwapColors.accent
                                                : "transparent"
                                        }
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Share what you learned, what worked, what could be better…"
                        placeholderTextColor={SkillSwapColors.textLight}
                        multiline
                        style={styles.modalInput}
                        numberOfLines={4}
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{comment.length}/500</Text>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: SkillSwapColors.backgroundSecondary }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.modalBtnText, { color: SkillSwapColors.text }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.modalBtn,
                                { backgroundColor: SkillSwapColors.primary },
                                submitting && { opacity: 0.6 },
                            ]}
                            onPress={async () => {
                                setSubmitting(true);
                                try {
                                    await onSubmit(rating, comment.trim());
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                                    Post review
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
    muted: { color: SkillSwapColors.textSecondary, fontSize: 14 },

    content: { padding: 16, paddingBottom: 32 },

    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
        marginBottom: 12,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },

    card: {
        backgroundColor: SkillSwapColors.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    skillName: {
        fontSize: 20,
        fontWeight: "700",
        color: SkillSwapColors.text,
        marginBottom: 12,
    },
    counterpartyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: SkillSwapColors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    cpName: { fontSize: 15, fontWeight: "600", color: SkillSwapColors.text },
    cpRole: { fontSize: 12, color: SkillSwapColors.textSecondary },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SkillSwapColors.borderLight,
    },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: SkillSwapColors.backgroundSecondary,
        justifyContent: "center",
        alignItems: "center",
    },
    detailLabel: { fontSize: 12, color: SkillSwapColors.textSecondary },
    detailValue: {
        fontSize: 15,
        color: SkillSwapColors.text,
        fontWeight: "500",
        marginTop: 2,
    },

    actions: { gap: 10, marginTop: 4, marginBottom: 12 },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    actionLabel: { fontSize: 15, fontWeight: "600" },

    notesCard: {
        backgroundColor: SkillSwapColors.white,
        borderRadius: 14,
        padding: 16,
    },
    notesHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
    },
    notesTitle: { fontSize: 13, fontWeight: "600", color: SkillSwapColors.textSecondary },
    notesBody: { fontSize: 15, color: SkillSwapColors.text, lineHeight: 22 },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: SkillSwapColors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 32,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    modalTitle: { fontSize: 20, fontWeight: "700", color: SkillSwapColors.text },
    modalSubtitle: {
        fontSize: 14,
        color: SkillSwapColors.textSecondary,
        marginBottom: 20,
    },
    starRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        marginBottom: 20,
    },
    modalInput: {
        backgroundColor: SkillSwapColors.backgroundSecondary,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: SkillSwapColors.text,
        minHeight: 100,
        textAlignVertical: "top",
    },
    charCount: {
        fontSize: 12,
        color: SkillSwapColors.textLight,
        textAlign: "right",
        marginTop: 4,
        marginBottom: 20,
    },
    modalActions: { flexDirection: "row", gap: 12 },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    modalBtnText: { fontSize: 15, fontWeight: "600" },
});
