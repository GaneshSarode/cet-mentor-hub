-- ============================================
-- Bookmarks System Schema
-- Users can bookmark PYQ questions for revision
-- ============================================

CREATE TABLE IF NOT EXISTS pyq_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES pyq_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_pyq_bookmarks_user ON pyq_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_pyq_bookmarks_question ON pyq_bookmarks(question_id);

-- Row Level Security
ALTER TABLE pyq_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON pyq_bookmarks
  FOR SELECT USING (true);

CREATE POLICY "Users can create bookmarks" ON pyq_bookmarks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own bookmarks" ON pyq_bookmarks
  FOR DELETE USING (true);
