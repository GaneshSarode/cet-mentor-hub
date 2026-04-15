// ============================================
// PYQ Test System — TypeScript Types
// ============================================

export interface PyqPaper {
  id: string;
  title: string;
  year: number;
  shift: 'morning' | 'evening';
  exam_date: string | null;
  subject_group: 'PCM' | 'PCB';
  pdf_url: string | null;
  total_questions: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface PyqQuestion {
  id: string;
  paper_id: string;
  question_number: number;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  topic: string | null;
  question_text: string;
  question_image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  solution_text: string | null;
  solution_image_url: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  marks_positive: number;
  marks_negative: number;
  created_at: string;
}

export interface PyqTestSession {
  id: string;
  user_id: string;
  paper_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  submitted_at: string | null;
  time_remaining_seconds: number;
  score: number | null;
  total_marks: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  created_at: string;
}

export interface PyqTestAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean | null;
  time_spent_seconds: number;
  is_marked_for_review: boolean;
  answered_at: string;
}

// Derived types for the test engine
export type QuestionStatus = 'not-visited' | 'visited' | 'answered' | 'marked-for-review';

export interface QuestionState {
  question: PyqQuestion;
  status: QuestionStatus;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isMarkedForReview: boolean;
  timeSpent: number; // seconds
}

export interface TestState {
  session: PyqTestSession;
  paper: PyqPaper;
  questions: QuestionState[];
  currentQuestionIndex: number;
  activeSubject: 'Physics' | 'Chemistry' | 'Mathematics' | 'all';
  timeRemaining: number; // seconds
  isSubmitted: boolean;
}

// Result types
export interface SubjectResult {
  subject: string;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
  maxScore: number;
  timeSpent: number; // total seconds
}

export interface TestResult {
  session: PyqTestSession;
  paper: PyqPaper;
  subjectResults: SubjectResult[];
  totalScore: number;
  maxScore: number;
  accuracy: number; // percentage
  performanceTag: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  answers: (PyqTestAnswer & { question: PyqQuestion })[];
}

// Admin types
export interface PaperFormData {
  title: string;
  year: number;
  shift: 'morning' | 'evening';
  exam_date: string;
  subject_group: 'PCM' | 'PCB';
  pdf_url: string;
  total_questions: number;
  duration_minutes: number;
}

export interface QuestionCSVRow {
  question_number: number;
  subject: string;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  solution_text: string;
  difficulty: string;
}
