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

export interface MCQOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  options?: MCQOption[];
  correctAnswer?: string; // For MCQ, stores option id. For others, stores the answer text.
}

export interface Test {
  id:string;
  title: string;
  description: string;
  duration: number; // in minutes
  teacherId: string;
  questions: Question[];
  createdAt: string;
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Submission {
  id: string;
  testId: string;
  studentId: string;
  answers: Answer[];
  submittedAt: string;
  score?: number; // Calculated for MCQs
}
