import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const MinimalistAvatar: React.FC<Props> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <div
      className={`rounded-full overflow-hidden bg-[#18202f] border border-white/10 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="نمایه کاربری"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-slate-300"
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="20" fill="#151b27" />
        
        {/* Clean monochrome minimalist head */}
        <circle cx="20" cy="14" r="6" fill="#cbd5e1" />
        
        {/* Clean monochrome minimalist shoulders */}
        <path
          d="M8 34C8 27.3726 13.3726 22 20 22C26.6274 22 32 27.3726 32 34V36H8V34Z"
          fill="#94a3b8"
        />
        
        {/* Subtle subtle contour line */}
        <circle cx="20" cy="14" r="6" stroke="#475569" strokeWidth="1" />
        <path
          d="M8 34C8 27.3726 13.3726 22 20 22C26.6274 22 32 27.3726 32 34"
          stroke="#475569"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};
