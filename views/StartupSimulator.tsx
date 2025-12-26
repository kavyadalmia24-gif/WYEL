
import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Lightbulb, Target, Users, BarChart, Zap, ChevronRight, ChevronLeft, 
  MessageSquare, Sparkles, Send, Loader2, Save, FileText, CheckCircle2, 
  Search, Briefcase, Flag, Globe, ShieldAlert, Cpu, Layers, Layout, HandMetal
} from 'lucide-react';
import { UserStats, StartupState, StartupJourneyStage, PitchSlide } from '../types';
import { getStartupCoPilotAdvice, generatePitchDeckSlides, generateStartupIdeas } from '../services/geminiService';
import confetti from 'canvas-confetti';

interface Props {
  userStats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
}

const STAGES = [
  { id: StartupJourneyStage.IDEATION, label: 'Ideation Lab', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: StartupJourneyStage.DISCOVERY, label: 'Vision & Problem', icon: Search, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: StartupJourneyStage.MARKET, label: 'Market Intelligence', icon: BarChart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: StartupJourneyStage.STRATEGY, label: 'Business Model', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: StartupJourneyStage.PROTOTYPE, label: 'Prototyping', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: StartupJourneyStage.PRODUCT, label: 'MVP Blueprint', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { id: StartupJourneyStage.VALIDATION, label: 'Validation Path', icon: Flag, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: StartupJourneyStage.PITCH, label: 'Pitch Deck', icon: FileText, color: 'text-violet-500', bg: 'bg-violet-50' },
];

const StartupSimulator: React.FC<Props> = ({ userStats, updateStats }) => {
  const [activeStartup, setActiveStartup] = useState<StartupState>(() => {
    return userStats.savedStartups[0] || {
      id: Date.now().toString(),
      name: '',
      currentStage: StartupJourneyStage.IDEATION,
      interests: '',
      data: {
        problem: '',
        solution: '',
        targetUser: '',
        tam: '',
        competitors: '',
        mvpFeatures: [],
        techStack: '',
        revenueModel: '',
        gtmStrategy: '',
        validationPlan: '',
        userFlow: '',
      },
      pitchDeck: [],
      isCompleted: false,
      xpEarned: 0
    };
  });

  const [suggestedIdeas, setSuggestedIdeas] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string }>>([
    { role: 'model', text: "Welcome to the Lab! 🧪 I'm your co-pilot. If you have an idea, type it above. If you're stuck, tell me what you're interested in (e.g., 'sustainable energy') and I'll generate some sparks!" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleUpdateData = (key: keyof StartupState['data'], value: any) => {
    setActiveStartup(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value }
    }));
  };

  const handleGetIdeas = async () => {
    if (!activeStartup.interests.trim()) return;
    setIsSuggesting(true);
    try {
      const ideas = await generateStartupIdeas(activeStartup.interests);
      setSuggestedIdeas(ideas);
      setChatHistory(prev => [...prev, { role: 'model', text: "I've generated some high-potential concepts for you! Have a look below." }]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const selectSuggestedIdea = (idea: any) => {
    setActiveStartup(prev => ({
      ...prev,
      name: idea.name,
      data: {
        ...prev.data,
        problem: idea.problem,
        solution: idea.solution
      }
    }));
    setChatHistory(prev => [...prev, { role: 'model', text: `Great choice! **${idea.name}** sounds like a winner. Let's move to the Discovery stage to refine the problem.` }]);
    confetti({ particleCount: 100, spread: 70 });
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await getStartupCoPilotAdvice(activeStartup.currentStage, activeStartup.data, userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const nextStage = async () => {
    const currentIndex = STAGES.findIndex(s => s.id === activeStartup.currentStage);
    if (currentIndex < STAGES.length - 1) {
      const nextStageId = STAGES[currentIndex + 1].id;
      
      if (nextStageId === StartupJourneyStage.PITCH && activeStartup.pitchDeck.length === 0) {
        setIsGeneratingDeck(true);
        const deck = await generatePitchDeckSlides(activeStartup.data);
        setActiveStartup(prev => ({ ...prev, currentStage: nextStageId, pitchDeck: deck }));
        setIsGeneratingDeck(false);
      } else {
        setActiveStartup(prev => ({ ...prev, currentStage: nextStageId }));
      }
      
      updateStats({ entreXp: userStats.entreXp + 150 });
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const prevStage = () => {
    const currentIndex = STAGES.findIndex(s => s.id === activeStartup.currentStage);
    if (currentIndex > 0) {
      setActiveStartup(prev => ({ ...prev, currentStage: STAGES[currentIndex - 1].id }));
    }
  };

  const renderIdeation = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">What interests you?</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={activeStartup.interests} 
              onChange={(e) => setActiveStartup(prev => ({ ...prev, interests: e.target.value }))}
              className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-lg focus:ring-4 focus:ring-amber-100 outline-none"
              placeholder="e.g. AI, Space, Food, E-sports..."
            />
            <button 
              onClick={handleGetIdeas} 
              disabled={isSuggesting || !activeStartup.interests}
              className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSuggesting ? <Loader2 className="animate-spin" /> : <Sparkles />} Spark Ideas
            </button>
          </div>
        </div>

        {suggestedIdeas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 animate-in fade-in zoom-in-95">
            {suggestedIdeas.map((idea, i) => (
              <div 
                key={i} 
                onClick={() => selectSuggestedIdea(idea)}
                className="p-6 rounded-3xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <HandMetal className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Option 0{i+1}</span>
                </div>
                <h4 className="text-xl font-heading font-black text-slate-900 leading-tight">{idea.name}</h4>
                <p className="text-xs text-slate-500 font-medium italic">{idea.tagline}</p>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{idea.problem}</p>
              </div>
            ))}
          </div>
        )}

        <div className="pt-8 border-t border-slate-50">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Confirmed Startup Name</label>
           <input 
              type="text" 
              value={activeStartup.name} 
              onChange={(e) => setActiveStartup(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-slate-100 border-none rounded-2xl px-6 py-5 font-heading font-black text-2xl text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none"
              placeholder="Your brand name goes here..."
            />
        </div>
      </div>
    </div>
  );

  const renderDiscovery = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">The Massive Problem</label>
          <textarea 
            value={activeStartup.data.problem}
            onChange={(e) => handleUpdateData('problem', e.target.value)}
            rows={5}
            className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium text-slate-700 focus:ring-4 focus:ring-rose-100 outline-none resize-none text-lg"
            placeholder="Describe the human pain point. Who hurts? Why?"
          />
        </div>
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">The Unique Solution</label>
          <textarea 
            value={activeStartup.data.solution}
            onChange={(e) => handleUpdateData('solution', e.target.value)}
            rows={5}
            className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium text-slate-700 focus:ring-4 focus:ring-rose-100 outline-none resize-none text-lg"
            placeholder="How does your startup kill that pain uniquely?"
          />
        </div>
      </div>
    </div>
  );

  const renderPrototype = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Core User Flow</label>
        <textarea 
          value={activeStartup.data.userFlow}
          onChange={(e) => handleUpdateData('userFlow', e.target.value)}
          rows={6}
          className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none text-lg"
          placeholder="Step 1: User does X... Step 2: System does Y... Step 3: Magic happens..."
        />
        <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
           <Zap className="text-blue-600 shrink-0" />
           <p className="text-xs text-blue-700 leading-relaxed font-medium">Use your AI co-pilot to check if this flow is too complex for an MVP!</p>
        </div>
      </div>
    </div>
  );

  const activeStageConfig = STAGES.find(s => s.id === activeStartup.currentStage);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Rocket className="text-indigo-600" />
             <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Incubator Mode</span>
          </div>
          <h1 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight">The Pre-Startup Studio</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] border shadow-sm">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Venture Hub</p>
              <p className="font-heading font-black text-slate-900">{activeStartup.name || 'Incubating...'}</p>
           </div>
           <HandMetal className="text-amber-500" size={24} />
        </div>
      </header>

      {/* Vertical Navigation & Stage Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Rail */}
        <div className="lg:col-span-2 space-y-3">
          {STAGES.map((s, idx) => {
            const isActive = activeStartup.currentStage === s.id;
            const isDone = STAGES.findIndex(x => x.id === activeStartup.currentStage) > idx;
            const Icon = s.icon;
            return (
              <button 
                key={s.id}
                onClick={() => {
                  if (isDone || isActive) setActiveStartup(prev => ({ ...prev, currentStage: s.id }));
                }}
                disabled={!isDone && !isActive}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border text-left group ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 'bg-white text-slate-400 border-slate-100 opacity-50 cursor-not-allowed'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : isDone ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                   {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <div className="hidden lg:block overflow-hidden">
                   <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Phase 0{idx+1}</p>
                   <p className="text-xs font-bold truncate">{s.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-6 space-y-8">
            <div className={`p-10 rounded-[3rem] border bg-white shadow-xl min-h-[600px] flex flex-col`}>
                <div className="flex items-center gap-6 mb-12">
                    <div className={`w-20 h-20 ${activeStageConfig?.bg} ${activeStageConfig?.color} rounded-3xl flex items-center justify-center shadow-sm`}>
                        {activeStageConfig && <activeStageConfig.icon size={40} />}
                    </div>
                    <div>
                        <h2 className="text-3xl font-heading font-black text-slate-900 leading-tight">{activeStageConfig?.label}</h2>
                        <p className="text-slate-500 font-medium">Stage {STAGES.findIndex(s => s.id === activeStartup.currentStage) + 1} of {STAGES.length}</p>
                    </div>
                </div>

                <div className="flex-1">
                    {activeStartup.currentStage === StartupJourneyStage.IDEATION && renderIdeation()}
                    {activeStartup.currentStage === StartupJourneyStage.DISCOVERY && renderDiscovery()}
                    {activeStartup.currentStage === StartupJourneyStage.MARKET && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                          <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Market Hierarchy (TAM/SAM/SOM)</label>
                            <textarea 
                              value={activeStartup.data.tam}
                              onChange={(e) => handleUpdateData('tam', e.target.value)}
                              rows={3}
                              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none"
                              placeholder="Define your total, serviceable, and obtainable markets..."
                            />
                          </div>
                          <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Competitor Landscape</label>
                            <textarea 
                              value={activeStartup.data.competitors}
                              onChange={(e) => handleUpdateData('competitors', e.target.value)}
                              rows={3}
                              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none"
                              placeholder="Who is doing something similar? How do you win?"
                            />
                          </div>
                        </div>
                    )}
                    {activeStartup.currentStage === StartupJourneyStage.PROTOTYPE && renderPrototype()}
                    {activeStartup.currentStage === StartupJourneyStage.STRATEGY && (
                         <div className="bg-white p-8 rounded-[2rem] border shadow-sm animate-in slide-in-from-right duration-500">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">The Revenue Engine</label>
                             <textarea 
                               value={activeStartup.data.revenueModel}
                               onChange={(e) => handleUpdateData('revenueModel', e.target.value)}
                               rows={8}
                               className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium text-slate-700 focus:ring-4 focus:ring-emerald-100 outline-none text-lg"
                               placeholder="How will the money flow? Pricing, tiers, margins..."
                             />
                         </div>
                    )}
                    {activeStartup.currentStage === StartupJourneyStage.PRODUCT && (
                         <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-right duration-500">
                           <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">MVP Feature Set</label>
                             <textarea 
                               value={activeStartup.data.mvpFeatures.join('\n')}
                               onChange={(e) => handleUpdateData('mvpFeatures', e.target.value.split('\n'))}
                               rows={4}
                               className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-700 focus:ring-4 focus:ring-cyan-100 outline-none"
                               placeholder="What 3 things MUST it do to launch?"
                             />
                           </div>
                           <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Execution Stack</label>
                             <input 
                               value={activeStartup.data.techStack}
                               onChange={(e) => handleUpdateData('techStack', e.target.value)}
                               className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-700 focus:ring-4 focus:ring-cyan-100 outline-none"
                               placeholder="React, Bubble, Flutter, Shopify...?"
                             />
                           </div>
                         </div>
                    )}
                    {activeStartup.currentStage === StartupJourneyStage.VALIDATION && (
                         <div className="bg-white p-8 rounded-[2rem] border shadow-sm animate-in slide-in-from-right duration-500">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Go-To-Market & Testing</label>
                             <textarea 
                               value={activeStartup.data.gtmStrategy}
                               onChange={(e) => handleUpdateData('gtmStrategy', e.target.value)}
                               rows={6}
                               className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium text-slate-700 focus:ring-4 focus:ring-orange-100 outline-none text-lg"
                               placeholder="How will you find your first 10 paying customers?"
                             />
                         </div>
                    )}
                    {activeStartup.currentStage === StartupJourneyStage.PITCH && (
                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                         {isGeneratingDeck ? (
                           <div className="py-20 text-center space-y-6">
                              <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} />
                              <h3 className="text-2xl font-bold">Writing Investor Deck...</h3>
                           </div>
                         ) : activeStartup.pitchDeck.map((slide, i) => (
                            <div key={i} className="bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-6 text-white/5 font-black text-6xl">0{i+1}</div>
                               <h4 className="text-2xl font-black mb-4">{slide.title}</h4>
                               <p className="text-white/70 text-sm mb-6 leading-relaxed italic">"{slide.content}"</p>
                               <ul className="space-y-2">
                                  {slide.keyPoints.map((kp, ki) => <li key={ki} className="flex items-center gap-2 text-xs font-bold text-white/90"><CheckCircle2 className="text-emerald-400" size={14} /> {kp}</li>)}
                               </ul>
                            </div>
                         ))}
                      </div>
                    )}
                </div>

                <div className="mt-12 flex justify-between items-center border-t pt-10 border-slate-50">
                    <button 
                        onClick={prevStage}
                        disabled={activeStartup.currentStage === StartupJourneyStage.IDEATION}
                        className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-800 disabled:opacity-0 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft size={20} /> Back
                    </button>
                    <button 
                        onClick={nextStage}
                        disabled={activeStartup.currentStage === StartupJourneyStage.PITCH || (!activeStartup.name && activeStartup.currentStage === StartupJourneyStage.IDEATION)}
                        className={`px-12 py-5 rounded-[2rem] font-bold text-white shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 ${activeStageConfig?.color.replace('text-', 'bg-') || 'bg-slate-900'}`}
                    >
                        {activeStartup.currentStage === StartupJourneyStage.VALIDATION ? 'Finish & Generate Deck' : 'Confirm & Proceed'} <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>

        {/* Persistent AI Co-Pilot Panel */}
        <div className="lg:col-span-4 flex flex-col h-full">
            <div className="glass-card h-[600px] rounded-[3rem] border bg-slate-900 text-white shadow-2xl flex flex-col overflow-hidden">
                <div className="p-8 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                        <Sparkles size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-lg leading-tight">Co-Pilot</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Pre-Startup Expert</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-none border border-white/10' : 'bg-white/20 text-white/90 rounded-tl-none border border-white/5'}`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-2 text-[10px] text-white/50">
                                <Loader2 size={12} className="animate-spin" /> Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-6 bg-white/5 border-t border-white/10">
                    <div className="flex gap-2 bg-white/10 p-2 rounded-2xl border border-white/10">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                            placeholder="Ask for help or brainstorming..."
                            className="flex-1 bg-transparent border-none text-xs px-3 focus:outline-none placeholder:text-white/30"
                        />
                        <button 
                            onClick={handleChat}
                            disabled={!chatInput.trim() || isChatLoading}
                            className="bg-white text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Helper Panel */}
            <div className="mt-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
               <div className="flex items-center gap-3">
                  <HandMetal className="text-amber-500" size={24} />
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Startup Tip</h4>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed italic">
                  {activeStartup.currentStage === StartupJourneyStage.IDEATION && "Don't overthink. Focus on a problem you personally have or one you see people complaining about on Reddit/Twitter."}
                  {activeStartup.currentStage === StartupJourneyStage.PRODUCT && "A real MVP shouldn't take more than 2 weeks to build. If yours takes longer, you're building too much."}
                  {activeStartup.currentStage === StartupJourneyStage.PITCH && "Investors invest in lines, not dots. Show them the trajectory of your thinking, not just a snapshot."}
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartupSimulator;
