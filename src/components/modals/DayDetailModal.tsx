import React, { useState } from 'react';
import { Task, Priority } from '../../types';
import { DayInfo } from '../../utils/dateUtils';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayInfo | null;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  day,
  tasks,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('normal');
  const [newNotes, setNewNotes] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen || !day) return null;

  const dayTasks = tasks.filter(t => t.date === day.dateStr);
  const completedCount = dayTasks.filter(t => t.completed).length;
  const pendingCount = dayTasks.length - completedCount;

  const filteredTasks = dayTasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      date: day.dateStr,
      priority: newPriority,
      time: newTime.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewTime('');
    setNewNotes('');
    setNewPriority('normal');
    setShowAddForm(false);
  };

  const handleSaveEdit = (task: Task) => {
    if (!editTitle.trim()) return;
    onUpdateTask({
      ...task,
      title: editTitle.trim(),
    });
    setEditingTaskId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#111622] border border-white/10 p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                {day.dayName}، {day.formattedPersian}
              </h2>
              {day.isToday && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  امروز
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 mt-0.5">
              {pendingCount} در انتظار • {completedCount} تکمیل‌شده
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Filter tabs & Add button */}
        <div className="flex items-center justify-between py-3 border-b border-white/[0.06] gap-2">
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({dayTasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filter === 'pending' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              در انتظار ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filter === 'completed' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تکمیل‌شده ({completedCount})
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {showAddForm ? 'remove' : 'add'}
            </span>
            <span>{showAddForm ? 'انصراف' : 'تسک جدید'}</span>
          </button>
        </div>

        {/* Add task form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="p-3.5 my-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="عنوان تسک..."
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                placeholder="زمان (مثلاً ۱۰:۳۰)"
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as Priority)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#141b28] border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="normal">اولویت: عادی</option>
                <option value="important">اولویت: مهم</option>
                <option value="urgent">اولویت: ضروری</option>
              </select>
            </div>

            <textarea
              rows={2}
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="یادداشت یا توضیحات تکمیلی (اختیاری)..."
              className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
            />

            <button
              type="submit"
              className="py-2 rounded-lg bg-white/15 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              ثبت تسک
            </button>
          </form>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2">
          {filteredTasks.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              تسکی در این وضعیت وجود ندارد
            </div>
          ) : (
            filteredTasks.map(task => {
              const isEditing = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    task.completed
                      ? 'bg-white/[0.01] border-white/5 opacity-60'
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
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

                    {/* Content */}
                    <div className="flex flex-col min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="flex-1 px-2 py-1 rounded bg-black/50 border border-white/20 text-xs text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(task)}
                            className="px-2 py-1 bg-white/10 text-xs rounded text-white"
                          >
                            ذخیره
                          </button>
                          <button
                            onClick={() => setEditingTaskId(null)}
                            className="px-2 py-1 text-xs text-slate-400"
                          >
                            لغو
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-medium leading-relaxed ${
                                task.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-white'
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
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                            {task.time && <span>ساعت {task.time}</span>}
                            {task.notes && (
                              <>
                                {task.time && <span>•</span>}
                                <span className="truncate">{task.notes}</span>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditTitle(task.title);
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="ویرایش"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="حذف"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
