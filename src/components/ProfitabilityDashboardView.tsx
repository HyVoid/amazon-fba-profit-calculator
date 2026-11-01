import React, { useState } from 'react';
import {
  ComputedCogsProfitRow,
  DashboardMarketSummary,
  DashboardMonthlySummary,
  DashboardMasterSkuSummary,
  Marketplace,
} from '../types';
import {
  LayoutDashboard,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DataBar } from './DataBar';
import { StatusPill } from './StatusPill';

interface ProfitabilityDashboardViewProps {
  kpis: {
    totalNetRevenueBase: number;
    totalCogsBase: number;
    totalExpensesBase: number;
    totalOperatingProfitBase: number;
    consolidatedOperatingMarginRate: number;
  };
  marketSummaries: DashboardMarketSummary[];
  monthlySummaries: DashboardMonthlySummary[];
  masterSkuSummaries: DashboardMasterSkuSummary[];
  selectedMarketplace: string;
  onChangeMarketplace: (mkt: string) => void;
  selectedCategory: string;
  onChangeCategory: (cat: string) => void;
  categories: string[];
  baseCurrencyCode: string;
  baseCurrencySymbol: string;
  targetMarginThreshold: number;
  minGrossMarginThreshold: number;
  periodSummaryText: string;
}

export const ProfitabilityDashboardView: React.FC<ProfitabilityDashboardViewProps> = ({
  kpis,
  marketSummaries,
  monthlySummaries,
  masterSkuSummaries,
  selectedMarketplace,
  onChangeMarketplace,
  selectedCategory,
  onChangeCategory,
  categories,
  baseCurrencyCode,
  baseCurrencySymbol,
  targetMarginThreshold,
  minGrossMarginThreshold,
  periodSummaryText,
}) => {
  // Max revenue in master SKU list for normalized data bars
  const maxSkuRevenue = Math.max(
    ...masterSkuSummaries.map((s) => s.netRevenueBase),
    1
  );

  // Top profitable market
  const bestMarket = [...marketSummaries].sort(
    (a, b) => b.operatingProfitBase - a.operatingProfitBase
  )[0];

  // Most diluted or negative SKU
  const lossSkus = masterSkuSummaries.filter((s) => s.operatingProfitBase < 0);

  return (
    <div className="space-y-6 view-enter">
      {/* Top Section: Dashboard Header & Interactive Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[var(--color-primary)]" />
            <h1 className="font-heading text-3xl font-bold tracking-display text-[var(--color-primary)]">
              Executive Profitability Dashboard
            </h1>
          </div>
          <p className="text-xs text-[var(--color-muted)] font-mono mt-1">
            Sheet: 09_Profitability_Dashboard | {periodSummaryText}
          </p>
        </div>

        {/* Interactive Drilldown Filters (C3, F3) */}
        <div className="flex items-center gap-3 bg-[var(--color-surface)] p-2 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[var(--color-primary)] text-[11px] uppercase tracking-label">
              Market (C3):
            </span>
            <select
              value={selectedMarketplace}
              onChange={(e) => onChangeMarketplace(e.target.value)}
              className="px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-primary)] cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="ALL">ALL (Consolidated 4-Markets)</option>
              <option value="US">US Marketplace (USD)</option>
              <option value="CA">CA Marketplace (CAD)</option>
              <option value="UK">UK Marketplace (GBP)</option>
              <option value="AU">AU Marketplace (AUD)</option>
            </select>
          </div>

          <div className="h-4 w-px bg-[var(--color-border)]" />

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[var(--color-primary)] text-[11px] uppercase tracking-label">
              Category (F3):
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => onChangeCategory(e.target.value)}
              className="px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-primary)] cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="ALL">ALL Product Lines</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 Global KPI Hero Cards (Row 5: B5:J5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Net Revenue */}
        <div className="app-card app-card-hover p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-[11px] uppercase font-semibold tracking-label">
              Net Sales Revenue ({baseCurrencySymbol}) (B5)
            </span>
            <span className="text-[11px] font-mono">B4</span>
          </div>
          <p className="font-heading text-3xl font-bold tracking-display text-[var(--color-primary)]">
            {baseCurrencySymbol}
            {kpis.totalNetRevenueBase.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <span className="text-[11px] text-[var(--color-muted)] block">
            Net of customer returns & refunds
          </span>
        </div>

        {/* Total COGS */}
        <div className="app-card app-card-hover p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-[11px] uppercase font-semibold tracking-label">
              Consolidated COGS ({baseCurrencySymbol}) (D5)
            </span>
            <span className="text-[11px] font-mono">D4</span>
          </div>
          <p className="font-heading text-3xl font-bold tracking-display text-[var(--color-primary)]">
            {baseCurrencySymbol}
            {kpis.totalCogsBase.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <span className="text-[11px] text-[var(--color-muted)] block">
            Weighted landed cost including freight
          </span>
        </div>

        {/* Operating Expenses */}
        <div className="app-card app-card-hover p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-[11px] uppercase font-semibold tracking-label">
              Platform Expenses ({baseCurrencySymbol}) (F5)
            </span>
            <span className="text-[11px] font-mono">F4</span>
          </div>
          <p className="font-heading text-3xl font-bold tracking-display text-[var(--color-primary)]">
            {baseCurrencySymbol}
            {kpis.totalExpensesBase.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <span className="text-[11px] text-[var(--color-muted)] block">
            FBA, Commissions, Ads, Storage
          </span>
        </div>

        {/* Operating Net Profit */}
        <div className="app-card app-card-hover p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-[11px] uppercase font-semibold tracking-label">
              Operating Net Profit ({baseCurrencySymbol}) (H5)
            </span>
            <span className="text-[11px] font-mono">H4</span>
          </div>
          <p
            className={`font-heading text-3xl font-bold tracking-display ${
              kpis.totalOperatingProfitBase < 0
                ? 'text-[var(--color-negative)]'
                : 'text-[var(--color-primary)]'
            }`}
          >
            {baseCurrencySymbol}
            {kpis.totalOperatingProfitBase.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <span className="text-[11px] text-[var(--color-muted)] block">
            After landed COGS & all platform fees
          </span>
        </div>

        {/* Operating Margin % */}
        <div className="app-card app-card-hover p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-[11px] uppercase font-semibold tracking-label">
              Operating Margin (J5)
            </span>
            <span className="text-[11px] font-mono">J4</span>
          </div>
          <p
            className={`font-heading text-3xl font-bold tracking-display ${
              kpis.consolidatedOperatingMarginRate < 0
                ? 'text-[var(--color-negative)]'
                : 'text-[var(--color-primary)]'
            }`}
          >
            {(kpis.consolidatedOperatingMarginRate * 100).toFixed(1)}%
          </p>
          <span className="text-[11px] text-[var(--color-muted)] block">
            Target benchmark: {(targetMarginThreshold * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Strategic Insight Block (Accent border, light surface) */}
      <div className="insight-block space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="font-heading text-base font-bold text-[var(--color-primary)]">
            Executive Performance Intelligence & Recommendations
          </h3>
        </div>
        <p className="text-xs text-[var(--color-body-text)] leading-relaxed">
          • <strong>Marketplace Dominance:</strong>{' '}
          {bestMarket ? (
            <>
              <strong>{bestMarket.marketplace}</strong> is currently the top profit engine with{' '}
              {baseCurrencySymbol}
              {bestMarket.operatingProfitBase.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{' '}
              operating net profit ({(bestMarket.operatingMarginRate * 100).toFixed(1)}% net margin).
            </>
          ) : (
            'Evaluating active markets...'
          )}
          <br />
          • <strong>Cost & Expense Audit:</strong> Anti-duplication whitelist successfully screened out duplicate ad spend records from settlement reports. COGS is calculated with cumulative batch FIFO protection to prevent inflation from recent raw material hikes.
          {lossSkus.length > 0 && (
            <>
              <br />
              • <strong className="text-[var(--color-negative)]">Action Required:</strong> SKU{' '}
              {lossSkus.map((s) => s.masterSku).join(', ')} is generating negative net margins. Review PPC bid efficiency and FBA tier dimensions to restore profitability.
            </>
          )}
        </p>
      </div>

      {/* Analytical Matrices (Grid 12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Marketplace Matrix & Monthly Trend (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Matrix 1: Multi-Marketplace Comparative Matrix (A10:H13) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                  Cross-Marketplace Profitability Comparison (A10:H13)
                </h3>
                <p className="text-xs text-[var(--color-muted)] font-mono">
                  Normalized in {baseCurrencyCode} ({baseCurrencySymbol})
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th className="text-left">Marketplace (A10#)</th>
                    <th className="text-right">Net Units (B10#)</th>
                    <th className="text-right">Net Sales (C10#)</th>
                    <th className="text-right">Total COGS (D10#)</th>
                    <th className="text-right">Gross Margin (E10#)</th>
                    <th className="text-right">Platform Fees (F10#)</th>
                    <th className="text-right font-bold text-[var(--color-primary)]">
                      Net Profit (G10#)
                    </th>
                    <th className="text-right font-bold">Net Margin (H10#)</th>
                  </tr>
                </thead>
                <tbody>
                  {marketSummaries.map((m) => {
                    const isSelected = selectedMarketplace === m.marketplace;
                    const isNegative = m.operatingProfitBase < 0;

                    return (
                      <tr
                        key={m.marketplace}
                        onClick={() =>
                          onChangeMarketplace(isSelected ? 'ALL' : m.marketplace)
                        }
                        className={`matrix-interactive-cell cursor-pointer ${
                          isSelected ? 'bg-blue-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="font-bold text-xs font-mono text-[var(--color-primary)]">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                            {m.marketplace}
                          </span>
                        </td>
                        <td className="text-right font-mono text-xs">
                          {m.netUnits.toLocaleString('en-US')}
                        </td>
                        <td className="text-right font-mono text-xs font-medium">
                          {baseCurrencySymbol}
                          {m.netRevenueBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="text-right font-mono text-xs text-gray-600">
                          {baseCurrencySymbol}
                          {m.totalCogsBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="text-right font-mono text-xs">
                          {(m.grossMarginRate * 100).toFixed(1)}%
                        </td>
                        <td className="text-right font-mono text-xs text-gray-600">
                          {baseCurrencySymbol}
                          {m.totalExpensesBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={`text-right font-mono text-xs font-bold ${
                            isNegative
                              ? 'text-[var(--color-negative)]'
                              : 'text-[var(--color-primary)]'
                          }`}
                        >
                          {baseCurrencySymbol}
                          {m.operatingProfitBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={`text-right font-mono text-xs font-bold ${
                            isNegative
                              ? 'text-[var(--color-negative)]'
                              : 'text-[var(--color-primary)]'
                          }`}
                        >
                          {(m.operatingMarginRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matrix 2: Monthly Profitability Trend Time Series (A18:G29) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                  Monthly Profitability Trajectory (A18:G29)
                </h3>
                <p className="text-xs text-[var(--color-muted)] font-mono">
                  Filtered by {selectedMarketplace === 'ALL' ? 'All Marketplaces' : `${selectedMarketplace} Marketplace`}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th className="text-left">Month (A18#)</th>
                    <th className="text-right">Net Sales (B18#)</th>
                    <th className="text-right">COGS (C18#)</th>
                    <th className="text-right">Gross Profit (D18#)</th>
                    <th className="text-right">Expenses (E18#)</th>
                    <th className="text-right font-bold text-[var(--color-primary)]">
                      Net Profit (F18#)
                    </th>
                    <th className="text-right font-bold">Net Margin % (G18#)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummaries.map((m) => {
                    const isNegative = m.operatingProfitBase < 0;

                    return (
                      <tr key={m.month}>
                        <td className="font-bold text-xs font-mono text-[var(--color-primary)]">
                          {m.month}
                        </td>
                        <td className="text-right font-mono text-xs font-medium">
                          {baseCurrencySymbol}
                          {m.netRevenueBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="text-right font-mono text-xs text-gray-600">
                          {baseCurrencySymbol}
                          {m.totalCogsBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="text-right font-mono text-xs font-medium">
                          {baseCurrencySymbol}
                          {m.grossProfitBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="text-right font-mono text-xs text-gray-600">
                          {baseCurrencySymbol}
                          {m.totalExpensesBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={`text-right font-mono text-xs font-bold ${
                            isNegative
                              ? 'text-[var(--color-negative)]'
                              : 'text-[var(--color-primary)]'
                          }`}
                        >
                          {baseCurrencySymbol}
                          {m.operatingProfitBase.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={`text-right font-mono text-xs font-bold ${
                            isNegative
                              ? 'text-[var(--color-negative)]'
                              : 'text-[var(--color-primary)]'
                          }`}
                        >
                          {(m.operatingMarginRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Master SKU Leaderboard (J10:R100) (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                Master SKU Global Leaderboard (J10:R100)
              </h3>
              <p className="text-xs text-[var(--color-muted)] font-mono">
                Consolidated cross-marketplace product unit economics
              </p>
            </div>
          </div>

          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th className="text-left">Master SKU (J10#)</th>
                    <th className="text-right">Units (L10#)</th>
                    <th className="text-right">Revenue (M10#)</th>
                    <th className="text-right">Gross % (O10#)</th>
                    <th className="text-right font-bold text-[var(--color-primary)]">
                      Net Profit (P10#)
                    </th>
                    <th className="text-right font-bold">Net % (Q10#)</th>
                    <th className="text-center">Benchmark (R10#)</th>
                  </tr>
                </thead>
                <tbody>
                  {masterSkuSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[var(--color-muted)]">
                        No Master SKUs matching filters.
                      </td>
                    </tr>
                  ) : (
                    masterSkuSummaries.map((s) => {
                      const isNegative = s.operatingProfitBase < 0;

                      return (
                        <tr key={s.masterSku}>
                          <td>
                            <div className="font-mono font-bold text-xs text-[var(--color-primary)]">
                              {s.masterSku}
                            </div>
                            <div className="text-[11px] text-[var(--color-muted)] truncate max-w-[140px]">
                              {s.productName}
                            </div>
                          </td>
                          <td className="text-right font-mono text-xs">
                            {s.netUnits.toLocaleString('en-US')}
                          </td>
                          <td className="text-right font-mono text-xs">
                            <div className="font-medium text-[var(--color-primary)]">
                              {baseCurrencySymbol}
                              {s.netRevenueBase.toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </div>
                            <DataBar
                              value={s.netRevenueBase}
                              max={maxSkuRevenue}
                              className="mt-1"
                            />
                          </td>
                          <td className="text-right font-mono text-xs">
                            {(s.grossMarginRate * 100).toFixed(1)}%
                          </td>
                          <td
                            className={`text-right font-mono text-xs font-bold ${
                              isNegative
                                ? 'text-[var(--color-negative)]'
                                : 'text-[var(--color-primary)]'
                            }`}
                          >
                            {baseCurrencySymbol}
                            {s.operatingProfitBase.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td
                            className={`text-right font-mono text-xs font-bold ${
                              isNegative
                                ? 'text-[var(--color-negative)]'
                                : 'text-[var(--color-primary)]'
                            }`}
                          >
                            {(s.operatingMarginRate * 100).toFixed(1)}%
                          </td>
                          <td className="text-center">
                            {s.targetEvaluation === 'Target Met' ? (
                              <StatusPill label="Target Met" variant="positive" />
                            ) : s.targetEvaluation === 'Critical Loss Alert' ? (
                              <StatusPill label="Loss Alert" variant="negative" />
                            ) : (
                              <StatusPill label="Review" variant="muted" />
                            )}
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
      </div>
    </div>
  );
};
