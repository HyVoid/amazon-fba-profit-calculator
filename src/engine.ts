import {
  AppData,
  ComputedProductMaster,
  ComputedProcurementBatch,
  ComputedSalesRecord,
  ComputedExpenseRecord,
  ComputedShipmentFreight,
  ComputedCogsProfitRow,
  DashboardMarketSummary,
  DashboardMonthlySummary,
  DashboardMasterSkuSummary,
  ValidationSummary,
  Marketplace,
  Currency,
} from './types';

export function getFxRate(
  month: string,
  currency: Currency,
  baseCurrency: Currency,
  fxRates: AppData['fxRates']
): number {
  if (currency === baseCurrency) return 1.0;
  const match = fxRates.find((f) => f.month === month && f.currency === currency);
  return match ? match.rateToBase : 0.0;
}

export function computeShipments(
  shipments: AppData['shipments'],
  procurement: AppData['procurement'],
  products: AppData['products'],
  fxRates: AppData['fxRates'],
  baseCurrency: Currency,
  globalRule: AppData['controlPanel']['freightAllocationBasis']
): ComputedShipmentFreight[] {
  return shipments.map((shipment) => {
    const effectiveRule =
      shipment.ruleOverride === 'Default Global'
        ? globalRule
        : shipment.ruleOverride;

    const fxRate = getFxRate(shipment.month, shipment.currency, baseCurrency, fxRates);
    const freightBase = shipment.freightAmountLocal * fxRate;

    // Filter procurement batches tied to this shipment
    const relatedBatches = procurement.filter((b) => b.shipmentId === shipment.shipmentId);

    let shipmentTotalCbm = 0;
    let shipmentTotalKg = 0;
    let shipmentTotalUnits = 0;

    for (const batch of relatedBatches) {
      const product = products.find((p) => p.masterSku === batch.masterSku);
      const unitCbm = product ? product.unitCbm : 0;
      const unitWeightKg = product ? product.unitWeightKg : 0;

      shipmentTotalCbm += batch.receivedUnits * unitCbm;
      shipmentTotalKg += batch.receivedUnits * unitWeightKg;
      shipmentTotalUnits += batch.receivedUnits;
    }

    return {
      ...shipment,
      effectiveRule,
      freightBase,
      shipmentTotalCbm,
      shipmentTotalKg,
      shipmentTotalUnits,
    };
  });
}

export function computeProcurementBatches(
  procurement: AppData['procurement'],
  products: AppData['products'],
  computedShipments: ComputedShipmentFreight[],
  fxRates: AppData['fxRates'],
  baseCurrency: Currency
): ComputedProcurementBatch[] {
  return procurement.map((batch) => {
    const product = products.find((p) => p.masterSku === batch.masterSku);
    const unitCbm = product ? product.unitCbm : 0;
    const unitWeightKg = product ? product.unitWeightKg : 0;

    const batchTotalCbm = batch.receivedUnits * unitCbm;
    const batchTotalKg = batch.receivedUnits * unitWeightKg;

    const applicableFxRate = getFxRate(
      batch.effectiveMonth,
      batch.currency,
      baseCurrency,
      fxRates
    );

    const directCostBase =
      ((batch.mfgUnitPrice + batch.packagingUnitPrice) * batch.receivedUnits +
        batch.dutyAmount +
        batch.prepAmount) *
      applicableFxRate;

    const shipment = computedShipments.find((s) => s.shipmentId === batch.shipmentId);
    let allocatedFreightBase = 0;

    if (shipment) {
      let weightRatio = 0;
      if (shipment.effectiveRule === 'By Volume (CBM)') {
        weightRatio =
          shipment.shipmentTotalCbm > 0 ? batchTotalCbm / shipment.shipmentTotalCbm : 0;
      } else if (shipment.effectiveRule === 'By Weight (KG)') {
        weightRatio =
          shipment.shipmentTotalKg > 0 ? batchTotalKg / shipment.shipmentTotalKg : 0;
      } else {
        weightRatio =
          shipment.shipmentTotalUnits > 0
            ? batch.receivedUnits / shipment.shipmentTotalUnits
            : 0;
      }
      allocatedFreightBase = shipment.freightBase * weightRatio;
    }

    const batchTotalLandedCostBase = directCostBase + allocatedFreightBase;
    const unitLandedCostBase =
      batch.receivedUnits > 0 ? batchTotalLandedCostBase / batch.receivedUnits : 0;

    return {
      ...batch,
      batchTotalCbm,
      batchTotalKg,
      applicableFxRate,
      directCostBase,
      allocatedFreightBase,
      batchTotalLandedCostBase,
      unitLandedCostBase,
    };
  });
}

