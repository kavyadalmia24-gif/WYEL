
import React, { useState, useEffect } from 'react';
import { calculateSIP, calculateLumpsum, calculateEMI } from '../utils/calculations';
import { CalculationResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calculator } from 'lucide-react';

interface MiniCalculatorProps {
  type: 'SIP' | 'LUMPSUM' | 'EMI';
}

const MiniCalculator: React.FC<MiniCalculatorProps> = ({ type }) => {
  const [amount, setAmount] = useState(type === 'EMI' ? 100000 : 5000);
  const [rate, setRate] = useState(type === 'EMI' ? 10 : 12);
  const [years, setYears] = useState(5);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    let res;
    if (type === 'SIP') {
      res = calculateSIP(amount, rate, years);
    } else if (type === 'LUMPSUM') {
      res = calculateLumpsum(amount, rate, years);
    } else {
      res = calculateEMI(amount, rate, years);
    }
    setResult(res);
  }, [type, amount, rate, years]);

  const COLORS = ['#10b981', '#3b82f6'];

  const getLabels = () => {
    if (type === 'EMI') return { amount: 'Loan Amount', rate: 'Interest Rate %', total: 'Total Payable' };
    if (type === 'SIP') return { amount: 'Monthly Investment', rate: 'Exp. Return %', total: 'Total Value' };
    return { amount: 'Total Investment', rate: 'Exp. Return %', total: 'Total Value' };
  };

  const labels = getLabels();

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm my-8">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <Calculator size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Simulator: {type === 'SIP' ? 'SIP Investment' : type === 'LUMPSUM' ? 'Lumpsum Growth' : 'Loan EMI'}</h3>
          <p className="text-xs text-slate-500">Try changing values to see how it affects the outcome</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">{labels.amount}</label>
            <input 
              type="range" 
              min={type === 'EMI' ? 10000 : 500} 
              max={type === 'EMI' ? 1000000 : 100000} 
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-right font-mono font-medium text-slate-700 mt-1">${amount.toLocaleString()}</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">{labels.rate}</label>
            <input 
              type="range" 
              min={1} 
              max={30} 
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-right font-mono font-medium text-slate-700 mt-1">{rate}%</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Duration: {years} Years</label>
            <input 
              type="range" 
              min={1} 
              max={30} 
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="w-32 h-32 relative">
               {result && (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={[
                         { name: 'Invested', value: result.investedAmount },
                         { name: 'Gains/Interest', value: result.totalInterest }
                       ]}
                       cx="50%"
                       cy="50%"
                       innerRadius={25}
                       outerRadius={40}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       <Cell key="cell-0" fill={COLORS[1]} />
                       <Cell key="cell-1" fill={COLORS[0]} />
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
               )}
            </div>
            <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium">{labels.total}</p>
                <p className="text-xl font-bold text-slate-900">${result?.totalValue.toLocaleString()}</p>
                {type === 'EMI' && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold">
                        EMI: ${result?.monthlyEMI?.toLocaleString()}/mo
                    </div>
                )}
                {type !== 'EMI' && (
                    <div className="mt-2 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                        Gain: +${result?.totalInterest.toLocaleString()}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCalculator;
