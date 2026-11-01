import React, { useState } from 'react';
import { ExpenseRecordRow, ComputedExpenseRecord, Marketplace, Currency } from '../types';
import { Plus, Trash2, Search, Receipt, CheckCircle, XCircle } from 'lucide-react';
import { StatusPill } from './StatusPill';

interface AmazonExpenseViewProps {
  expenses: ComputedExpenseRecord[];
  onUpdateRow: (id: string, updated: Partial<ExpenseRecordRow>) => void;
  onAddRow: (newRow: Omit<ExpenseRecordRow, 'id'>) => void;
  onDeleteRow: (id: string) => void;
  baseCurrencySymbol: string;
}

export const AmazonExpenseView: React.FC<AmazonExpenseViewProps> = ({
  expenses,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  baseCurrencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.marketplaceSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.originalFeeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.reportSource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarket =
      selectedMarketplace === 'ALL' || e.marketplace === selectedMarketplace;

    const matchesCat =
      categoryFilter === 'ALL' || e.standardCategory === categoryFilter;

    return matchesSearch && matchesMarket && matchesCat;
  });

  const handleAddNew = () => {
    const nextNum = expenses.length + 1;
    onAddRow({
      recordId: `EXP-202603-US-${String(nextNum).padStart(3, '0')}`,
      month: '2026-03',
      marketplace: 'US',
      marketplaceSku: 'US-PROD-001-A',
      reportSource: 'Settlement_Report',
      originalFeeType: 'Referral Fee',
      currency: 'USD',
      amountLocal: 1500.00,
    });
  };

  const interceptedCount = expenses.filter((e) => e.dedupEffectiveFactor === 0).length;

  return (
    <div className="space-y-4 view-enter">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
              Amazon Operating Expenses & Anti-Duplication Engine
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted)] font-mono">
            Sheet: 05_Amazon_Expense_Data | A:H (Expense Ingestion) | I:M (Whitelist Dedup & FX Normalization)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {interceptedCount > 0 && (
            <div className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium flex items-center gap-1.5">
              <span>{interceptedCount} Duplicate / Non-Authoritative Records Filtered</span>
            </div>
          )}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Platform Commission & Fulfillment">Commission & FBA</option>
            <option value="Advertising & Promotion">Advertising (PPC)</option>
            <option value="Storage & Miscellaneous">Storage & Misc</option>
          </select>

          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className="px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Marketplaces</option>
            <option value="US">US Marketplace</option>
            <option value="CA">CA Marketplace</option>
            <option value="UK">UK Marketplace</option>
            <option value="AU">AU Marketplace</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search ID, fee type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs w-44 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th className="text-left">Record ID (A)</th>
                <th className="text-center">Month (B)</th>
                <th className="text-center">Mkt (C)</th>
                <th className="text-left">Marketplace SKU (D)</th>
                <th className="text-left">Report Source (E)</th>
                <th className="text-left">Fee Type (F)</th>
                <th className="text-center">Curr (G)</th>
                <th className="text-right">Amount (H)</th>
                <th className="text-left bg-[rgba(5,28,44,0.08)]">Mapped Master SKU (I#)</th>
                <th className="text-left bg-[rgba(5,28,44,0.08)]">Standard Category (J#)</th>
                <th className="text-center bg-[rgba(5,28,44,0.08)]">Dedup Factor (K#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">FX Rate (L#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)] font-bold text-[var(--color-primary)]">
                  Effective Net ({baseCurrencySymbol}) (M#)
                </th>
                <th className="text-center w-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-8 text-[var(--color-muted)]">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => {
                  const isFilteredOut = e.dedupEffectiveFactor === 0;

                  return (
                    <tr
                      key={e.id}
                      className={
                        isFilteredOut
                          ? 'opacity-60 bg-red-50/40 line-through-text'
                          : ''
                      }
                    >
                      <td>
                        <input
                          type="text"
                          value={e.recordId}
                          onChange={(ev) =>
                            onUpdateRow(e.id, { recordId: ev.target.value })
                          }
                          className="editable-input font-mono text-xs w-36"
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="text"
                          value={e.month}
                          onChange={(ev) =>
                            onUpdateRow(e.id, { month: ev.target.value })
                          }
                          className="editable-input font-mono text-xs text-center w-20"
                        />
                      </td>
                      <td className="text-center">
                        <select
                          value={e.marketplace}
                          onChange={(ev) =>
                            onUpdateRow(e.id, {
                              marketplace: ev.target.value as Marketplace,
                            })
                          }
                          className="editable-input text-xs font-mono cursor-pointer"
                        >
                          <option value="US">US</option>
                          <option value="CA">CA</option>
                          <option value="UK">UK</option>
                          <option value="AU">AU</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={e.marketplaceSku}
                          onChange={(ev) =>
                            onUpdateRow(e.id, { marketplaceSku: ev.target.value })
                          }
                          className="editable-input font-mono text-xs w-36"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={e.reportSource}
                          onChange={(ev) =>
                            onUpdateRow(e.id, { reportSource: ev.target.value })
                          }
                          className="editable-input font-mono text-xs w-36"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={e.originalFeeType}
                          onChange={(ev) =>
                            onUpdateRow(e.id, { originalFeeType: ev.target.value })
                          }
                          className="editable-input text-xs w-36"
                        />
                      </td>
                      <td className="text-center">
                        <select
                          value={e.currency}
                          onChange={(ev) =>
                            onUpdateRow(e.id, { currency: ev.target.value as Currency })
                          }
                          className="editable-input text-xs font-mono cursor-pointer"
                        >
                          <option value="USD">USD</option>
                          <option value="CAD">CAD</option>
                          <option value="GBP">GBP</option>
                          <option value="AUD">AUD</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={e.amountLocal}
                          onChange={(ev) =>
                            onUpdateRow(e.id, {
                              amountLocal: parseFloat(ev.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-24"
                        />
                      </td>

                      {/* Formula: Mapped Master SKU */}
                      <td className="font-mono text-xs bg-gray-50/70 font-medium">
                        {e.masterSku}
                      </td>

                      {/* Formula: Standard Category */}
                      <td className="text-xs bg-gray-50/70">
                        <span className="font-medium text-[var(--color-primary)]">
                          {e.standardCategory}
                        </span>
                      </td>

                      {/* Formula: Dedup Factor */}
                      <td className="text-center font-mono text-xs bg-gray-50/70">
                        {e.dedupEffectiveFactor === 1 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            1 (Valid)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[var(--color-negative)] font-semibold">
                            <XCircle className="w-3 h-3 text-[var(--color-negative)]" />
                            0 (Blocked)
                          </span>
                        )}
                      </td>

                      {/* Formula: FX Rate */}
                      <td className="text-right font-mono text-xs bg-gray-50/70">
                        {e.applicableFxRate.toFixed(4)}
                      </td>

                      {/* Formula: Effective Net Expense Base */}
                      <td className="text-right font-mono text-xs bg-gray-50/70 font-semibold text-[var(--color-primary)]">
                        {baseCurrencySymbol}
                        {e.effectiveNetExpenseBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <button
                          onClick={() => onDeleteRow(e.id)}
                          title="Delete expense row"
                          className="text-gray-400 hover:text-[var(--color-negative)] transition-colors p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
