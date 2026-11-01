import React from 'react';
import {
  FxRateRow,
  ShipmentFreightRow,
  ComputedShipmentFreight,
  Currency,
  AllocationBasis,
} from '../types';
import { Plus, Trash2, ArrowLeftRight, Ship } from 'lucide-react';

interface FxAllocationViewProps {
  fxRates: FxRateRow[];
  shipments: ComputedShipmentFreight[];
  onUpdateFxRow: (id: string, updated: Partial<FxRateRow>) => void;
  onAddFxRow: (newRow: Omit<FxRateRow, 'id'>) => void;
  onDeleteFxRow: (id: string) => void;
  onUpdateShipmentRow: (id: string, updated: Partial<ShipmentFreightRow>) => void;
  onAddShipmentRow: (newRow: Omit<ShipmentFreightRow, 'id'>) => void;
  onDeleteShipmentRow: (id: string) => void;
  baseCurrencyCode: Currency;
  baseCurrencySymbol: string;
}

export const FxAllocationView: React.FC<FxAllocationViewProps> = ({
  fxRates,
  shipments,
  onUpdateFxRow,
  onAddFxRow,
  onDeleteFxRow,
  onUpdateShipmentRow,
  onAddShipmentRow,
  onDeleteShipmentRow,
  baseCurrencyCode,
  baseCurrencySymbol,
}) => {
  const handleAddFx = () => {
    onAddFxRow({
      month: '2026-04',
      currency: 'USD',
      rateToBase: 1.3750,
    });
  };

  const handleAddShipment = () => {
    const nextNum = shipments.length + 1;
    onAddShipmentRow({
      shipmentId: `SHIP-2026-${String(nextNum).padStart(3, '0')}`,
      month: '2026-03',
      currency: 'USD',
      freightAmountLocal: 4500.00,
      ruleOverride: 'Default Global',
    });
  };

  return (
    <div className="space-y-6 view-enter">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
            Monthly FX Rates & International Shared Freight Allocation Pool
          </h2>
        </div>
        <p className="text-xs text-[var(--color-muted)] font-mono">
          Sheet: 06_FX_Allocation | Left: FX Matrix (A:D) | Right: Shared Container Freight Pool (G:P)
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Sub-table: FX Rates (4 cols on xl) */}
        <div className="xl:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
                Monthly FX Rates to {baseCurrencyCode}
              </h3>
              <p className="text-xs text-[var(--color-muted)]">
                Used for cross-border currency translation
              </p>
            </div>
            <button
              onClick={handleAddFx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rate</span>
            </button>
          </div>

          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th className="text-left bg-[rgba(5,28,44,0.08)]">Key (A#)</th>
                    <th className="text-center">Month (B)</th>
                    <th className="text-center">Curr (C)</th>
                    <th className="text-right">1 Unit = X {baseCurrencyCode} (D)</th>
                    <th className="text-center w-8">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fxRates.map((f) => (
                    <tr key={f.id}>
                      <td className="font-mono text-xs text-[var(--color-muted)] bg-gray-50/70">
                        {f.month}|{f.currency}
                      </td>
                      <td className="text-center">
                        <input
                          type="text"
                          value={f.month}
                          onChange={(e) =>
                            onUpdateFxRow(f.id, { month: e.target.value })
                          }
                          className="editable-input font-mono text-xs text-center w-20"
                        />
                      </td>
                      <td className="text-center">
                        <select
                          value={f.currency}
                          onChange={(e) =>
                            onUpdateFxRow(f.id, { currency: e.target.value as Currency })
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
                          step="0.0001"
                          value={f.rateToBase}
                          onChange={(e) =>
                            onUpdateFxRow(f.id, {
                              rateToBase: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-24"
                        />
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => onDeleteFxRow(f.id)}
                          title="Delete FX row"
                          className="text-gray-400 hover:text-[var(--color-negative)] transition-colors p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sub-table: Shared Freight Pool (7 cols on xl) */}
        <div className="xl:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
                Shared Freight Bill Pool
              </h3>
              <p className="text-xs text-[var(--color-muted)]">
                Aggregates ocean/air freight and allocates to PO batches in 03
              </p>
            </div>
            <button
              onClick={handleAddShipment}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shipment</span>
            </button>
          </div>

          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th className="text-left">Shipment ID (G)</th>
                    <th className="text-center">Month (H)</th>
                    <th className="text-center">Curr (I)</th>
                    <th className="text-right">Freight Local (J)</th>
                    <th className="text-left">Rule Override (K)</th>
                    <th className="text-left bg-[rgba(5,28,44,0.08)]">Effective Rule (L#)</th>
                    <th className="text-right bg-[rgba(5,28,44,0.08)]">
                      Freight ({baseCurrencySymbol}) (M#)
                    </th>
                    <th className="text-right bg-[rgba(5,28,44,0.08)]">Total CBM (N#)</th>
                    <th className="text-right bg-[rgba(5,28,44,0.08)]">Total KG (O#)</th>
                    <th className="text-center w-8">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <input
                          type="text"
                          value={s.shipmentId}
                          onChange={(e) =>
                            onUpdateShipmentRow(s.id, { shipmentId: e.target.value })
                          }
                          className="editable-input font-mono text-xs w-28"
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="text"
                          value={s.month}
                          onChange={(e) =>
                            onUpdateShipmentRow(s.id, { month: e.target.value })
                          }
                          className="editable-input font-mono text-xs text-center w-20"
                        />
                      </td>
                      <td className="text-center">
                        <select
                          value={s.currency}
                          onChange={(e) =>
                            onUpdateShipmentRow(s.id, {
                              currency: e.target.value as Currency,
                            })
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
                          value={s.freightAmountLocal}
                          onChange={(e) =>
                            onUpdateShipmentRow(s.id, {
                              freightAmountLocal: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-24"
                        />
                      </td>
                      <td>
                        <select
                          value={s.ruleOverride}
                          onChange={(e) =>
                            onUpdateShipmentRow(s.id, {
                              ruleOverride: e.target.value as ShipmentFreightRow['ruleOverride'],
                            })
                          }
                          className="editable-input text-xs cursor-pointer"
                        >
                          <option value="Default Global">Default Global</option>
                          <option value="By Volume (CBM)">By Volume (CBM)</option>
                          <option value="By Weight (KG)">By Weight (KG)</option>
                          <option value="By Units">By Units</option>
                        </select>
                      </td>

                      {/* Formula: Effective Rule */}
                      <td className="text-xs bg-gray-50/70 font-medium">
                        {s.effectiveRule}
                      </td>

                      {/* Formula: Converted Freight Base */}
                      <td className="text-right font-mono text-xs bg-gray-50/70 font-semibold text-[var(--color-primary)]">
                        {baseCurrencySymbol}
                        {s.freightBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Formula: Total CBM */}
                      <td className="text-right font-mono text-xs bg-gray-50/70">
                        {s.shipmentTotalCbm.toFixed(3)}
                      </td>

                      {/* Formula: Total KG */}
                      <td className="text-right font-mono text-xs bg-gray-50/70">
                        {s.shipmentTotalKg.toFixed(1)}
                      </td>

                      <td className="text-center">
                        <button
                          onClick={() => onDeleteShipmentRow(s.id)}
                          title="Delete shipment"
                          className="text-gray-400 hover:text-[var(--color-negative)] transition-colors p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
