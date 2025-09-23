import {
  User,
  Skill,
  Session,
  Review,
  Transaction,
  Notification,
} from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Full-stack developer with 8 years of experience. Love teaching Python and learning new languages!",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    credits: 150,
    rating: 4.9,
    totalSessions: 47,
    skillsOffered: [],
    skillsWanted: ["Spanish", "Guitar", "Photography"],
    languages: ["English", "Mandarin"],
    joinedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Carlos Rodriguez",
    email: "carlos@example.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Native Spanish speaker and guitar instructor. Looking to improve my programming skills!",
    location: "Madrid, Spain",
    timezone: "Europe/Madrid",
    credits: 89,
    rating: 4.8,
    totalSessions: 32,
    skillsOffered: [],
    skillsWanted: ["Python", "React", "Data Science"],
    languages: ["Spanish", "English"],
    joinedAt: "2024-02-20T00:00:00Z",
  },
  {
    id: "3",
    name: "Yuki Tanaka",
    email: "yuki@example.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "Professional photographer and Japanese tutor. Passionate about visual storytelling.",
    location: "Tokyo, Japan",
    timezone: "Asia/Tokyo",
    credits: 203,
    rating: 4.95,
    totalSessions: 68,
    skillsOffered: [],
    skillsWanted: ["French", "Cooking", "Marketing"],
    languages: ["Japanese", "English"],
    joinedAt: "2024-01-08T00:00:00Z",
  },
];

export const mockSkills: Skill[] = [
  {
    id: "1",
    name: "Python Programming",
    category: "Programming",
    description:
      "Learn Python from basics to advanced concepts including web development, data analysis, and automation.",
    level: "Expert",
    creditsPerHour: 25,
    userId: "1",
    rating: 4.9,
    totalSessions: 47,
  },
  {
    id: "2",
    name: "Spanish Conversation",
    category: "Languages",
    description:
      "Native Spanish speaker offering conversational practice and grammar lessons for all levels.",
    level: "Expert",
    creditsPerHour: 20,
    userId: "2",
    rating: 4.8,
    totalSessions: 32,
  },
  {
    id: "3",
    name: "Guitar Lessons",
    category: "Music",
    description:
      "Acoustic and electric guitar lessons covering various styles from classical to rock.",
    level: "Advanced",
    creditsPerHour: 22,
    userId: "2",
    rating: 4.7,
    totalSessions: 28,
  },
  {
    id: "4",
    name: "Photography",
    category: "Creative",
    description:
      "Professional photography techniques, composition, lighting, and post-processing with Lightroom.",
    level: "Expert",
    creditsPerHour: 30,
    userId: "3",
    rating: 4.95,
    totalSessions: 68,
  },
  {
    id: "5",
    name: "Japanese Language",
    category: "Languages",
    description:
      "Learn Japanese from hiragana to business level. Cultural insights included!",
    level: "Expert",
    creditsPerHour: 28,
    userId: "3",
    rating: 4.9,
    totalSessions: 45,
  },
];

export const mockSessions: Session[] = [
  {
    id: "1",
    teacherId: "2",
    learnerId: "1",
    skillId: "2",
    scheduledAt: "2024-12-05T15:00:00Z",
    duration: 60,
    status: "confirmed",
    creditsAmount: 20,
    notes: "Focus on conversational Spanish for travel",
    meetingLink: "https://meet.skillswap.com/session-1",
    createdAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "2",
    teacherId: "1",
    learnerId: "2",
    skillId: "1",
    scheduledAt: "2024-12-06T18:00:00Z",
    duration: 90,
    status: "pending",
    creditsAmount: 37,
    notes: "Introduction to Python web development with Flask",
    createdAt: "2024-12-02T14:30:00Z",
  },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    sessionId: "1",
    reviewerId: "1",
    revieweeId: "2",
    rating: 5,
    comment:
      "Carlos is an excellent Spanish teacher! Very patient and encouraging.",
    createdAt: "2024-11-28T20:00:00Z",
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    userId: "1",
    type: "earned",
    amount: 25,
    description: "Python Programming session with Carlos",
    sessionId: "2",
    createdAt: "2024-11-30T19:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    type: "spent",
    amount: 20,
    description: "Spanish Conversation session with Carlos",
    sessionId: "1",
    createdAt: "2024-11-28T16:00:00Z",
  },
  {
    id: "3",
    userId: "1",
    type: "bonus",
    amount: 50,
    description: "Welcome bonus for new users",
    createdAt: "2024-11-25T12:00:00Z",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    title: "Session Reminder",
    message: "Your Spanish lesson with Carlos starts in 1 hour",
    type: "session",
    read: false,
    createdAt: "2024-12-05T14:00:00Z",
    actionUrl: "/sessions/1",
  },
  {
    id: "2",
    userId: "1",
    title: "Credits Earned",
    message: "You earned 25 credits from your Python session!",
    type: "credit",
    read: true,
    createdAt: "2024-11-30T19:05:00Z",
  },
];

// Add skills to users
mockUsers[0].skillsOffered = [mockSkills[0]];
mockUsers[1].skillsOffered = [mockSkills[1], mockSkills[2]];
mockUsers[2].skillsOffered = [mockSkills[3], mockSkills[4]];

// Add user references to skills
mockSkills.forEach((skill) => {
  skill.user = mockUsers.find((user) => user.id === skill.userId);
});

// Add references to sessions
mockSessions.forEach((session) => {
  session.teacher = mockUsers.find((user) => user.id === session.teacherId);
  session.learner = mockUsers.find((user) => user.id === session.learnerId);
  session.skill = mockSkills.find((skill) => skill.id === session.skillId);
});

// Add references to reviews
mockReviews.forEach((review) => {
  review.reviewer = mockUsers.find((user) => user.id === review.reviewerId);
  review.reviewee = mockUsers.find((user) => user.id === review.revieweeId);
});
