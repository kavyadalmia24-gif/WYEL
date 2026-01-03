
import React, { useState } from 'react';
import { 
  TrendingUp, Rocket, ChevronRight, PlayCircle, ArrowLeft, BookOpen, Zap, Award, Target, Sun, CreditCard, Home, AlertTriangle, ShieldCheck, Landmark, PiggyBank, Briefcase, Lightbulb, Sparkles, ChevronDown, ChevronUp, Users, Gavel, Settings, BadgeDollarSign,
  Search, BarChart3, DollarSign, Megaphone, Users2, Loader2, RefreshCw
} from 'lucide-react';
import { generateLessonContent } from '../services/geminiService';
import { GeneratedLessonData, UserStats, SkillType } from '../types';
import MiniCalculator from '../components/MiniCalculators';
import confetti from 'canvas-confetti';

interface LearnProps {
  userStats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
}

const FINANCE_CURRICULUM = [
  { title: "Foundation Modules (Beginner)", modules: ["Money Basics 101", "Smart Spending & Saving", "Banking Essentials", "Budgeting for Beginners", "Understanding Interest", "Financial Safety & Scams"], icon: PiggyBank, banner: "bg-[#059669]" },
  { title: "Intermediate Money Skills", modules: ["Mastering Digital Banking", "Credit Cards & Credit Score", "Savings Accounts vs FD vs RD", "Taxes for Young Earners", "Income Planning & Side Hustles"], icon: Landmark, banner: "bg-[#2563eb]" },
  { title: "Investing & Wealth-Building", modules: ["Investing Basics for Everyone", "Mutual Funds & SIP Mastery", "Stock Market 101", "Fundamental Analysis", "Technical Analysis & Charts", "Portfolio Building"], icon: TrendingUp, banner: "bg-[#4f46e5]" },
  { title: "Advanced Trading & Crypto", modules: ["Trading vs Investing", "Day & Swing Trading Strategies", "Crypto & Blockchain Basics", "Advanced Crypto Investing", "Crypto Security & Scams"], icon: Zap, banner: "bg-[#d97706]" },
  { title: "Youth & Family Finance", modules: ["Introducing Kids to Money", "Pocket Money & Smart Choices", "Joint Accounts & Family Budgeting", "Wedding Finance Planning", "Parenting for Financial Success"], icon: Users, banner: "bg-[#e11d48]" },
  { title: "Work-Life & Money Wellness", modules: ["Financial Stress Management", "Healthy Work-Life Budgeting", "Habits for Mental Wellness", "Burnout Prevention", "Sleep & Wealth", "Decision Fatigue"], icon: Sun, banner: "bg-[#d97706]" },
  { title: "Legal & Consumer Rights", modules: ["Banking Ombudsman", "Insurance Claim Rights", "Fraud Reporting", "SEBI Regulations", "Online Consumer Rights"], icon: Gavel, banner: "bg-[#475569]" },
  { title: "Professional Investment Tools", modules: ["Options Trading Basics", "Futures Explained", "Index Funds vs ETFs", "Risk Indicators (VIX)", "Algo Trading Basics"], icon: Settings, banner: "bg-[#2563eb]" },
  { title: "Business Entrepreneurship", modules: ["Cost Optimization", "Business Funding", "Valuations", "Unit Economics", "Small Business Tax"], icon: Briefcase, banner: "bg-[#4f46e5]" },
  { title: "Real World Money Skills", modules: ["Home Buying Steps", "Rental Agreements", "Property Documents", "Car Buying vs Leasing", "Co-Living Finances"], icon: Home, banner: "bg-[#059669]" },
  { title: "Money Risk & Crisis", modules: ["Emergency Blueprint", "Job Loss Strategy", "Inflation Management", "Recession Survival", "Disaster Finance"], icon: AlertTriangle, banner: "bg-[#e11d48]" },
  { title: "Career & Income", modules: ["Portfolio Basics", "Freelance Payments", "Side Business", "Personal Branding", "Pricing Your Skills"], icon: BadgeDollarSign, banner: "bg-[#d97706]" },
  { title: "Borrowing & Credit", modules: ["Utilization Deep Dive", "CIBIL Repair", "Balance Transfer", "Reward Optimization", "BNPL Risks"], icon: CreditCard, banner: "bg-[#2563eb]" }
];

