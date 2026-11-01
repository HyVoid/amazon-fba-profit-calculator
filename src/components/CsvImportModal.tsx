import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import {
  ProductMasterRow,
  ProcurementBatchRow,
  SalesRecordRow,
  ExpenseRecordRow,
  FxRateRow,
  ShipmentFreightRow,
} from '../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (rows: Omit<ProductMasterRow, 'id'>[]) => void;
  onImportProcurement: (rows: Omit<ProcurementBatchRow, 'id'>[]) => void;
  onImportSales: (rows: Omit<SalesRecordRow, 'id'>[]) => void;
  onImportExpenses: (rows: Omit<ExpenseRecordRow, 'id'>[]) => void;
  onImportFxRates: (rows: Omit<FxRateRow, 'id'>[]) => void;
}

type ImportTarget =
  | '02_Product_Master'
  | '03_Procurement_Landed_Cost'
  | '04_Amazon_Sales_Data'
  | '05_Amazon_Expense_Data'
  | '06_FX_Allocation';

const SAMPLE_TEMPLATES: Record<ImportTarget, { headers: string[]; sample: string }> = {
  '02_Product_Master': {
    headers: [
      'marketplaceSku',
      'marketplace',
      'masterSku',
      'productName',
      'category',
      'unitCbm',
      'unitWeightKg',
      'status',
    ],
    sample:
      'marketplaceSku,marketplace,masterSku,productName,category,unitCbm,unitWeightKg,status\nUS-PROD-006-F,US,PROD-006,Cold Brew Coffee Pitcher,Coffee & Tea,0.0035,0.75,Active\nCA-PROD-006-F,CA,PROD-006,Cold Brew Coffee Pitcher,Coffee & Tea,0.0035,0.75,Active',
  },
  '03_Procurement_Landed_Cost': {
    headers: [
      'poBatchId',
      'shipmentId',
      'effectiveMonth',
      'masterSku',
      'currency',
      'receivedUnits',
      'mfgUnitPrice',
      'packagingUnitPrice',
      'dutyAmount',
      'prepAmount',
    ],
    sample:
      'poBatchId,shipmentId,effectiveMonth,masterSku,currency,receivedUnits,mfgUnitPrice,packagingUnitPrice,dutyAmount,prepAmount\nPO-202603-09,SHIP-2026-003,2026-03,PROD-003,USD,2500,4.60,0.50,550.00,220.00',
  },
  '04_Amazon_Sales_Data': {
    headers: [
      'transactionId',
      'month',
      'marketplace',
      'marketplaceSku',
      'currency',
      'grossUnitsSold',
      'grossProductSales',
      'returnedUnits',
      'refundedAmount',
    ],
    sample:
      'transactionId,month,marketplace,marketplaceSku,currency,grossUnitsSold,grossProductSales,returnedUnits,refundedAmount\nTXN-202603-US-101,2026-03,US,US-PROD-001-A,USD,400,12800.00,12,384.00',
  },
  '05_Amazon_Expense_Data': {
    headers: [
      'recordId',
      'month',
      'marketplace',
      'marketplaceSku',
      'reportSource',
      'originalFeeType',
      'currency',
      'amountLocal',
    ],
    sample:
      'recordId,month,marketplace,marketplaceSku,reportSource,originalFeeType,currency,amountLocal\nEXP-202603-US-101,2026-03,US,US-PROD-001-A,Settlement_Report,Referral Fee,USD,1850.00\nEXP-202603-US-102,2026-03,US,US-PROD-001-A,Sponsored_Ads_Report,PPC Spend,USD,1600.00',
  },
  '06_FX_Allocation': {
    headers: ['month', 'currency', 'rateToBase'],
    sample: 'month,currency,rateToBase\n2026-04,USD,1.3800\n2026-04,CAD,1.0000\n2026-04,GBP,1.7500\n2026-04,AUD,0.8950',
  },
};

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
  onImportProcurement,
  onImportSales,
  onImportExpenses,
  onImportFxRates,
}) => {
  const [target, setTarget] = useState<ImportTarget>('04_Amazon_Sales_Data');
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setCsvText(SAMPLE_TEMPLATES[target].sample);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setError(null);
    setSuccessCount(null);

    if (!csvText.trim()) {
      setError('Please paste CSV text or select a file to import.');
      return;
    }

    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setError('CSV requires at least a header row and one data row.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const dataLines = lines.slice(1);

    try {
      if (target === '02_Product_Master') {
        const rows: Omit<ProductMasterRow, 'id'>[] = dataLines.map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          return {
            marketplaceSku: cols[0] || 'SKU-NEW',
            marketplace: (cols[1] || 'US') as any,
            masterSku: cols[2] || 'PROD-NEW',
            productName: cols[3] || 'New Product',
            category: cols[4] || 'General',
            unitCbm: parseFloat(cols[5]) || 0.002,
            unitWeightKg: parseFloat(cols[6]) || 0.5,
            status: (cols[7] === 'Discontinued' ? 'Discontinued' : 'Active') as any,
          };
        });
        onImportProducts(rows);
        setSuccessCount(rows.length);
      } else if (target === '03_Procurement_Landed_Cost') {
        const rows: Omit<ProcurementBatchRow, 'id'>[] = dataLines.map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          return {
            poBatchId: cols[0] || 'PO-NEW',
            shipmentId: cols[1] || 'SHIP-NEW',
            effectiveMonth: cols[2] || '2026-03',
            masterSku: cols[3] || 'PROD-001',
            currency: (cols[4] || 'USD') as any,
            receivedUnits: parseInt(cols[5]) || 1000,
            mfgUnitPrice: parseFloat(cols[6]) || 5.0,
            packagingUnitPrice: parseFloat(cols[7]) || 0.5,
            dutyAmount: parseFloat(cols[8]) || 0,
            prepAmount: parseFloat(cols[9]) || 0,
          };
        });
        onImportProcurement(rows);
        setSuccessCount(rows.length);
      } else if (target === '04_Amazon_Sales_Data') {
        const rows: Omit<SalesRecordRow, 'id'>[] = dataLines.map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          return {
            transactionId: cols[0] || `TXN-${Date.now()}`,
            month: cols[1] || '2026-03',
            marketplace: (cols[2] || 'US') as any,
            marketplaceSku: cols[3] || 'US-PROD-001-A',
            currency: (cols[4] || 'USD') as any,
            grossUnitsSold: parseInt(cols[5]) || 0,
            grossProductSales: parseFloat(cols[6]) || 0,
            returnedUnits: parseInt(cols[7]) || 0,
            refundedAmount: parseFloat(cols[8]) || 0,
          };
        });
        onImportSales(rows);
        setSuccessCount(rows.length);
      } else if (target === '05_Amazon_Expense_Data') {
        const rows: Omit<ExpenseRecordRow, 'id'>[] = dataLines.map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          return {
            recordId: cols[0] || `EXP-${Date.now()}`,
            month: cols[1] || '2026-03',
            marketplace: (cols[2] || 'US') as any,
            marketplaceSku: cols[3] || 'US-PROD-001-A',
            reportSource: cols[4] || 'Settlement_Report',
            originalFeeType: cols[5] || 'Referral Fee',
            currency: (cols[6] || 'USD') as any,
            amountLocal: parseFloat(cols[7]) || 0,
          };
        });
        onImportExpenses(rows);
        setSuccessCount(rows.length);
      } else if (target === '06_FX_Allocation') {
        const rows: Omit<FxRateRow, 'id'>[] = dataLines.map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          return {
            month: cols[0] || '2026-04',
            currency: (cols[1] || 'USD') as any,
            rateToBase: parseFloat(cols[2]) || 1.0,
          };
        });
        onImportFxRates(rows);
        setSuccessCount(rows.length);
      }

      setTimeout(() => {
        onClose();
        setSuccessCount(null);
        setCsvText('');
      }, 1200);
    } catch (err: any) {
      setError(`Import parsing failed: ${err.message || 'Check CSV column alignment.'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(5,28,44,0.4)] backdrop-blur-sm">
      <div className="app-card w-full max-w-2xl overflow-hidden shadow-[var(--shadow-lg)] border border-[var(--color-border)]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="font-heading text-xl font-bold text-[var(--color-primary)]">
              Bulk CSV Import
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Sheet Select */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-label text-[var(--color-primary)] mb-1">
              Destination Table
            </label>
            <select
              value={target}
              onChange={(e) => {
                setTarget(e.target.value as ImportTarget);
                setError(null);
                setSuccessCount(null);
              }}
              className="editable-input w-full cursor-pointer text-xs font-medium"
            >
              <option value="04_Amazon_Sales_Data">04_Amazon_Sales_Data (Sales & Returns)</option>
              <option value="05_Amazon_Expense_Data">05_Amazon_Expense_Data (Operating Expenses)</option>
              <option value="03_Procurement_Landed_Cost">03_Procurement_Landed_Cost (Alibaba Batches)</option>
              <option value="02_Product_Master">02_Product_Master (Product & SKU Catalog)</option>
              <option value="06_FX_Allocation">06_FX_Allocation (Monthly FX Rates)</option>
            </select>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--color-muted)]">
              Paste comma-separated text or choose a CSV file:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] text-[var(--color-accent)] hover:underline font-medium cursor-pointer"
              >
                Load Sample CSV
              </button>
              <label className="text-[11px] text-[var(--color-primary)] bg-[var(--color-bg)] px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] cursor-pointer hover:bg-gray-200">
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              rows={7}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste CSV rows here..."
              className="editable-input w-full font-mono text-[11px] leading-relaxed resize-y"
            />
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-3 rounded bg-red-50 text-[var(--color-negative)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 rounded bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Successfully imported {successCount} rows into {target}!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-primary)] text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Process & Import</span>
          </button>
        </div>
      </div>
    </div>
  );
};
