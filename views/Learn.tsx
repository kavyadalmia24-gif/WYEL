
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Rocket, ChevronRight, PlayCircle, ArrowLeft, Trophy, BrainCircuit, BookOpen, Globe2, Zap, Award, Target, Users, Scale, Factory, BarChart4, HeartHandshake, Sun, Compass, CreditCard, Brain, Home, AlertTriangle, ShieldCheck, Layers, FileText, Landmark, PiggyBank, Briefcase, Lightbulb, Users2, Megaphone, BadgeDollarSign, LineChart, Handshake, Settings, Gavel, Wallet, HandCoins, Share2, HeartPulse, Sparkles, CheckCircle2, XCircle, DollarSign, X
} from 'lucide-react';
import { generateLessonContent } from '../services/geminiService';
import { GeneratedLessonData, UserStats, SkillType } from '../types';
import MiniCalculator from '../components/MiniCalculators';
import confetti from 'canvas-confetti';

// --- Types ---

interface Chapter { id: string; title: string; isCompleted?: boolean; }
interface Module { id: string; title: string; chapters: Chapter[]; }
interface Track { id: string; title: string; description: string; icon: any; color: string; accentColor: string; modules: Module[]; skillType: SkillType; }

// --- Curriculum Data ---

const FINANCE_CURRICULUM_RAW = [
  { title: "Foundation Modules (Beginner)", modules: ["Money Basics 101", "Smart Spending & Saving", "Banking Essentials", "Budgeting for Beginners", "Understanding Interest", "Financial Safety & Scams"], icon: PiggyBank, color: "emerald" },
  { title: "Intermediate Money Skills", modules: ["Mastering Digital Banking", "Credit Cards & Credit Score", "Savings Accounts vs FD vs RD", "Taxes for Young Earners", "Income Planning & Side Hustles"], icon: Landmark, color: "blue" },
  { title: "Investing & Wealth-Building", modules: ["Investing Basics for Everyone", "Mutual Funds & SIP Mastery", "Stock Market 101", "Fundamental Analysis", "Technical Analysis & Charts", "Portfolio Building"], icon: TrendingUp, color: "indigo" },
  { title: "Advanced Trading & Crypto", modules: ["Trading vs Investing", "Day & Swing Trading Strategies", "Crypto & Blockchain Basics", "Advanced Crypto Investing", "Crypto Security & Scams"], icon: Zap, color: "orange" },
  { title: "Youth & Family Finance", modules: ["Introducing Kids to Money", "Pocket Money & Smart Choices", "Joint Accounts & Family Budgeting", "Wedding Finance Planning", "Parenting for Financial Success"], icon: Users, color: "rose" },
  { title: "Work-Life & Money Wellness", modules: ["Financial Stress Management", "Healthy Work-Life Budgeting", "Money Habits for Mental Wellness", "Burnout Prevention for Earners", "Sleep, Productivity & Wealth", "Decision Fatigue & Smart Spending"], icon: Sun, color: "amber" },
  { title: "Legal & Consumer Rights", modules: ["Banking Ombudsman Guide", "Insurance Claim Rights", "Fraud Reporting & Recovery", "Investment Regulations & SEBI", "Buying Online Consumer Rights"], icon: Scale, color: "slate" },
  { title: "Professional Investment Tools", modules: ["Options Trading for Beginners", "Futures Contracts Explained", "Index Funds vs ETFs", "Risk Indicators (VIX, Beta)", "Algo Trading Basics"], icon: BarChart4, color: "red" },
  { title: "Business & Entrepreneurship (Advanced)", modules: ["Cost Structure Optimization", "Business Funding & Loans", "Understanding Valuations", "Unit Economics Simplified", "Small Business Taxation"], icon: Factory, color: "cyan" },
  { title: "Real World Money Skills", modules: ["Home Buying Step-by-Step", "Rental Agreements & Rights", "Land / Property Document Basics", "Car Buying vs Leasing", "Co-Living & Flatmate Finances"], icon: Home, color: "teal" },
  { title: "Money Risk & Crisis Handling", modules: ["Emergency Fund Blueprint", "Handling Job Loss Financially", "Managing Inflation in Daily Life", "Economic Recession Survival Plan", "Personal Disaster Finance Plan"], icon: AlertTriangle, color: "rose" },
  { title: "Career & Income Building", modules: ["Portfolio & Resume Basics", "Freelancing Platforms & Payments", "Building a Side Business", "Personal Branding Basics", "Pricing Your Skills for Profit"], icon: Compass, color: "indigo" },
  { title: "Borrowing & Credit Mastery", modules: ["Credit Utilization Deep Dive", "Loan Settlement & CIBIL Repair", "Balance Transfer Smart Strategy", "Credit Card Reward Optimization", "BNPL Risks & Hacks"], icon: CreditCard, color: "violet" },
  { title: "Money Psychology & Mindset", modules: ["Overcoming Fear of Money", "Building Wealth Habits", "Minimalism & Money", "Financial Decision-Making Biases", "Emotional Spending Control"], icon: Brain, color: "orange" },
  { title: "Money & Relationships", modules: ["How to Negotiate Salary & Deals"], icon: HeartHandshake, color: "rose" },
  { title: "Alternative Investments", modules: ["Gold vs Digital Gold", "Bonds & Govt Securities", "REITs & InvITs", "Commodity Investing", "Art & Luxury Investing", "International Investing"], icon: Layers, color: "pink" },
  { title: "Global Financial Literacy", modules: ["Currency & Forex Basics", "Geopolitics & Markets", "Trade Deficits Explained", "Crypto Regulations", "NRI Taxation Basics"], icon: Globe2, color: "blue" },
  { title: "Practical Financial Tools", modules: ["Excel for Finance", "Tax Filing Step-by-Step", "Salary Slip Breakdown", "Reading Bank Statements", "Brokerage App Walkthrough"], icon: FileText, color: "slate" },
  { title: "Financial Growth & Life Skills", modules: ["Insurance Essentials", "Goal Setting & Wealth Planning", "Behavioural Finance", "Debt Management & Loans", "Retirement Planning"], icon: ShieldCheck, color: "emerald" },
  { title: "Bonus Specialized Modules", modules: ["Indian Financial System", "Inflation & Economy", "Financial Tools Mastery", "Real Estate Basics", "Entrepreneurship Finance"], icon: BookOpen, color: "violet" },
];

