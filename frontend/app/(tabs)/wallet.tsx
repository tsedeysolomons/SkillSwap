import { SkillSwapColors, gradients } from "@/constants/skillswap-colors";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { Transaction } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function WalletScreen() {
  const { currentUser, transactions } = useSkillSwap();

  const stats = useMemo(() => {
    const earned = transactions
      .filter((t: any) => t.type === "earned")
      .reduce((sum: any, t: any) => sum + t.amount, 0);

    const spent = transactions
      .filter((t: any) => t.type === "spent")
      .reduce((sum: any, t: any) => sum + t.amount, 0);

    const bonus = transactions
      .filter((t: any) => t.type === "bonus")
      .reduce((sum: any, t: any) => sum + t.amount, 0);

    return { earned, spent, bonus };
  }, [transactions]);

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "earned":
        return <ArrowUpRight size={20} color={SkillSwapColors.success} />;
      case "spent":
        return <ArrowDownLeft size={20} color={SkillSwapColors.error} />;
      case "bonus":
        return <Gift size={20} color={SkillSwapColors.accent} />;
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "earned":
        return SkillSwapColors.success;
      case "spent":
        return SkillSwapColors.error;
      case "bonus":
        return SkillSwapColors.accent;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const date = new Date(item.createdAt);
    const isPositive = item.type === "earned" || item.type === "bonus";

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIcon,
              { backgroundColor: `${getTransactionColor(item.type)}20` },
            ]}
          >
            {getTransactionIcon(item.type)}
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>
              {item.description}
            </Text>
            <Text style={styles.transactionDate}>
              {date.toLocaleDateString()} at{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: getTransactionColor(item.type) },
          ]}
        >
          {isPositive ? "+" : "-"}
          {item.amount}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={gradients.primary}
        style={styles.balanceCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.balanceHeader}>
          <Wallet size={24} color={SkillSwapColors.white} />
          <Text style={styles.balanceLabel}>Available Credits</Text>
        </View>
        <Text style={styles.balanceAmount}>{currentUser?.credits || 0}</Text>
        <Text style={styles.balanceSubtext}>Ready to spend on learning</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <TrendingUp size={20} color={SkillSwapColors.success} />
          <Text style={styles.statAmount}>+{stats.earned}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingDown size={20} color={SkillSwapColors.error} />
          <Text style={styles.statAmount}>-{stats.spent}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Gift size={20} color={SkillSwapColors.accent} />
          <Text style={styles.statAmount}>+{stats.bonus}</Text>
          <Text style={styles.statLabel}>Bonus</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.sectionSubtitle}>
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Wallet size={64} color={SkillSwapColors.textLight} />
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <Text style={styles.emptySubtitle}>
        Start teaching or learning to see your transaction history
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleHeader}>
        <Text style={styles.title}>Wallet</Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
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
  titleHeader: {
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
  content: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 0,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: SkillSwapColors.white,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: "bold",
    color: SkillSwapColors.white,
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: SkillSwapColors.white,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: SkillSwapColors.white,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: SkillSwapColors.text,
  },
  statLabel: {
    fontSize: 12,
    color: SkillSwapColors.textSecondary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: SkillSwapColors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  transactionCard: {
    backgroundColor: SkillSwapColors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: SkillSwapColors.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: SkillSwapColors.textSecondary,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
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
  },
});
