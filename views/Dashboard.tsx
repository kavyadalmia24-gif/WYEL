
import React, { useMemo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Award, ArrowRight, Zap, Target, BookOpen, Briefcase, CandlestickChart, Rocket, Sparkles, Loader2 } from 'lucide-react';
import { ViewState, UserStats, Stock, SkillType } from '../types';
import { getDailyInsight } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  userStats: UserStats;
  stocks: Stock[];
  updateStats: (newStats: Partial<UserStats>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userStats, stocks, updateStats }) => {
  const isFinance = userStats.activeSkill === SkillType.FINANCE;
  const currentXp = isFinance ? userStats.xp : userStats.entreXp;
  
  const [dailyInsight, setDailyInsight] = useState<string>("");
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsInsightLoading(true);
      const insight = await getDailyInsight(userStats.activeSkill);
      setDailyInsight(insight);
      setIsInsightLoading(false);
    };
    fetchInsight();
  }, [userStats.activeSkill]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-extrabold text-slate-900 mb-2 tracking-tight">
            Hello, {isFinance ? 'Investor' : 'Founder'}! 🚀
          </h1>
          <p className="text-slate-500 text-lg font-light">Your path to financial freedom starts here.</p>
        </div>
        
        {/* Skill Toggle */}
        <div className="bg-slate-200/50 backdrop-blur-md p-1.5 rounded-[1.25rem] flex shadow-inner border border-white/50">
          <button 
            onClick={() => updateStats({ activeSkill: SkillType.FINANCE })}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isFinance ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-slate-500 hover:text-indigo-400'}`}
          >
            <DollarSign size={16} /> Finance
          </button>
          <button 
            onClick={() => updateStats({ activeSkill: SkillType.ENTREPRENEURSHIP })}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${!isFinance ? 'bg-white shadow-md text-rose-600 scale-[1.02]' : 'text-slate-500 hover:text-rose-400'}`}
          >
            <Rocket size={16} /> Founder
          </button>
        </div>
      </header>

      {/* Daily AI Insight Section */}
      <div className="relative group overflow-hidden rounded-[2.5rem]">
        <div className={`absolute inset-0 bg-gradient-to-r ${isFinance ? 'from-indigo-500/10 via-violet-500/10 to-transparent' : 'from-rose-500/10 via-orange-500/10 to-transparent'} opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/80 bg-white/40 relative z-10 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-indigo-500/5">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${isFinance ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'} animate-pulse-slow`}>
                <Sparkles size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Daily AI Insight</p>
                {isInsightLoading ? (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Loader2 size={20} className="animate-spin text-slate-300" />
                        <span className="text-slate-400 font-medium animate-pulse">Analyzing market signals...</span>
                    </div>
                ) : (
                    <p className="text-xl md:text-2xl font-heading font-bold text-slate-800 leading-tight">
                        "{dailyInsight}"
                    </p>
                )}
            </div>
            <div className="hidden lg:block">
                <button 
                    onClick={() => {
                        setDailyInsight("");
                        setIsInsightLoading(true);
                        getDailyInsight(userStats.activeSkill).then(res => {
                            setDailyInsight(res);
                            setIsInsightLoading(false);
                        });
                    }}
                    className="p-3 rounded-full hover:bg-white/50 transition-colors text-slate-300 hover:text-indigo-500"
                    title="Refresh Insight"
                >
                    <Zap size={20} />
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group border-white/80 shadow-lg">
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className={`w-14 h-14 ${isFinance ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'} rounded-2xl flex items-center justify-center shadow-sm`}>
              <Award size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{isFinance ? 'Trader XP' : 'Founder XP'}</p>
              <p className="text-3xl font-heading font-extrabold text-slate-900">{currentXp.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isFinance ? 'bg-amber-400' : 'bg-rose-400'}`} 
              style={{ width: `${Math.min(100, (currentXp / 5000) * 100)}%` }} 
            />
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group border-white/80 shadow-lg">
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Zap size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Skill Level</p>
              <p className="text-3xl font-heading font-extrabold text-slate-900">{userStats.level}</p>
            </div>
          </div>
           <div className="flex gap-1.5 mt-2">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= userStats.level ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                ))}
            </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group border-white/80 shadow-lg">
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lessons</p>
              <p className="text-3xl font-heading font-extrabold text-slate-900">{userStats.lessonsCompleted}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Keep learning to grow XP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div onClick={() => onNavigate(isFinance ? ViewState.MARKET : ViewState.SIMULATOR)} className={`relative rounded-[2.5rem] p-10 overflow-hidden cursor-pointer group transition-all duration-500 shadow-2xl ${isFinance ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' : 'bg-gradient-to-br from-rose-600 to-rose-800'} hover:scale-[1.01]`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-8 border border-white/20 backdrop-blur-md">
                {isFinance ? <CandlestickChart size={24} /> : <Rocket size={24} />}
              </div>
              <h2 className="text-4xl font-heading font-bold text-white mb-4 tracking-tight">{isFinance ? 'Market Terminal' : 'Startup Studio'}</h2>
              <p className="text-white/70 text-lg max-w-md leading-relaxed font-light">
                {isFinance ? 'Experience real-time simulated trading with global assets.' : 'Validate ideas, build MVPs and secure venture capital funding.'}
              </p>
            </div>
            <div className="mt-12 flex items-center gap-3 text-white font-bold text-xl">
                Open {isFinance ? 'Terminal' : 'Studio'} 
                <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-2 transition-transform">
                    <ArrowRight size={24} />
                </div>
            </div>
          </div>
        </div>

        <div onClick={() => onNavigate(ViewState.ADVISOR)} className="relative rounded-[2.5rem] p-10 overflow-hidden cursor-pointer group transition-all duration-500 shadow-2xl bg-white border border-slate-200 hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-8 shadow-lg">
                <Sparkles size={24} className="text-amber-300" />
              </div>
              <h2 className="text-4xl font-heading font-bold text-slate-900 mb-4 tracking-tight">AI Expert Advisor</h2>
              <p className="text-slate-500 text-lg max-w-md leading-relaxed font-light">
                {isFinance ? 'Need clarity on compound interest or portfolio theory? FinBot is ready.' : 'Stuck on your customer persona? EntreBot provides strategic feedback.'}
              </p>
            </div>
            <div className="mt-12 flex items-center gap-3 text-indigo-600 font-bold text-xl">
                Start Consultation 
                <div className="bg-indigo-50 p-2 rounded-full group-hover:translate-x-2 transition-transform">
                    <ArrowRight size={24} />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