const ENTRE_CURRICULUM_RAW = [
  { title: "Entrepreneurial Mindset", modules: ["Thinking Like a Founder", "Risk vs Reward Mindset", "Solving Problems That Matter", "Discipline Over Motivation", "Learning From Failure"], icon: Brain, color: "rose" },
  { title: "Problem Discovery & Validation", modules: ["Identifying Real Pain Points", "Customer Interviews Basics", "Market Gaps Recognition", "Validation Without Building", "Avoiding Fake Demand"], icon: Lightbulb, color: "amber" },
  { title: "Idea to Opportunity", modules: ["Turning Ideas Into Opportunities", "Idea Filtering Frameworks", "Competitive Gap Analysis", "Timing the Market", "Choosing the Right Idea"], icon: Compass, color: "indigo" },
  { title: "Market & Industry Research", modules: ["TAM SAM SOM Explained", "Customer Segmentation", "Industry Trend Analysis", "Competitor Mapping", "Market Entry Barriers"], icon: Globe2, color: "blue" },
  { title: "Value Proposition Design", modules: ["Crafting Clear Value Propositions", "Customer Jobs-to-Be-Done", "Differentiation Strategy", "Benefits vs Features", "Value Messaging Clarity"], icon: Target, color: "emerald" },
  { title: "Business Models & Strategy", modules: ["Types of Business Models", "Revenue Stream Design", "Cost Structure Planning", "Unit Economics Basics", "Choosing the Right Model"], icon: Layers, color: "violet" },
  { title: "MVP & Product Thinking", modules: ["Minimum Viable Product Basics", "No-Code MVP Approaches", "Feature Prioritization", "Build–Measure–Learn Loop", "Avoiding Overbuilding"], icon: Rocket, color: "orange" },
  { title: "Customer Experience & UX", modules: ["Customer Journey Mapping", "UX Principles for Startups", "Onboarding Experience Design", "Retention vs Acquisition", "Feedback-Driven Improvements"], icon: Users2, color: "rose" },
  { title: "Branding & Positioning", modules: ["Brand Identity Fundamentals", "Positioning in Crowded Markets", "Naming & Brand Voice", "Trust & Credibility Building", "Storytelling for Brands"], icon: Megaphone, color: "pink" },
  { title: "Marketing Foundations", modules: ["Early-Stage Marketing Strategy", "Content Marketing Basics", "Social Media for Startups", "Community-Led Growth", "Marketing Experimentation"], icon: Zap, color: "orange" },
  { title: "Sales & Revenue Generation", modules: ["Sales Funnel Fundamentals", "Cold Outreach Basics", "Pricing Psychology", "Negotiation Skills", "Closing Your First Customers"], icon: BadgeDollarSign, color: "emerald" },
  { title: "Growth & Scaling", modules: ["Growth Metrics That Matter", "Product-Led Growth Basics", "Scaling Without Breaking", "Growth Experiments", "Avoiding Premature Scaling"], icon: LineChart, color: "indigo" },
  { title: "Team & Culture Building", modules: ["Hiring First Team Members", "Founder–Team Alignment", "Building Startup Culture", "Managing Conflict", "Leadership for Founders"], icon: Handshake, color: "blue" },
  { title: "Operations & Execution", modules: ["Daily Execution Systems", "Process Design Basics", "Tools for Startup Operations", "Time & Priority Management", "Founder Productivity Systems"], icon: Settings, color: "slate" },
  { title: "Legal & Compliance Basics", modules: ["Business Registration Overview", "Founder Agreements Basics", "Intellectual Property Essentials", "Compliance for Startups", "Avoiding Legal Pitfalls"], icon: Gavel, color: "zinc" },
  { title: "Startup Finance for Founders", modules: ["Startup Accounting Basics", "Cash Flow Management", "Burn Rate & Runway", "Financial Planning for Startups", "Founder Salary Decisions"], icon: Wallet, color: "emerald" },
  { title: "Fundraising & Investors", modules: ["Bootstrapping vs Funding", "Angel & VC Overview", "Pitch Deck Essentials", "Valuation Basics", "Investor Communication"], icon: HandCoins, color: "amber" },
  { title: "Go-To-Market Strategy", modules: ["Choosing Distribution Channels", "Launch Strategy Planning", "Early Adopter Acquisition", "Market Feedback Loops", "Iterating After Launch"], icon: Share2, color: "indigo" },
  { title: "Resilience & Crisis Management", modules: ["Handling Startup Failure", "Pivoting Strategically", "Managing Uncertainty", "Founder Mental Health", "Crisis Decision-Making"], icon: HeartPulse, color: "rose" },
  { title: "Founder Growth & Long-Term Vision", modules: ["Founder Personal Growth", "Building Long-Term Vision", "Exit Strategies Overview", "Sustainable Entrepreneurship", "Legacy & Impact Building"], icon: Sparkles, color: "violet" },
];

