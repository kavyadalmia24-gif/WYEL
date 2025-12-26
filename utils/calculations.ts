
import { CalculationResult } from '../types';

// Existing Finance Calculations ...
export const calculateSIP = (monthlyInvestment: number, annualRate: number, years: number): CalculationResult => {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const totalValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const investedAmount = monthlyInvestment * months;
  const totalInterest = totalValue - investedAmount;
  const breakdown = [];
  for (let i = 1; i <= years; i++) {
    const monthsPassed = i * 12;
    const yearValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate) * (1 + monthlyRate);
    breakdown.push({ year: i, balance: Math.round(yearValue), invested: Math.round(monthlyInvestment * monthsPassed) });
  }
  return { investedAmount: Math.round(investedAmount), totalInterest: Math.round(totalInterest), totalValue: Math.round(totalValue), breakdown };
};

export const calculateLumpsum = (investment: number, annualRate: number, years: number): CalculationResult => {
  const rate = annualRate / 100;
  const totalValue = investment * Math.pow(1 + rate, years);
  const totalInterest = totalValue - investment;
  const breakdown = [];
  for (let i = 1; i <= years; i++) {
    breakdown.push({ year: i, balance: Math.round(investment * Math.pow(1 + rate, i)), invested: investment });
  }
  return { investedAmount: Math.round(investment), totalInterest: Math.round(totalInterest), totalValue: Math.round(totalValue), breakdown };
};

