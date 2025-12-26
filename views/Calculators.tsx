
import React, { useState, useEffect, useRef } from 'react';
import { 
  calculateSIP, 
  calculateLumpsum, 
  calculateEMI, 
  calculateFD, 
  calculateRD, 
  calculatePPF, 
  calculateInflation, 
  calculateGoal,
  calculateBudget,
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateStartupCost,
  calculateBreakEven,
  calculatePricing,
  calculateTAM,
  calculateRevenueModel,
  calculateCAC,
  calculateUnitEconomics,
  calculateRiskScore,
  calculateGTM,
  calculatePitchReadiness,
  calculateCompetitorScore
} from '../utils/calculations';
import { CalculationResult, UserStats, SkillType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, PiggyBank, Landmark, Target, AlertTriangle, Briefcase, Coins, Wallet, Percent, 
  PieChart as PieIcon, LucideIcon, Rocket, Users, BarChart3, ShieldAlert, Flag, MessageSquare, Scale, Zap
} from 'lucide-react';

type CalculatorType = 'SIP' | 'LUMPSUM' | 'EMI' | 'FD' | 'RD' | 'PPF' | 'INFLATION' | 'GOAL' | 'BUDGET' | 'SIMPLE' | 'COMPOUND' |
                      'STARTUP_COST' | 'BREAK_EVEN' | 'PRICING' | 'TAM' | 'REVENUE' | 'CAC' | 'UNIT_ECON' | 'RISK' | 'GTM' | 'PITCH' | 'COMPETITOR';

interface CalculatorConfig {
  label: string;
  icon: LucideIcon;
  inputs: { amount: string; rate: string; years: string };
  defaults: { amount: number; rate: number; years: number };
  calculate: (amount: number, rate: number, years: number) => CalculationResult;
  resultLabels: { invested: string; interest: string; total: string };
  colors: string[];
  chartType: 'AREA' | 'PIE' | 'BAR';
}