const ENTREPRENEUR_CURRICULUM = [
  { title: "Entrepreneurial Mindset", modules: ["Thinking Like a Founder", "Risk vs Reward Mindset", "Solving Problems That Matter", "Discipline Over Motivation", "Learning From Failure"], icon: Lightbulb, banner: "bg-amber-600" },
  { title: "Problem Discovery & Validation", modules: ["Identifying Real Pain Points", "Customer Interviews Basics", "Market Gaps Recognition", "Validation Without Building", "Avoiding Fake Demand"], icon: Search, banner: "bg-indigo-600" },
  { title: "Idea to Opportunity", modules: ["Turning Ideas Into Opportunities", "Idea Filtering Frameworks", "Competitive Gap Analysis", "Timing the Market", "Choosing the Right Idea"], icon: Target, banner: "bg-rose-600" },
  { title: "Market & Industry Research", modules: ["TAM SAM SOM Explained", "Customer Segmentation", "Industry Trend Analysis", "Competitor Mapping", "Market Entry Barriers"], icon: BarChart3, banner: "bg-emerald-600" },
  { title: "Value Proposition Design", modules: ["Crafting Clear Value Propositions", "Customer Jobs-to-Be-Done", "Differentiation Strategy", "Benefits vs Features", "Value Messaging Clarity"], icon: Sparkles, banner: "bg-violet-600" },
  { title: "Business Models & Strategy", modules: ["Types of Business Models", "Revenue Stream Design", "Cost Structure Planning", "Unit Economics Basics", "Choosing the Right Model"], icon: Briefcase, banner: "bg-slate-700" },
  { title: "MVP & Product Thinking", modules: ["Minimum Viable Product Basics", "No-Code MVP Approaches", "Feature Prioritization", "Build–Measure–Learn Loop", "Avoiding Overbuilding"], icon: Rocket, banner: "bg-orange-600" },
  { title: "Customer Experience & UX", modules: ["Customer Journey Mapping", "UX Principles for Startups", "Onboarding Experience Design", "Retention vs Acquisition", "Feedback-Driven Improvements"], icon: Users, banner: "bg-cyan-600" },
  { title: "Branding & Positioning", modules: ["Brand Identity Fundamentals", "Positioning in Crowded Markets", "Naming & Brand Voice", "Storytelling for Brands", "Trust & Credibility Building"], icon: Award, banner: "bg-pink-600" },
  { title: "Early-Stage Marketing", modules: ["Marketing Foundations", "Strategy Basics", "Content Marketing", "Social Media for Startups", "Community-Led Growth"], icon: Megaphone, banner: "bg-sky-600" },
  { title: "Sales & Revenue", modules: ["Sales Funnel Fundamentals", "Cold Outreach Basics", "Pricing Psychology", "Negotiation Skills", "Closing Your First Customers"], icon: BadgeDollarSign, banner: "bg-emerald-700" },
  { title: "Growth & Scaling", modules: ["Growth Metrics That Matter", "Product-Led Growth Basics", "Scaling Without Breaking", "Growth Experiments", "Avoiding Premature Scaling"], icon: TrendingUp, banner: "bg-indigo-700" },
  { title: "Team & Culture", modules: ["Hiring First Team Members", "Founder–Team Alignment", "Building Startup Culture", "Managing Conflict", "Leadership for Founders"], icon: Users2, banner: "bg-orange-700" },
  { title: "Operations & Execution", modules: ["Daily Execution Systems", "Process Design Basics", "Tools for Startup Operations", "Time & Priority Management", "Founder Productivity Systems"], icon: Settings, banner: "bg-slate-800" },
  { title: "Legal & Compliance", modules: ["Business Registration", "Founder Agreements", "Intellectual Property", "Compliance for Startups", "Avoiding Legal Pitfalls"], icon: Gavel, banner: "bg-slate-600" },
  { title: "Startup Finance", modules: ["Startup Accounting", "Cash Flow Management", "Burn Rate & Runway", "Financial Planning", "Founder Salary Decisions"], icon: DollarSign, banner: "bg-emerald-800" },
  { title: "Fundraising & Investors", modules: ["Bootstrapping vs Funding", "Angel & VC Overview", "Pitch Deck Essentials", "Valuation Basics", "Investor Communication"], icon: Landmark, banner: "bg-violet-800" },
  { title: "Go-To-Market Strategy", modules: ["Choosing Distribution Channels", "Launch Strategy Planning", "Early Adopter Acquisition", "Market Feedback Loops", "Iterating After Launch"], icon: Target, banner: "bg-rose-700" },
  { title: "Resilience & Crisis", modules: ["Handling Startup Failure", "Pivoting Strategically", "Managing Uncertainty", "Founder Mental Health", "Crisis Decision-Making"], icon: AlertTriangle, banner: "bg-rose-800" },
  { title: "Long-Term Vision", modules: ["Founder Personal Growth", "Building Long-Term Vision", "Exit Strategies Overview", "Sustainable Entrepreneurship", "Legacy & Impact Building"], icon: Sun, banner: "bg-amber-700" }
];