const COLORS_MAP: Record<string, string> = {
  emerald: 'from-emerald-500 to-teal-600',
  blue: 'from-blue-500 to-cyan-600',
  indigo: 'from-indigo-500 to-violet-600',
  orange: 'from-orange-500 to-amber-600',
  rose: 'from-rose-500 to-pink-600',
  amber: 'from-amber-400 to-yellow-500',
  slate: 'from-slate-500 to-gray-600',
  red: 'from-red-500 to-rose-600',
  cyan: 'from-cyan-500 to-sky-600',
  teal: 'from-teal-500 to-emerald-600',
  violet: 'from-violet-500 to-purple-600',
  zinc: 'from-zinc-500 to-slate-600',
  pink: 'from-pink-500 to-rose-600'
};

const processCurriculum = (skill: SkillType): Track[] => {
  const raw = skill === SkillType.FINANCE ? FINANCE_CURRICULUM_RAW : ENTRE_CURRICULUM_RAW;
  return raw.map((track, tIdx) => ({
    id: `${skill === SkillType.FINANCE ? 'f' : 'e'}${tIdx}`,
    title: track.title,
    description: `Master the fundamentals of ${track.title} with expert modules.`,
    icon: track.icon,
    color: track.color,
    accentColor: COLORS_MAP[track.color] || 'from-indigo-500 to-violet-600',
    skillType: skill,
    modules: [{
        id: `m-${tIdx}`,
        // Fix: Added missing 'title' property as required by the Module interface
        title: track.title,
        chapters: track.modules.map((m, mIdx) => ({
            id: `c-${tIdx}-${mIdx}`,
            title: m,
            isCompleted: false
        }))
    }]
  }));
};

