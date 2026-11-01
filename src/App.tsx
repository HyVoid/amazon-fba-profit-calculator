import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AppData,
  SheetTab,
  ProductMasterRow,
  ProcurementBatchRow,
  SalesRecordRow,
  ExpenseRecordRow,
  FxRateRow,
  ShipmentFreightRow,
  ValidationRefreshLog,
} from './types';
import { INITIAL_DATA } from './mockData';
import {
  computeShipments,
  computeProcurementBatches,
  computeProductMaster,
  computeSales,
  computeExpenses,
  computeCogsProfitEngine,
  computeValidationSummary,
  computeDashboardRollups,
} from './engine';
import { Header } from './components/Header';
import { ControlPanelView } from './components/ControlPanelView';
import { ProductMasterView } from './components/ProductMasterView';
import { ProcurementLandedCostView } from './components/ProcurementLandedCostView';
import { AmazonSalesView } from './components/AmazonSalesView';
import { AmazonExpenseView } from './components/AmazonExpenseView';
import { FxAllocationView } from './components/FxAllocationView';
import { CogsProfitEngineView } from './components/CogsProfitEngineView';
import { DataValidationView } from './components/DataValidationView';
import { ProfitabilityDashboardView } from './components/ProfitabilityDashboardView';
import { CsvImportModal } from './components/CsvImportModal';
import { ConfirmModal } from './components/ConfirmModal';

const STORAGE_KEY = 'theseus_workshop_sku_accounting_v1';

