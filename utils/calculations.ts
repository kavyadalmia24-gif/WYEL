import { CalculationResult } from '../types';

export const calculateSIP = (
  monthlyInvestment: number,
  annualRate: number,
  years: number
): CalculationResult => {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  
  // SIP Formula: P * ({[1 + i]^n - 1} / i) * (1 + i)
  const totalValue = monthlyInvestment * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
    (1 + monthlyRate);

  const investedAmount = monthlyInvestment * months;
  const totalInterest = totalValue - investedAmount;

  const breakdown = [];
  let currentInvested = 0;

  for (let i = 1; i <= years; i++) {
    const monthsPassed = i * 12;
    const yearValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    currentInvested = monthlyInvestment * monthsPassed;
    breakdown.push({
      year: i,
      balance: Math.round(yearValue),
      invested: Math.round(currentInvested)
    });
  }

  return {
    investedAmount: Math.round(investedAmount),
    totalInterest: Math.round(totalInterest),
    totalValue: Math.round(totalValue),
    breakdown
  };
};

export const calculateLumpsum = (
  investment: number,
  annualRate: number,
  years: number
): CalculationResult => {
  const rate = annualRate / 100;
  
  // Compound Interest: P * (1 + r)^n
  const totalValue = investment * Math.pow(1 + rate, years);
  const totalInterest = totalValue - investment;

  const breakdown = [];
  for (let i = 1; i <= years; i++) {
    const yearValue = investment * Math.pow(1 + rate, i);
    breakdown.push({
      year: i,
      balance: Math.round(yearValue),
      invested: investment
    });
  }

  return {
    investedAmount: Math.round(investment),
    totalInterest: Math.round(totalInterest),
    totalValue: Math.round(totalValue),
    breakdown
  };
};

export const calculateEMI = (
  principal: number,
  annualRate: number,
  years: number
): CalculationResult => {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
  const emi = principal * monthlyRate * 
    (Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  const breakdown = [];
  for (let i = 1; i <= years; i++) {
    const monthsPassed = i * 12;
    const paid = emi * monthsPassed;
    breakdown.push({
      year: i,
      balance: Math.round(paid),
      invested: Math.round(principal)
    });
  }

  return {
    investedAmount: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalValue: Math.round(totalPayment),
    monthlyEMI: Math.round(emi),
    breakdown
  };
};

export const calculateFD = (
  principal: number,
  annualRate: number,
  years: number
): CalculationResult => {
  // Fixed Deposit usually compounds quarterly
  const n = 4; // Quarterly compounding
  const r = annualRate / 100;
  
  const totalValue = principal * Math.pow(1 + r/n, n * years);
  const totalInterest = totalValue - principal;

  const breakdown = [];
  for (let i = 1; i <= years; i++) {
    const yearValue = principal * Math.pow(1 + r/n, n * i);
    breakdown.push({
      year: i,
      balance: Math.round(yearValue),
      invested: principal
    });
  }

  return {
    investedAmount: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalValue: Math.round(totalValue),
    breakdown
  };
};

export const calculateRD = (
  monthlyInvestment: number,
  annualRate: number,
  years: number
): CalculationResult => {
  return calculateSIP(monthlyInvestment, annualRate, years);
};

export const calculatePPF = (
  yearlyInvestment: number,
  rate: number, 
  years: number
): CalculationResult => {
  const r = rate / 100;
  
  let balance = 0;
  const breakdown = [];
  let totalInvested = 0;

  for (let i = 1; i <= years; i++) {
    balance = (balance + yearlyInvestment) * (1 + r);
    totalInvested += yearlyInvestment;
    breakdown.push({
      year: i,
      balance: Math.round(balance),
      invested: totalInvested
    });
  }

  const totalInterest = balance - totalInvested;

  return {
    investedAmount: Math.round(totalInvested),
    totalInterest: Math.round(totalInterest),
    totalValue: Math.round(balance),
    breakdown
  };
};

export const calculateInflation = (
  currentCost: number,
  inflationRate: number,
  years: number
): CalculationResult => {
  const r = inflationRate / 100;
  const futureValue = currentCost * Math.pow(1 + r, years);
  const costIncrease = futureValue - currentCost;

  const breakdown = [];
  for (let i = 1; i <= years; i++) {
    const val = currentCost * Math.pow(1 + r, i);
    breakdown.push({
      year: i,
      balance: Math.round(val),
      invested: currentCost 
    });
  }

  return {
    investedAmount: Math.round(currentCost), 
    totalInterest: Math.round(costIncrease), 
    totalValue: Math.round(futureValue), 
    breakdown
  };
};

export const calculateGoal = (
  targetAmount: number,
  annualRate: number,
  years: number
): CalculationResult => {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  
  const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const monthlyInvestment = targetAmount / factor;
  
  const totalInvested = monthlyInvestment * months;
  const totalInterest = targetAmount - totalInvested;

  return {
    ...calculateSIP(monthlyInvestment, annualRate, years),
    monthlyEMI: Math.round(monthlyInvestment) 
  };
};

export const calculateBudget = (
  income: number,
  rate: number,
  years: number
): CalculationResult => {
  // 50-30-20 Rule
  const needs = income * 0.5;
  const wants = income * 0.3;
  const savings = income * 0.2;

  return {
    investedAmount: needs, 
    totalInterest: wants,  
    totalValue: savings,   
    breakdown: [],
    chartData: [
      { name: 'Needs (50%)', value: Math.round(needs), color: '#3b82f6' }, 
      { name: 'Wants (30%)', value: Math.round(wants), color: '#ec4899' }, 
      { name: 'Savings (20%)', value: Math.round(savings), color: '#10b981' } 
    ]
  };
};

export const calculateSimpleInterest = (
  principal: number,
  rate: number,
  years: number
): CalculationResult => {
  const interest = (principal * rate * years) / 100;
  const total = principal + interest;
  
  const breakdown = [];
  for (let i = 1; i <= years; i++) {
    breakdown.push({
      year: i,
      balance: Math.round(principal + (principal * rate * i) / 100),
      invested: principal
    });
  }

  return {
    investedAmount: Math.round(principal),
    totalInterest: Math.round(interest),
    totalValue: Math.round(total),
    breakdown
  };
};

export const calculateCompoundInterest = (
    principal: number,
    rate: number,
    years: number
  ): CalculationResult => {
    return calculateLumpsum(principal, rate, years);
  };