// --- Improved Markdown Renderer ---

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parsed = content
    .replace(/\n/g, '<br/>')
    .replace(/## (.*?)(?=<br|$)/g, '<h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4 border-b border-indigo-100 pb-2">$1</h3>')
    .replace(/\*\* (.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
    .replace(/-(.*?)(?=<br|$)/g, '<div class="flex gap-2 items-start ml-2 mb-1"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span><span>$1</span></div>');

  return (
    <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-light">
      <div dangerouslySetInnerHTML={{ __html: parsed }} />
    </div>
  );
};

const Learn: React.FC<{ userStats: UserStats, updateStats: (s: Partial<UserStats>) => void }> = ({ userStats, updateStats }) => {
  const isFinance = userStats.activeSkill === SkillType.FINANCE;
  const tracks = useMemo(() => processCurriculum(userStats.activeSkill), [userStats.activeSkill]);
  
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [lessonData, setLessonData] = useState<GeneratedLessonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Quiz State
  const [quizMode, setQuizMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [chapterCompleted, setChapterCompleted] = useState(false);

  const handleChapterSelect = async (chapter: Chapter, moduleTitle: string) => {
    setActiveChapter(chapter);
    setLessonData(null);
    setQuizMode(false);
    setChapterCompleted(false);
    setCurrentQ(0);
    setQuizScore(0);
    setIsLoading(true);
    
    try {
      const data = await generateLessonContent(chapter.title, moduleTitle);
      if (data) setLessonData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (idx: number) => {
      if (isAnswered) return;
      setSelectedOpt(idx);
      setIsAnswered(true);
      if (idx === lessonData?.quiz[currentQ].correctAnswer) setQuizScore(s => s + 1);
  };

  const handleNextQuestion = () => {
      if (!lessonData) return;
      if (currentQ < lessonData.quiz.length - 1) {
          setCurrentQ(c => c + 1);
          setSelectedOpt(null);
          setIsAnswered(false);
      } else {
          setChapterCompleted(true);
          const xpKey = isFinance ? 'xp' : 'entreXp';
          updateStats({
              [xpKey]: userStats[xpKey] + 100 + (quizScore * 10),
              lessonsCompleted: userStats.lessonsCompleted + 1,
              quizScore: userStats.quizScore + quizScore
          });
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <BrainCircuit size={64} className="text-indigo-600 mb-6 animate-spin" />
        <p className="text-xl font-heading font-bold text-slate-700 tracking-tight">Curating your AI lesson...</p>
        <p className="text-slate-400 mt-2">Connecting to the Gemini intelligence network</p>
      </div>
    );
  }

  if (activeChapter && lessonData) {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-in slide-in-from-right duration-500 pb-20">
        <button onClick={() => { setActiveChapter(null); setLessonData(null); }} className="flex items-center gap-2 mb-8 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
          <ArrowLeft size={20}/> Back to Curriculum
        </button>
        <div className="glass-card p-10 rounded-[2.5rem] bg-white shadow-2xl relative overflow-hidden border border-white/60">
          {!quizMode ? (
            <div>
              <div className="mb-10 pb-8 border-b border-indigo-50/50">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-4">
                      <BookOpen size={12} /> {selectedTrack?.title}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mb-4 leading-tight">{lessonData.title}</h1>
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                        <span className="flex items-center gap-1"><Globe2 size={16}/> Gemini AI Verified</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>Interactive Module</span>
                  </div>
              </div>
              <MarkdownRenderer content={lessonData.content} />
              
              {lessonData.simulator && lessonData.simulator !== 'null' && (
                  <div className="mt-16 mb-16 transform scale-[1.02]">
                      <MiniCalculator type={lessonData.simulator as any} />
                  </div>
              )}

              <button onClick={() => setQuizMode(true)} className="mt-12 w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-bold text-xl hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3">
                Test Your Knowledge <ChevronRight size={20} />
              </button>
            </div>
          ) : !chapterCompleted ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                  <div>
                      <h2 className="text-2xl font-heading font-bold text-slate-900">Quiz Challenge</h2>
                      <p className="text-slate-500 text-sm">Testing: {activeChapter.title}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 flex items-center justify-center font-heading font-bold text-indigo-600 text-xl bg-white shadow-sm">
                      {currentQ + 1}<span className="text-sm text-slate-400 font-normal">/{lessonData.quiz.length}</span>
                  </div>
              </div>

              <div className="space-y-8">
                  <h3 className="text-2xl font-medium text-slate-800 leading-relaxed font-heading">
                      {lessonData.quiz[currentQ].question}
                  </h3>

                  <div className="space-y-4">
                      {lessonData.quiz[currentQ].options.map((opt, idx) => {
                          let btnClass = "w-full p-6 rounded-2xl text-left border-2 transition-all flex items-center justify-between group relative overflow-hidden ";
                          if (isAnswered) {
                              if (idx === lessonData.quiz[currentQ].correctAnswer) btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm";
                              else if (idx === selectedOpt) btnClass += "border-rose-500 bg-rose-50 text-rose-900 shadow-sm";
                              else btnClass += "border-slate-100 text-slate-400 opacity-50 bg-white/50";
                          } else {
                              btnClass += "border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-lg bg-white shadow-sm";
                          }

                          return (
                              <button key={idx} onClick={() => handleQuizAnswer(idx)} disabled={isAnswered} className={btnClass}>
                                  <span className="font-bold relative z-10 text-lg">{opt}</span>
                                  {isAnswered && idx === lessonData.quiz[currentQ].correctAnswer && <CheckCircle2 className="text-emerald-600 relative z-10" size={28} />}
                                  {isAnswered && idx === selectedOpt && idx !== lessonData.quiz[currentQ].correctAnswer && <XCircle className="text-rose-600 relative z-10" size={28} />}
                              </button>
                          )
                      })}
                  </div>

                  {isAnswered && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="bg-indigo-50 p-6 rounded-2xl text-indigo-900 mb-8 border border-indigo-100/50">
                              <strong className="block mb-2 text-indigo-700 font-heading text-lg">AI Insight:</strong> 
                              <p className="opacity-90 leading-relaxed italic">{lessonData.quiz[currentQ].explanation}</p>
                          </div>
                          <button onClick={handleNextQuestion} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-600 transition-all transform hover:scale-[1.02]">
                              {currentQ < lessonData.quiz.length - 1 ? 'Next Challenge' : 'Unlock Rewards'}
                          </button>
                      </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 animate-in zoom-in duration-500 flex flex-col items-center">
                <div className="w-32 h-32 bg-amber-100 rounded-[2rem] flex items-center justify-center mb-8 text-amber-500 shadow-xl shadow-amber-100/50 rotate-3">
                    <Trophy size={64} fill="currentColor" />
                </div>
                <h2 className="text-5xl font-heading font-extrabold text-slate-900 mb-4">Mastered!</h2>
                <p className="text-xl text-slate-500 mb-10 max-w-sm">You've successfully conquered <br/><span className="text-indigo-600 font-bold">{activeChapter.title}</span></p>
                <div className="flex gap-6 mb-12">
                      <div className="bg-white p-6 rounded-3xl w-44 border border-emerald-100 shadow-xl">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">Score</p>
                        <p className="text-4xl font-heading font-extrabold text-slate-900">{quizScore}/3</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl w-44 border border-indigo-100 shadow-xl">
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">XP Gained</p>
                        <p className="text-4xl font-heading font-extrabold text-slate-900">+{100 + (quizScore * 10)}</p>
                    </div>
                </div>
                <button onClick={() => { setActiveChapter(null); setLessonData(null); }} className="px-12 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-indigo-600 transition-all shadow-xl hover:shadow-2xl">Return to Academy</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <h2 className="text-5xl font-heading font-extrabold text-slate-900 mb-3 tracking-tight">
            {isFinance ? 'Denari Academy' : 'Founder School'}
          </h2>
          <p className="text-slate-500 text-xl font-light">
            {tracks.length} expert tracks. {tracks.reduce((acc, t) => acc + t.modules[0].chapters.length, 0)} interactive modules. Infinite potential.
          </p>
        </div>
        <div className={`px-8 py-4 rounded-[1.5rem] font-bold shadow-xl flex items-center gap-3 border ${isFinance ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-rose-600 text-white border-rose-500'}`}>
          <Award size={24}/> {isFinance ? userStats.xp : userStats.entreXp} XP
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tracks.map(track => {
          const Icon = track.icon;
          return (
            <div key={track.id} onClick={() => setSelectedTrack(track)} className="backdrop-blur-xl bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-sm">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${track.accentColor} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`} />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-md bg-white border border-slate-50 group-hover:scale-110 transition-transform`}>
                <Icon size={32} className={`text-${track.color}-600`}/>
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors h-14 flex items-center leading-tight">{track.title}</h3>
              <p className="text-slate-500 text-sm mb-8 line-clamp-2 h-10 font-medium">{track.description}</p>
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                  {track.modules[0].chapters.length} Interactive Steps
                </span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight size={20}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTrack && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-white/20">
            <div className={`p-12 bg-gradient-to-r ${selectedTrack.accentColor} text-white flex justify-between items-center relative overflow-hidden shadow-lg`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10">
                <h2 className="text-5xl font-heading font-bold mb-3 tracking-tight">{selectedTrack.title}</h2>
                <p className="text-xl opacity-90 font-light max-w-2xl">{selectedTrack.description}</p>
              </div>
              <button onClick={() => setSelectedTrack(null)} className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors relative z-10 backdrop-blur-md border border-white/20 shadow-lg">
                <X size={24} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-slate-50/40 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedTrack.modules[0].chapters.map((ch, chIdx) => (
                      <button key={ch.id} onClick={() => handleChapterSelect(ch, selectedTrack.title)} className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-indigo-400 text-left font-bold transition-all flex justify-between items-center group shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-heading font-extrabold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {chIdx + 1}
                            </div>
                            <div>
                                <span className="text-slate-800 text-lg block leading-tight">{ch.title}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 block">Level {chIdx + 1}</span>
                            </div>
                        </div>
                        <PlayCircle size={24} className="text-slate-200 group-hover:text-indigo-600 transition-all transform group-hover:scale-110"/>
                      </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;
