import React, { useState } from 'react';
import { Task, Habit, Priority } from '../../types';
import { getWeekDays, DayInfo } from '../../utils/dateUtils';
import { DayDetailModal } from '../modals/DayDetailModal';

interface WeeklyPlannerScreenProps {
  tasks: Task[];
  habits: Habit[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
  onCreateHabit: (title: string, icon?: string) => void;
  onDeleteHabit: (id: string) => void;
}

export const WeeklyPlannerScreen: React.FC<WeeklyPlannerScreenProps> = ({
  tasks,
  habits,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleHabitDay,
  onCreateHabit,
  onDeleteHabit,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<DayInfo | null>(null);

  // New habit form state
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('check_circle');

  // Quick task per day state
  const [quickTaskDay, setQuickTaskDay] = useState<string | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const weekDays = getWeekDays(weekOffset);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    onCreateHabit(newHabitTitle.trim(), newHabitIcon);
    setNewHabitTitle('');
    setShowAddHabitModal(false);
  };

  const handleQuickTaskSubmit = (dateStr: string) => {
    if (!quickTaskTitle.trim()) return;
    onAddTask({
      title: quickTaskTitle.trim(),
      date: dateStr,
      priority: 'normal' as Priority,
    });
    setQuickTaskTitle('');
    setQuickTaskDay(null);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-6 max-w-5xl mx-auto">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between bg-[#111622] p-4 rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">
            calendar_view_week
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-semibold text-white">
              برنامه هفتگی
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

      {/* SECTION 1: Habits Table across 7 Days */}
      <section className="bg-[#111622] p-4 sm:p-5 rounded-xl border border-white/[0.06] flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-[18px]">
              task_alt
            </span>
            <h2 className="text-sm font-semibold text-white">
              عادات و روتین‌های روزانه
            </h2>
            <span className="text-[11px] text-slate-400">
              ({habits.length} عادت ثبت‌شده)
            </span>
          </div>

          <button
            onClick={() => setShowAddHabitModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            افزودن عادت
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 pb-2">
                <th className="py-2.5 pr-2 font-medium w-48">عنوان عادت</th>
                {weekDays.map(day => (
                  <th
                    key={day.dateStr}
                    onClick={() => setSelectedDayForDetail(day)}
                    className={`py-2 px-1 text-center font-medium cursor-pointer hover:text-white transition-colors ${
                      day.isToday ? 'text-cyan-400 font-semibold' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[12px]">{day.dayName}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-outfit">
                        {day.dayNumber}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="py-2.5 pl-2 text-center font-medium w-16">تکمیل</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                    هنوز عادتی ثبت نشده است. روی «افزودن عادت» کلیک کنید.
                  </td>
                </tr>
              ) : (
                habits.map(habit => {
                  // Count completed days this week
                  const completedDaysThisWeek = weekDays.filter(
                    d => !!habit.history[d.dateStr]
                  ).length;

                  return (
                    <tr key={habit.id} className="hover:bg-white/[0.015] transition-colors">
                      {/* Habit Name */}
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">
                            {habit.icon || 'check_circle'}
                          </span>
                          <span className="text-slate-200 font-medium truncate">
                            {habit.title}
                          </span>
                        </div>
                      </td>

                      {/* 7 Checkbox Days */}
                      {weekDays.map(day => {
                        const isDone = !!habit.history[day.dateStr];
                        return (
                          <td key={day.dateStr} className="py-2.5 px-1 text-center">
                            <button
                              onClick={() => onToggleHabitDay(habit.id, day.dateStr)}
                              className={`w-6 h-6 mx-auto rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                isDone
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                                  : 'border-white/15 hover:border-white/30 text-transparent'
                              }`}
                              title={`${habit.title} در ${day.dayName}`}
                              aria-label={`علامت زدن ${habit.title} در ${day.dayName}`}
                            >
                              <span
                                className={`material-symbols-outlined text-[15px] ${
                                  isDone ? 'opacity-100' : 'opacity-0'
                                }`}
                              >
                                check
                              </span>
                            </button>
                          </td>
                        );
                      })}

                      {/* Tally */}
                      <td className="py-3 pl-2 text-center font-outfit text-slate-400 text-xs font-medium">
                        {completedDaysThisWeek}/7
                      </td>

                      {/* Delete */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`آیا از حذف عادت «${habit.title}» اطمینان دارید؟`)) {
                              onDeleteHabit(habit.id);
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="حذف عادت"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: 7-Day Task Grid with Click-to-Detail */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              checklist
            </span>
            <h2 className="text-sm font-semibold text-white">
              برنامه تسک‌های هفتگی به تفکیک روز
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            روی هر روز کلیک کنید تا وارد نمای جزئیات روزانه شوید
          </span>
        </div>

        {/* 7 Columns / Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map(day => {
            const dayTasks = tasks.filter(t => t.date === day.dateStr);
            const completedCount = dayTasks.filter(t => t.completed).length;

            return (
              <div
                key={day.dateStr}
                className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                  day.isToday
                    ? 'bg-[#141b28] border-cyan-500/40'
                    : 'bg-[#111622] border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div>
                  {/* Day Card Header (Clickable to open Day Detail View) */}
                  <div
                    onClick={() => setSelectedDayForDetail(day)}
                    className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {day.dayName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {day.formattedPersian}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-outfit text-slate-400">
                        {completedCount}/{dayTasks.length}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-slate-500 group-hover:text-white transition-colors">
                        open_in_new
                      </span>
                    </div>
                  </div>

                  {/* Tasks List for Day */}
                  <div className="flex flex-col gap-1.5 min-h-[90px]">
                    {dayTasks.length === 0 ? (
                      <span className="text-[11px] text-slate-400 text-center py-4">
                        بدون تسک
                      </span>
                    ) : (
                      dayTasks.slice(0, 4).map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-1.5 group/task"
                        >
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                              task.completed
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                                : 'border-white/20 hover:border-white/40 text-transparent'
                            }`}
                            aria-label="تغییر وضعیت تسک"
                          >
                            <span className="material-symbols-outlined text-[11px]">
                              check
                            </span>
                          </button>
                          <span
                            onClick={() => setSelectedDayForDetail(day)}
                            className={`text-[11px] truncate flex-1 cursor-pointer ${
                              task.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-300 hover:text-white'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))
                    )}
                    {dayTasks.length > 4 && (
                      <button
                        onClick={() => setSelectedDayForDetail(day)}
                        className="text-[10px] text-cyan-400 text-right mt-1 hover:underline"
                      >
                        +{dayTasks.length - 4} تسک دیگر...
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Add Task Input for This Day */}
                <div className="mt-2 pt-2 border-t border-white/[0.04]">
                  {quickTaskDay === day.dateStr ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={quickTaskTitle}
                        onChange={e => setQuickTaskTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleQuickTaskSubmit(day.dateStr)}
                        placeholder="تسک جدید..."
                        className="w-full text-[11px] px-2 py-1 rounded bg-black/40 border border-white/20 text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleQuickTaskSubmit(day.dateStr)}
                        className="px-1.5 py-1 text-[11px] bg-white/10 rounded text-white shrink-0 hover:bg-white/20"
                      >
                        ثبت
                      </button>
                      <button
                        onClick={() => setQuickTaskDay(null)}
                        className="text-[11px] text-slate-400 p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setQuickTaskDay(day.dateStr);
                        setQuickTaskTitle('');
                      }}
                      className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">add</span>
                      افزودن تسک
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Habit Modal */}
      {showAddHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#111622] border border-white/10 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-white">افزودن عادت یا روتین جدید</h3>
              <button
                onClick={() => setShowAddHabitModal(false)}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddHabit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  نام عادت یا روتین (مثلاً ورزش، مطالعه، نوشیدن آب، برنامه‌نویسی)
                </label>
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={e => setNewHabitTitle(e.target.value)}
                  placeholder="عنوان عادت..."
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">آیکون مرتبط</label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    'water_drop',
                    'fitness_center',
                    'menu_book',
                    'terminal',
                    'self_improvement',
                    'directions_walk',
                    'bedtime',
                    'laptop_mac',
                    'draw',
                    'psychology',
                    'check_circle',
                    'favorite',
                  ].map(icon => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setNewHabitIcon(icon)}
                      className={`p-2 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                        newHabitIcon === icon
                          ? 'bg-white/15 border-cyan-400 text-cyan-300'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 py-2 rounded-lg bg-white/15 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                ثبت در جدول هفتگی
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Day Detail Modal for full CRUD when any day is clicked */}
      <DayDetailModal
        isOpen={!!selectedDayForDetail}
        onClose={() => setSelectedDayForDetail(null)}
        day={selectedDayForDetail}
        tasks={tasks}
        onToggleTask={onToggleTask}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};