export default function App() {
  // Load initial state from localStorage or fallback to INITIAL_DATA
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.controlPanel && parsed.products && parsed.sales) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return INITIAL_DATA;
  });

  // Active navigation tab (hash or state)
  const [currentTab, setCurrentTab] = useState<SheetTab>(() => {
    const hash = window.location.hash.replace('#', '') as SheetTab;
    const validTabs: SheetTab[] = [
      '01_Control_Panel',
      '02_Product_Master',
      '03_Procurement_Landed_Cost',
      '04_Amazon_Sales_Data',
      '05_Amazon_Expense_Data',
      '06_FX_Allocation',
      '07_COGS_Profit_Engine',
      '08_Data_Validation',
      '09_Profitability_Dashboard',
    ];
    return validTabs.includes(hash) ? hash : '09_Profitability_Dashboard';
  });

  // Dashboard specific filter states (C3 & F3)
  const [dashboardMarket, setDashboardMarket] = useState<string>('ALL');
  const [dashboardCategory, setDashboardCategory] = useState<string>('ALL');

  // Modals state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Hidden file input for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }, [data]);

  // Sync hash with tab
  const handleSelectTab = (tab: SheetTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to touch lastSaved timestamp on state modifications
  const updateData = (updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      return {
        ...next,
        lastSavedTimestamp: new Date().toISOString(),
      };
    });
  };

  // ----------------------------------------------------
  // Reactive Core Computations Engine
  // ----------------------------------------------------

  // 1. Shipments
  const computedShipments = useMemo(() => {
    return computeShipments(
      data.shipments,
      data.procurement,
      data.products,
      data.fxRates,
      data.controlPanel.baseCurrencyCode,
      data.controlPanel.freightAllocationBasis
    );
  }, [
    data.shipments,
    data.procurement,
    data.products,
    data.fxRates,
    data.controlPanel.baseCurrencyCode,
    data.controlPanel.freightAllocationBasis,
  ]);

  // 2. Procurement Batches
  const computedBatches = useMemo(() => {
    return computeProcurementBatches(
      data.procurement,
      data.products,
      computedShipments,
      data.fxRates,
      data.controlPanel.baseCurrencyCode
    );
  }, [
    data.procurement,
    data.products,
    computedShipments,
    data.fxRates,
    data.controlPanel.baseCurrencyCode,
  ]);

  // 3. Product Master
  const computedProducts = useMemo(() => {
    return computeProductMaster(data.products, computedBatches);
  }, [data.products, computedBatches]);

  // 4. Sales Records
  const computedSales = useMemo(() => {
    return computeSales(
      data.sales,
      data.products,
      data.fxRates,
      data.controlPanel.baseCurrencyCode
    );
  }, [data.sales, data.products, data.fxRates, data.controlPanel.baseCurrencyCode]);

  // 5. Expense Records
  const computedExpenses = useMemo(() => {
    return computeExpenses(
      data.expenses,
      data.products,
      data.fxRates,
      data.controlPanel.baseCurrencyCode,
      data.controlPanel
    );
  }, [
    data.expenses,
    data.products,
    data.fxRates,
    data.controlPanel.baseCurrencyCode,
    data.controlPanel,
  ]);

  // 6. COGS Profit Engine (Sheet 07)
  const profitRows = useMemo(() => {
    return computeCogsProfitEngine(
      computedSales,
      computedExpenses,
      computedBatches,
      computedProducts,
      data.controlPanel
    );
  }, [
    computedSales,
    computedExpenses,
    computedBatches,
    computedProducts,
    data.controlPanel,
  ]);

  // 7. Validation Summary (Sheet 08)
  const validationSummary = useMemo(() => {
    return computeValidationSummary(
      computedSales,
      computedExpenses,
      data.products,
      computedBatches,
      profitRows,
      data.controlPanel
    );
  }, [
    computedSales,
    computedExpenses,
    data.products,
    computedBatches,
    profitRows,
    data.controlPanel,
  ]);

  // 8. Dashboard Rollups (Sheet 09)
  const dashboardRollups = useMemo(() => {
    return computeDashboardRollups(
      profitRows,
      dashboardMarket,
      dashboardCategory,
      data.controlPanel.targetOperatingMarginThreshold
    );
  }, [
    profitRows,
    dashboardMarket,
    dashboardCategory,
    data.controlPanel.targetOperatingMarginThreshold,
  ]);

  // Extract unique categories for dashboard filter
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(data.products.map((p) => p.category))).sort();
  }, [data.products]);

  // System Health Status (Control Panel $F$3)
  const hasSystemErrors =
    validationSummary.orphanSkus.length > 0 ||
    validationSummary.missingLandedCostSkus.length > 0;

  const systemHealthText = hasSystemErrors
    ? `Data Discrepancy: ${validationSummary.orphanSkus.length} unmapped SKU(s) / ${validationSummary.missingLandedCostSkus.length} missing landed cost(s). Review 08_Data_Validation.`
    : 'Data Integrity Verified: All active marketplace SKUs mapped with landed cost accounted.';

  const periodSummaryText = `Audit Period: ${data.controlPanel.startMonth} - ${data.controlPanel.endMonth} | Base Currency: ${data.controlPanel.baseCurrencyCode} (${data.controlPanel.baseCurrencySymbol}) | Freight: ${data.controlPanel.freightAllocationBasis} | COGS: ${data.controlPanel.cogsMethod}`;

  // ----------------------------------------------------
  // Backup Export & Import Handlers
  // ----------------------------------------------------
  const handleExportBackup = () => {
    const today = new Date().toISOString().split('T')[0];
    const fileName = `Theseus-Workshop-backup-${today}.json`;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Backup exported successfully as ${fileName}`);
  };

  const handleImportBackup = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        // Validate core structure
        if (
          parsed &&
          parsed.controlPanel &&
          Array.isArray(parsed.products) &&
          Array.isArray(parsed.sales) &&
          Array.isArray(parsed.expenses)
        ) {
          setData({
            ...parsed,
            lastSavedTimestamp: new Date().toISOString(),
          });
          showNotification('Backup successfully restored and verified!');
        } else {
          alert('Invalid backup file format. Missing required worksheet schema.');
        }
      } catch (err) {
        alert('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    setData({
      ...INITIAL_DATA,
      lastSavedTimestamp: new Date().toISOString(),
    });
    showNotification('System restored to factory initial dataset.');
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Hidden File Input for Backup Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* 56px Sticky Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        lastSaved={data.lastSavedTimestamp}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onResetData={() => setIsResetModalOpen(true)}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-8 z-50 bg-[var(--color-primary)] text-white text-xs px-4 py-2.5 rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] flex items-center gap-2 animate-bounce">
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area: max-width 1400px, 40px left/right padding */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-8">
        {/* Sheet 09: Profitability Dashboard */}
        {currentTab === '09_Profitability_Dashboard' && (
          <ProfitabilityDashboardView
            kpis={dashboardRollups.kpis}
            marketSummaries={dashboardRollups.marketSummaries}
            monthlySummaries={dashboardRollups.monthlySummaries}
            masterSkuSummaries={dashboardRollups.masterSkuSummaries}
            selectedMarketplace={dashboardMarket}
            onChangeMarketplace={setDashboardMarket}
            selectedCategory={dashboardCategory}
            onChangeCategory={setDashboardCategory}
            categories={uniqueCategories}
            baseCurrencyCode={data.controlPanel.baseCurrencyCode}
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
            targetMarginThreshold={data.controlPanel.targetOperatingMarginThreshold}
            minGrossMarginThreshold={data.controlPanel.minGrossMarginThreshold}
            periodSummaryText={periodSummaryText}
          />
        )}

        {/* Sheet 07: COGS Profit Engine */}
        {currentTab === '07_COGS_Profit_Engine' && (
          <CogsProfitEngineView
            rows={profitRows}
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
          />
        )}

        {/* Sheet 01: Control Panel */}
        {currentTab === '01_Control_Panel' && (
          <ControlPanelView
            params={data.controlPanel}
            onChange={(updated) =>
              updateData((prev) => ({
                ...prev,
                controlPanel: { ...prev.controlPanel, ...updated },
              }))
            }
            systemHealthText={systemHealthText}
            hasErrors={hasSystemErrors}
          />
        )}

        {/* Sheet 02: Product Master */}
        {currentTab === '02_Product_Master' && (
          <ProductMasterView
            products={computedProducts}
            onUpdateRow={(id, updated) =>
              updateData((prev) => ({
                ...prev,
                products: prev.products.map((p) =>
                  p.id === id ? { ...p, ...updated } : p
                ),
              }))
            }
            onAddRow={(newRow) =>
              updateData((prev) => ({
                ...prev,
                products: [...prev.products, { ...newRow, id: `p-${Date.now()}` }],
              }))
            }
            onDeleteRow={(id) =>
              updateData((prev) => ({
                ...prev,
                products: prev.products.filter((p) => p.id !== id),
              }))
            }
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
          />
        )}

        {/* Sheet 03: Procurement & Landed Cost */}
        {currentTab === '03_Procurement_Landed_Cost' && (
          <ProcurementLandedCostView
            batches={computedBatches}
            onUpdateRow={(id, updated) =>
              updateData((prev) => ({
                ...prev,
                procurement: prev.procurement.map((b) =>
                  b.id === id ? { ...b, ...updated } : b
                ),
              }))
            }
            onAddRow={(newRow) =>
              updateData((prev) => ({
                ...prev,
                procurement: [
                  ...prev.procurement,
                  { ...newRow, id: `po-${Date.now()}` },
                ],
              }))
            }
            onDeleteRow={(id) =>
              updateData((prev) => ({
                ...prev,
                procurement: prev.procurement.filter((b) => b.id !== id),
              }))
            }
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
          />
        )}

        {/* Sheet 04: Amazon Sales Data */}
        {currentTab === '04_Amazon_Sales_Data' && (
          <AmazonSalesView
            sales={computedSales}
            onUpdateRow={(id, updated) =>
              updateData((prev) => ({
                ...prev,
                sales: prev.sales.map((s) =>
                  s.id === id ? { ...s, ...updated } : s
                ),
              }))
            }
            onAddRow={(newRow) =>
              updateData((prev) => ({
                ...prev,
                sales: [...prev.sales, { ...newRow, id: `s-${Date.now()}` }],
              }))
            }
            onDeleteRow={(id) =>
              updateData((prev) => ({
                ...prev,
                sales: prev.sales.filter((s) => s.id !== id),
              }))
            }
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
          />
        )}

        {/* Sheet 05: Amazon Expense Data */}
        {currentTab === '05_Amazon_Expense_Data' && (
          <AmazonExpenseView
            expenses={computedExpenses}
            onUpdateRow={(id, updated) =>
              updateData((prev) => ({
                ...prev,
                expenses: prev.expenses.map((e) =>
                  e.id === id ? { ...e, ...updated } : e
                ),
              }))
            }
            onAddRow={(newRow) =>
              updateData((prev) => ({
                ...prev,
                expenses: [...prev.expenses, { ...newRow, id: `e-${Date.now()}` }],
              }))
            }
            onDeleteRow={(id) =>
              updateData((prev) => ({
                ...prev,
                expenses: prev.expenses.filter((e) => e.id !== id),
              }))
            }
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
          />
        )}

        {/* Sheet 06: FX Allocation */}
        {currentTab === '06_FX_Allocation' && (
          <FxAllocationView
            fxRates={data.fxRates}
            shipments={computedShipments}
            onUpdateFxRow={(id, updated) =>
              updateData((prev) => ({
                ...prev,
                fxRates: prev.fxRates.map((f) =>
                  f.id === id ? { ...f, ...updated } : f
                ),
              }))
            }
            onAddFxRow={(newRow) =>
              updateData((prev) => ({
                ...prev,
                fxRates: [...prev.fxRates, { ...newRow, id: `fx-${Date.now()}` }],
              }))
            }
            onDeleteFxRow={(id) =>
              updateData((prev) => ({
                ...prev,
                fxRates: prev.fxRates.filter((f) => f.id !== id),
              }))
            }
            onUpdateShipmentRow={(id, updated) =>
              updateData((prev) => ({
                ...prev,
                shipments: prev.shipments.map((s) =>
                  s.id === id ? { ...s, ...updated } : s
                ),
              }))
            }
            onAddShipmentRow={(newRow) =>
              updateData((prev) => ({
                ...prev,
                shipments: [
                  ...prev.shipments,
                  { ...newRow, id: `sh-${Date.now()}` },
                ],
              }))
            }
            onDeleteShipmentRow={(id) =>
              updateData((prev) => ({
                ...prev,
                shipments: prev.shipments.filter((s) => s.id !== id),
              }))
            }
            baseCurrencyCode={data.controlPanel.baseCurrencyCode}
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
          />
        )}

        {/* Sheet 08: Data Validation */}
        {currentTab === '08_Data_Validation' && (
          <DataValidationView
            logs={data.validationLogs}
            onUpdateLog={(idx, updated) =>
              updateData((prev) => {
                const newLogs = [...prev.validationLogs];
                newLogs[idx] = { ...newLogs[idx], ...updated };
                return { ...prev, validationLogs: newLogs };
              })
            }
            summary={validationSummary}
            baseCurrencySymbol={data.controlPanel.baseCurrencySymbol}
          />
        )}
      </main>

      {/* Mandatory Page Footer (Specification Section 4) */}
      <footer className="mt-auto py-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] text-center text-[11px] text-[var(--color-muted)]">
        <p>
          All data in this tool is stored in your browser's localStorage. The page itself does not retain any user data.
        </p>
      </footer>

      {/* CSV Bulk Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportProducts={(rows) =>
          updateData((prev) => ({
            ...prev,
            products: [
              ...prev.products,
              ...rows.map((r, i) => ({ ...r, id: `p-imp-${Date.now()}-${i}` })),
            ],
          }))
        }
        onImportProcurement={(rows) =>
          updateData((prev) => ({
            ...prev,
            procurement: [
              ...prev.procurement,
              ...rows.map((r, i) => ({ ...r, id: `po-imp-${Date.now()}-${i}` })),
            ],
          }))
        }
        onImportSales={(rows) =>
          updateData((prev) => ({
            ...prev,
            sales: [
              ...prev.sales,
              ...rows.map((r, i) => ({ ...r, id: `s-imp-${Date.now()}-${i}` })),
            ],
          }))
        }
        onImportExpenses={(rows) =>
          updateData((prev) => ({
            ...prev,
            expenses: [
              ...prev.expenses,
              ...rows.map((r, i) => ({ ...r, id: `e-imp-${Date.now()}-${i}` })),
            ],
          }))
        }
        onImportFxRates={(rows) =>
          updateData((prev) => ({
            ...prev,
            fxRates: [
              ...prev.fxRates,
              ...rows.map((r, i) => ({ ...r, id: `fx-imp-${Date.now()}-${i}` })),
            ],
          }))
        }
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetData}
        title="Reset Baseline Dataset"
        message="Are you sure you want to reset all workbook sheets back to initial default values? Any changes you have entered will be discarded."
        confirmLabel="Confirm Reset"
      />
    </div>
  );
}