const FINANCE_CONFIG: Partial<Record<CalculatorType, CalculatorConfig>> = {
  SIP: { label: 'SIP Calculator', icon: TrendingUp, inputs: { amount: 'Monthly Investment', rate: 'Exp. Return %', years: 'Period (Yrs)' }, defaults: { amount: 5000, rate: 12, years: 10 }, calculate: calculateSIP, resultLabels: { invested: 'Invested', interest: 'Returns', total: 'Value' }, colors: ['#6366f1', '#10b981'], chartType: 'AREA' },
  LUMPSUM: { label: 'Lumpsum', icon: Coins, inputs: { amount: 'Investment', rate: 'Exp. Return %', years: 'Period (Yrs)' }, defaults: { amount: 100000, rate: 12, years: 5 }, calculate: calculateLumpsum, resultLabels: { invested: 'Invested', interest: 'Returns', total: 'Value' }, colors: ['#6366f1', '#10b981'], chartType: 'AREA' },
  EMI: { label: 'Loan EMI', icon: Landmark, inputs: { amount: 'Loan Amount', rate: 'Rate %', years: 'Tenure (Yrs)' }, defaults: { amount: 500000, rate: 9, years: 5 }, calculate: calculateEMI, resultLabels: { invested: 'Principal', interest: 'Interest', total: 'Total' }, colors: ['#6366f1', '#f43f5e'], chartType: 'PIE' },
  FD: { label: 'Fixed Deposit', icon: Briefcase, inputs: { amount: 'Deposit', rate: 'Rate %', years: 'Period (Yrs)' }, defaults: { amount: 100000, rate: 7.5, years: 5 }, calculate: calculateFD, resultLabels: { invested: 'Deposit', interest: 'Interest', total: 'Maturity' }, colors: ['#6366f1', '#10b981'], chartType: 'PIE' },
  RD: { label: 'Recurring Deposit', icon: PiggyBank, inputs: { amount: 'Monthly', rate: 'Rate %', years: 'Period (Yrs)' }, defaults: { amount: 5000, rate: 7, years: 5 }, calculate: calculateRD, resultLabels: { invested: 'Invested', interest: 'Interest', total: 'Maturity' }, colors: ['#6366f1', '#10b981'], chartType: 'AREA' },
  PPF: { label: 'PPF', icon: Landmark, inputs: { amount: 'Yearly', rate: 'Rate %', years: 'Period (Yrs)' }, defaults: { amount: 100000, rate: 7.1, years: 15 }, calculate: calculatePPF, resultLabels: { invested: 'Invested', interest: 'Interest', total: 'Maturity' }, colors: ['#6366f1', '#10b981'], chartType: 'AREA' },
  INFLATION: { label: 'Inflation', icon: AlertTriangle, inputs: { amount: 'Current Cost', rate: 'Inflation %', years: 'Period (Yrs)' }, defaults: { amount: 50000, rate: 6, years: 10 }, calculate: calculateInflation, resultLabels: { invested: 'Cost Now', interest: 'Increase', total: 'Future Cost' }, colors: ['#64748b', '#f43f5e'], chartType: 'PIE' },
  GOAL: { label: 'Goal Planner', icon: Target, inputs: { amount: 'Target', rate: 'Exp. Return %', years: 'Period (Yrs)' }, defaults: { amount: 1000000, rate: 12, years: 10 }, calculate: calculateGoal, resultLabels: { invested: 'Investment', interest: 'Wealth', total: 'Target' }, colors: ['#6366f1', '#10b981'], chartType: 'AREA' },
  BUDGET: { label: '50/30/20 Rule', icon: Wallet, inputs: { amount: 'Income', rate: '', years: '' }, defaults: { amount: 50000, rate: 0, years: 0 }, calculate: (income) => calculateBudget(income), resultLabels: { invested: 'Needs', interest: 'Wants', total: 'Savings' }, colors: ['#3b82f6', '#ec4899', '#10b981'], chartType: 'PIE' },
  SIMPLE: { label: 'Simple Interest', icon: Percent, inputs: { amount: 'Principal', rate: 'Rate %', years: 'Period (Yrs)' }, defaults: { amount: 10000, rate: 5, years: 5 }, calculate: calculateSimpleInterest, resultLabels: { invested: 'Principal', interest: 'Interest', total: 'Total' }, colors: ['#6366f1', '#10b981'], chartType: 'PIE' },
  COMPOUND: { label: 'Compound Interest', icon: PieIcon, inputs: { amount: 'Principal', rate: 'Rate %', years: 'Period (Yrs)' }, defaults: { amount: 10000, rate: 5, years: 5 }, calculate: calculateCompoundInterest, resultLabels: { invested: 'Principal', interest: 'Interest', total: 'Total' }, colors: ['#6366f1', '#10b981'], chartType: 'PIE' }
};

