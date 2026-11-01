import React from 'react';
import { SheetTab } from '../types';
import {
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  currentTab: SheetTab;
  onSelectTab: (tab: SheetTab) => void;
  lastSaved: string;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onOpenCsvModal: () => void;
  onResetData: () => void;
}

const TABS: { id: SheetTab; label: string; shortNumber: string }[] = [
  { id: '09_Profitability_Dashboard', label: 'Dashboard', shortNumber: '09' },
  { id: '07_COGS_Profit_Engine', label: 'Profit Engine', shortNumber: '07' },
  { id: '01_Control_Panel', label: 'Control Panel', shortNumber: '01' },
  { id: '02_Product_Master', label: 'Product Master', shortNumber: '02' },
  { id: '03_Procurement_Landed_Cost', label: 'Procurement & Freight', shortNumber: '03' },
  { id: '04_Amazon_Sales_Data', label: 'Sales & Returns', shortNumber: '04' },
  { id: '05_Amazon_Expense_Data', label: 'Amazon Expenses', shortNumber: '05' },
  { id: '06_FX_Allocation', label: 'FX & Shipments', shortNumber: '06' },
  { id: '08_Data_Validation', label: 'Data Quality Audit', shortNumber: '08' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  lastSaved,
  onExportBackup,
  onImportBackup,
  onOpenCsvModal,
  onResetData,
}) => {
  const formattedLastSaved = React.useMemo(() => {
    if (!lastSaved) return 'Just now';
    try {
      const date = new Date(lastSaved);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return lastSaved;
    }
  }, [lastSaved]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--nav-bg)] border-b border-[var(--nav-border)] shadow-[var(--shadow-nav)] select-none">
      {/* Top Brand & Utility Bar */}
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold tracking-tight text-[var(--color-primary)]">
              Theseus Workshop
            </span>
            <span className="hidden sm:inline-block w-px h-4 bg-gray-300" />
            <span className="hidden md:inline-block text-xs text-[var(--color-muted)] font-normal tracking-normal truncate max-w-[340px]">
              Cross-Marketplace SKU Landed Cost Accounting & Profit Intelligence Engine
            </span>
          </div>
        </div>

        {/* Global Utilities: Last saved + Backup & Data controls */}
        <div className="flex items-center gap-3">
          {/* Last Saved Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--color-bg)] text-[11px] text-[var(--color-muted)] font-mono">
            <Clock className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            <span>Saved {formattedLastSaved}</span>
          </div>

          <div className="h-4 w-px bg-[var(--color-border)] hidden lg:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={onExportBackup}
              title="Download JSON backup containing all 9 sheets"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-primary)] font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onImportBackup}
              title="Restore from JSON backup file"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-primary)] font-medium transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="hidden sm:inline">Import</span>
            </button>

            <button
              onClick={onOpenCsvModal}
              title="Bulk import CSV into any sheet"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-primary)] font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="hidden sm:inline">Bulk CSV</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset data to factory baseline"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-transparent hover:bg-red-50 text-[var(--color-negative)] font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Tabs Navigation */}
      <div className="max-w-[1440px] mx-auto px-6 overflow-x-auto scrollbar-none border-t border-[rgba(5,28,44,0.06)]">
        <div className="flex items-center gap-1 h-10 min-w-max">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative h-10 px-3 flex items-center gap-2 text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'font-semibold text-[var(--nav-text)]'
                    : 'text-[var(--nav-text-inactive)] hover:text-[var(--nav-text)]'
                }`}
              >
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}
                >
                  {tab.shortNumber}
                </span>
                <span>{tab.label}</span>

                {/* Active Indicator Underline */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[3px]"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
