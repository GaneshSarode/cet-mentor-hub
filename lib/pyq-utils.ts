import { PyqTestSession, PyqPaper, SubjectResult, PyqTestAnswer, PyqQuestion } from "@/lib/types/database";

export function calculateTestResult(
  session: PyqTestSession,
  paper: PyqPaper,
  answers: (PyqTestAnswer & { pyq_questions: PyqQuestion })[]
) {
  let totalScore = 0;
  
  const subjects = ['Physics', 'Chemistry', 'Mathematics'];
  const subjectMap = new Map<string, SubjectResult>();
  
  subjects.forEach(sub => {
    subjectMap.set(sub, {
      subject: sub,
      correct: 0,
      wrong: 0,
      unattempted: 0,
      score: 0,
      maxScore: sub === 'Mathematics' ? 100 : 50,
      timeSpent: 0
    });
  });

  // Since not all questions might be answered, we also need to account for unattempted
  // But answers array only contains interacted questions.
  // We deduce unattempted = total questions - correct - wrong for each subject
  // assuming uniform distribution: Phy 50, Chem 50, Math 50
  
  const qCountPerSub = 50;

  answers.forEach(ans => {
    const q = ans.pyq_questions;
    if (!q) return;
    
    const subResult = subjectMap.get(q.subject);
    if (!subResult) return;

    subResult.timeSpent += ans.time_spent_seconds;

    if (ans.selected_option) {
      if (ans.is_correct) {
        subResult.correct++;
        const marks = Number(q.marks_positive) || (q.subject === 'Mathematics' ? 2 : 1);
        subResult.score += marks;
        totalScore += marks;
      } else {
        subResult.wrong++;
        const neg = Number(q.marks_negative) || 0;
        subResult.score -= neg;
        totalScore -= neg;
      }
    }
  });

  // Calculate unattempted
  Array.from(subjectMap.values()).forEach(sub => {
    sub.unattempted = qCountPerSub - sub.correct - sub.wrong;
  });

  const accuracy = answers.filter(a => !!a.selected_option).length > 0 
    ? (answers.filter(a => a.is_correct).length / answers.filter(a => !!a.selected_option).length) * 100 
    : 0;

  let performanceTag: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' = 'Needs Improvement';
  if (totalScore >= 160) performanceTag = 'Excellent';
  else if (totalScore >= 120) performanceTag = 'Good';
  else if (totalScore >= 80) performanceTag = 'Average';

  return {
    totalScore,
    maxScore: paper.total_questions === 150 ? 200 : paper.total_questions * 1, // approximate
    accuracy,
    performanceTag,
    subjectResults: Array.from(subjectMap.values())
  };
}
