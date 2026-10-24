import { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Task, Habit, WorkSession, JournalEntry, UserProfile } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Toast, ToastMessage } from './components/common/Toast';
import { TodayDashboardScreen } from './components/screens/TodayDashboardScreen';
import { WeeklyPlannerScreen } from './components/screens/WeeklyPlannerScreen';
import { DailyJournalScreen } from './components/screens/DailyJournalScreen';
import { FlexibleTimerScreen } from './components/screens/FlexibleTimerScreen';
import { AiWeeklyReviewScreen } from './components/screens/AiWeeklyReviewScreen';
import { ProfileModal } from './components/modals/ProfileModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [user, setUser] = useState<UserProfile>(storageService.getUser());
  const [tasks, setTasks] = useState<Task[]>(storageService.getTasks());
  const [habits, setHabits] = useState<Habit[]>(storageService.getHabits());
  const [sessions, setSessions] = useState<WorkSession[]>(storageService.getWorkSessions());
  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>(
    storageService.getJournalEntries()
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' = 'success') => {
    setToast({
      id: 'toast_' + Date.now(),
      message,
      type,
    });
  }, []);

  const refreshAllData = useCallback(() => {
    setUser(storageService.getUser());
    setTasks(storageService.getTasks());
    setHabits(storageService.getHabits());
    setSessions(storageService.getWorkSessions());
    setJournalEntries(storageService.getJournalEntries());
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Tasks CRUD
  const handleToggleTask = (id: string) => {
    const updated = storageService.toggleTask(id);
    if (!updated) return;
    setTasks(storageService.getTasks());
    showToast(
      updated.completed ? `تسک «${updated.title}» انجام شد` : `تسک «${updated.title}» در انتظار قرار گرفت`,
      'info'
    );
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask = storageService.createTask(taskData);
    setTasks(storageService.getTasks());
    showToast(`تسک «${newTask.title}» اضافه شد`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    storageService.updateTask(updatedTask);
    setTasks(storageService.getTasks());
    showToast('تغییرات تسک ذخیره شد');
  };

  const handleDeleteTask = (id: string) => {
    storageService.deleteTask(id);
    setTasks(storageService.getTasks());
    showToast('تسک حذف شد', 'info');
  };

  // Habits CRUD
  const handleToggleHabitDay = (habitId: string, dateStr: string) => {
    storageService.toggleHabitDay(habitId, dateStr);
    setHabits(storageService.getHabits());
  };

  const handleCreateHabit = (title: string, icon?: string) => {
    const newHabit = storageService.createHabit(title, icon);
    setHabits(storageService.getHabits());
    showToast(`عادت «${newHabit.title}» به جدول اضافه شد`);
  };

  const handleDeleteHabit = (id: string) => {
    storageService.deleteHabit(id);
    setHabits(storageService.getHabits());
    showToast('عادت حذف شد', 'info');
  };

  // Journal
  const handleSaveJournal = (date: string, content: string, title?: string) => {
    storageService.saveJournalEntry(date, content, title);
    setJournalEntries(storageService.getJournalEntries());
    showToast('یادداشت روزانه ذخیره شد');
  };

  const handleDeleteJournal = (date: string) => {
    storageService.deleteJournalEntry(date);
    setJournalEntries(storageService.getJournalEntries());
    showToast('یادداشت حذف شد', 'info');
  };

  // Timer sessions
  const handleLogSession = (date: string, durationSeconds: number, taskTitle?: string) => {
    storageService.logWorkSession(date, durationSeconds, taskTitle);
    setSessions(storageService.getWorkSessions());
    showToast('جلسه کاری با موفقیت ثبت گردید');
  };

  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter(s => s.id !== id);
    storageService.saveWorkSessions(remaining);
    setSessions(remaining);
    showToast('رکورد جلسه حذف شد', 'info');
  };

  return (
    <div className="bg-[#0b0f17] text-[#dfe2ef] min-h-screen flex flex-col font-vazir antialiased">
      {/* Clean Header */}
      <Header
        user={user}
        activeTab={activeTab}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-14 pb-20 sm:pb-24">
        {activeTab === 'today' && (
          <TodayDashboardScreen
            user={user}
            tasks={tasks}
            habits={habits}
            sessions={sessions}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onToggleHabitDay={handleToggleHabitDay}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'planner' && (
          <WeeklyPlannerScreen
            tasks={tasks}
            habits={habits}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleHabitDay={handleToggleHabitDay}
            onCreateHabit={handleCreateHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === 'journal' && (
          <DailyJournalScreen
            entries={journalEntries}
            onSaveEntry={handleSaveJournal}
            onDeleteEntry={handleDeleteJournal}
          />
        )}

        {activeTab === 'timer' && (
          <FlexibleTimerScreen
            sessions={sessions}
            onLogSession={handleLogSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'ai-review' && (
          <AiWeeklyReviewScreen
            tasks={tasks}
            habits={habits}
            sessions={sessions}
            journalEntries={journalEntries}
          />
        )}
      </main>

      {/* Clean Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={tab => setActiveTab(tab)} />

      {/* Clean Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Profile & Data Ownership Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        tasks={tasks}
        habits={habits}
        sessions={sessions}
        journalEntries={journalEntries}
        onUpdateUser={updatedUser => setUser(updatedUser)}
        onDataReset={refreshAllData}
      />
    </div>
  );
}