const ENTRE_CONFIG: Partial<Record<CalculatorType, CalculatorConfig>> = {
  STARTUP_COST: { label: 'Startup Cost', icon: Rocket, inputs: { amount: 'Setup Costs', rate: 'Monthly OpEx', years: 'Months Run' }, defaults: { amount: 200000, rate: 15000, years: 12 }, calculate: calculateStartupCost, resultLabels: { invested: 'Setup', interest: 'Burn', total: 'Total' }, colors: ['#6366f1', '#f43f5e'], chartType: 'PIE' },
  BREAK_EVEN: { label: 'Break-even', icon: Scale, inputs: { amount: 'Fixed Costs', rate: 'Unit Price', years: 'Var. Cost/Unit' }, defaults: { amount: 50000, rate: 100, years: 40 }, calculate: calculateBreakEven, resultLabels: { invested: 'Units Required', interest: 'Unit Margin', total: 'Revenue Goal' }, colors: ['#94a3b8', '#10b981'], chartType: 'PIE' },
  PRICING: { label: 'Pricing Strategy', icon: Target, inputs: { amount: 'Unit Cost', rate: 'Margin %', years: '' }, defaults: { amount: 100, rate: 30, years: 1 }, calculate: (a, r) => calculatePricing(a, r), resultLabels: { invested: 'Cost', interest: 'Profit', total: 'Price' }, colors: ['#64748b', '#10b981'], chartType: 'PIE' },
  TAM: { label: 'Market Size', icon: Users, inputs: { amount: 'Total Population', rate: 'Target %', years: 'Capture %' }, defaults: { amount: 1000000, rate: 10, years: 5 }, calculate: calculateTAM, resultLabels: { invested: 'TAM', interest: 'SAM', total: 'SOM' }, colors: ['#4f46e5', '#6366f1', '#818cf8'], chartType: 'BAR' },
  REVENUE: { label: 'Revenue Model', icon: BarChart3, inputs: { amount: 'Users', rate: 'ARPU ($)', years: 'Churn %' }, defaults: { amount: 1000, rate: 20, years: 5 }, calculate: calculateRevenueModel, resultLabels: { invested: 'Monthly Rev', interest: 'LTV', total: 'Annual Rev' }, colors: ['#10b981', '#6366f1'], chartType: 'BAR' },
  CAC: { label: 'CAC Estimator', icon: Zap, inputs: { amount: 'Total Spend', rate: 'Leads', years: 'Conv. Rate %' }, defaults: { amount: 5000, rate: 200, years: 10 }, calculate: calculateCAC, resultLabels: { invested: 'Spend', interest: 'Cust. Count', total: 'CAC ($)' }, colors: ['#f43f5e', '#6366f1'], chartType: 'BAR' },
  UNIT_ECON: { label: 'Unit Economics', icon: Scale, inputs: { amount: 'LTV ($)', rate: 'CAC ($)', years: '' }, defaults: { amount: 300, rate: 80, years: 1 }, calculate: (a, r) => calculateUnitEconomics(a, r), resultLabels: { invested: 'CAC', interest: 'LTV', total: 'LTV:CAC Ratio' }, colors: ['#f43f5e', '#10b981'], chartType: 'PIE' },
  RISK: { label: 'Risk Scorecard', icon: ShieldAlert, inputs: { amount: 'Market Fit (1-10)', rate: 'Team Qual (1-10)', years: 'Tech Risk (1-10)' }, defaults: { amount: 7, rate: 8, years: 4 }, calculate: calculateRiskScore, resultLabels: { invested: 'Market', interest: 'Team', total: 'Overall Score' }, colors: ['#f43f5e', '#fbbf24', '#10b981'], chartType: 'BAR' },
  GTM: { label: 'Go-To-Market', icon: Flag, inputs: { amount: 'Reach (Impressions)', rate: 'CTR %', years: 'Conversion %' }, defaults: { amount: 100000, rate: 2, years: 5 }, calculate: calculateGTM, resultLabels: { invested: 'Reach', interest: 'Visitors', total: 'Customers' }, colors: ['#94a3b8', '#6366f1', '#10b981'], chartType: 'BAR' },
  PITCH: { label: 'Pitch Readiness', icon: MessageSquare, inputs: { amount: 'Deck Quality (1-10)', rate: 'Financials (1-10)', years: 'Traction (1-10)' }, defaults: { amount: 6, rate: 5, years: 4 }, calculate: calculatePitchReadiness, resultLabels: { invested: 'Deck', interest: 'Data', total: 'Readiness %' }, colors: ['#f43f5e', '#10b981'], chartType: 'BAR' },
  COMPETITOR: { label: 'Competitor Analysis', icon: Scale, inputs: { amount: 'Our Features (#)', rate: 'Comp. Features (#)', years: '' }, defaults: { amount: 12, rate: 15, years: 1 }, calculate: (a, r) => calculateCompetitorScore(a, r), resultLabels: { invested: 'Us', interest: 'Them', total: 'Gap' }, colors: ['#10b981', '#f43f5e'], chartType: 'BAR' }
};

interface Props {
  userStats: UserStats;
}

