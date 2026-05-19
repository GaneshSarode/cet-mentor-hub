-- ============================================
-- Fix: Tighten RLS Policies
-- Since this app uses Clerk (not Supabase Auth),
-- auth.uid() is NOT available. All user-specific
-- operations go through API routes that use the
-- admin (service_role) client which bypasses RLS.
--
-- Strategy:
--   Papers & Questions: Public read (keep as-is)
--   Sessions & Answers: Block direct anon access
--     (all ops go through API routes with admin client)
--   Bookmarks: Block direct anon access
-- ============================================

-- ─── Sessions: Restrict direct anon access ───
DROP POLICY IF EXISTS "Users can view own sessions" ON pyq_test_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON pyq_test_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON pyq_test_sessions;

-- Only the service_role (API routes) can access sessions
-- Anon/public key users get zero rows
CREATE POLICY "Sessions are only accessible via API" ON pyq_test_sessions
  FOR SELECT USING (false);
CREATE POLICY "Sessions are only insertable via API" ON pyq_test_sessions
  FOR INSERT WITH CHECK (false);
CREATE POLICY "Sessions are only updatable via API" ON pyq_test_sessions
  FOR UPDATE USING (false);

-- ─── Answers: Restrict direct anon access ───
DROP POLICY IF EXISTS "Users can view own answers" ON pyq_test_answers;
DROP POLICY IF EXISTS "Users can create answers" ON pyq_test_answers;
DROP POLICY IF EXISTS "Users can update own answers" ON pyq_test_answers;

CREATE POLICY "Answers are only accessible via API" ON pyq_test_answers
  FOR SELECT USING (false);
CREATE POLICY "Answers are only insertable via API" ON pyq_test_answers
  FOR INSERT WITH CHECK (false);
CREATE POLICY "Answers are only updatable via API" ON pyq_test_answers
  FOR UPDATE USING (false);

-- ─── Bookmarks: Restrict direct anon access ───
DROP POLICY IF EXISTS "Users can view own bookmarks" ON pyq_bookmarks;
DROP POLICY IF EXISTS "Users can create bookmarks" ON pyq_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON pyq_bookmarks;

CREATE POLICY "Bookmarks are only accessible via API" ON pyq_bookmarks
  FOR SELECT USING (false);
CREATE POLICY "Bookmarks are only insertable via API" ON pyq_bookmarks
  FOR INSERT WITH CHECK (false);
CREATE POLICY "Bookmarks are only deletable via API" ON pyq_bookmarks
  FOR DELETE USING (false);
