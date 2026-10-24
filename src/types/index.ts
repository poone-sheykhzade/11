export type Priority = 'normal' | 'important' | 'urgent';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  priority: Priority;
  time?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  icon?: string;
  history: { [dateStr: string]: boolean }; // YYYY-MM-DD -> boolean
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  updatedAt: string;
}

export interface WorkSession {
  id: string;
  date: string; // YYYY-MM-DD
  taskTitle?: string;
  durationSeconds: number; // in seconds
  timestamp: string;
}

export interface WeeklyReviewResult {
  weekLabel: string;
  score: number; // 0 to 100
  taskCompletionRate: number;
  tasksTotal: number;
  tasksCompleted: number;
  habitConsistencyRate: number;
  habitsTotalChecks: number;
  habitsCompletedChecks: number;
  focusMinutesTotal: number;
  focusSessionsCount: number;
  journalEntriesCount: number;
  summaryText: string;
  highlights: string[];
  improvements: string[];
  insufficientData: boolean;
  analyzedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
}

export type ActiveTab = 'today' | 'planner' | 'journal' | 'timer' | 'ai-review';
