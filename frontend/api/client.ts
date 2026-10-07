import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Notification, Session, Skill, Transaction, User } from "@/types";

export const TOKEN_KEY = "jwtToken";
export const USER_KEY = "currentUser";

/**
 * Base URL for the SkillSwap API.
 *
 * Set EXPO_PUBLIC_SKILLSWAP_API_URL to override, e.g. on a physical device:
 *   EXPO_PUBLIC_SKILLSWAP_API_URL=http://192.168.1.20:5000
 *
 * Without it we fall back to a host that works per platform:
 *  - Android emulator sees the dev machine as 10.0.2.2 (localhost is the emulator itself)
 *  - iOS simulator and web can use localhost
 */
function defaultBaseUrl(): string {
  if (Platform.OS === "android") return "http://10.0.2.2:5000";
  return "http://localhost:5000";
}

const envUrl = process.env.EXPO_PUBLIC_SKILLSWAP_API_URL;

export const API_BASE = (envUrl && envUrl.trim().replace(/\/$/, "")) || defaultBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** True when the request failed before reaching the server (offline / wrong host). */
  get isNetworkError() {
    return this.status === 0;
  }
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(
      `Cannot reach the SkillSwap server at ${API_BASE}. Start the backend and check EXPO_PUBLIC_SKILLSWAP_API_URL.`,
      0,
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      response.statusText ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const api = {
  // auth
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  register: (payload: Record<string, unknown>) =>
    apiRequest<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  // profile
  me: () => apiRequest<User>("/users/me"),
  updateProfile: (patch: Partial<User>) =>
    apiRequest<User>("/users/me", { method: "PUT", body: patch }),

  // skills
  skills: () => apiRequest<Skill[]>("/skills"),
  skill: (id: string) => apiRequest<Skill>(`/skills/${id}`),
  mySkills: () => apiRequest<Skill[]>("/skills/mine"),
  createSkill: (payload: {
    name: string;
    category: string;
    description?: string;
    level: Skill["level"];
    creditsPerHour: number;
  }) => apiRequest<Skill>("/skills", { method: "POST", body: payload }),
  updateSkill: (id: string, patch: Partial<Skill>) =>
    apiRequest<Skill>(`/skills/${id}`, { method: "PUT", body: patch }),
  deleteSkill: (id: string) =>
    apiRequest<{ ok: true }>(`/skills/${id}`, { method: "DELETE" }),

  // sessions
  sessions: () => apiRequest<Session[]>("/sessions"),
  session: (id: string) => apiRequest<Session>(`/sessions/${id}`),
  bookSession: (payload: {
    skillId: string;
    scheduledAt: string;
    duration: number;
    notes?: string;
  }) => apiRequest<Session>("/sessions", { method: "POST", body: payload }),
  updateSession: (
    id: string,
    patch: { status?: Session["status"]; notes?: string; meetingLink?: string },
  ) => apiRequest<Session>(`/sessions/${id}`, { method: "PUT", body: patch }),

  // wallet
  transactions: () => apiRequest<Transaction[]>("/transactions"),
  balance: () => apiRequest<{ credits: number }>("/wallet/balance"),

  // notifications
  notifications: () => apiRequest<Notification[]>("/notifications"),
  markNotificationRead: (id: string) =>
    apiRequest<Notification>(`/notifications/${id}/read`, { method: "PUT" }),
  deleteNotification: (id: string) =>
    apiRequest<{ ok: true }>(`/notifications/${id}`, { method: "DELETE" }),
};
