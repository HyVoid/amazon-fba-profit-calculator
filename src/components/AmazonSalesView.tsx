import React, { useState } from 'react';
import { SalesRecordRow, ComputedSalesRecord, Marketplace, Currency } from '../types';
import { Plus, Trash2, Search, ShoppingBag } from 'lucide-react';

interface AmazonSalesViewProps {
  sales: ComputedSalesRecord[];
  onUpdateRow: (id: string, updated: Partial<SalesRecordRow>) => void;
  onAddRow: (newRow: Omit<SalesRecordRow, 'id'>) => void;
  onDeleteRow: (id: string) => void;
  baseCurrencySymbol: string;
}

export const AmazonSalesView: React.FC<AmazonSalesViewProps> = ({
  sales,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  baseCurrencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  const uniqueMonths = Array.from(new Set(sales.map((s) => s.month))).sort();

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.marketplaceSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.masterSku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarket =
      selectedMarketplace === 'ALL' || s.marketplace === selectedMarketplace;

    const matchesMonth = selectedMonth === 'ALL' || s.month === selectedMonth;

    return matchesSearch && matchesMarket && matchesMonth;
  });

  const handleAddNew = () => {
    const nextNum = sales.length + 1;
    onAddRow({
      transactionId: `TXN-202603-US-${String(nextNum).padStart(3, '0')}`,
      month: '2026-03',
      marketplace: 'US',
      marketplaceSku: 'US-PROD-001-A',
      currency: 'USD',
      grossUnitsSold: 300,
      grossProductSales: 9600.00,
      returnedUnits: 8,
      refundedAmount: 256.00,
    });
  };

  return (
    <div className="space-y-4 view-enter">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
              Amazon 4-Marketplace Sales & Customer Returns Data
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted)] font-mono">
            Sheet: 04_Amazon_Sales_Data | A:I (Raw Order Ledger) | J:N (Net Revenue Normalization)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Months</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
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
              placeholder="Search transaction, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs w-48 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sales Row</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th className="text-left">Txn ID (A)</th>
                <th className="text-center">Month (B)</th>
                <th className="text-center">Mkt (C)</th>
                <th className="text-left">Marketplace SKU (D)</th>
                <th className="text-center">Curr (E)</th>
                <th className="text-right">Gross Units (F)</th>
                <th className="text-right">Gross Sales (G)</th>
                <th className="text-right">Returns (H)</th>
                <th className="text-right">Refunds (I)</th>
                <th className="text-left bg-[rgba(5,28,44,0.08)]">Mapped Master SKU (J#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">Net Units (K#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">Net Sales Local (L#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">FX Rate (M#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)] font-bold text-[var(--color-primary)]">
                  Net Revenue ({baseCurrencySymbol}) (N#)
                </th>
                <th className="text-center w-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-8 text-[var(--color-muted)]">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const isUnmapped = s.masterSku === 'UNMAPPED_SKU';

                  return (
                    <tr key={s.id} className={isUnmapped ? 'anomaly-row' : ''}>
                      <td>
                        <input
                          type="text"
                          value={s.transactionId}
                          onChange={(e) =>
                            onUpdateRow(s.id, { transactionId: e.target.value })
                          }
                          className="editable-input font-mono text-xs w-36"
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="text"
                          value={s.month}
                          onChange={(e) =>
                            onUpdateRow(s.id, { month: e.target.value })
                          }
                          className="editable-input font-mono text-xs text-center w-20"
                        />
                      </td>
                      <td className="text-center">
                        <select
                          value={s.marketplace}
                          onChange={(e) =>
                            onUpdateRow(s.id, {
                              marketplace: e.target.value as Marketplace,
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
                          value={s.marketplaceSku}
                          onChange={(e) =>
                            onUpdateRow(s.id, { marketplaceSku: e.target.value })
                          }
                          className="editable-input font-mono text-xs w-36"
                        />
                      </td>
                      <td className="text-center">
                        <select
                          value={s.currency}
                          onChange={(e) =>
                            onUpdateRow(s.id, { currency: e.target.value as Currency })
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
                          value={s.grossUnitsSold}
                          onChange={(e) =>
                            onUpdateRow(s.id, {
                              grossUnitsSold: parseInt(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-20"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={s.grossProductSales}
                          onChange={(e) =>
                            onUpdateRow(s.id, {
                              grossProductSales: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-24"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          value={s.returnedUnits}
                          onChange={(e) =>
                            onUpdateRow(s.id, {
                              returnedUnits: parseInt(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-16"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={s.refundedAmount}
                          onChange={(e) =>
                            onUpdateRow(s.id, {
                              refundedAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-20"
                        />
                      </td>

                      {/* Formula: Master SKU */}
                      <td className="font-mono text-xs bg-gray-50/70 font-medium">
                        {isUnmapped ? (
                          <span className="text-[var(--color-negative)] font-bold">
                            UNMAPPED_SKU
                          </span>
                        ) : (
                          s.masterSku
                        )}
                      </td>

                      {/* Formula: Net Units */}
                      <td className="text-right font-mono text-xs bg-gray-50/70">
                        {s.netUnitsSold.toLocaleString('en-US')}
                      </td>

                      {/* Formula: Net Sales Local */}
                      <td className="text-right font-mono text-xs bg-gray-50/70">
                        {s.currency} {s.netRevenueLocal.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Formula: FX Rate */}
                      <td className="text-right font-mono text-xs bg-gray-50/70">
                        {s.applicableFxRate.toFixed(4)}
                      </td>

                      {/* Formula: Net Revenue Base */}
                      <td className="text-right font-mono text-xs bg-gray-50/70 font-semibold text-[var(--color-primary)]">
                        {baseCurrencySymbol}
                        {s.netRevenueBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <button
                          onClick={() => onDeleteRow(s.id)}
                          title="Delete sales row"
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
