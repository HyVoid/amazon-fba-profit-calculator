import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Reset All Data',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(5,28,44,0.4)] backdrop-blur-sm">
      <div className="app-card w-full max-w-md overflow-hidden shadow-[var(--shadow-lg)] border border-[var(--color-border)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-negative)]">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-primary)] p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-xs text-[var(--color-body-text)] leading-relaxed">
          <p>{message}</p>
          <div className="mt-3 p-3 rounded bg-red-50 text-[var(--color-negative)] text-[11px] font-medium border border-red-200">
            Warning: This action will overwrite your local changes and reload the baseline sample dataset.
          </div>
        </div>

        <div className="px-6 py-3.5 bg-gray-50 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-primary)] text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-negative)] text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