const Calculators: React.FC<Props> = ({ userStats }) => {
  const isFinance = userStats.activeSkill === SkillType.FINANCE;
  const config = isFinance ? FINANCE_CONFIG : ENTRE_CONFIG;
  const initialTab = isFinance ? 'SIP' : 'STARTUP_COST';

  const [activeTab, setActiveTab] = useState<CalculatorType>(initialTab);
  const [amount, setAmount] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(5);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleTabChange = (type: CalculatorType) => {
    setActiveTab(type);
    const cfg = config[type];
    if (cfg) {
      setAmount(cfg.defaults.amount);
      setRate(cfg.defaults.rate);
      setYears(cfg.defaults.years);
    }
  };

  useEffect(() => {
    const activeCfg = config[activeTab];
    if (activeCfg) {
      const res = activeCfg.calculate(amount, rate, years);
      setResult(res);
    }
  }, [activeTab, amount, rate, years, isFinance]);

  // Sync tab when skill changes
  useEffect(() => {
    handleTabChange(isFinance ? 'SIP' : 'STARTUP_COST');
  }, [isFinance]);

  const activeConfig = config[activeTab];
  if (!activeConfig) return null;

  const chartData = activeConfig.chartType === 'PIE' && result?.chartData 
    ? result.chartData 
    : (result?.chartData || [
        { name: activeConfig.resultLabels.invested, value: result?.investedAmount || 0, color: activeConfig.colors[0] },
        { name: activeConfig.resultLabels.interest, value: result?.totalInterest || 0, color: activeConfig.colors[1] }
      ]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            {isFinance ? 'Wealth Simulators' : 'Venture Simulators'}
          </h2>
          <p className="text-slate-500 text-lg font-light">
            {isFinance ? 'Model your long-term returns with institutional precision.' : 'Simulate your startup metrics before writing a single line of code.'}
          </p>
        </div>
        
        <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x">
            {(Object.keys(config) as CalculatorType[]).map((type) => {
                const Icon = config[type]?.icon || Rocket;
                const isActive = activeTab === type;
                return (
                <button
                    key={type}
                    onClick={() => handleTabChange(type)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap snap-start border ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                >
                    <Icon size={16} />
                    {config[type]?.label}
                </button>
                );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 rounded-[3rem] border bg-white shadow-xl">
            <div className="space-y-8">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{activeConfig.inputs.amount}</label>
                    <div className="relative">
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-heading font-extrabold text-2xl text-slate-900" />
                    </div>
                    <input type="range" min={0} max={activeConfig.defaults.amount * 5} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-4 accent-indigo-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                </div>

                {activeConfig.inputs.rate && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{activeConfig.inputs.rate}</label>
                    <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-heading font-extrabold text-2xl text-slate-900" />
                    <input type="range" min={0} max={100} step={1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-4 accent-indigo-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                  </div>
                )}

                {activeConfig.inputs.years && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{activeConfig.inputs.years}</label>
                    <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-heading font-extrabold text-2xl text-slate-900" />
                    <input type="range" min={1} max={50} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-4 accent-indigo-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {[
                   { label: activeConfig.resultLabels.invested, value: result?.investedAmount, color: 'text-slate-600', bg: 'bg-white' },
                   { label: activeConfig.resultLabels.interest, value: result?.totalInterest, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                   { label: activeConfig.resultLabels.total, value: result?.totalValue, color: 'text-emerald-600', bg: 'bg-emerald-50/50' }
               ].map((item, idx) => (
                   <div key={idx} className={`${item.bg} p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center`}>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                       <p className={`text-3xl font-heading font-black ${item.color}`}>
                           {activeTab === 'RISK' || activeTab === 'PITCH' || activeTab === 'UNIT_ECON' ? item.value?.toFixed(2) : `$${item.value?.toLocaleString()}`}
                       </p>
                   </div>
               ))}
           </div>

           <div className="glass-card p-10 rounded-[3.5rem] border bg-white shadow-2xl min-h-[450px] flex flex-col">
               <h3 className="font-heading font-bold text-xl text-slate-900 mb-8 flex items-center gap-2">
                   <BarChart3 className="text-indigo-600" /> Metrics Visualizer
               </h3>
               <div className="flex-1">
                   <ResponsiveContainer width="100%" height="100%">
                       {activeConfig.chartType === 'PIE' ? (
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                       ) : activeConfig.chartType === 'BAR' ? (
                          <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                  {chartData.map((entry: any, index: number) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Bar>
                          </BarChart>
                       ) : (
                           <AreaChart data={result?.breakdown || []}>
                               <defs>
                                   <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor={activeConfig.colors[0]} stopOpacity={0.2}/>
                                       <stop offset="95%" stopColor={activeConfig.colors[0]} stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `Yr ${val}`} />
                               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                               <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                               <Area type="monotone" dataKey="balance" stroke={activeConfig.colors[0]} strokeWidth={4} fill="url(#colorGrad)" />
                               <Area type="monotone" dataKey="invested" stroke={activeConfig.colors[1]} strokeWidth={2} strokeDasharray="8 8" fill="none" />
                           </AreaChart>
                       )}
                   </ResponsiveContainer>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Calculators;
