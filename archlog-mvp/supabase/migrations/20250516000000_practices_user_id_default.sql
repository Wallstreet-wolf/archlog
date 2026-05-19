-- 在 Supabase SQL Editor 中执行，或由 supabase db push 应用
ALTER TABLE practices ALTER COLUMN user_id SET DEFAULT auth.uid();
