import { Task, Habit, JournalEntry, WorkSession, UserProfile, WeeklyReviewResult } from '../types';
import { getTodayDateStr, getWeekDays } from '../utils/dateUtils';

const STORAGE_KEYS = {
  USER: 'lifeos_user_v2',
  TASKS: 'lifeos_tasks_v2',
  HABITS: 'lifeos_habits_v2',
  JOURNAL: 'lifeos_journal_v2',
  SESSIONS: 'lifeos_sessions_v2',
  REVIEWS: 'lifeos_reviews_v2',
};

const today = getTodayDateStr();
const currentWeek = getWeekDays(0);

// Default Seed Data
const DEFAULT_USER: UserProfile = {
  id: 'usr_sahar',
  name: 'سحر',
  email: 'sahar@example.com',
};

// Seed clean, realistic tasks for the current week
const DEFAULT_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'بررسی نهایی پروتوتایپ رابط کاربری',
    date: currentWeek[0]?.dateStr || today,
    completed: true,
    priority: 'important',
    time: '۱۰:۰۰',
    notes: 'بازبینی طرح‌های تیم و هماهنگی با مدیر محصول',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task_2',
    title: 'مطالعه معماری سرویس‌های توزیع‌شده',
    date: currentWeek[1]?.dateStr || today,
    completed: true,
    priority: 'normal',
    time: '۱۶:۰۰',
    notes: 'فصل کشینگ و پایداری کلاسترها',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task_3',
    title: 'کانفیگ سرور و بهینه‌سازی دیتابیس',
    date: today,
    completed: false,
    priority: 'urgent',
    time: '۱۱:۳۰',
    notes: 'بررسی کوئری‌های کند و تنظیم کش ردیس',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task_4',
    title: 'پیاده‌سازی تست‌های واحد اندپوینت‌ها',
    date: today,
    completed: false,
    priority: 'important',
    time: '۱۵:۰۰',
    notes: 'تست یکپارچگی احراز هویت و مدیریت خطاها',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task_5',
    title: 'جلسه بازبینی هفتگی با تیم توسعه',
    date: currentWeek[5]?.dateStr || today,
    completed: false,
    priority: 'normal',
    time: '۱۷:۰۰',
    notes: 'بررسی تسک‌های اسپرینت و اولویت‌های هفته بعد',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit_water',
    title: 'نوشیدن ۲ لیتر آب',
    icon: 'water_drop',
    history: {
      [currentWeek[0]?.dateStr || '']: true,
      [currentWeek[1]?.dateStr || '']: true,
      [currentWeek[2]?.dateStr || '']: true,
      [today]: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_workout',
    title: 'ورزش و پیاده‌روی',
    icon: 'fitness_center',
    history: {
      [currentWeek[0]?.dateStr || '']: true,
      [currentWeek[2]?.dateStr || '']: true,
      [today]: false,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_reading',
    title: 'مطالعه ۲۰ صفحه کتاب',
    icon: 'menu_book',
    history: {
      [currentWeek[1]?.dateStr || '']: true,
      [today]: false,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_code',
    title: 'تمرکز عمیق برنامه‌نویسی',
    icon: 'terminal',
    history: {
      [currentWeek[0]?.dateStr || '']: true,
      [currentWeek[1]?.dateStr || '']: true,
      [today]: true,
    },
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_JOURNALS: Record<string, JournalEntry> = {
  [today]: {
    id: `journal_${today}`,
    date: today,
    title: 'تمرکز آرام و پیشرفت پیوسته',
    content: 'امروز روی بازبینی کدهای بک‌اند و بهینه‌سازی دیتابیس کار کردم. فضای کاری آرام‌تر و بدون حواس‌پرتی به پیشرفت کارها کمک زیادی کرد.',
    updatedAt: new Date().toISOString(),
  },
};

const DEFAULT_SESSIONS: WorkSession[] = [
  {
    id: 'session_1',
    date: today,
    taskTitle: 'کانفیگ سرور و بهینه‌سازی دیتابیس',
    durationSeconds: 45 * 60,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'session_2',
    date: currentWeek[0]?.dateStr || today,
    taskTitle: 'پروتوتایپ رابط کاربری',
    durationSeconds: 60 * 60,
    timestamp: new Date().toISOString(),
  },
];

class StorageService {
  // USER
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  }

  saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // TASKS
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  }

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'completed'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.getTasks().map(t => (t.id === updatedTask.id ? updatedTask : t));
    this.saveTasks(tasks);
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
  }

  toggleTask(id: string): Task | undefined {
    const tasks = this.getTasks();
    let updated: Task | undefined;
    const newTasks = tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        updated = {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
        return updated;
      }
      return t;
    });
    this.saveTasks(newTasks);
    return updated;
  }

  // HABITS
  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  }

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }

  createHabit(title: string, icon?: string): Habit {
    const habits = this.getHabits();
    const newHabit: Habit = {
      id: 'habit_' + Date.now(),
      title,
      icon: icon || 'check_circle',
      history: {},
      createdAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    this.saveHabits(habits);
    return newHabit;
  }

  deleteHabit(id: string): void {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.saveHabits(habits);
  }

  toggleHabitDay(habitId: string, dateStr: string): boolean {
    const habits = this.getHabits();
    let newState = false;
    const updated = habits.map(h => {
      if (h.id === habitId) {
        newState = !h.history[dateStr];
        return {
          ...h,
          history: {
            ...h.history,
            [dateStr]: newState,
          },
        };
      }
      return h;
    });
    this.saveHabits(updated);
    return newState;
  }

  // JOURNAL
  getJournalEntries(): Record<string, JournalEntry> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return data ? JSON.parse(data) : DEFAULT_JOURNALS;
    } catch {
      return DEFAULT_JOURNALS;
    }
  }

  getJournalEntry(date: string): JournalEntry | undefined {
    const entries = this.getJournalEntries();
    return entries[date];
  }

  saveJournalEntry(date: string, content: string, title?: string): JournalEntry {
    const entries = this.getJournalEntries();
    const entry: JournalEntry = {
      id: entries[date]?.id || `journal_${date}`,
      date,
      title: title?.trim() || undefined,
      content,
      updatedAt: new Date().toISOString(),
    };
    entries[date] = entry;
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
    return entry;
  }

  deleteJournalEntry(date: string): void {
    const entries = this.getJournalEntries();
    delete entries[date];
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
  }

  // WORK SESSIONS (Flexible Timer)
  getWorkSessions(): WorkSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : DEFAULT_SESSIONS;
    } catch {
      return DEFAULT_SESSIONS;
    }
  }

  saveWorkSessions(sessions: WorkSession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  logWorkSession(date: string, durationSeconds: number, taskTitle?: string): WorkSession {
    const sessions = this.getWorkSessions();
    const session: WorkSession = {
      id: 'session_' + Date.now(),
      date,
      durationSeconds,
      taskTitle: taskTitle?.trim() || undefined,
      timestamp: new Date().toISOString(),
    };
    sessions.unshift(session);
    this.saveWorkSessions(sessions);
    return session;
  }

  // WEEKLY REVIEWS
  getWeeklyReviews(): Record<string, WeeklyReviewResult> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveWeeklyReview(weekKey: string, review: WeeklyReviewResult): void {
    const reviews = this.getWeeklyReviews();
    reviews[weekKey] = review;
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }

  // BACKUP & RESTORE
  exportBackup(): string {
    const data = {
      version: '2.0-minimal',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      tasks: this.getTasks(),
      habits: this.getHabits(),
      journal: this.getJournalEntries(),
      sessions: this.getWorkSessions(),
    };
    return JSON.stringify(data, null, 2);
  }

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.user) this.saveUser(parsed.user);
      if (parsed.tasks) this.saveTasks(parsed.tasks);
      if (parsed.habits) this.saveHabits(parsed.habits);
      if (parsed.journal) localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(parsed.journal));
      if (parsed.sessions) this.saveWorkSessions(parsed.sessions);
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.JOURNAL);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
  }
}

export const storageService = new StorageService();
