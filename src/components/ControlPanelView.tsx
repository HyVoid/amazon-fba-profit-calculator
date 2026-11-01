import React from 'react';
import { ControlPanelParams, AllocationBasis, CogsMethod, Currency } from '../types';
import { Sliders, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ControlPanelViewProps {
  params: ControlPanelParams;
  onChange: (updated: Partial<ControlPanelParams>) => void;
  systemHealthText: string;
  hasErrors: boolean;
}

export const ControlPanelView: React.FC<ControlPanelViewProps> = ({
  params,
  onChange,
  systemHealthText,
  hasErrors,
}) => {
  return (
    <div className="space-y-6 view-enter">
      {/* Executive Summary Banner */}
      <div className="app-card p-6 border-l-4 border-[var(--color-accent)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
                Global Control Panel & Accounting Policies
              </h2>
            </div>
            <p className="text-xs text-[var(--color-muted)] font-mono">
              Sheet: 01_Control_Panel | Cell References: $C$3:$C$14
            </p>
          </div>

          {/* System Health Status Indicator */}
          <div
            className={`px-4 py-2.5 rounded-[var(--radius-md)] flex items-center gap-2.5 text-xs font-medium ${
              hasErrors
                ? 'bg-red-50 text-[var(--color-negative)] border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {hasErrors ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[var(--color-negative)]" />
            ) : (
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            )}
            <span>{systemHealthText}</span>
          </div>
        </div>

        {/* Dynamic Accounting Policy Summary */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-primary)] bg-[var(--color-bg)] px-3.5 py-2.5 rounded-[var(--radius-sm)] flex items-center justify-between flex-wrap gap-2">
          <span>
            <strong>Active Audit Window:</strong> {params.startMonth} through {params.endMonth}
          </span>
          <span>
            <strong>Reporting Currency:</strong> {params.baseCurrencyCode} ({params.baseCurrencySymbol})
          </span>
          <span>
            <strong>Freight Rule:</strong> {params.freightAllocationBasis}
          </span>
          <span>
            <strong>COGS Rule:</strong> {params.cogsMethod}
          </span>
        </div>
      </div>

      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Section 1: Accounting Period & Currency */}
        <div className="app-card p-5 space-y-4">
          <div className="border-b border-[var(--color-border)] pb-2">
            <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
              Accounting Period & Currency
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              Controls global date range and base currency conversion
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Report Start Month ($C$3)
              </label>
              <input
                type="text"
                value={params.startMonth}
                onChange={(e) => onChange({ startMonth: e.target.value })}
                placeholder="YYYY-MM"
                className="editable-input w-full font-mono"
              />
              <span className="text-[10px] text-[var(--color-muted)]">e.g. 2026-01</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Report End Month ($C$4)
              </label>
              <input
                type="text"
                value={params.endMonth}
                onChange={(e) => onChange({ endMonth: e.target.value })}
                placeholder="YYYY-MM"
                className="editable-input w-full font-mono"
              />
              <span className="text-[10px] text-[var(--color-muted)]">e.g. 2026-03</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                  Base Currency ($C$5)
                </label>
                <select
                  value={params.baseCurrencyCode}
                  onChange={(e) =>
                    onChange({ baseCurrencyCode: e.target.value as Currency })
                  }
                  className="editable-input w-full font-mono cursor-pointer"
                >
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                  Symbol ($C$6)
                </label>
                <input
                  type="text"
                  value={params.baseCurrencySymbol}
                  onChange={(e) => onChange({ baseCurrencySymbol: e.target.value })}
                  placeholder="CA$"
                  className="editable-input w-full font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Allocation & Valuation Rules */}
        <div className="app-card p-5 space-y-4">
          <div className="border-b border-[var(--color-border)] pb-2">
            <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
              Freight & Valuation Rules
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              Determines landed cost allocation and inventory COGS logic
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Freight Allocation Basis ($C$7)
              </label>
              <select
                value={params.freightAllocationBasis}
                onChange={(e) =>
                  onChange({ freightAllocationBasis: e.target.value as AllocationBasis })
                }
                className="editable-input w-full cursor-pointer"
              >
                <option value="By Volume (CBM)">By Volume (CBM) - Ocean default</option>
                <option value="By Weight (KG)">By Weight (KG) - Air default</option>
                <option value="By Units">By Units - Equal quantity split</option>
              </select>
              <span className="text-[10px] text-[var(--color-muted)]">
                Applied to shared shipments without single-bill override
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Historical COGS Valuation Method ($C$8)
              </label>
              <select
                value={params.cogsMethod}
                onChange={(e) =>
                  onChange({ cogsMethod: e.target.value as CogsMethod })
                }
                className="editable-input w-full cursor-pointer"
              >
                <option value="Historical Cumulative Weighted Average">
                  Historical Cumulative Weighted Average (FIFO Timeline)
                </option>
                <option value="Latest Batch Standard Cost">
                  Latest Batch Standard Cost (Replacement Cost)
                </option>
              </select>
              <span className="text-[10px] text-[var(--color-muted)]">
                Protects historical months from subsequent purchase price changes
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Authoritative Report Whitelist */}
        <div className="app-card p-5 space-y-4">
          <div className="border-b border-[var(--color-border)] pb-2">
            <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
              Anti-Duplication Whitelist
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              Designates authoritative report sources to prevent double-counting
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Authoritative Txn Source ($C$9)
              </label>
              <input
                type="text"
                value={params.validTxnSource}
                onChange={(e) => onChange({ validTxnSource: e.target.value })}
                className="editable-input w-full font-mono"
              />
              <span className="text-[10px] text-[var(--color-muted)]">
                Used for Referral Fees & FBA Fulfillment Fees
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Authoritative Ads Source ($C$10)
              </label>
              <input
                type="text"
                value={params.validAdsSource}
                onChange={(e) => onChange({ validAdsSource: e.target.value })}
                className="editable-input w-full font-mono"
              />
              <span className="text-[10px] text-[var(--color-muted)]">
                Used for Sponsored Products & PPC spend
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Authoritative Storage Source ($C$11)
              </label>
              <input
                type="text"
                value={params.validStorageSource}
                onChange={(e) => onChange({ validStorageSource: e.target.value })}
                className="editable-input w-full font-mono"
              />
              <span className="text-[10px] text-[var(--color-muted)]">
                Used for Monthly Storage & Inventory Disposal
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Audit & Alert Thresholds */}
        <div className="app-card p-5 space-y-4 md:col-span-2 lg:col-span-3">
          <div className="border-b border-[var(--color-border)] pb-2">
            <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
              Alert Thresholds & Diagnostic Baselines
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              Triggers flags in 07_COGS_Profit_Engine and 08_Data_Validation audit lists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Minimum Gross Margin Floor ($C$12)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={params.minGrossMarginThreshold}
                  onChange={(e) =>
                    onChange({ minGrossMarginThreshold: parseFloat(e.target.value) || 0 })
                  }
                  className="editable-input w-28 font-mono"
                />
                <span className="text-xs font-medium text-[var(--color-primary)]">
                  ({(params.minGrossMarginThreshold * 100).toFixed(1)}%)
                </span>
              </div>
              <span className="text-[10px] text-[var(--color-muted)] block mt-1">
                Flags products falling below this gross margin red line
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Target Operating Net Margin ($C$13)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={params.targetOperatingMarginThreshold}
                  onChange={(e) =>
                    onChange({
                      targetOperatingMarginThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="editable-input w-28 font-mono"
                />
                <span className="text-xs font-medium text-[var(--color-primary)]">
                  ({(params.targetOperatingMarginThreshold * 100).toFixed(1)}%)
                </span>
              </div>
              <span className="text-[10px] text-[var(--color-muted)] block mt-1">
                Benchmark for star-performer classification in Dashboard
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
                Purchase Cost Volatility Alert ($C$14)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={params.costVarianceThreshold}
                  onChange={(e) =>
                    onChange({
                      costVarianceThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="editable-input w-28 font-mono"
                />
                <span className="text-xs font-medium text-[var(--color-primary)]">
                  (±{(params.costVarianceThreshold * 100).toFixed(1)}%)
                </span>
              </div>
              <span className="text-[10px] text-[var(--color-muted)] block mt-1">
                Triggers warning when latest purchase deviates from historical average
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
