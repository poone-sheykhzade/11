import React, { useState, useEffect } from 'react';
import { Task, Habit, WorkSession, JournalEntry, WeeklyReviewResult } from '../../types';
import { getWeekDays, formatPersianNumber } from '../../utils/dateUtils';
import { generateWeeklyReview } from '../../services/aiReviewService';
import { storageService } from '../../services/storageService';

interface AiWeeklyReviewScreenProps {
  tasks: Task[];
  habits: Habit[];
  sessions: WorkSession[];
  journalEntries: Record<string, JournalEntry>;
}

export const AiWeeklyReviewScreen: React.FC<AiWeeklyReviewScreenProps> = ({
  tasks,
  habits,
  sessions,
  journalEntries,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<WeeklyReviewResult | null>(null);

  const weekDays = getWeekDays(weekOffset);
  const weekKey = `week_${weekDays[0]?.dateStr}_${weekDays[6]?.dateStr}`;

  // Load cached review if available
  useEffect(() => {
    const cached = storageService.getWeeklyReviews()[weekKey];
    if (cached) {
      setReviewResult(cached);
    } else {
      setReviewResult(null);
    }
  }, [weekKey]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateWeeklyReview({
        weekDays,
        tasks,
        habits,
        sessions,
        journalEntries,
      });
      setReviewResult(result);
      storageService.saveWeeklyReview(weekKey, result);
    } catch (e) {
      console.error('Analysis error', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Live week metrics calculation
  const weekDates = new Set(weekDays.map(d => d.dateStr));
  const weekTasks = tasks.filter(t => weekDates.has(t.date));
  const completedTasksCount = weekTasks.filter(t => t.completed).length;
  const taskRate = weekTasks.length > 0 ? Math.round((completedTasksCount / weekTasks.length) * 100) : 0;

  let totalHabitChecks = 0;
  let doneHabitChecks = 0;
  habits.forEach(h => {
    weekDays.forEach(d => {
      totalHabitChecks++;
      if (h.history[d.dateStr]) doneHabitChecks++;
    });
  });
  const habitRate = totalHabitChecks > 0 ? Math.round((doneHabitChecks / totalHabitChecks) * 100) : 0;

  const weekSessions = sessions.filter(s => weekDates.has(s.date));
  const weekMinutes = Math.round(
    weekSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-6 max-w-4xl mx-auto">
      {/* Header & Week navigation */}
      <div className="flex items-center justify-between bg-[#111622] p-4 rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-cyan-400 text-[20px]">
            auto_awesome
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-semibold text-white">
              گزارش هوشمند و ارزیابی هفتگی
            </h1>
            <span className="text-[11px] text-slate-400">
              {weekDays[0]?.formattedPersian} تا {weekDays[6]?.formattedPersian}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            title="هفته قبل"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
              weekOffset === 0
                ? 'bg-white/15 text-white font-medium'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            هفته جاری
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            title="هفته بعد"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
        </div>
      </div>

      {/* Raw Activity Metrics for this Week */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-1">
          <span className="text-xs text-slate-400">تکمیل تسک‌ها</span>
          <span className="text-base font-semibold text-white font-outfit">
            {formatPersianNumber(completedTasksCount)} از {formatPersianNumber(weekTasks.length)}
          </span>
          <span className="text-[10px] text-cyan-400 font-outfit">
            {taskRate}٪ انجام شده
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-1">
          <span className="text-xs text-slate-400">ثبات در عادات</span>
          <span className="text-base font-semibold text-white font-outfit">
            {formatPersianNumber(doneHabitChecks)} از {formatPersianNumber(totalHabitChecks)}
          </span>
          <span className="text-[10px] text-emerald-400 font-outfit">
            {habitRate}٪ استمرار
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-1">
          <span className="text-xs text-slate-400">زمان تمرکز کاری</span>
          <span className="text-base font-semibold text-white font-outfit">
            {Math.floor(weekMinutes / 60)} س و {weekMinutes % 60} د
          </span>
          <span className="text-[10px] text-slate-500">
            {weekSessions.length} جلسه ثبت‌شده
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-1">
          <span className="text-xs text-slate-400">یادداشت‌های هفتگی</span>
          <span className="text-base font-semibold text-white font-outfit">
            {formatPersianNumber(
              Object.values(journalEntries).filter(j => weekDates.has(j.date)).length
            )}{' '}
            روز
          </span>
          <span className="text-[10px] text-slate-500">
            ثبت خاطرات و بازتاب‌ها
          </span>
        </div>
      </div>

      {/* Action Trigger */}
      <div className="flex items-center justify-between bg-[#111622] p-4 rounded-xl border border-white/[0.06]">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white">
            تحلیل جامع هوش مصنوعی براساس داده‌های واقعی
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            بررسی نقاط قوت، فرصت‌های بهبود و محاسبه نمره هفتگی از ۱۰۰٪
          </span>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[17px]">
            {isAnalyzing ? 'hourglass_empty' : 'psychology'}
          </span>
          <span>{isAnalyzing ? 'در حال تحلیل داده‌ها...' : reviewResult ? 'به‌روزرسانی تحلیل' : 'تولید گزارش هوشمند'}</span>
        </button>
      </div>

      {/* Analysis Output Result */}
      {reviewResult && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {reviewResult.insufficientData ? (
            <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-[20px] shrink-0 mt-0.5">
                info
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-white">داده‌های این هفته برای ارزیابی کافی نیست</span>
                <p className="text-slate-300 text-xs">
                  {reviewResult.summaryText}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Performance Score Card */}
              <div className="p-5 rounded-2xl bg-[#111622] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-18 h-18 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="font-outfit text-2xl font-bold text-white">
                      {reviewResult.score}٪
                    </span>
                    <span className="text-[10px] text-slate-400">نمره هفته</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      ارزیابی عملکرد کلی هفته
                    </span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                      {reviewResult.summaryText}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-44 bg-black/40 h-2 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${reviewResult.score}%` }}
                  />
                </div>
              </div>

              {/* Achievements & Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Highlights */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold pb-2 border-b border-white/[0.06]">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    دستاوردها و نقاط قوت واقعی
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-slate-300 leading-relaxed">
                    {reviewResult.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practical Improvements */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold pb-2 border-b border-white/[0.06]">
                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                    پیشنهادات و راهکارهای عملی
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-slate-300 leading-relaxed">
                    {reviewResult.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
