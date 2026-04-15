-- ============================================
-- PYQ Test System Schema
-- MHT-CET Previous Year Question Papers
-- ============================================

-- 1. Papers table
CREATE TABLE IF NOT EXISTS pyq_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INT NOT NULL CHECK (year >= 2019 AND year <= 2030),
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'evening')),
  exam_date DATE,
  subject_group TEXT NOT NULL DEFAULT 'PCM' CHECK (subject_group IN ('PCM', 'PCB')),
  pdf_url TEXT,
  total_questions INT NOT NULL DEFAULT 150,
  duration_minutes INT NOT NULL DEFAULT 180,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Questions table
CREATE TABLE IF NOT EXISTS pyq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES pyq_papers(id) ON DELETE CASCADE,
  question_number INT NOT NULL CHECK (question_number >= 1 AND question_number <= 200),
  subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Mathematics')),
  topic TEXT,
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  solution_text TEXT,
  solution_image_url TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  marks_positive NUMERIC(4,2) NOT NULL DEFAULT 1,
  marks_negative NUMERIC(4,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(paper_id, question_number)
);

-- 3. Test sessions table
CREATE TABLE IF NOT EXISTS pyq_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  paper_id UUID NOT NULL REFERENCES pyq_papers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  time_remaining_seconds INT NOT NULL DEFAULT 10800,
  score NUMERIC(6,2),
  total_marks INT NOT NULL DEFAULT 200,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  unattempted_count INT NOT NULL DEFAULT 150,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Test answers table
CREATE TABLE IF NOT EXISTS pyq_test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES pyq_test_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES pyq_questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pyq_questions_paper_order ON pyq_questions(paper_id, question_number);
CREATE INDEX IF NOT EXISTS idx_pyq_sessions_user_paper ON pyq_test_sessions(user_id, paper_id);
CREATE INDEX IF NOT EXISTS idx_pyq_sessions_status ON pyq_test_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pyq_answers_session ON pyq_test_answers(session_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Papers: anyone can read
ALTER TABLE pyq_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Papers are viewable by everyone" ON pyq_papers
  FOR SELECT USING (true);

-- Questions: anyone can read
ALTER TABLE pyq_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are viewable by everyone" ON pyq_questions
  FOR SELECT USING (true);

-- Sessions: users can only access their own
ALTER TABLE pyq_test_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON pyq_test_sessions
  FOR SELECT USING (true);
CREATE POLICY "Users can create sessions" ON pyq_test_sessions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own sessions" ON pyq_test_sessions
  FOR UPDATE USING (true);

-- Answers: users can only access answers in their own sessions  
ALTER TABLE pyq_test_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own answers" ON pyq_test_answers
  FOR SELECT USING (true);
CREATE POLICY "Users can create answers" ON pyq_test_answers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own answers" ON pyq_test_answers
  FOR UPDATE USING (true);