export function computeProductMaster(
  products: AppData['products'],
  computedBatches: ComputedProcurementBatch[]
): ComputedProductMaster[] {
  return products.map((product) => {
    let settlementCurrency: Currency = 'USD';
    if (product.marketplace === 'CA') settlementCurrency = 'CAD';
    else if (product.marketplace === 'UK') settlementCurrency = 'GBP';
    else if (product.marketplace === 'AU') settlementCurrency = 'AUD';

    const relatedBatches = computedBatches.filter(
      (b) => b.masterSku === product.masterSku
    );
    const historicalBatchCount = relatedBatches.length;

    // Latest unit landed cost
    let latestUnitLandedCostBase = 0;
    if (relatedBatches.length > 0) {
      // Sort by effectiveMonth desc
      const sorted = [...relatedBatches].sort((a, b) =>
        b.effectiveMonth.localeCompare(a.effectiveMonth)
      );
      latestUnitLandedCostBase = sorted[0].unitLandedCostBase;
    }

    return {
      ...product,
      settlementCurrency,
      historicalBatchCount,
      latestUnitLandedCostBase,
    };
  });
}

export function computeSales(
  sales: AppData['sales'],
  products: AppData['products'],
  fxRates: AppData['fxRates'],
  baseCurrency: Currency
): ComputedSalesRecord[] {
  return sales.map((sale) => {
    const product = products.find((p) => p.marketplaceSku === sale.marketplaceSku);
    const masterSku = product ? product.masterSku : 'UNMAPPED_SKU';

    const netUnitsSold = sale.grossUnitsSold - sale.returnedUnits;
    const netRevenueLocal = sale.grossProductSales - sale.refundedAmount;

    const applicableFxRate = getFxRate(sale.month, sale.currency, baseCurrency, fxRates);
    const netRevenueBase = netRevenueLocal * applicableFxRate;

    return {
      ...sale,
      masterSku,
      netUnitsSold,
      netRevenueLocal,
      applicableFxRate,
      netRevenueBase,
    };
  });
}

export function computeExpenses(
  expenses: AppData['expenses'],
  products: AppData['products'],
  fxRates: AppData['fxRates'],
  baseCurrency: Currency,
  controlPanel: AppData['controlPanel']
): ComputedExpenseRecord[] {
  const seenRecordIds = new Set<string>();

  return expenses.map((expense) => {
    const product = products.find((p) => p.marketplaceSku === expense.marketplaceSku);
    const masterSku = product ? product.masterSku : 'UNMAPPED_SKU';

    // Standard Category Mapping
    let standardCategory: ComputedExpenseRecord['standardCategory'] =
      'Storage & Miscellaneous';
    const fee = expense.originalFeeType.toLowerCase();
    if (
      fee.includes('referral') ||
      fee.includes('fulfillment') ||
      fee.includes('fba') ||
      fee.includes('refund commission')
    ) {
      standardCategory = 'Platform Commission & Fulfillment';
    } else if (
      fee.includes('ppc') ||
      fee.includes('ad') ||
      fee.includes('sponsor')
    ) {
      standardCategory = 'Advertising & Promotion';
    }

    // Deduplication check:
    // 1. Report source matches authoritative source
    let sourceMatch = false;
    if (standardCategory === 'Platform Commission & Fulfillment') {
      sourceMatch = expense.reportSource === controlPanel.validTxnSource;
    } else if (standardCategory === 'Advertising & Promotion') {
      sourceMatch = expense.reportSource === controlPanel.validAdsSource;
    } else {
      sourceMatch = expense.reportSource === controlPanel.validStorageSource;
    }

    // 2. Unique record check
    const isFirstOccurrence = !seenRecordIds.has(expense.recordId);
    seenRecordIds.add(expense.recordId);

    const dedupEffectiveFactor: 0 | 1 = sourceMatch && isFirstOccurrence ? 1 : 0;

    const applicableFxRate = getFxRate(
      expense.month,
      expense.currency,
      baseCurrency,
      fxRates
    );

    const effectiveNetExpenseBase =
      expense.amountLocal * dedupEffectiveFactor * applicableFxRate;

    return {
      ...expense,
      masterSku,
      standardCategory,
      dedupEffectiveFactor,
      applicableFxRate,
      effectiveNetExpenseBase,
    };
  });
}

