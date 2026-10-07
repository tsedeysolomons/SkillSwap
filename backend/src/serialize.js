// Row -> API shape converters.
// The database is snake_case; the mobile app consumes camelCase.
// password_hash is never included in any mapped output.

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar_url || undefined,
    bio: row.bio || "",
    location: row.location || "",
    timezone: row.timezone || "UTC",
    gender: row.gender || undefined,
    role: row.role || undefined,
    ageRange: row.age_range || undefined,
    credits: Number(row.credits ?? 0),
    rating: Number(row.rating ?? 0),
    totalSessions: Number(row.total_sessions ?? 0),
    skillsOffered: [],
    skillsWanted: [],
    languages: row.languages || [],
    joinedAt: row.joined_at,
  };
}

function mapSkill(row) {
  if (!row) return null;
  const skill = {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || "",
    level: row.level,
    creditsPerHour: Number(row.credits_per_hour ?? 0),
    userId: row.user_id,
    rating: Number(row.rating ?? 0),
    totalSessions: Number(row.total_sessions ?? 0),
    createdAt: row.created_at,
  };
  if (row.teacher) skill.user = mapUser(row.teacher);
  return skill;
}

function mapSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    teacherId: row.teacher_id,
    learnerId: row.learner_id,
    skillId: row.skill_id,
    scheduledAt: row.scheduled_at,
    duration: Number(row.duration ?? 0),
    status: row.status,
    creditsAmount: Number(row.credits_amount ?? 0),
    notes: row.notes || undefined,
    meetingLink: row.meeting_link || undefined,
    createdAt: row.created_at,
    skill: row.skill ? mapSkill(row.skill) : undefined,
    teacher: row.teacher ? mapUser(row.teacher) : undefined,
    learner: row.learner ? mapUser(row.learner) : undefined,
  };
}

function mapTransaction(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: Number(row.amount ?? 0),
    description: row.description || "",
    sessionId: row.session_id || undefined,
    createdAt: row.created_at,
  };
}

function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: !!row.read,
    actionUrl: row.action_url || undefined,
    createdAt: row.created_at,
  };
}

module.exports = {
  mapUser,
  mapSkill,
  mapSession,
  mapTransaction,
  mapNotification,
};
