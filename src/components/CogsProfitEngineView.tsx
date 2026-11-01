import React, { useState } from 'react';
import { ComputedCogsProfitRow, Marketplace } from '../types';
import { Cpu, Search, Filter, AlertTriangle } from 'lucide-react';
import { DataBar } from './DataBar';
import { StatusPill } from './StatusPill';

interface CogsProfitEngineViewProps {
  rows: ComputedCogsProfitRow[];
  baseCurrencySymbol: string;
}

export const CogsProfitEngineView: React.FC<CogsProfitEngineViewProps> = ({
  rows,
  baseCurrencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('ALL');
  const [anomalyOnly, setAnomalyOnly] = useState(false);

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.primaryKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.masterSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.healthDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarket =
      selectedMarketplace === 'ALL' || r.marketplace === selectedMarketplace;

    const matchesAnomaly = !anomalyOnly || r.isAnomaly;

    return matchesSearch && matchesMarket && matchesAnomaly;
  });

  // Calculate totals for active filtered set
  const totalNetRevenue = filteredRows.reduce((sum, r) => sum + r.netRevenueBase, 0);
  const totalCogs = filteredRows.reduce((sum, r) => sum + r.totalCogsBase, 0);
  const totalGrossProfit = filteredRows.reduce((sum, r) => sum + r.grossProfitBase, 0);
  const totalExpenses = filteredRows.reduce((sum, r) => sum + r.totalExpensesBase, 0);
  const totalOpProfit = filteredRows.reduce((sum, r) => sum + r.operatingProfitBase, 0);
  const blendedOpMargin = totalNetRevenue > 0 ? totalOpProfit / totalNetRevenue : 0;

  return (
    <div className="space-y-4 view-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
              Historical Batch COGS Matching & SKU Profit Engine
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted)] font-mono">
            Sheet: 07_COGS_Profit_Engine | 100% Automated Formula Array Engine (A6#:S6#)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anomalyOnly}
              onChange={(e) => setAnomalyOnly(e.target.checked)}
              className="rounded text-[var(--color-accent)] focus:ring-0"
            />
            <span className="font-medium">Filter Anomalies Only</span>
          </label>

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
              placeholder="Search month, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs w-48 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>
      </div>

      {/* Mini Rollup Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="app-card p-3">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Net Revenue
          </span>
          <p className="font-heading text-lg font-bold text-[var(--color-primary)]">
            {baseCurrencySymbol}
            {totalNetRevenue.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="app-card p-3">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Total COGS
          </span>
          <p className="font-heading text-lg font-bold text-[var(--color-primary)]">
            {baseCurrencySymbol}
            {totalCogs.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="app-card p-3">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Gross Profit
          </span>
          <p className="font-heading text-lg font-bold text-[var(--color-primary)]">
            {baseCurrencySymbol}
            {totalGrossProfit.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="app-card p-3">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Amazon Expenses
          </span>
          <p className="font-heading text-lg font-bold text-[var(--color-primary)]">
            {baseCurrencySymbol}
            {totalExpenses.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="app-card p-3">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Operating Net Profit
          </span>
          <p
            className={`font-heading text-lg font-bold ${
              totalOpProfit < 0
                ? 'text-[var(--color-negative)]'
                : 'text-[var(--color-primary)]'
            }`}
          >
            {baseCurrencySymbol}
            {totalOpProfit.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="app-card p-3">
          <span className="text-[10px] uppercase font-semibold text-[var(--color-muted)] tracking-label">
            Operating Net Margin
          </span>
          <p className="font-heading text-lg font-bold text-[var(--color-primary)]">
            {(blendedOpMargin * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Master Engine Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th className="text-left bg-[rgba(5,28,44,0.06)]">Primary Key (A#)</th>
                <th className="text-center">Month (B#)</th>
                <th className="text-center">Mkt (C#)</th>
                <th className="text-left">Marketplace SKU (D#)</th>
                <th className="text-left">Master SKU (E#)</th>
                <th className="text-right">Net Units (F#)</th>
                <th className="text-right">Net Revenue (G#)</th>
                <th className="text-right">Matched Landed Cost (H#)</th>
                <th className="text-right">Latest Landed Cost (I#)</th>
                <th className="text-right">Cost Variance (J#)</th>
                <th className="text-right">Total COGS (K#)</th>
                <th className="text-right">Gross Profit (L#)</th>
                <th className="text-right">Gross Margin % (M#)</th>
                <th className="text-right">Commission & FBA (N#)</th>
                <th className="text-right">PPC Ads (O#)</th>
                <th className="text-right">Storage & Misc (P#)</th>
                <th className="text-right font-bold text-[var(--color-primary)]">
                  Operating Net ({baseCurrencySymbol}) (Q#)
                </th>
                <th className="text-right font-bold">Net Margin % (R#)</th>
                <th className="text-left">Diagnosis & Action (S#)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-8 text-[var(--color-muted)]">
                    No records found for current criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const isNegativeProfit = r.operatingProfitBase < 0;
                  const isLowGrossMargin = r.grossMarginRate < 0.15;
                  const isHighVariance = Math.abs(r.costVarianceRate) > 0.10;

                  return (
                    <tr
                      key={r.primaryKey}
                      className={r.isAnomaly ? 'anomaly-row' : ''}
                    >
                      {/* Primary Key */}
                      <td className="font-mono text-xs text-[var(--color-muted)]">
                        {r.primaryKey}
                      </td>

                      {/* Month */}
                      <td className="text-center font-mono text-xs">{r.month}</td>

                      {/* Marketplace */}
                      <td className="text-center font-mono font-medium text-xs">
                        {r.marketplace}
                      </td>

                      {/* Marketplace SKU */}
                      <td className="font-mono text-xs">{r.marketplaceSku}</td>

                      {/* Master SKU */}
                      <td className="font-mono font-medium text-xs text-[var(--color-primary)]">
                        {r.masterSku}
                      </td>

                      {/* Net Units */}
                      <td className="text-right font-mono text-xs">
                        {r.netUnitsSold.toLocaleString('en-US')}
                      </td>

                      {/* Net Revenue Base */}
                      <td className="text-right font-mono text-xs font-semibold text-[var(--color-primary)]">
                        {baseCurrencySymbol}
                        {r.netRevenueBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Matched Landed Cost */}
                      <td className="text-right font-mono text-xs">
                        {baseCurrencySymbol}
                        {r.matchedUnitLandedCostBase.toFixed(3)}
                      </td>

                      {/* Latest Landed Cost */}
                      <td className="text-right font-mono text-xs">
                        {baseCurrencySymbol}
                        {r.latestUnitLandedCostBase.toFixed(3)}
                      </td>

                      {/* Cost Variance */}
                      <td className="text-right font-mono text-xs">
                        {isHighVariance ? (
                          <span className="font-semibold text-amber-900">
                            {(r.costVarianceRate * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-[var(--color-muted)]">
                            {(r.costVarianceRate * 100).toFixed(1)}%
                          </span>
                        )}
                      </td>

                      {/* Total COGS Base */}
                      <td className="text-right font-mono text-xs">
                        {baseCurrencySymbol}
                        {r.totalCogsBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Gross Profit Base */}
                      <td className="text-right font-mono text-xs font-medium">
                        {baseCurrencySymbol}
                        {r.grossProfitBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Gross Margin % */}
                      <td className="text-right font-mono text-xs">
                        {isLowGrossMargin ? (
                          <span className="anomaly-text">
                            {(r.grossMarginRate * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span>{(r.grossMarginRate * 100).toFixed(1)}%</span>
                        )}
                      </td>

                      {/* Commission & FBA */}
                      <td className="text-right font-mono text-xs text-gray-600">
                        {baseCurrencySymbol}
                        {r.commissionFbaBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* PPC Ads */}
                      <td className="text-right font-mono text-xs text-gray-600">
                        {baseCurrencySymbol}
                        {r.adSpendBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Storage & Misc */}
                      <td className="text-right font-mono text-xs text-gray-600">
                        {baseCurrencySymbol}
                        {r.storageMiscBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Operating Profit */}
                      <td
                        className={`text-right font-mono text-xs font-bold ${
                          isNegativeProfit
                            ? 'text-[var(--color-negative)]'
                            : 'text-[var(--color-primary)]'
                        }`}
                      >
                        {baseCurrencySymbol}
                        {r.operatingProfitBase.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Operating Net Margin % */}
                      <td
                        className={`text-right font-mono text-xs font-bold ${
                          isNegativeProfit
                            ? 'text-[var(--color-negative)]'
                            : 'text-[var(--color-primary)]'
                        }`}
                      >
                        {(r.operatingMarginRate * 100).toFixed(1)}%
                      </td>

                      {/* Diagnosis Tag */}
                      <td className="text-xs">
                        <span className="font-medium text-[var(--color-body-text)]">
                          {r.healthDiagnosis}
                        </span>
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