export function computeCogsProfitEngine(
  computedSales: ComputedSalesRecord[],
  computedExpenses: ComputedExpenseRecord[],
  computedBatches: ComputedProcurementBatch[],
  computedProducts: ComputedProductMaster[],
  controlPanel: AppData['controlPanel']
): ComputedCogsProfitRow[] {
  // Filter sales within startMonth and endMonth
  const activeSales = computedSales.filter(
    (s) => s.month >= controlPanel.startMonth && s.month <= controlPanel.endMonth
  );

  // Group by unique month | marketplace | marketplaceSku
  const groupedKeys = new Map<string, ComputedSalesRecord[]>();
  for (const sale of activeSales) {
    const key = `${sale.month}|${sale.marketplace}|${sale.marketplaceSku}`;
    const group = groupedKeys.get(key) || [];
    group.push(sale);
    groupedKeys.set(key, group);
  }

  const results: ComputedCogsProfitRow[] = [];

  for (const [key, salesInGroup] of groupedKeys.entries()) {
    const [month, marketplace, marketplaceSku] = key.split('|') as [
      string,
      Marketplace,
      string,
    ];

    const product = computedProducts.find((p) => p.marketplaceSku === marketplaceSku);
    const masterSku = product ? product.masterSku : 'UNMAPPED_SKU';
    const productName = product ? product.productName : 'Unmapped Product';
    const category = product ? product.category : 'Unknown Category';

    const netUnitsSold = salesInGroup.reduce((sum, s) => sum + s.netUnitsSold, 0);
    const netRevenueBase = salesInGroup.reduce((sum, s) => sum + s.netRevenueBase, 0);

    // Latest unit landed cost for this masterSku
    const allMasterBatches = computedBatches.filter((b) => b.masterSku === masterSku);
    let latestUnitLandedCostBase = 0;
    if (allMasterBatches.length > 0) {
      const sorted = [...allMasterBatches].sort((a, b) =>
        b.effectiveMonth.localeCompare(a.effectiveMonth)
      );
      latestUnitLandedCostBase = sorted[0].unitLandedCostBase;
    }

    // Matched unit landed cost
    let matchedUnitLandedCostBase = 0;
    if (controlPanel.cogsMethod === 'Historical Cumulative Weighted Average') {
      // batches where effectiveMonth <= month
      const eligibleBatches = allMasterBatches.filter((b) => b.effectiveMonth <= month);
      const totalCost = eligibleBatches.reduce(
        (sum, b) => sum + b.batchTotalLandedCostBase,
        0
      );
      const totalUnits = eligibleBatches.reduce((sum, b) => sum + b.receivedUnits, 0);

      matchedUnitLandedCostBase =
        totalUnits > 0 ? totalCost / totalUnits : latestUnitLandedCostBase;
    } else {
      matchedUnitLandedCostBase = latestUnitLandedCostBase;
    }

    const costVarianceRate =
      matchedUnitLandedCostBase > 0
        ? (latestUnitLandedCostBase - matchedUnitLandedCostBase) /
          matchedUnitLandedCostBase
        : 0;

    const totalCogsBase = netUnitsSold * matchedUnitLandedCostBase;
    const grossProfitBase = netRevenueBase - totalCogsBase;
    const grossMarginRate = netRevenueBase > 0 ? grossProfitBase / netRevenueBase : 0;

    // Filter expenses matching this month, marketplace, and marketplaceSku
    const matchingExpenses = computedExpenses.filter(
      (e) =>
        e.month === month &&
        e.marketplace === marketplace &&
        e.marketplaceSku === marketplaceSku
    );

    const commissionFbaBase = matchingExpenses
      .filter((e) => e.standardCategory === 'Platform Commission & Fulfillment')
      .reduce((sum, e) => sum + e.effectiveNetExpenseBase, 0);

    const adSpendBase = matchingExpenses
      .filter((e) => e.standardCategory === 'Advertising & Promotion')
      .reduce((sum, e) => sum + e.effectiveNetExpenseBase, 0);

    const storageMiscBase = matchingExpenses
      .filter((e) => e.standardCategory === 'Storage & Miscellaneous')
      .reduce((sum, e) => sum + e.effectiveNetExpenseBase, 0);

    const totalExpensesBase = commissionFbaBase + adSpendBase + storageMiscBase;
    const operatingProfitBase = grossProfitBase - totalExpensesBase;
    const operatingMarginRate =
      netRevenueBase > 0 ? operatingProfitBase / netRevenueBase : 0;

    // Health Diagnosis
    let healthDiagnosis = '🔵 Compliant Margin';
    let isAnomaly = false;

    if (masterSku === 'UNMAPPED_SKU') {
      healthDiagnosis = '❌ Unmapped SKU';
      isAnomaly = true;
    } else if (matchedUnitLandedCostBase <= 0) {
      healthDiagnosis = '⚠️ Landed Cost Missing';
      isAnomaly = true;
    } else if (operatingProfitBase < 0) {
      healthDiagnosis = '🔴 Critical Net Loss';
      isAnomaly = true;
    } else if (grossMarginRate < controlPanel.minGrossMarginThreshold) {
      healthDiagnosis = '🟠 Low Gross Margin';
      isAnomaly = true;
    } else if (Math.abs(costVarianceRate) > controlPanel.costVarianceThreshold) {
      healthDiagnosis = '🟡 High Cost Volatility';
    } else if (operatingMarginRate >= controlPanel.targetOperatingMarginThreshold) {
      healthDiagnosis = '🟢 Star Performer';
    }

    results.push({
      primaryKey: key,
      month,
      marketplace,
      marketplaceSku,
      masterSku,
      productName,
      category,
      netUnitsSold,
      netRevenueBase,
      matchedUnitLandedCostBase,
      latestUnitLandedCostBase,
      costVarianceRate,
      totalCogsBase,
      grossProfitBase,
      grossMarginRate,
      commissionFbaBase,
      adSpendBase,
      storageMiscBase,
      totalExpensesBase,
      operatingProfitBase,
      operatingMarginRate,
      healthDiagnosis,
      isAnomaly,
    });
  }

  // Sort results by month asc, marketplace asc, marketplaceSku asc
  results.sort((a, b) => a.primaryKey.localeCompare(b.primaryKey));

  return results;
}

