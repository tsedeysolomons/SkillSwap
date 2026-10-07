import {
    ApiError,
    api,
    TOKEN_KEY,
    USER_KEY,
} from "@/api/client";
import {
    Notification,
    Review,
    Session,
    Skill,
    Transaction,
    User,
} from "@/types";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

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
  register: (userData: Partial<User> & { password?: string }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  bookSession: (
    teacherId: string,
    skillId: string,
    scheduledAt: string,
    duration: number,
  ) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  addReview: (
    sessionId: string,
    rating: number,
    comment: string,
  ) => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  isLoading: boolean;
}

export const [SkillSwapProvider, useSkillSwap] =
  createContextHook<SkillSwapStore>(() => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const queryClient = useQueryClient();

    // Restore the session from device storage on cold start.
    const bootQuery = useQuery({
      queryKey: ["boot"],
      queryFn: async () => {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        return {
          token: storedToken,
          user: storedUser ? (JSON.parse(storedUser) as User) : null,
        };
      },
    });

    useEffect(() => {
      if (!bootQuery.data) return;
      setToken(bootQuery.data.token);
      setCurrentUser(bootQuery.data.user);
    }, [bootQuery.data]);

    const isAuthenticated = !!token;

    // Clearing BOTH keys is what actually signs the user out.
    // (Previously only currentUser was removed, leaving a live jwtToken behind.)
    const clearSession = useCallback(async () => {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setToken(null);
      setCurrentUser(null);
      queryClient.clear();
    }, [queryClient]);

    // The server is the source of truth for credits and stats, so refresh on mount.
    const meQuery = useQuery({
      queryKey: ["me", token],
      queryFn: () => api.me(),
      enabled: !!token,
      retry: false,
    });

    useEffect(() => {
      if (!meQuery.data) return;
      setCurrentUser(meQuery.data);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(meQuery.data)).catch(
        () => {},
      );
    }, [meQuery.data]);

    // An expired or revoked token should sign the user out rather than loop forever.
    useEffect(() => {
      const error = meQuery.error as ApiError | null;
      if (error && (error.status === 401 || error.status === 403)) {
        void clearSession();
      }
    }, [meQuery.error, clearSession]);

    const skillsQuery = useQuery({
      queryKey: ["skills"],
      queryFn: () => api.skills(),
    });

    const sessionsQuery = useQuery({
      queryKey: ["sessions"],
      queryFn: () => api.sessions(),
      enabled: !!token,
    });

    const transactionsQuery = useQuery({
      queryKey: ["transactions"],
      queryFn: () => api.transactions(),
      enabled: !!token,
    });

    const notificationsQuery = useQuery({
      queryKey: ["notifications"],
      queryFn: () => api.notifications(),
      enabled: !!token,
    });

    const refreshAfterSessionChange = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["me", token] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, [queryClient, token]);

    const loginMutation = useMutation({
      mutationFn: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => {
        const data = await api.login(email, password);
        await AsyncStorage.multiSet([
          [TOKEN_KEY, data.token],
          [USER_KEY, JSON.stringify(data.user)],
        ]);
        return data;
      },
      onSuccess: (data) => {
        setToken(data.token);
        setCurrentUser(data.user);
        queryClient.invalidateQueries();
      },
    });

    const registerMutation = useMutation({
      mutationFn: async (userData: Partial<User>) => {
        const data = await api.register({
          name: userData.name,
          email: userData.email,
          password: (userData as { password?: string })?.password || "",
          bio: userData.bio,
          location: userData.location,
          timezone: userData.timezone || "UTC",
          gender: userData.gender,
          role: userData.role,
          ageRange: userData.ageRange,
        });
        await AsyncStorage.multiSet([
          [TOKEN_KEY, data.token],
          [USER_KEY, JSON.stringify(data.user)],
        ]);
        return data;
      },
      onSuccess: (data) => {
        setToken(data.token);
        setCurrentUser(data.user);
        queryClient.invalidateQueries();
      },
    });

    const updateProfileMutation = useMutation({
      mutationFn: async (userData: Partial<User>) => {
        const user = await api.updateProfile({
          name: userData.name,
          bio: userData.bio,
          location: userData.location,
          timezone: userData.timezone,
          gender: userData.gender,
          role: userData.role,
          ageRange: userData.ageRange,
          languages: userData.languages,
        });
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      },
      onSuccess: (user) => {
        setCurrentUser(user);
        queryClient.setQueryData(["me", token], user);
      },
    });

    const bookSessionMutation = useMutation({
      mutationFn: async ({
        skillId,
        scheduledAt,
        duration,
      }: {
        teacherId: string;
        skillId: string;
        scheduledAt: string;
        duration: number;
      }) =>
        api.bookSession({
          skillId,
          scheduledAt,
          duration,
        }),
      onSuccess: refreshAfterSessionChange,
    });

    const cancelSessionMutation = useMutation({
      mutationFn: (sessionId: string) =>
        api.updateSession(sessionId, { status: "cancelled" }),
      onSuccess: refreshAfterSessionChange,
    });

    const markNotificationReadMutation = useMutation({
      mutationFn: (notificationId: string) =>
        api.markNotificationRead(notificationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    });

    return {
      currentUser,
      isAuthenticated,
      skills: skillsQuery.data || [],
      sessions: sessionsQuery.data || [],
      // Reviews have no backend endpoint yet; nothing in the UI reads this today.
      reviews: [],
      transactions: transactionsQuery.data || [],
      notifications: notificationsQuery.data || [],
      searchQuery,
      selectedCategory,
      login: async (email: string, password: string) => {
        await loginMutation.mutateAsync({ email, password });
      },
      logout: clearSession,
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
        duration: number,
      ) => {
        await bookSessionMutation.mutateAsync({
          teacherId,
          skillId,
          scheduledAt,
          duration,
        });
      },
      cancelSession: async (sessionId: string) => {
        await cancelSessionMutation.mutateAsync(sessionId);
      },
      addReview: async () => {
        throw new Error("Reviews are not implemented on the backend yet");
      },
      markNotificationRead: (notificationId: string) => {
        markNotificationReadMutation.mutate(notificationId);
      },
      setSearchQuery,
      setSelectedCategory,
      isLoading:
        bootQuery.isPending ||
        loginMutation.isPending ||
        registerMutation.isPending ||
        updateProfileMutation.isPending ||
        bookSessionMutation.isPending ||
        cancelSessionMutation.isPending,
    };
  });

export function useFilteredSkills() {
  const { skills, searchQuery, selectedCategory } = useSkillSwap();

  return skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skill.user?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}

export function useUnreadNotifications() {
  const { notifications } = useSkillSwap();
  return notifications.filter((notification) => !notification.read);
}
