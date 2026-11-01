import React from 'react';

export type PillVariant = 'default' | 'positive' | 'negative' | 'warning' | 'muted';

interface StatusPillProps {
  label: string;
  variant?: PillVariant;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = 'default',
  icon,
  className = '',
}) => {
  let style: React.CSSProperties = {
    backgroundColor: 'rgba(5, 28, 44, 0.05)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(5, 28, 44, 0.08)',
  };

  if (variant === 'negative') {
    style = {
      backgroundColor: 'rgba(211, 47, 47, 0.08)',
      color: 'var(--color-negative)',
      border: '1px solid rgba(211, 47, 47, 0.20)',
    };
  } else if (variant === 'positive') {
    style = {
      backgroundColor: 'rgba(0, 200, 83, 0.08)',
      color: 'var(--color-positive)',
      border: '1px solid rgba(0, 200, 83, 0.20)',
    };
  } else if (variant === 'warning') {
    style = {
      backgroundColor: 'rgba(5, 28, 44, 0.06)',
      color: 'var(--color-primary)',
      border: '1px solid rgba(5, 28, 44, 0.16)',
    };
  } else if (variant === 'muted') {
    style = {
      backgroundColor: 'rgba(136, 136, 136, 0.08)',
      color: 'var(--color-muted)',
      border: '1px solid rgba(136, 136, 136, 0.18)',
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase ${className}`}
      style={style}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
