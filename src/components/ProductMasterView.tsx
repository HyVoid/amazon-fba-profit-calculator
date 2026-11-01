import React, { useState } from 'react';
import { ProductMasterRow, ComputedProductMaster, Marketplace } from '../types';
import { Plus, Trash2, Search, Database } from 'lucide-react';
import { StatusPill } from './StatusPill';

interface ProductMasterViewProps {
  products: ComputedProductMaster[];
  onUpdateRow: (id: string, updated: Partial<ProductMasterRow>) => void;
  onAddRow: (newRow: Omit<ProductMasterRow, 'id'>) => void;
  onDeleteRow: (id: string) => void;
  baseCurrencySymbol: string;
}

export const ProductMasterView: React.FC<ProductMasterViewProps> = ({
  products,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  baseCurrencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('ALL');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.marketplaceSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.masterSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarket =
      selectedMarketplace === 'ALL' || p.marketplace === selectedMarketplace;

    return matchesSearch && matchesMarket;
  });

  const handleAddNew = () => {
    onAddRow({
      marketplaceSku: `US-NEW-${Date.now().toString().slice(-4)}`,
      marketplace: 'US',
      masterSku: 'PROD-NEW',
      productName: 'New Catalog Item',
      category: 'Home & Kitchen',
      unitCbm: 0.002,
      unitWeightKg: 0.5,
      status: 'Active',
    });
  };

  return (
    <div className="space-y-4 view-enter">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-heading text-2xl font-bold tracking-heading text-[var(--color-primary)]">
              Cross-Marketplace Product Master & SKU Mapping
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted)] font-mono">
            Sheet: 02_Product_Master | A:H (Manual Inputs) | I:K (Automated Dynamic Formula Columns)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Marketplace filter */}
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

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search SKU or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs w-48 sm:w-60 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add SKU</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th className="text-left">Marketplace SKU (A)</th>
                <th className="text-center">Mkt (B)</th>
                <th className="text-left">Master SKU (C)</th>
                <th className="text-left">Standard Name (D)</th>
                <th className="text-left">Category (E)</th>
                <th className="text-right">Unit CBM (F)</th>
                <th className="text-right">Unit KG (G)</th>
                <th className="text-center">Status (H)</th>
                <th className="text-center bg-[rgba(5,28,44,0.08)]">Settlement Curr (I#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">PO Batches (J#)</th>
                <th className="text-right bg-[rgba(5,28,44,0.08)]">
                  Latest Landed ({baseCurrencySymbol}) (K#)
                </th>
                <th className="text-center w-12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-[var(--color-muted)]">
                    No matching products found. Click "Add SKU" to insert a new mapping.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const hasNoLandedCost = p.status === 'Active' && p.historicalBatchCount === 0;

                  return (
                    <tr key={p.id} className={hasNoLandedCost ? 'anomaly-row' : ''}>
                      {/* Marketplace SKU (Editable) */}
                      <td>
                        <input
                          type="text"
                          value={p.marketplaceSku}
                          onChange={(e) =>
                            onUpdateRow(p.id, { marketplaceSku: e.target.value })
                          }
                          className="editable-input font-mono text-xs w-36"
                        />
                      </td>

                      {/* Marketplace (Editable) */}
                      <td className="text-center">
                        <select
                          value={p.marketplace}
                          onChange={(e) =>
                            onUpdateRow(p.id, {
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

                      {/* Master SKU (Editable) */}
                      <td>
                        <input
                          type="text"
                          value={p.masterSku}
                          onChange={(e) =>
                            onUpdateRow(p.id, { masterSku: e.target.value })
                          }
                          className="editable-input font-mono font-medium text-xs w-28"
                        />
                      </td>

                      {/* Product Name (Editable) */}
                      <td>
                        <input
                          type="text"
                          value={p.productName}
                          onChange={(e) =>
                            onUpdateRow(p.id, { productName: e.target.value })
                          }
                          className="editable-input text-xs w-48"
                        />
                      </td>

                      {/* Category (Editable) */}
                      <td>
                        <input
                          type="text"
                          value={p.category}
                          onChange={(e) =>
                            onUpdateRow(p.id, { category: e.target.value })
                          }
                          className="editable-input text-xs w-32"
                        />
                      </td>

                      {/* Unit CBM (Editable) */}
                      <td className="text-right">
                        <input
                          type="number"
                          step="0.0001"
                          value={p.unitCbm}
                          onChange={(e) =>
                            onUpdateRow(p.id, {
                              unitCbm: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-20"
                        />
                      </td>

                      {/* Unit Weight KG (Editable) */}
                      <td className="text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={p.unitWeightKg}
                          onChange={(e) =>
                            onUpdateRow(p.id, {
                              unitWeightKg: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="editable-input text-xs text-right font-mono w-20"
                        />
                      </td>

                      {/* Status (Editable) */}
                      <td className="text-center">
                        <select
                          value={p.status}
                          onChange={(e) =>
                            onUpdateRow(p.id, {
                              status: e.target.value as 'Active' | 'Discontinued',
                            })
                          }
                          className="editable-input text-xs cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Discontinued">Discontinued</option>
                        </select>
                      </td>

                      {/* Formula Generated: Settlement Currency */}
                      <td className="text-center font-mono text-xs bg-gray-50/70 font-medium">
                        {p.settlementCurrency}
                      </td>

                      {/* Formula Generated: Historical Batch Count */}
                      <td className="text-right font-mono text-xs bg-gray-50/70">
                        {p.historicalBatchCount === 0 ? (
                          <span className="text-[var(--color-negative)] font-semibold">0 batches</span>
                        ) : (
                          `${p.historicalBatchCount} batches`
                        )}
                      </td>

                      {/* Formula Generated: Latest Landed Cost Base */}
                      <td className="text-right font-mono text-xs bg-gray-50/70 font-medium">
                        {p.latestUnitLandedCostBase > 0 ? (
                          `${baseCurrencySymbol}${p.latestUnitLandedCostBase.toFixed(2)}`
                        ) : (
                          <span className="text-[var(--color-negative)] font-semibold">Missing Cost</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <button
                          onClick={() => onDeleteRow(p.id)}
                          title="Delete row"
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