export const calculateEMI = (principal: number, annualRate: number, years: number): CalculationResult => {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const emi = principal * monthlyRate * (Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { investedAmount: Math.round(principal), totalInterest: Math.round(totalInterest), totalValue: Math.round(totalPayment), monthlyEMI: Math.round(emi), breakdown: [] };
};

export const calculateFD = (principal: number, annualRate: number, years: number): CalculationResult => {
  const r = annualRate / 100;
  const totalValue = principal * Math.pow(1 + r/4, 4 * years);
  return { investedAmount: Math.round(principal), totalInterest: Math.round(totalValue - principal), totalValue: Math.round(totalValue), breakdown: [] };
};

export const calculateRD = (monthly: number, rate: number, years: number): CalculationResult => calculateSIP(monthly, rate, years);

export const calculatePPF = (yearly: number, rate: number, years: number): CalculationResult => {
  let balance = 0;
  let invested = 0;
  for (let i = 1; i <= years; i++) { balance = (balance + yearly) * (1 + rate/100); invested += yearly; }
  return { investedAmount: Math.round(invested), totalInterest: Math.round(balance - invested), totalValue: Math.round(balance), breakdown: [] };
};

export const calculateInflation = (cost: number, rate: number, years: number): CalculationResult => {
  const future = cost * Math.pow(1 + rate/100, years);
  return { investedAmount: Math.round(cost), totalInterest: Math.round(future - cost), totalValue: Math.round(future), breakdown: [] };
};

export const calculateGoal = (target: number, rate: number, years: number): CalculationResult => {
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const monthly = target / factor;
  return { investedAmount: Math.round(monthly * months), totalInterest: Math.round(target - (monthly * months)), totalValue: Math.round(target), monthlyEMI: Math.round(monthly), breakdown: [] };
};

export const calculateBudget = (income: number): CalculationResult => ({
  investedAmount: income * 0.5, totalInterest: income * 0.3, totalValue: income * 0.2, breakdown: [],
  chartData: [{ name: 'Needs', value: income * 0.5, color: '#3b82f6' }, { name: 'Wants', value: income * 0.3, color: '#ec4899' }, { name: 'Savings', value: income * 0.2, color: '#10b981' }]
});

export const calculateSimpleInterest = (p: number, r: number, t: number): CalculationResult => {
  const interest = (p * r * t) / 100;
  return { investedAmount: p, totalInterest: interest, totalValue: p + interest, breakdown: [] };
};

export const calculateCompoundInterest = (p: number, r: number, t: number): CalculationResult => calculateLumpsum(p, r, t);

// --- NEW ENTREPRENEURSHIP CALCULATIONS ---

/** 1. Startup Cost Estimator */
export const calculateStartupCost = (fixed: number, marketing: number, months: number): CalculationResult => {
  const total = fixed + (marketing * months);
  return {
    investedAmount: fixed,
    totalInterest: marketing * months,
    totalValue: total,
    breakdown: [],
    chartData: [
      { name: 'Fixed Setup', value: fixed, color: '#6366f1' },
      { name: 'OpEx (Months)', value: marketing * months, color: '#f43f5e' }
    ]
  };
};

/** 2. Break-even Simulator */
export const calculateBreakEven = (fixedCosts: number, unitPrice: number, variableCost: number): CalculationResult => {
  const margin = unitPrice - variableCost;
  const units = margin > 0 ? Math.ceil(fixedCosts / margin) : 0;
  return {
    investedAmount: units, // Used as 'Units to Break Even'
    totalInterest: margin, // Used as 'Unit Margin'
    totalValue: units * unitPrice, // Used as 'Total Revenue at Break-even'
    breakdown: [],
    chartData: [
      { name: 'Variable Cost', value: variableCost, color: '#94a3b8' },
      { name: 'Profit Margin', value: margin, color: '#10b981' }
    ]
  };
};

/** 3. Pricing Strategy Simulator */
export const calculatePricing = (cost: number, desiredMargin: number): CalculationResult => {
  const price = cost / (1 - desiredMargin / 100);
  const profit = price - cost;
  return {
    investedAmount: cost,
    totalInterest: profit,
    totalValue: price,
    breakdown: [],
    chartData: [
      { name: 'Cost of Goods', value: cost, color: '#64748b' },
      { name: 'Net Profit', value: profit, color: '#10b981' }
    ]
  };
};

/** 4. Market Size Estimator (TAM-SAM-SOM) */
export const calculateTAM = (totalPop: number, targetPercent: number, reachPercent: number): CalculationResult => {
  const tam = totalPop;
  const sam = totalPop * (targetPercent / 100);
  const som = sam * (reachPercent / 100);
  return {
    investedAmount: tam,
    totalInterest: sam,
    totalValue: som,
    breakdown: [],
    chartData: [
      { name: 'TAM (Total)', value: tam, color: '#4f46e5' },
      { name: 'SAM (Target)', value: sam, color: '#6366f1' },
      { name: 'SOM (Obtainable)', value: som, color: '#818cf8' }
    ]
  };
};

/** 5. Revenue Model Simulator (SaaS) */
export const calculateRevenueModel = (users: number, arpu: number, churn: number): CalculationResult => {
  const monthlyRev = users * arpu;
  const ltv = arpu / (churn / 100);
  return {
    investedAmount: monthlyRev,
    totalInterest: ltv,
    totalValue: monthlyRev * 12,
    breakdown: []
  };
};

/** 6. Customer Acquisition Cost (CAC) Simulator */
export const calculateCAC = (spend: number, leads: number, convRate: number): CalculationResult => {
  const customers = leads * (convRate / 100);
  const cac = customers > 0 ? spend / customers : 0;
  return {
    investedAmount: spend,
    totalInterest: customers,
    totalValue: cac,
    breakdown: []
  };
};

/** 7. Unit Economics Checker */
export const calculateUnitEconomics = (ltv: number, cac: number): CalculationResult => {
  const ratio = cac > 0 ? ltv / cac : 0;
  return {
    investedAmount: cac,
    totalInterest: ltv,
    totalValue: ratio,
    breakdown: [],
    chartData: [
      { name: 'CAC (Cost)', value: cac, color: '#f43f5e' },
      { name: 'LTV (Value)', value: ltv, color: '#10b981' }
    ]
  };
};

/** 8. Risk & Feasibility Scorecard */
export const calculateRiskScore = (market: number, team: number, tech: number): CalculationResult => {
  const total = (market + team + tech) / 3;
  return {
    investedAmount: market,
    totalInterest: team,
    totalValue: total, // 0-10 score
    breakdown: []
  };
};

/** 9. Go-To-Market Simulator (Funnel) */
export const calculateGTM = (reach: number, clickRate: number, convRate: number): CalculationResult => {
  const visitors = reach * (clickRate / 100);
  const customers = visitors * (convRate / 100);
  return {
    investedAmount: reach,
    totalInterest: visitors,
    totalValue: customers,
    breakdown: [],
    chartData: [
      { name: 'Reach', value: reach, color: '#94a3b8' },
      { name: 'Visitors', value: visitors, color: '#6366f1' },
      { name: 'Customers', value: customers, color: '#10b981' }
    ]
  };
};

/** 10. Pitch Readiness Checker */
export const calculatePitchReadiness = (deck: number, financial: number, traction: number): CalculationResult => {
  const score = (deck + financial + traction) / 3;
  return { investedAmount: deck, totalInterest: financial, totalValue: score, breakdown: [] };
};

/** 11. Competitor Analysis */
export const calculateCompetitorScore = (ourFeatures: number, compFeatures: number): CalculationResult => {
  const diff = ourFeatures - compFeatures;
  return {
    investedAmount: ourFeatures,
    totalInterest: compFeatures,
    totalValue: diff,
    breakdown: [],
    chartData: [
      { name: 'Us', value: ourFeatures, color: '#10b981' },
      { name: 'Competitor', value: compFeatures, color: '#f43f5e' }
    ]
  };
};
