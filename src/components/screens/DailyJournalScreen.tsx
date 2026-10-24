import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../../types';
import { getTodayDateStr, formatFullPersianDate } from '../../utils/dateUtils';

interface DailyJournalScreenProps {
  entries: Record<string, JournalEntry>;
  onSaveEntry: (date: string, content: string, title?: string) => void;
  onDeleteEntry: (date: string) => void;
}

export const DailyJournalScreen: React.FC<DailyJournalScreenProps> = ({
  entries,
  onSaveEntry,
  onDeleteEntry,
}) => {
  const todayStr = getTodayDateStr();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync state when selectedDate changes
  useEffect(() => {
    const existing = entries[selectedDate];
    if (existing) {
      setTitle(existing.title || '');
      setContent(existing.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setSaveStatus(null);
  }, [selectedDate, entries]);

  const handleSave = () => {
    if (!content.trim() && !title.trim()) {
      return;
    }
    onSaveEntry(selectedDate, content.trim(), title.trim() || undefined);
    setSaveStatus('یادداشت با موفقیت ذخیره شد');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleDelete = () => {
    if (confirm('آیا از حذف این یادداشت روزانه اطمینان دارید؟')) {
      onDeleteEntry(selectedDate);
      setTitle('');
      setContent('');
      setSaveStatus('یادداشت حذف شد');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  // Convert entries to sorted array
  const entriesList = Object.values(entries)
    .filter(e => e.content.trim() || e.title?.trim())
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredEntries = entriesList.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.content.toLowerCase().includes(q) ||
      (e.title && e.title.toLowerCase().includes(q)) ||
      e.date.includes(q)
    );
  });

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#111622] p-4 rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">
            edit_note
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-semibold text-white">
              یادداشت‌ها و خاطرات روزانه
            </h1>
            <span className="text-[11px] text-slate-400">
              ثبت افکار، خاطرات و بازتاب‌های فردی به تفکیک تاریخ
            </span>
          </div>
        </div>

        {/* Date Selector input */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-white/15 text-white font-medium'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            امروز
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => e.target.value && setSelectedDate(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Writing Area (2 cols on desktop) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="bg-[#111622] rounded-xl border border-white/[0.06] p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-medium">
                  {formatFullPersianDate(selectedDate)}
                </span>
                {selectedDate === todayStr && (
                  <span className="text-[10px] px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    امروز
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-outfit">
                {wordCount} کلمه
              </span>
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="موضوع یا عنوان یادداشت امروز (اختیاری)..."
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/[0.08] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />

            {/* Content Textarea */}
            <textarea
              rows={12}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="افکار، تجربیات، خاطرات، یادگیری‌ها یا چالش‌های امروز را اینجا بنویسید..."
              className="w-full p-3.5 rounded-lg bg-black/30 border border-white/[0.08] text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 leading-relaxed resize-none"
            />

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  ذخیره یادداشت
                </button>

                {entries[selectedDate] && (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
                  >
                    حذف
                  </button>
                )}
              </div>

              {saveStatus && (
                <span className="text-xs text-cyan-400 animate-fade-in">
                  {saveStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Past Memories & Entries Sidebar (1 col on desktop) */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#111622] rounded-xl border border-white/[0.06] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                آرشیو خاطرات ({entriesList.length})
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="جستجو در خاطرات..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Entries List */}
            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-0.5">
              {filteredEntries.length === 0 ? (
                <span className="text-xs text-slate-500 text-center py-6">
                  یادداشتی یافت نشد
                </span>
              ) : (
                filteredEntries.map(entry => {
                  const isSelected = entry.date === selectedDate;
                  return (
                    <button
                      key={entry.date}
                      onClick={() => setSelectedDate(entry.date)}
                      className={`text-right p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-white/10 border-cyan-400/50'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-300">
                          {entry.title || 'بدون عنوان'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-outfit">
                          {entry.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
