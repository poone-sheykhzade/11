import React, { useState } from 'react';
import { UserProfile, Task, Habit, WorkSession, Priority } from '../../types';
import { getTodayDateStr, formatFullPersianDate, formatPersianNumber } from '../../utils/dateUtils';

interface TodayDashboardScreenProps {
  user: UserProfile;
  tasks: Task[];
  habits: Habit[];
  sessions: WorkSession[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onDeleteTask: (id: string) => void;
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
  onNavigateToTab: (tab: 'planner' | 'journal' | 'timer' | 'ai-review') => void;
}

export const TodayDashboardScreen: React.FC<TodayDashboardScreenProps> = ({
  user,
  tasks,
  habits,
  sessions,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onToggleHabitDay,
  onNavigateToTab,
}) => {
  const todayStr = getTodayDateStr();
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('normal');

  // Today's tasks
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const pendingTasks = todayTasks.length - completedTasks;

  // Today's habits
  const todayHabitsCompleted = habits.filter(h => !!h.history[todayStr]).length;

  // Today's focus sessions
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayFocusMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddTask({
      title: quickTitle.trim(),
      date: todayStr,
      priority: quickPriority,
    });

    setQuickTitle('');
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-6 max-w-4xl mx-auto">
      {/* 1. Simple Friendly Greeting (No levels, no badges, no XP) */}
      <section className="flex flex-col gap-1 py-1">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          سلام {user.name} 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {formatFullPersianDate(todayStr)}
        </p>
      </section>

      {/* 2. Today's Summary Metrics */}
      <section className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400">تسک‌های امروز</span>
          <span className="text-base sm:text-lg font-semibold text-white font-outfit mt-0.5">
            {formatPersianNumber(completedTasks)} از {formatPersianNumber(todayTasks.length)}
          </span>
          <span className="text-[10px] text-slate-400">
            {pendingTasks > 0 ? `${formatPersianNumber(pendingTasks)} در انتظار` : 'همه تکمیل شدند'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400">عادات روزانه</span>
          <span className="text-base sm:text-lg font-semibold text-white font-outfit mt-0.5">
            {formatPersianNumber(todayHabitsCompleted)} از {formatPersianNumber(habits.length)}
          </span>
          <span className="text-[10px] text-slate-400">ثبت‌شده برای امروز</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400">زمان تمرکز امروز</span>
          <span className="text-base sm:text-lg font-semibold text-white font-outfit mt-0.5">
            {formatPersianNumber(todayFocusMinutes)} دقیقه
          </span>
          <span className="text-[10px] text-slate-400">
            {formatPersianNumber(todaySessions.length)} جلسه کاری
          </span>
        </div>
      </section>

      {/* 3. Today's Tasks */}
      <section className="bg-[#111622] rounded-xl border border-white/[0.06] p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-[18px]">
              check_circle
            </span>
            <h2 className="text-sm font-semibold text-white">تسک‌های امروز</h2>
            <span className="text-[11px] text-slate-400">
              ({todayTasks.length} تسک)
            </span>
          </div>

          <button
            onClick={() => onNavigateToTab('planner')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>برنامه هفتگی</span>
            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          </button>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            placeholder="افزودن تسک جدید برای امروز..."
            className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          />

          <select
            value={quickPriority}
            onChange={e => setQuickPriority(e.target.value as Priority)}
            className="px-2 py-2 rounded-lg bg-[#141b28] border border-white/10 text-xs text-slate-300 focus:outline-none"
          >
            <option value="normal">عادی</option>
            <option value="important">مهم</option>
            <option value="urgent">ضروری</option>
          </select>

          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            افزودن
          </button>
        </form>

        {/* Tasks List */}
        <div className="flex flex-col gap-2 mt-1">
          {todayTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              تسکی برای امروز ثبت نشده است. از نوار بالا تسک جدید اضافه کنید.
            </div>
          ) : (
            todayTasks.map(task => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-white/[0.01] border-white/5 opacity-60'
                    : 'bg-white/[0.025] border-white/[0.07] hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Clean Checkbox */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      task.completed
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    aria-label={task.completed ? 'علامت به عنوان در انتظار' : 'علامت به عنوان تکمیل'}
                  >
                    {task.completed && (
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    )}
                  </button>

                  <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <span
                      className={`text-xs font-medium ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>

                    {task.priority === 'urgent' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                        ضروری
                      </span>
                    )}
                    {task.priority === 'important' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        مهم
                      </span>
                    )}

                    {task.time && (
                      <span className="text-[10px] text-slate-400">
                        {task.time}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="حذف"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. Today's Habits Check-In */}
      <section className="bg-[#111622] rounded-xl border border-white/[0.06] p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              routine
            </span>
            <h2 className="text-sm font-semibold text-white">عادات امروز</h2>
          </div>
          <button
            onClick={() => onNavigateToTab('planner')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>جدول کامل هفتگی</span>
            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {habits.map(habit => {
            const isDone = !!habit.history[todayStr];
            return (
              <button
                key={habit.id}
                onClick={() => onToggleHabitDay(habit.id, todayStr)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer text-right ${
                  isDone
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    {habit.icon || 'check_circle'}
                  </span>
                  <span className="text-xs font-medium truncate">{habit.title}</span>
                </div>
                <span
                  className={`material-symbols-outlined text-[16px] shrink-0 ${
                    isDone ? 'text-cyan-400 material-symbols-filled' : 'text-slate-600'
                  }`}
                >
                  {isDone ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Quick Access to Timer & Journal */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={() => onNavigateToTab('timer')}
          className="p-4 rounded-xl bg-[#111622] border border-white/[0.06] hover:border-white/15 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">زمان‌سنج کار و تمرکز</span>
              <span className="text-[11px] text-slate-400">ثبت مدت زمان کار روی تسک‌ها</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_left</span>
        </div>

        <div
          onClick={() => onNavigateToTab('journal')}
          className="p-4 rounded-xl bg-[#111622] border border-white/[0.06] hover:border-white/15 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">یادداشت و خاطرات روزانه</span>
              <span className="text-[11px] text-slate-400">ثبت افکار و بازتاب‌های امروز</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_left</span>
        </div>
      </section>
    </div>
  );
};
