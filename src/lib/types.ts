
export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // Storing password for localStorage auth as requested
  teacherId?: string;
  registerNumber?: string;
}

export type QuestionType = 'mcq' | 'short-answer' | 'essay';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface MCQOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  difficulty: QuestionDifficulty;
  category: string;
  negativeMarks?: number;
  explanation?: string;
  options?: MCQOption[];
  correctAnswer?: string; // For MCQ, stores option id.
}

export interface Test {
  id:string;
  title: string;
  description?: string;
  duration: number; // in minutes
  teacherId: string;
  questions: Question[];
  createdAt: string;
  accessCode?: string;
  maxAttempts?: number; // 0 for unlimited
}

export interface Answer {
  questionId: string;
  value: string;
  pointsAwarded?: number;
}

export interface Submission {
  id: string;
  testId: string;
  studentId: string;
  answers: Answer[];
  submittedAt: string;
  attemptNumber: number;
  score?: number; // No longer used for final score, but kept for potential data analysis.
  gradedScore?: number; // Manually calculated score by teacher. This is the source of truth.
  leaveCount?: number;
}

    