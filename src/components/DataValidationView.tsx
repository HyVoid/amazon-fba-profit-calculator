import React from 'react';
import { ValidationRefreshLog, ValidationSummary } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Ban,
  FileQuestion,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { StatusPill } from './StatusPill';

interface DataValidationViewProps {
  logs: ValidationRefreshLog[];
  onUpdateLog: (index: number, updated: Partial<ValidationRefreshLog>) => void;
  summary: ValidationSummary;
  baseCurrencySymbol: string;
}

export const DataValidationView: React.FC<DataValidationViewProps> = ({
  logs,
  onUpdateLog,
  summary,
  baseCurrencySymbol,
}) => {
  const isStale = (dateStr: string) => {
    if (!dateStr) return true;
    const diffDays =
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24);
    return diffDays > 31;
  };

  const totalAnomalies =
    summary.orphanSkus.length +
    summary.missingLandedCostSkus.length +
    summary.lowOrNegativeMarginSkus.length +
    summary.costVolatilitySkus.length;

  return (
    <div className="space-y-6 view-enter">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
            Data Quality Audit & Real-Time Anomaly Detection
          </h2>
        </div>
        <p className="text-xs text-[var(--color-muted)] font-mono">
          Sheet: 08_Data_Validation | Refresh Audit Log (A:D) | 5 Live Automated Exception Watchlists (F, H, J, L, N)
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="app-card p-4">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Unmapped Orphan SKUs
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span
              className={`font-heading text-2xl font-bold ${
                summary.orphanSkus.length > 0
                  ? 'text-[var(--color-negative)]'
                  : 'text-[var(--color-primary)]'
              }`}
            >
              {summary.orphanSkus.length}
            </span>
            <FileQuestion className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <span className="text-[11px] text-[var(--color-muted)] mt-1 block">
            Appearing in sales without master record
          </span>
        </div>

        <div className="app-card p-4">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Active SKUs Missing Cost
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span
              className={`font-heading text-2xl font-bold ${
                summary.missingLandedCostSkus.length > 0
                  ? 'text-[var(--color-negative)]'
                  : 'text-[var(--color-primary)]'
              }`}
            >
              {summary.missingLandedCostSkus.length}
            </span>
            <AlertTriangle className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <span className="text-[11px] text-[var(--color-muted)] mt-1 block">
            Active catalog items with 0 PO batches
          </span>
        </div>

        <div className="app-card p-4">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Deduplicated Expense Items
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
              {summary.interceptedExpenses.length}
            </span>
            <Ban className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[11px] text-[var(--color-muted)] mt-1 block">
            Duplicate report lines blocked from P&L
          </span>
        </div>

        <div className="app-card p-4">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Loss-Making / Low-Margin SKUs
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span
              className={`font-heading text-2xl font-bold ${
                summary.lowOrNegativeMarginSkus.length > 0
                  ? 'text-[var(--color-negative)]'
                  : 'text-[var(--color-primary)]'
              }`}
            >
              {summary.lowOrNegativeMarginSkus.length}
            </span>
            <TrendingDown className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
          <span className="text-[11px] text-[var(--color-muted)] mt-1 block">
            Operating profit &lt; 0 or gross margin &lt; 15%
          </span>
        </div>
      </div>

      {/* Part 1: Refresh Audit Log (A:D) */}
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">
          1. Data Source Refresh & Freshness Audit Log (A6:D11)
        </h3>
        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th className="text-left">Data Source Module (A)</th>
                <th className="text-center">Last Import Date (B)</th>
                <th className="text-center">Operator Status (C)</th>
                <th className="text-left bg-[rgba(5,28,44,0.08)]">
                  Freshness Validation (D#)
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => {
                const stale = isStale(log.lastImportDate);
                const isPending = log.operatorStatus === 'Pending Update';
                const hasIssue = stale || isPending;

                return (
                  <tr key={log.moduleName} className={hasIssue ? 'anomaly-row' : ''}>
                    <td className="font-medium text-xs text-[var(--color-primary)]">
                      {log.moduleName}
                    </td>
                    <td className="text-center">
                      <input
                        type="date"
                        value={log.lastImportDate}
                        onChange={(e) =>
                          onUpdateLog(idx, { lastImportDate: e.target.value })
                        }
                        className="editable-input text-xs font-mono text-center cursor-pointer"
                      />
                    </td>
                    <td className="text-center">
                      <select
                        value={log.operatorStatus}
                        onChange={(e) =>
                          onUpdateLog(idx, {
                            operatorStatus: e.target.value as ValidationRefreshLog['operatorStatus'],
                          })
                        }
                        className="editable-input text-xs cursor-pointer font-medium"
                      >
                        <option value="Verified">Verified</option>
                        <option value="Pending Update">Pending Update</option>
                      </select>
                    </td>
                    <td className="text-xs bg-gray-50/70">
                      {hasIssue ? (
                        <span className="inline-flex items-center gap-1.5 text-[var(--color-negative)] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Requires Refresh: Over 31 days or unconfirmed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid & Verified</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part 2: 5 Dynamic Anomaly Lists (F, H, J, L, N) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist 1: Orphan SKUs (F#) */}
        <div className="app-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h4 className="font-heading text-base font-bold text-[var(--color-primary)]">
              Unmapped Orphan SKUs (F#)
            </h4>
            <span className="text-xs text-[var(--color-muted)] font-mono">
              Count: {summary.orphanSkus.length}
            </span>
          </div>
          {summary.orphanSkus.length === 0 ? (
            <p className="text-xs text-emerald-700 py-3 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              No unmapped SKUs detected. All sales/expenses map to Master SKUs.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {summary.orphanSkus.map((item, i) => (
                <li
                  key={i}
                  className="p-2.5 rounded bg-red-50 border border-red-200 text-red-900 flex items-center justify-between font-mono"
                >
                  <div>
                    <strong>{item.marketplace}: </strong>
                    <span>{item.marketplaceSku}</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-negative)] uppercase font-semibold">
                    Found in {item.source}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Watchlist 2: Missing Landed Cost (H#) */}
        <div className="app-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h4 className="font-heading text-base font-bold text-[var(--color-primary)]">
              Active Master SKUs with Missing Landed Cost (H#)
            </h4>
            <span className="text-xs text-[var(--color-muted)] font-mono">
              Count: {summary.missingLandedCostSkus.length}
            </span>
          </div>
          {summary.missingLandedCostSkus.length === 0 ? (
            <p className="text-xs text-emerald-700 py-3 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              All active Master SKUs have recorded landed cost batches.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {summary.missingLandedCostSkus.map((item, i) => (
                <li
                  key={i}
                  className="p-2.5 rounded bg-red-50 border border-red-200 text-red-900 flex items-center justify-between font-mono"
                >
                  <span className="font-bold">{item.masterSku}</span>
                  <span className="text-[11px] text-gray-700">{item.productName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Watchlist 3: Intercepted Duplicate Expenses (J#) */}
        <div className="app-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h4 className="font-heading text-base font-bold text-[var(--color-primary)]">
              Deduplicated / Blocked Overlapping Expenses (J#)
            </h4>
            <span className="text-xs text-[var(--color-muted)] font-mono">
              Count: {summary.interceptedExpenses.length}
            </span>
          </div>
          {summary.interceptedExpenses.length === 0 ? (
            <p className="text-xs text-gray-500 py-3">
              No duplicate or non-authoritative expense lines intercepted.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {summary.interceptedExpenses.map((item, i) => (
                <li
                  key={i}
                  className="p-2.5 rounded bg-gray-50 border border-gray-200 text-gray-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-medium">{item.recordId}</span>
                    <span className="text-[var(--color-muted)] ml-2">
                      ({item.feeType} via {item.reportSource})
                    </span>
                  </div>
                  <span className="font-mono font-semibold">
                    {item.currency} {item.amountLocal.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Watchlist 4: Loss-Making or Low Margin SKUs (L#) */}
        <div className="app-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h4 className="font-heading text-base font-bold text-[var(--color-primary)]">
              Low Gross Margin & Loss-Making SKU Alerts (L#)
            </h4>
            <span className="text-xs text-[var(--color-muted)] font-mono">
              Count: {summary.lowOrNegativeMarginSkus.length}
            </span>
          </div>
          {summary.lowOrNegativeMarginSkus.length === 0 ? (
            <p className="text-xs text-emerald-700 py-3 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              No SKUs breached margin thresholds or generated negative operating profits.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {summary.lowOrNegativeMarginSkus.map((item, i) => (
                <li
                  key={i}
                  className="p-2.5 rounded bg-red-50 border border-red-200 text-red-900 flex items-center justify-between text-xs font-mono"
                >
                  <span className="font-semibold">{item.primaryKey}</span>
                  <div className="flex items-center gap-3">
                    <span>Gross: {(item.grossMarginRate * 100).toFixed(1)}%</span>
                    <span className="font-bold text-[var(--color-negative)]">
                      Net: {baseCurrencySymbol}
                      {item.operatingProfitBase.toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Watchlist 5: Severe Purchase Cost Volatility (N#) */}
        <div className="app-card p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h4 className="font-heading text-base font-bold text-[var(--color-primary)]">
              Severe Purchase Cost Volatility Warnings (N#)
            </h4>
            <span className="text-xs text-[var(--color-muted)] font-mono">
              Threshold: ±10.0% variance from historical baseline
            </span>
          </div>
          {summary.costVolatilitySkus.length === 0 ? (
            <p className="text-xs text-emerald-700 py-3 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              All recent PO batch prices remain within stability tolerance.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {summary.costVolatilitySkus.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-sm">{item.masterSku}</span>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Hist: {baseCurrencySymbol}{item.historicalCost.toFixed(2)} → Latest: {baseCurrencySymbol}{item.latestCost.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-amber-900">
                      {(item.varianceRate * 100).toFixed(1)}%
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-amber-800">
                      Price Surge
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
