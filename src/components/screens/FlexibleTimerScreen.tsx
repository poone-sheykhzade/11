import React, { useState, useEffect } from 'react';
import { WorkSession } from '../../types';
import { getTodayDateStr, formatPersianNumber, getWeekDays } from '../../utils/dateUtils';

interface FlexibleTimerScreenProps {
  sessions: WorkSession[];
  onLogSession: (date: string, durationSeconds: number, taskTitle?: string) => void;
  onDeleteSession?: (id: string) => void;
}

export const FlexibleTimerScreen: React.FC<FlexibleTimerScreenProps> = ({
  sessions,
  onLogSession,
  onDeleteSession,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const todayStr = getTodayDateStr();

  // Stopwatch interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
  };

  const handleStopAndSave = () => {
    if (elapsedSeconds < 10) {
      alert('جلسه کاری کوتاه‌تر از ۱۰ ثانیه ثبت نمی‌شود.');
      return;
    }

    setIsRunning(false);
    onLogSession(todayStr, elapsedSeconds, taskTitle.trim() || undefined);
    setSaveNote(`جلسه به مدت ${formatDurationText(elapsedSeconds)} ثبت شد.`);
    setElapsedSeconds(0);
    setTaskTitle('');

    setTimeout(() => setSaveNote(null), 3000);
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDurationText = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hours > 0) {
      return `${formatPersianNumber(hours)} ساعت و ${formatPersianNumber(mins)} دقیقه`;
    }
    return `${formatPersianNumber(Math.max(1, mins))} دقیقه`;
  };

  // Calculate statistics
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  const currentWeek = getWeekDays(0);
  const currentWeekDates = new Set(currentWeek.map(d => d.dateStr));
  const weekSessions = sessions.filter(s => currentWeekDates.has(s.date));
  const weekSeconds = weekSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#111622] p-4 rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">
            timer
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-semibold text-white">
              زمان‌سنج منعطف کار و تمرکز
            </h1>
            <span className="text-[11px] text-slate-400">
              ثبت آزادانه و منعطف زمان صرف‌شده روی فعالیت‌ها بدون اجبار در حالت از پیش تعریف‌شده
            </span>
          </div>
        </div>

        {isRunning && (
          <span className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            در حال ضبط زمان
          </span>
        )}
      </div>

      {/* Main Timer Display Card */}
      <div className="bg-[#111622] rounded-2xl border border-white/[0.06] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
        {/* Task Title Input */}
        <input
          type="text"
          value={taskTitle}
          onChange={e => setTaskTitle(e.target.value)}
          placeholder="در حال تمرکز روی چه تسک یا موضوعی هستید؟ (اختیاری)"
          className="w-full max-w-md px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
        />

        {/* Clean Elapsed Clock Display */}
        <div className="my-2">
          <span className="font-outfit text-5xl sm:text-6xl font-light tracking-tight text-white tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              <span>{elapsedSeconds > 0 ? 'ادامه' : 'شروع زمان‌سنج'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">pause</span>
              <span>توقف موقت</span>
            </button>
          )}

          {elapsedSeconds > 0 && (
            <>
              <button
                onClick={handleStopAndSave}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>پایان و ثبت جلسه</span>
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                title="شروع مجدد بدون ثبت"
              >
                شروع مجدد
              </button>
            </>
          )}
        </div>

        {saveNote && (
          <span className="text-xs text-cyan-300 mt-2 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-800/30">
            {saveNote}
          </span>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-1">
          <span className="text-xs text-slate-400">تمرکز امروز</span>
          <span className="text-base sm:text-lg font-semibold text-white font-outfit mt-0.5">
            {formatDurationText(todaySeconds)}
          </span>
          <span className="text-[10px] text-slate-500">
            {todaySessions.length} جلسه کاری ثبت‌شده
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-1">
          <span className="text-xs text-slate-400">تمرکز این هفته</span>
          <span className="text-base sm:text-lg font-semibold text-white font-outfit mt-0.5">
            {formatDurationText(weekSeconds)}
          </span>
          <span className="text-[10px] text-slate-500">
            {weekSessions.length} جلسه کاری در ۷ روز اخیر
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.06] flex flex-col gap-1">
          <span className="text-xs text-slate-400">میانگین هر جلسه</span>
          <span className="text-base sm:text-lg font-semibold text-white font-outfit mt-0.5">
            {weekSessions.length > 0
              ? formatDurationText(Math.round(weekSeconds / weekSessions.length))
              : '۰ دقیقه'}
          </span>
          <span className="text-[10px] text-slate-500">
            طول مدت معمول تمرکز
          </span>
        </div>
      </div>

      {/* Recorded Sessions History */}
      <div className="bg-[#111622] rounded-xl border border-white/[0.06] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-xs font-semibold text-white">
            تاریخچه جلسات کاری ثبت‌شده ({sessions.length})
          </h2>
        </div>

        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {sessions.length === 0 ? (
            <span className="text-xs text-slate-500 text-center py-6">
              هنوز جلسه‌ای ثبت نشده است.
            </span>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">
                    schedule
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">
                      {s.taskTitle || 'کار و تمرکز عمومی'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-outfit">
                      {s.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-outfit text-slate-300 font-medium text-xs">
                    {formatDurationText(s.durationSeconds)}
                  </span>
                  {onDeleteSession && (
                    <button
                      onClick={() => onDeleteSession(s.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="حذف رکورد"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
