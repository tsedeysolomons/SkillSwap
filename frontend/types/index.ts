export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  location: string;
  timezone: string;
  credits: number;
  rating: number;
  totalSessions: number;
  skillsOffered: Skill[];
  skillsWanted: string[];
  languages: string[];
  joinedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  creditsPerHour: number;
  userId: string;
  user?: User;
  rating: number;
  totalSessions: number;
}

export interface Session {
  id: string;
  teacherId: string;
  learnerId: string;
  skillId: string;
  skill?: Skill;
  teacher?: User;
  learner?: User;
  scheduledAt: string;
  duration: number; // in minutes
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  creditsAmount: number;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  reviewer?: User;
  reviewee?: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "earned" | "spent" | "bonus";
  amount: number;
  description: string;
  sessionId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "session" | "credit" | "review" | "general";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