const Learn: React.FC<LearnProps> = ({ userStats, updateStats }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<GeneratedLessonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const curriculum = userStats.activeSkill === SkillType.FINANCE ? FINANCE_CURRICULUM : ENTREPRENEUR_CURRICULUM;

  const handleStartLesson = async (topic: string, module: string) => {
    setSelectedTopic(topic);
    setSelectedModule(module);
    setIsLoading(true);
    setError(null);
    setShowQuiz(false);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out")), 30000)
    );

    try {
      const content = await Promise.race([
        generateLessonContent(topic, module),
        timeoutPromise
      ]) as GeneratedLessonData | null;

      if (content && content.title && content.content) {
        setLessonContent(content);
      } else {
        throw new Error("AI failed to return valid lesson content.");
      }
    } catch (err: any) {
      console.error("Lesson Error:", err);
      setError(
        err.message === "Request timed out" 
          ? "The Academy AI is taking longer than usual. Please try again."
          : "We couldn't draft your curriculum right now. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    const xpKey = userStats.activeSkill === SkillType.FINANCE ? 'xp' : 'entreXp';
    updateStats({
      [xpKey]: userStats[xpKey] + 100,
      lessonsCompleted: userStats.lessonsCompleted + 1,
      coins: userStats.coins + 50
    });
    setLessonContent(null);
    setShowQuiz(false);
  };

  /**
   * Robust light-weight Markdown-to-JSX renderer
   */
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // H1 Header
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-4xl font-black mt-10 mb-6 text-slate-900 leading-tight">{trimmed.replace('# ', '')}</h1>;
      }
      
      // H2 Header
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-3xl font-black mt-12 mb-6 text-slate-900 border-b pb-4 leading-tight">{trimmed.replace('## ', '')}</h2>;
      }
      
      // H3 Header
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-2xl font-black mt-8 mb-4 text-slate-800 leading-tight">{trimmed.replace('### ', '')}</h3>;
      }

      // List Items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-6 mb-2 list-disc text-slate-700">
            {renderInlines(trimmed.substring(2))}
          </li>
        );
      }

      // Empty Lines
      if (trimmed === '') return <div key={idx} className="h-4" />;

      // Standard Paragraph
      return (
        <p key={idx} className="mb-6 leading-relaxed text-slate-700 text-lg">
          {renderInlines(trimmed)}
        </p>
      );
    });
  };

  /**
   * Helper to render inline markdown like **bold**
   */
  const renderInlines = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  if (lessonContent && !showQuiz) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-in slide-in-from-bottom-4">
        <button onClick={() => setLessonContent(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 font-bold transition-colors">
          <ArrowLeft size={18} /> Back to Academy
        </button>
        <div className="glass-card p-12 rounded-[3.5rem] bg-white shadow-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-8">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{selectedTopic}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600 text-sm font-bold">{selectedModule}</span>
          </div>
          <h1 className="text-5xl font-heading font-black text-slate-900 mb-10 leading-tight">{lessonContent.title}</h1>
          <div className="prose-container max-w-none">
             {renderMarkdown(lessonContent.content)}
          </div>
          {lessonContent.simulator && lessonContent.simulator !== 'null' && (
            <div className="mt-16 pt-16 border-t border-slate-100">
               <MiniCalculator type={lessonContent.simulator as 'SIP' | 'LUMPSUM' | 'EMI'} />
            </div>
          )}
          <div className="mt-20 flex justify-center">
            <button onClick={() => setShowQuiz(true)} className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-bold text-xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 shadow-2xl transition-all flex items-center gap-3">
              Start Final Assessment <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showQuiz && lessonContent) {
    return (
        <div className="max-w-3xl mx-auto py-12 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-16">
                <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Award size={48} />
                </div>
                <h2 className="text-4xl font-heading font-black text-slate-900 mb-2">Knowledge Verification</h2>
                <p className="text-slate-500 text-lg font-medium">Topic: {lessonContent.title}</p>
            </div>
            <div className="space-y-8">
                {lessonContent.quiz.map((q, qIdx) => (
                    <div key={q.id} className="glass-card p-12 rounded-[3.5rem] bg-white border shadow-2xl">
                        <p className="font-heading font-bold text-2xl mb-10 text-slate-900 leading-snug"><span className="text-indigo-600 mr-3 opacity-30">Q{qIdx + 1}</span> {q.question}</p>
                        <div className="grid grid-cols-1 gap-4">
                            {q.options.map((opt, oIdx) => (
                                <button key={oIdx} onClick={handleQuizSubmit} className="p-8 rounded-3xl border-2 border-slate-100 text-left hover:border-indigo-500 hover:bg-indigo-50 transition-all font-bold text-slate-700 hover:text-indigo-800 text-lg shadow-sm">
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-heading font-black text-slate-900 tracking-tighter mb-4">The Academy</h1>
          <p className="text-slate-500 text-2xl font-light">Comprehensive {userStats.activeSkill === SkillType.FINANCE ? 'Financial' : 'Entrepreneurial'} Tracks.</p>
        </div>
        <div className="bg-white px-10 py-6 rounded-[3rem] border shadow-2xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg"><BookOpen size={28}/></div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modules Mastered</p>
                <p className="text-3xl font-heading font-black text-slate-900">{userStats.lessonsCompleted}</p>
            </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-[2rem] flex flex-col items-center gap-4 text-rose-700 animate-in slide-in-from-top-4 shadow-lg">
          <div className="flex items-center gap-4 w-full">
            <AlertTriangle className="shrink-0 text-rose-600" size={32} />
            <div className="flex-1">
              <p className="font-black text-lg">Academic Interrupt</p>
              <p className="font-medium text-sm opacity-80">{error}</p>
            </div>
            <button onClick={() => handleStartLesson(selectedTopic || "", selectedModule || "")} className="bg-rose-600 text-white p-3 rounded-full hover:bg-rose-700 transition-all shadow-md">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => setError(null)} className="p-3 text-rose-300 hover:text-rose-600 transition-all">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {curriculum.map((track, idx) => {
          const Icon = track.icon;
          const isExpanded = expandedTrack === idx;
          return (
            <div key={idx} className="glass-card rounded-[3.5rem] bg-white border border-slate-100 overflow-hidden hover:shadow-[0_40px_60px_-15px_rgba(0,0,0,0.15)] transition-all group flex flex-col">
              <div className={`${track.banner} h-40 p-10 flex items-start justify-between relative`}>
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
                      <Icon className="text-white" size={32} />
                  </div>
                  <div className="bg-slate-900/40 px-5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-white font-extrabold text-xs backdrop-blur-md">
                      <Zap size={14} className="text-amber-400" /> {track.modules.length} Modules
                  </div>
              </div>
              <div className="p-10 flex-1 flex flex-col">
                <h3 className="text-3xl font-heading font-bold text-slate-900 mb-8 leading-tight">{track.title}</h3>
                <div className="space-y-4 flex-1">
                  {(isExpanded ? track.modules : track.modules.slice(0, 5)).map((mod, modIdx) => (
                    <button key={modIdx} onClick={() => handleStartLesson(track.title, mod)} disabled={isLoading} className="w-full flex items-center justify-between p-6 rounded-3xl bg-slate-50 hover:bg-white hover:scale-[1.03] hover:shadow-xl hover:border-indigo-200 border border-transparent transition-all text-left group/mod disabled:opacity-50">
                      <span className="text-sm font-bold text-slate-700 group-hover/mod:text-indigo-800">{mod}</span>
                      <PlayCircle size={24} className="text-slate-300 group-hover/mod:text-indigo-600 transition-colors" />
                    </button>
                  ))}
                  {track.modules.length > 5 && (
                      <button onClick={() => setExpandedTrack(isExpanded ? null : idx)} className="w-full py-5 text-indigo-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 rounded-3xl transition-all mt-4 border border-dashed border-indigo-100">
                        {isExpanded ? <>Show Less <ChevronUp size={16} /></> : <>Show {track.modules.length - 5} More <ChevronDown size={16} /></>}
                      </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
              <div className="bg-white rounded-[4rem] p-20 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] max-w-xl w-full transform animate-in zoom-in-95 duration-700">
                  <div className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)]">
                      <Sparkles size={56} className="animate-pulse" />
                  </div>
                  <h3 className="text-4xl font-heading font-black text-slate-900 mb-6">Preparing Curriculum</h3>
                  <div className="space-y-4">
                      <p className="text-slate-500 text-xl font-medium">Designing high-impact module: <br/><span className="text-indigo-600 font-bold">"{selectedModule}"</span></p>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-10 relative">
                          <div className="h-full bg-indigo-600 w-full animate-shimmer" style={{backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'}} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest">Our AI is drafting custom content just for you...</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Learn;
