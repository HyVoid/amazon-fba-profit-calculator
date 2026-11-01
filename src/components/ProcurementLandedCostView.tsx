import React, { useState } from 'react';
import {
  ProcurementBatchRow,
  ComputedProcurementBatch,
  Currency,
} from '../types';
import { Plus, Trash2, Search, Ship } from 'lucide-react';

interface ProcurementLandedCostViewProps {
  batches: ComputedProcurementBatch[];
  onUpdateRow: (id: string, updated: Partial<ProcurementBatchRow>) => void;
  onAddRow: (newRow: Omit<ProcurementBatchRow, 'id'>) => void;
  onDeleteRow: (id: string) => void;
  baseCurrencySymbol: string;
}

export const ProcurementLandedCostView: React.FC<ProcurementLandedCostViewProps> = ({
  batches,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  baseCurrencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBatches = batches.filter((b) => {
    return (
      b.poBatchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.masterSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.effectiveMonth.includes(searchTerm)
    );
  });

  const handleAddNew = () => {
    const nextNum = batches.length + 1;
    onAddRow({
      poBatchId: `PO-202603-${String(nextNum).padStart(2, '0')}`,
      shipmentId: 'SHIP-2026-003',
      effectiveMonth: '2026-03',
      masterSku: 'PROD-001',
      currency: 'USD',
      receivedUnits: 2000,
      mfgUnitPrice: 7.50,
      packagingUnitPrice: 0.80,
      dutyAmount: 600.00,
      prepAmount: 250.00,
    });
  };

  return (
    <div className="space-y-4 view-enter">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
              Alibaba PO Batches & True Landed Cost Allocation
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted)] font-mono">
            Sheet: 03_Procurement_Landed_Cost | A:J (Procurement Inputs) | K:Q (Landed Cost Engine)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search PO, shipment, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs w-56 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add PO Batch</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th className="text-left">PO Batch (A)</th>
                <th className="text-left">Shipment ID (B)</th>
                <th className="text-center">Effective (C)</th>
                <th className="text-left">Master SKU (D)</th>
                <th className="text-center">Curr (E)</th>
                <th className="text-right">Units (F)</th>
                <th className="text-right">Mfg Price (G)</th>
                <th className="text-right">Pkg (H)</th>
                <th className="text-right">Duty (I)</th>
                <th className="text-right">Prep (J)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">CBM (K#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">KG (L#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">FX Rate (M#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">
                  Alloc Freight ({baseCurrencySymbol}) (O#)
                </th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">
                  Total Landed ({baseCurrencySymbol}) (P#)
                </th>
                <th className="text-right bg-[rgba(5,28,44,0.08)] font-bold text-[var(--color-accent)]">
                  Unit Landed ({baseCurrencySymbol}) (Q#)
                </th>
                <th className="text-center w-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center py-8 text-[var(--color-muted)]">
                    No procurement batches found.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <input
                        type="text"
                        value={b.poBatchId}
                        onChange={(e) =>
                          onUpdateRow(b.id, { poBatchId: e.target.value })
                        }
                        className="editable-input font-mono text-xs w-28"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={b.shipmentId}
                        onChange={(e) =>
                          onUpdateRow(b.id, { shipmentId: e.target.value })
                        }
                        className="editable-input font-mono text-xs w-28"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="text"
                        value={b.effectiveMonth}
                        onChange={(e) =>
                          onUpdateRow(b.id, { effectiveMonth: e.target.value })
                        }
                        className="editable-input font-mono text-xs text-center w-20"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={b.masterSku}
                        onChange={(e) =>
                          onUpdateRow(b.id, { masterSku: e.target.value })
                        }
                        className="editable-input font-mono font-medium text-xs w-24"
                      />
                    </td>
                    <td className="text-center">
                      <select
                        value={b.currency}
                        onChange={(e) =>
                          onUpdateRow(b.id, { currency: e.target.value as Currency })
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
                        value={b.receivedUnits}
                        onChange={(e) =>
                          onUpdateRow(b.id, {
                            receivedUnits: parseInt(e.target.value) || 0,
                          })
                        }
                        className="editable-input text-xs text-right font-mono w-20"
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={b.mfgUnitPrice}
                        onChange={(e) =>
                          onUpdateRow(b.id, {
                            mfgUnitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="editable-input text-xs text-right font-mono w-18"
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={b.packagingUnitPrice}
                        onChange={(e) =>
                          onUpdateRow(b.id, {
                            packagingUnitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="editable-input text-xs text-right font-mono w-16"
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={b.dutyAmount}
                        onChange={(e) =>
                          onUpdateRow(b.id, {
                            dutyAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="editable-input text-xs text-right font-mono w-20"
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={b.prepAmount}
                        onChange={(e) =>
                          onUpdateRow(b.id, {
                            prepAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="editable-input text-xs text-right font-mono w-18"
                      />
                    </td>

                    {/* Formula: CBM */}
                    <td className="text-right font-mono text-xs bg-gray-50/70">
                      {b.batchTotalCbm.toFixed(3)}
                    </td>

                    {/* Formula: KG */}
                    <td className="text-right font-mono text-xs bg-gray-50/70">
                      {b.batchTotalKg.toFixed(1)}
                    </td>

                    {/* Formula: FX Rate */}
                    <td className="text-right font-mono text-xs bg-gray-50/70">
                      {b.applicableFxRate.toFixed(4)}
                    </td>

                    {/* Formula: Allocated Freight */}
                    <td className="text-right font-mono text-xs bg-gray-50/70">
                      {baseCurrencySymbol}
                      {b.allocatedFreightBase.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Formula: Total Landed Cost */}
                    <td className="text-right font-mono text-xs bg-gray-50/70 font-medium">
                      {baseCurrencySymbol}
                      {b.batchTotalLandedCostBase.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Formula: Unit Landed Cost */}
                    <td className="text-right font-mono text-xs bg-gray-50/70 font-bold text-[var(--color-primary)]">
                      {baseCurrencySymbol}
                      {b.unitLandedCostBase.toFixed(3)}
                    </td>

                    {/* Actions */}
                    <td className="text-center">
                      <button
                        onClick={() => onDeleteRow(b.id)}
                        title="Delete batch"
                        className="text-gray-400 hover:text-[var(--color-negative)] transition-colors p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
