export type Marketplace = 'US' | 'CA' | 'UK' | 'AU';

export type Currency = 'USD' | 'CAD' | 'GBP' | 'AUD';

export type AllocationBasis = 'By Volume (CBM)' | 'By Weight (KG)' | 'By Units';

export type CogsMethod = 'Historical Cumulative Weighted Average' | 'Latest Batch Standard Cost';

export interface ControlPanelParams {
  startMonth: string; // YYYY-MM
  endMonth: string; // YYYY-MM
  baseCurrencyCode: Currency;
  baseCurrencySymbol: string;
  freightAllocationBasis: AllocationBasis;
  cogsMethod: CogsMethod;
  validTxnSource: string;
  validAdsSource: string;
  validStorageSource: string;
  minGrossMarginThreshold: number; // e.g. 0.15 for 15%
  targetOperatingMarginThreshold: number; // e.g. 0.20 for 20%
  costVarianceThreshold: number; // e.g. 0.10 for 10%
}

export interface ProductMasterRow {
  id: string;
  marketplaceSku: string;
  marketplace: Marketplace;
  masterSku: string;
  productName: string;
  category: string;
  unitCbm: number;
  unitWeightKg: number;
  status: 'Active' | 'Discontinued';
}

export interface ProcurementBatchRow {
  id: string;
  poBatchId: string;
  shipmentId: string;
  effectiveMonth: string; // YYYY-MM
  masterSku: string;
  currency: Currency;
  receivedUnits: number;
  mfgUnitPrice: number;
  packagingUnitPrice: number;
  dutyAmount: number;
  prepAmount: number;
}

export interface SalesRecordRow {
  id: string;
  transactionId: string;
  month: string; // YYYY-MM
  marketplace: Marketplace;
  marketplaceSku: string;
  currency: Currency;
  grossUnitsSold: number;
  grossProductSales: number;
  returnedUnits: number;
  refundedAmount: number;
}

export interface ExpenseRecordRow {
  id: string;
  recordId: string;
  month: string; // YYYY-MM
  marketplace: Marketplace;
  marketplaceSku: string;
  reportSource: string;
  originalFeeType: string;
  currency: Currency;
  amountLocal: number;
}

export interface FxRateRow {
  id: string;
  month: string; // YYYY-MM
  currency: Currency;
  rateToBase: number; // 1 unit of currency = X base currency
}

export interface ShipmentFreightRow {
  id: string;
  shipmentId: string;
  month: string; // YYYY-MM
  currency: Currency;
  freightAmountLocal: number;
  ruleOverride: 'Default Global' | AllocationBasis;
}

export interface ValidationRefreshLog {
  moduleName: string;
  lastImportDate: string;
  operatorStatus: 'Verified' | 'Pending Update';
}

// Full application state for localStorage and backup
export interface AppData {
  controlPanel: ControlPanelParams;
  products: ProductMasterRow[];
  procurement: ProcurementBatchRow[];
  sales: SalesRecordRow[];
  expenses: ExpenseRecordRow[];
  fxRates: FxRateRow[];
  shipments: ShipmentFreightRow[];
  validationLogs: ValidationRefreshLog[];
  lastSavedTimestamp: string;
}

// Computed results
export interface ComputedProductMaster extends ProductMasterRow {
  settlementCurrency: Currency;
  historicalBatchCount: number;
  latestUnitLandedCostBase: number;
}

export interface ComputedProcurementBatch extends ProcurementBatchRow {
  batchTotalCbm: number;
  batchTotalKg: number;
  applicableFxRate: number;
  directCostBase: number;
  allocatedFreightBase: number;
  batchTotalLandedCostBase: number;
  unitLandedCostBase: number;
}

export interface ComputedSalesRecord extends SalesRecordRow {
  masterSku: string;
  netUnitsSold: number;
  netRevenueLocal: number;
  applicableFxRate: number;
  netRevenueBase: number;
}

export interface ComputedExpenseRecord extends ExpenseRecordRow {
  masterSku: string;
  standardCategory: 'Platform Commission & Fulfillment' | 'Advertising & Promotion' | 'Storage & Miscellaneous';
  dedupEffectiveFactor: 0 | 1;
  applicableFxRate: number;
  effectiveNetExpenseBase: number;
}

export interface ComputedShipmentFreight extends ShipmentFreightRow {
  effectiveRule: AllocationBasis;
  freightBase: number;
  shipmentTotalCbm: number;
  shipmentTotalKg: number;
  shipmentTotalUnits: number;
}

export interface ComputedCogsProfitRow {
  primaryKey: string; // month|marketplace|marketplaceSku
  month: string;
  marketplace: Marketplace;
  marketplaceSku: string;
  masterSku: string;
  productName: string;
  category: string;
  netUnitsSold: number;
  netRevenueBase: number;
  matchedUnitLandedCostBase: number;
  latestUnitLandedCostBase: number;
  costVarianceRate: number;
  totalCogsBase: number;
  grossProfitBase: number;
  grossMarginRate: number;
  commissionFbaBase: number;
  adSpendBase: number;
  storageMiscBase: number;
  totalExpensesBase: number;
  operatingProfitBase: number;
  operatingMarginRate: number;
  healthDiagnosis: string;
  isAnomaly: boolean;
}

export interface DashboardMarketSummary {
  marketplace: Marketplace;
  netUnits: number;
  netRevenueBase: number;
  totalCogsBase: number;
  grossMarginRate: number;
  totalExpensesBase: number;
  operatingProfitBase: number;
  operatingMarginRate: number;
}

export interface DashboardMonthlySummary {
  month: string;
  netRevenueBase: number;
  totalCogsBase: number;
  grossProfitBase: number;
  totalExpensesBase: number;
  operatingProfitBase: number;
  operatingMarginRate: number;
}

export interface DashboardMasterSkuSummary {
  masterSku: string;
  productName: string;
  category: string;
  netUnits: number;
  netRevenueBase: number;
  totalCogsBase: number;
  grossMarginRate: number;
  operatingProfitBase: number;
  operatingMarginRate: number;
  targetEvaluation: 'Target Met' | 'Optimization Needed' | 'Critical Loss Alert';
}

export interface ValidationSummary {
  orphanSkus: { marketplace: Marketplace; marketplaceSku: string; source: string }[];
  missingLandedCostSkus: { masterSku: string; productName: string }[];
  interceptedExpenses: { recordId: string; reportSource: string; feeType: string; amountLocal: number; currency: Currency }[];
  lowOrNegativeMarginSkus: { primaryKey: string; grossMarginRate: number; operatingProfitBase: number }[];
  costVolatilitySkus: { masterSku: string; historicalCost: number; latestCost: number; varianceRate: number }[];
}

export type SheetTab =
  | '01_Control_Panel'
  | '02_Product_Master'
  | '03_Procurement_Landed_Cost'
  | '04_Amazon_Sales_Data'
  | '05_Amazon_Expense_Data'
  | '06_FX_Allocation'
  | '07_COGS_Profit_Engine'
  | '08_Data_Validation'
  | '09_Profitability_Dashboard';
