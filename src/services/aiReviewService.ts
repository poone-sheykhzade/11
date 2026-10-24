import { Task, Habit, WorkSession, JournalEntry, WeeklyReviewResult } from '../types';
import { DayInfo } from '../utils/dateUtils';

interface WeekDataPayload {
  weekDays: DayInfo[];
  tasks: Task[];
  habits: Habit[];
  sessions: WorkSession[];
  journalEntries: Record<string, JournalEntry>;
}

export async function generateWeeklyReview(payload: WeekDataPayload): Promise<WeeklyReviewResult> {
  const { weekDays, tasks, habits, sessions, journalEntries } = payload;
  const weekDates = new Set(weekDays.map(d => d.dateStr));

  // 1. Calculate actual real numbers
  const weekTasks = tasks.filter(t => weekDates.has(t.date));
  const tasksTotal = weekTasks.length;
  const completedTasks = weekTasks.filter(t => t.completed);
  const pendingTasks = weekTasks.filter(t => !t.completed);
  const tasksCompleted = completedTasks.length;

  const taskCompletionRate = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  // Habit consistency across the 7 days
  let habitsTotalChecks = 0;
  let habitsCompletedChecks = 0;
  const habitBreakdown: { title: string; completed: number; total: number }[] = [];

  habits.forEach(h => {
    let count = 0;
    weekDays.forEach(day => {
      habitsTotalChecks++;
      if (h.history[day.dateStr]) {
        habitsCompletedChecks++;
        count++;
      }
    });
    habitBreakdown.push({
      title: h.title,
      completed: count,
      total: 7,
    });
  });

  const habitConsistencyRate =
    habitsTotalChecks > 0 ? Math.round((habitsCompletedChecks / habitsTotalChecks) * 100) : 0;

  // Focus sessions
  const weekSessions = sessions.filter(s => weekDates.has(s.date));
  const focusMinutesTotal = Math.round(
    weekSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  // Journal entries
  const weekJournals = Object.values(journalEntries).filter(j => weekDates.has(j.date));
  const journalEntriesCount = weekJournals.length;

  const weekLabel = `${weekDays[0]?.formattedPersian} تا ${weekDays[6]?.formattedPersian}`;

  // Check if data is insufficient
  const insufficientData = tasksTotal === 0 && habitsCompletedChecks === 0 && focusMinutesTotal === 0;

  if (insufficientData) {
    return {
      weekLabel,
      score: 0,
      taskCompletionRate: 0,
      tasksTotal: 0,
      tasksCompleted: 0,
      habitConsistencyRate: 0,
      habitsTotalChecks: 0,
      habitsCompletedChecks: 0,
      focusMinutesTotal: 0,
      focusSessionsCount: 0,
      journalEntriesCount: 0,
      summaryText: 'در این بازه هفتگی، فعالیت یا تسک ثبت‌شده‌ای یافت نشد. برای ایجاد گزارش تحلیلی، لطفاً تسک‌ها، عادات یا جلسات تمرکز کاری خود را ثبت کنید.',
      highlights: [],
      improvements: [
        'حداقل ۳ تسک کلیدی برای روزهای هفته تعریف کنید.',
        'یک یا دو روتین ساده (مانند نوشیدن آب یا مطالعه) در جدول عادات ثبت نمایید.',
      ],
      insufficientData: true,
      analyzedAt: new Date().toISOString(),
    };
  }

  // Calculate realistic composite score (0 to 100%)
  // Weighted: 45% Tasks + 40% Habits + 15% Focus sessions (target 180+ mins)
  const focusScore = Math.min(100, Math.round((focusMinutesTotal / 180) * 100));
  let calculatedScore = 0;

  if (tasksTotal > 0 && habits.length > 0) {
    calculatedScore = Math.round(
      taskCompletionRate * 0.45 + habitConsistencyRate * 0.4 + focusScore * 0.15
    );
  } else if (tasksTotal > 0) {
    calculatedScore = Math.round(taskCompletionRate * 0.75 + focusScore * 0.25);
  } else if (habits.length > 0) {
    calculatedScore = Math.round(habitConsistencyRate * 0.75 + focusScore * 0.25);
  } else {
    calculatedScore = focusScore;
  }
  calculatedScore = Math.max(5, Math.min(100, calculatedScore));

  // Try calling server API endpoint if available, with structured prompt
  try {
    const apiPayload = {
      weekLabel,
      tasksTotal,
      tasksCompleted,
      taskCompletionRate,
      completedTaskTitles: completedTasks.map(t => t.title),
      pendingTaskTitles: pendingTasks.map(t => t.title),
      habitBreakdown,
      focusMinutesTotal,
      focusSessionsCount: weekSessions.length,
      journalEntriesCount,
      calculatedScore,
    };

    const res = await fetch('/api/ai-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.summaryText) {
        return {
          weekLabel,
          score: calculatedScore,
          taskCompletionRate,
          tasksTotal,
          tasksCompleted,
          habitConsistencyRate,
          habitsTotalChecks,
          habitsCompletedChecks,
          focusMinutesTotal,
          focusSessionsCount: weekSessions.length,
          journalEntriesCount,
          summaryText: data.summaryText,
          highlights: Array.isArray(data.highlights) && data.highlights.length > 0 ? data.highlights : generateHighlights(completedTasks, habitBreakdown, focusMinutesTotal),
          improvements: Array.isArray(data.improvements) && data.improvements.length > 0 ? data.improvements : generateImprovements(pendingTasks, habitBreakdown, focusMinutesTotal),
          insufficientData: false,
          analyzedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Graceful fallback to deterministic local analysis
  }

  // Pure deterministic grounded fallback using real data
  const highlights = generateHighlights(completedTasks, habitBreakdown, focusMinutesTotal);
  const improvements = generateImprovements(pendingTasks, habitBreakdown, focusMinutesTotal);

  let summaryText = `در این هفته مجموعاً ${tasksCompleted} از ${tasksTotal} تسک با نرخ موفقیت ${taskCompletionRate}٪ تکمیل شد. همچنین پیوستگی عادات شما به ${habitConsistencyRate}٪ رسید و ${focusMinutesTotal} دقیقه زمان تمرکز ثبت گردید.`;
  if (calculatedScore >= 75) {
    summaryText += ' عملکرد این هفته شما در سطح بسیار منظم و باثباتی ارزیابی می‌شود.';
  } else if (calculatedScore >= 50) {
    summaryText += ' روند کاری شما قابل قبول بوده و با تمرکز بر اولویت‌بندی تسک‌های معوقه می‌تواند ارتقا یابد.';
  } else {
    summaryText += ' نیاز به تنظیم بار کاری و تمرکز بیشتر بر انجام تعهدات روزانه احساس می‌شود.';
  }

  return {
    weekLabel,
    score: calculatedScore,
    taskCompletionRate,
    tasksTotal,
    tasksCompleted,
    habitConsistencyRate,
    habitsTotalChecks,
    habitsCompletedChecks,
    focusMinutesTotal,
    focusSessionsCount: weekSessions.length,
    journalEntriesCount,
    summaryText,
    highlights,
    improvements,
    insufficientData: false,
    analyzedAt: new Date().toISOString(),
  };
}

function generateHighlights(
  completedTasks: Task[],
  habitBreakdown: { title: string; completed: number; total: number }[],
  focusMinutesTotal: number
): string[] {
  const highlights: string[] = [];

  if (completedTasks.length > 0) {
    highlights.push(
      `تکمیل موفق تسک‌های مهم از جمله «${completedTasks[0].title}»${
        completedTasks.length > 1 ? ` و ${completedTasks.length - 1} تسک دیگر` : ''
      }.`
    );
  }

  const topHabit = habitBreakdown.find(h => h.completed >= 4);
  if (topHabit) {
    highlights.push(
      `ثبات عالی در روتین «${topHabit.title}» با انجام در ${topHabit.completed} روز از هفته.`
    );
  }

  if (focusMinutesTotal >= 60) {
    highlights.push(
      `ثبت بیش از ${Math.round(focusMinutesTotal / 60)} ساعت کار و تمرکز متمرکز در طول هفته.`
    );
  }

  if (highlights.length === 0) {
    highlights.push('شروع استمرار و ثبت نخستین گام‌های هفتگی در سیستم.');
  }

  return highlights;
}

function generateImprovements(
  pendingTasks: Task[],
  habitBreakdown: { title: string; completed: number; total: number }[],
  focusMinutesTotal: number
): string[] {
  const improvements: string[] = [];

  if (pendingTasks.length > 0) {
    improvements.push(
      `بررسی تسک‌های معوقه مانند «${pendingTasks[0].title}» و انتقال به اولویت روزهای ابتدایی هفته آینده.`
    );
  }

  const lowHabit = habitBreakdown.find(h => h.completed <= 2);
  if (lowHabit) {
    improvements.push(
      `تقویت روتین «${lowHabit.title}» با متصل کردن آن به یک زمان مشخص در روز.`
    );
  }

  if (focusMinutesTotal < 120) {
    improvements.push(
      'افزایش زمان تمرکز عمیق روزانه به حداقل ۲۵ تا ۳۰ دقیقه با استفاده از زمان‌سنج منعطف.'
    );
  }

  if (improvements.length === 0) {
    improvements.push('حفظ همین ریتم متعادل و اختصاص زمان برای بازبینی و استراحت پایدار.');
  }

  return improvements;
}