export function computeValidationSummary(
  computedSales: ComputedSalesRecord[],
  computedExpenses: ComputedExpenseRecord[],
  products: AppData['products'],
  computedBatches: ComputedProcurementBatch[],
  profitRows: ComputedCogsProfitRow[],
  controlPanel: AppData['controlPanel']
): ValidationSummary {
  // Orphan SKUs
  const orphanMap = new Map<string, { marketplace: Marketplace; marketplaceSku: string; source: string }>();
  for (const s of computedSales) {
    if (s.masterSku === 'UNMAPPED_SKU') {
      orphanMap.set(`${s.marketplace}|${s.marketplaceSku}`, {
        marketplace: s.marketplace,
        marketplaceSku: s.marketplaceSku,
        source: 'Sales Record',
      });
    }
  }
  for (const e of computedExpenses) {
    if (e.masterSku === 'UNMAPPED_SKU') {
      orphanMap.set(`${e.marketplace}|${e.marketplaceSku}`, {
        marketplace: e.marketplace,
        marketplaceSku: e.marketplaceSku,
        source: 'Expense Record',
      });
    }
  }

  // Missing Landed Cost for active products
  const uniqueActiveMasters = Array.from(
    new Set(products.filter((p) => p.status === 'Active').map((p) => p.masterSku))
  );
  const missingCostMasters = uniqueActiveMasters
    .filter((msku) => !computedBatches.some((b) => b.masterSku === msku))
    .map((msku) => {
      const prod = products.find((p) => p.masterSku === msku);
      return {
        masterSku: msku,
        productName: prod ? prod.productName : 'Active Product',
      };
    });

  // Intercepted / Deduplicated Expenses
  const interceptedExpenses = computedExpenses
    .filter((e) => e.dedupEffectiveFactor === 0)
    .map((e) => ({
      recordId: e.recordId,
      reportSource: e.reportSource,
      feeType: e.originalFeeType,
      amountLocal: e.amountLocal,
      currency: e.currency,
    }));

  // Low or negative margin SKUs
  const lowOrNegativeMarginSkus = profitRows
    .filter(
      (r) =>
        r.operatingProfitBase < 0 ||
        r.grossMarginRate < controlPanel.minGrossMarginThreshold
    )
    .map((r) => ({
      primaryKey: r.primaryKey,
      grossMarginRate: r.grossMarginRate,
      operatingProfitBase: r.operatingProfitBase,
    }));

  // Cost volatility SKUs
  const costVolatilityMap = new Map<string, { historicalCost: number; latestCost: number; varianceRate: number }>();
  for (const r of profitRows) {
    if (Math.abs(r.costVarianceRate) > controlPanel.costVarianceThreshold) {
      costVolatilityMap.set(r.masterSku, {
        historicalCost: r.matchedUnitLandedCostBase,
        latestCost: r.latestUnitLandedCostBase,
        varianceRate: r.costVarianceRate,
      });
    }
  }

  const costVolatilitySkus = Array.from(costVolatilityMap.entries()).map(
    ([masterSku, val]) => ({
      masterSku,
      ...val,
    })
  );

  return {
    orphanSkus: Array.from(orphanMap.values()),
    missingLandedCostSkus: missingCostMasters,
    interceptedExpenses,
    lowOrNegativeMarginSkus,
    costVolatilitySkus,
  };
}

