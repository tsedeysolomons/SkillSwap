-- database/seeds/seed.sql
-- Sample seed data for SkillSwap

-- USERS
INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    bio,
    location,
    timezone,
    credits,
    rating,
    total_sessions,
    languages,
    avatar_url,
    joined_at,
    updated_at
)
VALUES
(
    gen_random_uuid(),
    'Alice',
    'alice@example.com',
    'hashedpassword',
    'Enthusiastic teacher',
    'Nairobi',
    'Africa/Nairobi',
    100,
    4.5,
    5,
    ARRAY['English', 'Swahili'],
    NULL,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Bob',
    'bob@example.com',
    'hashedpassword',
    'Full-stack developer',
    'Lagos',
    'Africa/Lagos',
    80,
    4.0,
    3,
    ARRAY['English'],
    NULL,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Carol',
    'carol@example.com',
    'hashedpassword',
    'Design mentor',
    'Accra',
    'Africa/Accra',
    120,
    4.8,
    7,
    ARRAY['English', 'French'],
    NULL,
    NOW(),
    NOW()
);

-- SKILLS
INSERT INTO skills (
    id,
    user_id,
    name,
    category,
    description,
    level,
    credits_per_hour,
    rating,
    total_sessions,
    created_at
)
VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'JavaScript Basics',
    'Programming',
    'Intro to JavaScript for beginners',
    'Beginner',
    10,
    4.5,
    5,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'Python for Web',
    'Programming',
    'Django crash course',
    'Intermediate',
    12,
    4.2,
    3,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'carol@example.com'),
    'UI/UX Design',
    'Design',
    'Design thinking workshop',
    'Advanced',
    15,
    4.9,
    7,
    NOW()
);

-- SESSIONS
INSERT INTO sessions (
    id,
    teacher_id,
    learner_id,
    skill_id,
    scheduled_at,
    duration,
    status,
    credits_amount,
    notes,
    meeting_link,
    created_at
)
VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    (SELECT id FROM skills WHERE name = 'JavaScript Basics'),
    NOW() + INTERVAL '2 days',
    60,
    'confirmed',
    10,
    'JavaScript introduction session',
    'https://meet.example.com/js-session',
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    (SELECT id FROM users WHERE email = 'carol@example.com'),
    (SELECT id FROM skills WHERE name = 'Python for Web'),
    NOW() + INTERVAL '5 days',
    90,
    'pending',
    18,
    'Django basics session',
    'https://meet.example.com/python-session',
    NOW()
);

-- REVIEWS
INSERT INTO reviews (
    id,
    session_id,
    reviewer_id,
    reviewee_id,
    rating,
    comment,
    created_at
)
VALUES
(
    gen_random_uuid(),
    (SELECT id FROM sessions LIMIT 1 OFFSET 0),
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    5,
    'Great teacher with clear explanations.',
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM sessions LIMIT 1 OFFSET 1),
    (SELECT id FROM users WHERE email = 'carol@example.com'),
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    4,
    'Very informative session.',
    NOW()
);

-- TRANSACTIONS
INSERT INTO transactions (
    id,
    user_id,
    type,
    amount,
    description,
    session_id,
    created_at
)
VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'spent',
    10,
    'Session payment to Alice',
    (SELECT id FROM sessions LIMIT 1 OFFSET 0),
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'earned',
    10,
    'Credits earned from teaching session',
    (SELECT id FROM sessions LIMIT 1 OFFSET 0),
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'carol@example.com'),
    'spent',
    18,
    'Session payment to Bob',
    (SELECT id FROM sessions LIMIT 1 OFFSET 1),
    NOW()
);

-- NOTIFICATIONS
INSERT INTO notifications (
    id,
    user_id,
    title,
    message,
    type,
    read,
    action_url,
    created_at
)
VALUES
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'Session Confirmed',
    'Your session with Alice has been confirmed.',
    'session',
    false,
    '/sessions',
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'carol@example.com'),
    'Credits Updated',
    'Your credits have been deducted for the session.',
    'credit',
    false,
    '/transactions',
    NOW()
);