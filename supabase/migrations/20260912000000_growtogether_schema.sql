-- ====================================================================
-- GROWTOGETHER PRODUCTION POSTGRESQL DATABASE SCHEMA MIGRATION
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. USERS (PUBLIC PROFILES)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    streak_count INT NOT NULL DEFAULT 0,
    streak_freeze_tokens INT NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- --------------------------------------------------------------------
-- 2. USER_SETTINGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme VARCHAR(20) NOT NULL DEFAULT 'obsidian',
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    friend_activity_notifications BOOLEAN NOT NULL DEFAULT true,
    auto_streak_freeze BOOLEAN NOT NULL DEFAULT true,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. HABITS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'mindset',
    frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
    target_count_per_period INT NOT NULL DEFAULT 1,
    time_of_day VARCHAR(20) NOT NULL DEFAULT 'anytime',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_cat ON public.habits(user_id, category, is_archived);

-- --------------------------------------------------------------------
-- 4. HABIT_LOGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    count INT NOT NULL DEFAULT 1,
    notes TEXT,
    CONSTRAINT unique_habit_date UNIQUE (habit_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, completed_date);

-- --------------------------------------------------------------------
-- 5. TASKS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    due_date TIMESTAMPTZ,
    estimated_minutes INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status, due_date);

-- --------------------------------------------------------------------
-- 6. PLANNER_EVENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planner_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'focus',
    linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    linked_habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planner_user_date ON public.planner_events(user_id, event_date);

-- --------------------------------------------------------------------
-- 7. FRIEND_REQUESTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sender_not_receiver CHECK (sender_id <> receiver_id),
    CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
);

-- --------------------------------------------------------------------
-- 8. FRIENDSHIPS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_friendship UNIQUE (user_id_1, user_id_2)
);

-- --------------------------------------------------------------------
-- 9. SHARED_HABITS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'mindset',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 10. SHARED_GOALS & 11. SHARED_GOAL_MEMBERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shared_goal_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.shared_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_goal_member UNIQUE (goal_id, user_id)
);

-- --------------------------------------------------------------------
-- 12. ENCOURAGEMENTS (Cheers & Nudges)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.encouragements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'cheer',
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 13. NOTIFICATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- --------------------------------------------------------------------
-- 14. ACHIEVEMENTS & 15. USER_ACHIEVEMENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'streak'
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & STRICT USER DATA ISOLATION POLICIES
-- ====================================================================

-- 1. Profiles (Public read for active profiles, private write)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. User Settings (Strict isolation)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User settings strict isolation"
    ON public.user_settings FOR ALL USING (auth.uid() = id);

-- 3. Habits (Strict isolation)
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Habits strict user isolation"
    ON public.habits FOR ALL USING (auth.uid() = user_id);

-- 4. Habit Logs (Strict isolation)
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Habit logs strict user isolation"
    ON public.habit_logs FOR ALL USING (auth.uid() = user_id);

-- 5. Tasks (Strict isolation)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks strict user isolation"
    ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- 6. Planner Events (Strict isolation)
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planner events strict user isolation"
    ON public.planner_events FOR ALL USING (auth.uid() = user_id);

-- 7. Friend Requests (Sender / Receiver view)
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friend requests access"
    ON public.friend_requests FOR ALL
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 8. Friendships (Paired users view)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friendships access"
    ON public.friendships FOR ALL
    USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- 9. Encouragements (Sender / Receiver access)
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Encouragements access"
    ON public.encouragements FOR ALL
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 10. Notifications (Strict isolation)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications strict isolation"
    ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 11. Achievements (Public read, System unlock)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements readable by authenticated users"
    ON public.achievements FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User achievements strict isolation"
    ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
