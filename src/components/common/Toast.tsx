import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2600);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-50 flex items-center justify-between rounded-xl bg-[#141b28] border border-white/10 shadow-xl px-4 py-3 text-xs text-white">
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-cyan-400 text-[18px]">
          {toast.type === 'info' ? 'info' : 'check_circle'}
        </span>
        <span className="font-medium">{toast.message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1"
        aria-label="بستن"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
