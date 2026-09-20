import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkyvllwnxwoturpppyvu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_614SBRX9DA9dKbKv9H2BdA_ClKPJgbg';

// Environment status check helper for cloud deployment
export const isSupabaseConfigured = (): boolean => {
  return (
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://wkyvllwnxwoturpppyvu.supabase.co' &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * PRODUCTION POSTGRES ROW LEVEL SECURITY (RLS) POLICIES SCHEMA DOCUMENT
 * Apply these policies in Supabase SQL Editor when deploying cloud Postgres DB.
 *
 * -- 1. HABITS TABLE RLS
 * ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can only select own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
 * CREATE POLICY "Users can only insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
 * CREATE POLICY "Users can only update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
 * CREATE POLICY "Users can only delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);
 *
 * -- 2. TASKS TABLE RLS
 * ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can only select own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
 * CREATE POLICY "Users can only insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
 * CREATE POLICY "Users can only update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
 * CREATE POLICY "Users can only delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);
 *
 * -- 3. PLANNER EVENTS TABLE RLS
 * ALTER TABLE planner_blocks ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can only select own planner blocks" ON planner_blocks FOR SELECT USING (auth.uid() = user_id);
 * CREATE POLICY "Users can only modify own planner blocks" ON planner_blocks FOR ALL USING (auth.uid() = user_id);
 *
 * -- 4. SHARED GOALS TABLE RLS
 * ALTER TABLE shared_goals ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Goal members can read shared goal" ON shared_goals FOR SELECT
 *   USING (EXISTS (SELECT 1 FROM shared_goal_members WHERE goal_id = shared_goals.id AND user_id = auth.uid()));
 */