export function computeDashboardRollups(
  profitRows: ComputedCogsProfitRow[],
  selectedMarketplace: string, // 'ALL' or 'US', 'CA', etc.
  selectedCategory: string, // 'ALL' or category name
  targetMarginThreshold: number
) {
  // 1. Filtered rows by marketplace
  const marketFilteredRows =
    selectedMarketplace === 'ALL'
      ? profitRows
      : profitRows.filter((r) => r.marketplace === selectedMarketplace);

  // Consolidated KPI Cards
  const totalNetRevenueBase = marketFilteredRows.reduce((sum, r) => sum + r.netRevenueBase, 0);
  const totalCogsBase = marketFilteredRows.reduce((sum, r) => sum + r.totalCogsBase, 0);
  const totalExpensesBase = marketFilteredRows.reduce((sum, r) => sum + r.totalExpensesBase, 0);
  const totalOperatingProfitBase = marketFilteredRows.reduce(
    (sum, r) => sum + r.operatingProfitBase,
    0
  );
  const consolidatedOperatingMarginRate =
    totalNetRevenueBase > 0 ? totalOperatingProfitBase / totalNetRevenueBase : 0;

  // 2. Multi-Marketplace Comparative Matrix (all 4 marketplaces)
  const markets: Marketplace[] = ['US', 'CA', 'UK', 'AU'];
  const marketSummaries: DashboardMarketSummary[] = markets.map((mkt) => {
    const rows = profitRows.filter((r) => r.marketplace === mkt);
    const netUnits = rows.reduce((sum, r) => sum + r.netUnitsSold, 0);
    const netRevenueBase = rows.reduce((sum, r) => sum + r.netRevenueBase, 0);
    const cogsBase = rows.reduce((sum, r) => sum + r.totalCogsBase, 0);
    const grossMarginRate =
      netRevenueBase > 0 ? (netRevenueBase - cogsBase) / netRevenueBase : 0;
    const expensesBase = rows.reduce((sum, r) => sum + r.totalExpensesBase, 0);
    const opProfitBase = rows.reduce((sum, r) => sum + r.operatingProfitBase, 0);
    const opMarginRate = netRevenueBase > 0 ? opProfitBase / netRevenueBase : 0;

    return {
      marketplace: mkt,
      netUnits,
      netRevenueBase,
      totalCogsBase: cogsBase,
      grossMarginRate,
      totalExpensesBase: expensesBase,
      operatingProfitBase: opProfitBase,
      operatingMarginRate: opMarginRate,
    };
  });

  // 3. Monthly Profitability Trend Time Series (responsive to selectedMarketplace)
  const uniqueMonths = Array.from(new Set(marketFilteredRows.map((r) => r.month))).sort();
  const monthlySummaries: DashboardMonthlySummary[] = uniqueMonths.map((m) => {
    const rows = marketFilteredRows.filter((r) => r.month === m);
    const netRevenueBase = rows.reduce((sum, r) => sum + r.netRevenueBase, 0);
    const cogsBase = rows.reduce((sum, r) => sum + r.totalCogsBase, 0);
    const grossProfitBase = netRevenueBase - cogsBase;
    const expensesBase = rows.reduce((sum, r) => sum + r.totalExpensesBase, 0);
    const opProfitBase = rows.reduce((sum, r) => sum + r.operatingProfitBase, 0);
    const opMarginRate = netRevenueBase > 0 ? opProfitBase / netRevenueBase : 0;

    return {
      month: m,
      netRevenueBase,
      totalCogsBase: cogsBase,
      grossProfitBase,
      totalExpensesBase: expensesBase,
      operatingProfitBase: opProfitBase,
      operatingMarginRate: opMarginRate,
    };
  });

  // 4. Master SKU Cross-Marketplace Leaderboard (responsive to both selectedMarketplace & selectedCategory)
  let skuFilteredRows = marketFilteredRows;
  if (selectedCategory !== 'ALL') {
    skuFilteredRows = skuFilteredRows.filter((r) => r.category === selectedCategory);
  }

  const uniqueMasterSkus = Array.from(new Set(skuFilteredRows.map((r) => r.masterSku))).sort();
  const masterSkuSummaries: DashboardMasterSkuSummary[] = uniqueMasterSkus.map((msku) => {
    const rows = skuFilteredRows.filter((r) => r.masterSku === msku);
    const firstRow = rows[0];
    const productName = firstRow ? firstRow.productName : msku;
    const category = firstRow ? firstRow.category : 'General';

    const netUnits = rows.reduce((sum, r) => sum + r.netUnitsSold, 0);
    const netRevenueBase = rows.reduce((sum, r) => sum + r.netRevenueBase, 0);
    const cogsBase = rows.reduce((sum, r) => sum + r.totalCogsBase, 0);
    const grossMarginRate =
      netRevenueBase > 0 ? (netRevenueBase - cogsBase) / netRevenueBase : 0;
    const opProfitBase = rows.reduce((sum, r) => sum + r.operatingProfitBase, 0);
    const opMarginRate = netRevenueBase > 0 ? opProfitBase / netRevenueBase : 0;

    let targetEvaluation: DashboardMasterSkuSummary['targetEvaluation'] =
      'Optimization Needed';
    if (opProfitBase < 0) {
      targetEvaluation = 'Critical Loss Alert';
    } else if (opMarginRate >= targetMarginThreshold) {
      targetEvaluation = 'Target Met';
    }

    return {
      masterSku: msku,
      productName,
      category,
      netUnits,
      netRevenueBase,
      totalCogsBase: cogsBase,
      grossMarginRate,
      operatingProfitBase: opProfitBase,
      operatingMarginRate: opMarginRate,
      targetEvaluation,
    };
  });

  // Sort master SKU summaries by net revenue descending
  masterSkuSummaries.sort((a, b) => b.netRevenueBase - a.netRevenueBase);

  return {
    kpis: {
      totalNetRevenueBase,
      totalCogsBase,
      totalExpensesBase,
      totalOperatingProfitBase,
      consolidatedOperatingMarginRate,
    },
    marketSummaries,
    monthlySummaries,
    masterSkuSummaries,
  };
}
