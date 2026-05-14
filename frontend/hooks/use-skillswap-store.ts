import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  User,
  Skill,
  Session,
  Review,
  Transaction,
  Notification,
} from "@/types";
import {
  mockUsers,
  mockSkills,
  mockSessions,
  mockReviews,
  mockTransactions,
  mockNotifications,
} from "@/mocks/skillswap-data";

interface SkillSwapStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  skills: Skill[];
  sessions: Session[];
  reviews: Review[];
  transactions: Transaction[];
  notifications: Notification[];
  searchQuery: string;
  selectedCategory: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  bookSession: (
    teacherId: string,
    skillId: string,
    scheduledAt: string,
    duration: number
  ) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  addReview: (
    sessionId: string,
    rating: number,
    comment: string
  ) => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  isLoading: boolean;
}

export const [SkillSwapProvider, useSkillSwap] =
  createContextHook<SkillSwapStore>(() => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const queryClient = useQueryClient();

    // Load user from storage
    const userQuery = useQuery({
      queryKey: ["currentUser"],
      queryFn: async () => {
        const stored = await AsyncStorage.getItem("currentUser");
        return stored ? JSON.parse(stored) : null;
      },
    });

    // Load skills
    const skillsQuery = useQuery({
      queryKey: ["skills"],
      queryFn: async () => mockSkills,
    });

    // Load sessions for current user
    const sessionsQuery = useQuery({
      queryKey: ["sessions", currentUser?.id],
      queryFn: async () => {
        if (!currentUser) return [];
        return mockSessions.filter(
          (session) =>
            session.teacherId === currentUser.id ||
            session.learnerId === currentUser.id
        );
      },
      enabled: !!currentUser,
    });

    // Load reviews
    const reviewsQuery = useQuery({
      queryKey: ["reviews"],
      queryFn: async () => mockReviews,
    });

    // Load transactions for current user
    const transactionsQuery = useQuery({
      queryKey: ["transactions", currentUser?.id],
      queryFn: async () => {
        if (!currentUser) return [];
        return mockTransactions.filter(
          (transaction) => transaction.userId === currentUser.id
        );
      },
      enabled: !!currentUser,
    });

    // Load notifications for current user
    const notificationsQuery = useQuery({
      queryKey: ["notifications", currentUser?.id],
      queryFn: async () => {
        if (!currentUser) return [];
        return mockNotifications.filter(
          (notification) => notification.userId === currentUser.id
        );
      },
      enabled: !!currentUser,
    });

    useEffect(() => {
      if (userQuery.data) {
        setCurrentUser(userQuery.data);
      }
    }, [userQuery.data]);

    // Login mutation
    const loginMutation = useMutation({
      mutationFn: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Find user by email (mock authentication)
        const user = mockUsers.find((u) => u.email === email);
        if (!user) {
          throw new Error("Invalid credentials");
        }

        await AsyncStorage.setItem("currentUser", JSON.stringify(user));
        return user;
      },
      onSuccess: (user) => {
        setCurrentUser(user);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    });

    // Register mutation
    const registerMutation = useMutation({
      mutationFn: async (userData: Partial<User>) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newUser: User = {
          id: Date.now().toString(),
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          location: userData.location || "",
          timezone: userData.timezone || "UTC",
          credits: 50, // Welcome bonus
          rating: 0,
          totalSessions: 0,
          skillsOffered: [],
          skillsWanted: userData.skillsWanted || [],
          languages: userData.languages || ["English"],
          joinedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
        return newUser;
      },
      onSuccess: (user) => {
        setCurrentUser(user);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      },
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
      mutationFn: async (userData: Partial<User>) => {
        if (!currentUser) throw new Error("Not authenticated");

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const updatedUser = { ...currentUser, ...userData };
        await AsyncStorage.setItem("currentUser", JSON.stringify(updatedUser));
        return updatedUser;
      },
      onSuccess: (user) => {
        setCurrentUser(user);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      },
    });

    // Book session mutation
    const bookSessionMutation = useMutation({
      mutationFn: async ({
        teacherId,
        skillId,
        scheduledAt,
        duration,
      }: {
        teacherId: string;
        skillId: string;
        scheduledAt: string;
        duration: number;
      }) => {
        if (!currentUser) throw new Error("Not authenticated");

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const skill = mockSkills.find((s) => s.id === skillId);
        if (!skill) throw new Error("Skill not found");

        const creditsAmount = Math.ceil((duration / 60) * skill.creditsPerHour);

        if (currentUser.credits < creditsAmount) {
          throw new Error("Insufficient credits");
        }

        const newSession: Session = {
          id: Date.now().toString(),
          teacherId,
          learnerId: currentUser.id,
          skillId,
          scheduledAt,
          duration,
          status: "pending",
          creditsAmount,
          createdAt: new Date().toISOString(),
        };

        return newSession;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      },
    });

    const logout = async () => {
      await AsyncStorage.removeItem("currentUser");
      setCurrentUser(null);
      queryClient.clear();
    };

    const markNotificationRead = (notificationId: string) => {
      // In a real app, this would make an API call
      queryClient.setQueryData(
        ["notifications", currentUser?.id],
        (old: Notification[] | undefined) => {
          if (!old) return [];
          return old.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          );
        }
      );
    };

    return {
      currentUser,
      isAuthenticated: !!currentUser,
      skills: skillsQuery.data || [],
      sessions: sessionsQuery.data || [],
      reviews: reviewsQuery.data || [],
      transactions: transactionsQuery.data || [],
      notifications: notificationsQuery.data || [],
      searchQuery,
      selectedCategory,
      login: async (email: string, password: string) => {
        await loginMutation.mutateAsync({ email, password });
      },
      logout,
      register: async (userData: Partial<User>) => {
        await registerMutation.mutateAsync(userData);
      },
      updateProfile: async (userData: Partial<User>) => {
        await updateProfileMutation.mutateAsync(userData);
      },
      bookSession: async (
        teacherId: string,
        skillId: string,
        scheduledAt: string,
        duration: number
      ) => {
        await bookSessionMutation.mutateAsync({
          teacherId,
          skillId,
          scheduledAt,
          duration,
        });
      },
      cancelSession: async (sessionId: string) => {
        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500));
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      },
      addReview: async (sessionId: string, rating: number, comment: string) => {
        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500));
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      },
      markNotificationRead,
      setSearchQuery,
      setSelectedCategory,
      isLoading:
        loginMutation.isPending ||
        registerMutation.isPending ||
        updateProfileMutation.isPending ||
        bookSessionMutation.isPending,
    };
  });

export function useFilteredSkills() {
  const { skills, searchQuery, selectedCategory } = useSkillSwap();

  return skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.user?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}

export function useUnreadNotifications() {
  const { notifications } = useSkillSwap();
  return notifications.filter((notification) => !notification.read);
}
