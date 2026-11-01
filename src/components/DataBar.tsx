import React from 'react';

interface DataBarProps {
  value: number; // 0 to 1 (or normalized against max)
  max?: number;
  label?: string;
  className?: string;
}

export const DataBar: React.FC<DataBarProps> = ({
  value,
  max = 1,
  label,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  return (
    <div className={`flex items-center gap-2 w-full min-w-[90px] ${className}`}>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(5, 28, 44, 0.10)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: 'var(--color-accent)',
          }}
        />
      </div>
      {label && (
        <span className="text-[11px] font-medium text-[var(--color-body-text)] min-w-[38px] text-right">
          {label}
        </span>
      )}
    </div>
  );
};
