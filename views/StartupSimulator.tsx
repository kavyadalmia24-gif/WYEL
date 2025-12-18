
import React, { useState } from 'react';
import { Rocket, Target, Users, TrendingUp, DollarSign, BrainCircuit, ChevronRight, Briefcase, Zap, AlertCircle, Sparkles, Trophy, ArrowLeft } from 'lucide-react';
import { UserStats, StartupState } from '../types';
import { evaluatePitch } from '../services/geminiService';

interface Props {
  userStats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
}

const StartupSimulator: React.FC<Props> = ({ userStats, updateStats }) => {
  const [startup, setStartup] = useState<StartupState | null>(null);
  const [pitch, setPitch] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [pitchResult, setPitchResult] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [problem, setProblem] = useState('');
  const [model, setModel] = useState<'B2B' | 'B2C' | 'SaaS' | 'Marketplace'>('SaaS');

  const handleCreate = () => {
    if (!name || !industry) return;
    setStartup({
      name, industry, problem, model,
      stage: 'VALIDATION',
      budget: 10000,
      time: 60,
      metrics: { demand: 5, wtp: 0, retention: 0, users: 0, mrr: 0, burn: 1000, confidence: 5 },
      valuation: 0,
      equityOffered: 0
    });
  };

  const runAction = (type: 'INTERVIEW' | 'LANDING_PAGE' | 'MVP') => {
    if (!startup) return;
    const costs = { INTERVIEW: 500, LANDING_PAGE: 1500, MVP: 4000 };
    const timeCosts = { INTERVIEW: 3, LANDING_PAGE: 7, MVP: 14 };
    
    if (startup.budget < costs[type]) return;

    const demandImpact = Math.floor(Math.random() * (type === 'MVP' ? 30 : 15) + 5);
    const confImpact = Math.floor(Math.random() * 20 + 5);

    setStartup(prev => {
      if (!prev) return null;
      const nextMetrics = {
        ...prev.metrics,
        demand: Math.min(100, prev.metrics.demand + demandImpact),
        confidence: Math.min(100, prev.metrics.confidence + confImpact)
      };
      
      let nextStage = prev.stage;
      if (nextMetrics.confidence > 50 && prev.stage === 'VALIDATION') nextStage = 'TRACTION';

      return {
        ...prev,
        budget: prev.budget - costs[type],
        time: prev.time - timeCosts[type],
        metrics: nextMetrics,
        stage: nextStage
      };
    });
  };

  const handlePitchSubmit = async () => {
    if (!pitch.trim() || !startup) return;
    setIsEvaluating(true);
    try {
      const result = await evaluatePitch(pitch, startup);
      setPitchResult(result);
      if (result.score > 75) {
        setStartup(s => s ? ({ ...s, stage: 'FUNDRAISING' }) : null);
        updateStats({ entreXp: userStats.entreXp + 500 });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!startup) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in">
        <div className="text-center">
          <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl"><Rocket size={48} /></div>
          <h1 className="text-5xl font-heading font-extrabold text-slate-900">Founder's Studio</h1>
          <p className="text-xl text-slate-500 mt-4">Simulate your path from idea to exit.</p>
        </div>
        <div className="glass-card p-10 rounded-[3rem] bg-white shadow-2xl border border-slate-100 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Startup Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. EcoBox" className="w-full p-5 rounded-2xl border bg-slate-50 font-bold focus:ring-4 focus:ring-rose-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Industry</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. FinTech" className="w-full p-5 rounded-2xl border bg-slate-50 font-bold focus:ring-4 focus:ring-rose-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">The Problem</label>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="What are you solving?" rows={3} className="w-full p-5 rounded-2xl border bg-slate-50 font-bold focus:ring-4 focus:ring-rose-200 outline-none transition-all" />
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Business Model</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {['SaaS', 'Marketplace', 'B2B', 'B2C'].map(m => (
                   <button key={m} onClick={() => setModel(m as any)} className={`p-4 rounded-xl border-2 font-bold transition-all ${model === m ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400'}`}>{m}</button>
                 ))}
               </div>
            </div>
          </div>
          <button onClick={handleCreate} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-bold text-2xl hover:bg-rose-600 transition-all shadow-xl active:scale-95">Launch Simulator</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setStartup(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20}/></button>
          <div>
            <h2 className="text-2xl font-heading font-bold">{startup.name}</h2>
            <div className="flex gap-2 text-xs font-bold uppercase text-slate-400 mt-1">
              <span className="text-rose-600">{startup.stage} Stage</span>
              <span>•</span>
              <span>{startup.industry}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-6">
           <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase">Runway</p>
             <p className="text-xl font-heading font-bold">${startup.budget.toLocaleString()}</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase">Days Left</p>
             <p className="text-xl font-heading font-bold">{startup.time}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Confidence</p>
              <p className="text-3xl font-heading font-bold text-indigo-600">{Math.round(startup.metrics.confidence)}%</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Market Demand</p>
              <p className="text-3xl font-heading font-bold text-emerald-600">{Math.round(startup.metrics.demand)}%</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
              <p className="text-3xl font-heading font-bold text-rose-600">{startup.stage === 'VALIDATION' ? 'Validating' : 'Scaling'}</p>
            </div>
          </div>

          {startup.stage === 'VALIDATION' && (
            <div className="bg-indigo-600 p-12 rounded-[3rem] text-white text-center space-y-8">
               <h3 className="text-3xl font-heading font-bold">Validate Your Idea</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { t: 'INTERVIEW', l: 'Interviews', c: '$500', icon: Users },
                    { t: 'LANDING_PAGE', l: 'Landing Page', c: '$1.5k', icon: Target },
                    { t: 'MVP', l: 'Build MVP', c: '$4k', icon: Rocket }
                  ].map(act => (
                    <button key={act.t} onClick={() => runAction(act.t as any)} className="bg-white/10 hover:bg-white/20 p-8 rounded-3xl border border-white/20 flex flex-col items-center gap-4 transition-all">
                      <act.icon size={32} />
                      <span className="font-bold text-xl">{act.l}</span>
                      <span className="text-[10px] opacity-60 font-bold uppercase">{act.c} Cost</span>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {startup.stage === 'TRACTION' && (
            <div className="glass-card p-12 rounded-[3rem] bg-white border shadow-xl">
               <h3 className="text-3xl font-heading font-bold mb-6">Raise Funding</h3>
               <p className="text-slate-500 mb-8">You've reached critical traction. Pitch your vision to AI Investors to secure a term sheet.</p>
               <textarea value={pitch} onChange={e => setPitch(e.target.value)} placeholder="Type your 1-sentence elevator pitch..." className="w-full p-6 rounded-2xl border bg-slate-50 font-bold focus:ring-4 focus:ring-rose-200 outline-none mb-8" rows={4} />
               <button onClick={handlePitchSubmit} disabled={isEvaluating} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 hover:bg-rose-600 transition-all">
                 {isEvaluating ? <Zap className="animate-spin" /> : <Sparkles />} Evaluate Pitch
               </button>
               {pitchResult && (
                 <div className="mt-8 p-8 bg-slate-50 rounded-[2rem] border animate-in slide-in-from-top-4">
                   <div className="flex justify-between items-center mb-4">
                     <span className="font-bold text-slate-800">Review Score</span>
                     <span className="text-3xl font-heading font-bold text-rose-600">{pitchResult.score}%</span>
                   </div>
                   <p className="text-slate-600 text-lg leading-relaxed italic">"{pitchResult.feedback}"</p>
                 </div>
               )}
            </div>
          )}

          {startup.stage === 'FUNDRAISING' && (
            <div className="bg-emerald-600 p-16 rounded-[4rem] text-white text-center animate-in zoom-in">
               <Trophy size={80} className="mx-auto mb-8" />
               <h2 className="text-5xl font-heading font-bold mb-6">Term Sheet Received!</h2>
               <p className="text-xl mb-12 opacity-90">An AI Venture Capital firm wants to lead your seed round.</p>
               <div className="bg-white p-10 rounded-[3rem] text-slate-900 max-w-sm mx-auto shadow-2xl text-left space-y-6">
                 <div className="flex justify-between border-b pb-4"><span className="text-slate-400 font-bold uppercase text-xs">Investment</span> <span className="font-bold text-2xl text-emerald-600">$500,000</span></div>
                 <div className="flex justify-between border-b pb-4"><span className="text-slate-400 font-bold uppercase text-xs">Equity</span> <span className="font-bold text-2xl">10%</span></div>
                 <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-xs">Valuation</span> <span className="font-bold text-2xl">$5M</span></div>
                 <button onClick={() => setStartup(null)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl mt-6">Accept & Exit</button>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-8 rounded-[2.5rem] bg-white border shadow-md">
             <h3 className="font-heading font-bold text-xl mb-6 flex items-center gap-3"><Briefcase className="text-rose-500" /> Market Context</h3>
             <div className="space-y-4">
               <div className="p-5 bg-slate-50 rounded-2xl">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-1">Investor Sentiment</p>
                 <p className="text-xl font-bold text-slate-800">Aggressive Appetite</p>
               </div>
               <div className="p-5 bg-slate-50 rounded-2xl">
                 <p className="text-xs font-bold text-slate-400 uppercase">Sector Trend</p>
                 <p className="text-xl font-bold text-emerald-600">Hyper-growth</p>
               </div>
             </div>
           </div>
           <div className="bg-gradient-to-br from-indigo-600 to-violet-800 p-10 rounded-[2.5rem] text-white">
             <Sparkles size={40} className="mb-6 text-amber-300" />
             <h4 className="font-heading font-bold text-2xl mb-4">Founder's Edge</h4>
             <p className="text-lg opacity-80 italic leading-relaxed">"Build something people want. Revenue is just proof that you solved a hard problem."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StartupSimulator;
