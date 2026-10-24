import React, { useState } from 'react';
import { UserProfile, Task, Habit, WorkSession, JournalEntry } from '../../types';
import { MinimalistAvatar } from '../common/MinimalistAvatar';
import { storageService } from '../../services/storageService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  tasks: Task[];
  habits: Habit[];
  sessions: WorkSession[];
  journalEntries: Record<string, JournalEntry>;
  onUpdateUser: (user: UserProfile) => void;
  onDataReset: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  tasks,
  habits,
  sessions,
  journalEntries,
  onUpdateUser,
  onDataReset,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [importJson, setImportJson] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: name.trim() || user.name,
    };
    storageService.saveUser(updated);
    onUpdateUser(updated);
    setIsEditing(false);
    setStatusMessage('نام کاربری با موفقیت به‌روزرسانی شد');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleExport = () => {
    const backup = storageService.exportBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('فایل پشتیبان JSON دانلود شد');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const success = storageService.importBackup(importJson);
    if (success) {
      setStatusMessage('اطلاعات با موفقیت بازیابی شد');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setStatusMessage('خطا در قالب فایل JSON');
    }
  };

  const totalFocusMinutes = Math.round(
    sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111622] border border-white/10 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              account_circle
            </span>
            <h2 className="text-sm font-semibold text-white">پروفایل و مدیریت داده‌ها</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3.5 flex flex-col gap-4">
          {/* Minimalist Monochrome Avatar & Name */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <MinimalistAvatar size={48} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-white truncate">{user.name}</span>
              <span className="text-[11px] text-slate-400">کاربر سیستم عامل شخصی</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              {isEditing ? 'انصراف' : 'ویرایش'}
            </button>
          </div>

          {/* Edit form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">نام</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                className="py-1.5 rounded-lg bg-white/15 hover:bg-white/20 text-white font-medium text-xs cursor-pointer"
              >
                ذخیره نام
              </button>
            </form>
          )}

          {/* Activity Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-[11px] text-slate-400">کل تسک‌ها</span>
              <span className="font-outfit text-sm font-semibold text-white mt-1">
                {tasks.filter(t => t.completed).length} از {tasks.length} تکمیل‌شده
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-[11px] text-slate-400">کل زمان تمرکز</span>
              <span className="font-outfit text-sm font-semibold text-white mt-1">
                {totalFocusMinutes} دقیقه
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-[11px] text-slate-400">عادات فعال</span>
              <span className="font-outfit text-sm font-semibold text-white mt-1">
                {habits.length} روتین
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-[11px] text-slate-400">خاطرات و بازتاب‌ها</span>
              <span className="font-outfit text-sm font-semibold text-white mt-1">
                {Object.keys(journalEntries).length} روز ثبت‌شده
              </span>
            </div>
          </div>

          {/* Backup / Export / Import */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-white">پشتیبان‌گیری و مالکیت داده</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تمام اطلاعات و یادداشت‌های شما به صورت محلی در مرورگر ذخیره می‌شوند. می‌توانید هر زمان یک نسخه کامل JSON استخراج یا بارگذاری کنید.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleExport}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                خروجی JSON
              </button>
              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">upload</span>
                بازیابی JSON
              </button>
            </div>
          </div>

          {/* Import area */}
          {showImportArea && (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <textarea
                rows={3}
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                placeholder="متن JSON را اینجا وارد کنید..."
                className="w-full text-[11px] font-mono p-2 rounded-lg bg-black/40 border border-white/10 text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleImport}
                className="py-1 rounded-lg bg-white/15 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
              >
                تایید بازیابی
              </button>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={() => {
              if (confirm('آیا از بازنشانی کلیه اطلاعات به وضعیت پیش‌فرض اطمینان دارید؟')) {
                storageService.resetAll();
                onDataReset();
                onClose();
              }
            }}
            className="text-[11px] text-slate-500 hover:text-rose-400 text-center py-1 transition-colors cursor-pointer"
          >
            بازنشانی داده‌ها به حالت نمونه
          </button>

          {statusMessage && (
            <div className="p-2 text-center text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800/30 rounded-lg">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
