-- SkillSwap Database Schema
-- PostgreSQL

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    location VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC',
    credits INTEGER DEFAULT 50,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_sessions INTEGER DEFAULT 0,
    languages TEXT[],
    avatar_url TEXT,
    joined_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    level VARCHAR(50) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    credits_per_hour INTEGER NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    learner_id UUID REFERENCES users(id),
    skill_id UUID REFERENCES skills(id),
    scheduled_at TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    credits_amount INTEGER NOT NULL,
    notes TEXT,
    meeting_link TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) CHECK (type IN ('earned', 'spent', 'bonus')),
    amount INTEGER NOT NULL,
    description TEXT,
    session_id UUID REFERENCES sessions(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('session', 'credit', 'review', 'system')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX idx_sessions_learner_id ON sessions(learner_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
