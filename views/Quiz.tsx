
import React, { useState, useMemo } from 'react';
import { Trophy, Zap, ChevronRight, RefreshCw, Star, CheckCircle2, XCircle, Target, Globe } from 'lucide-react';
import { QuizQuestion, UserStats, SkillType } from '../types';
import confetti from 'canvas-confetti';

const QUESTIONS_DB: QuizQuestion[] = [
  // FINANCE QUESTIONS
  { id: 1, category: 'Basics', difficulty: 'Easy', skillType: SkillType.FINANCE, question: "What is the primary purpose of an Emergency Fund?", options: ["To buy a new car", "To invest in stocks", "To cover unexpected expenses", "To save for retirement"], correctAnswer: 2, explanation: "Emergency funds are for unforeseen financial shocks." },
  { id: 2, category: 'Investing', difficulty: 'Medium', skillType: SkillType.FINANCE, question: "What is 'Diversification'?", options: ["All money in one stock", "Spreading investments", "Investing only in gold", "Quick selling"], correctAnswer: 1, explanation: "Diversification spreads risk." },
  
  // ENTREPRENEURSHIP QUESTIONS
  { id: 101, category: 'Mindset', difficulty: 'Easy', skillType: SkillType.ENTREPRENEURSHIP, question: "What is a 'Pivoting' in startups?", options: ["Changing office location", "A strategic change in business direction", "Hiring a new CEO", "Closing the company"], correctAnswer: 1, explanation: "Pivoting is adjusting your strategy based on market feedback." },
  { id: 102, category: 'Validation', difficulty: 'Medium', skillType: SkillType.ENTREPRENEURSHIP, question: "What is the main goal of an MVP?", options: ["Full product launch", "Maximum feature set", "Learning about customers with minimum effort", "Perfect design"], correctAnswer: 2, explanation: "Minimum Viable Product is for learning with least effort." },
  { id: 103, category: 'Finance', difficulty: 'Hard', skillType: SkillType.ENTREPRENEURSHIP, question: "What is 'Burn Rate'?", options: ["The temperature of the office", "Monthly revenue growth", "How fast a company spends its venture capital", "Employee turnover rate"], correctAnswer: 2, explanation: "Burn rate is the rate at which a company loses money." },
  { id: 104, category: 'Marketing', difficulty: 'Easy', skillType: SkillType.ENTREPRENEURSHIP, question: "What does 'TAM' stand for?", options: ["Total Addressable Market", "Target Area Marketing", "Technical Asset Management", "Timed Action Mode"], correctAnswer: 0, explanation: "Total Addressable Market represents the total revenue opportunity." }
];

const Quiz: React.FC<{ userStats: UserStats, updateStats: (s: Partial<UserStats>) => void }> = ({ userStats, updateStats }) => {
  const [view, setView] = useState<'MENU' | 'GAME' | 'RESULTS'>('MENU');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const skillQuestions = useMemo(() => 
    QUESTIONS_DB.filter(q => q.skillType === userStats.activeSkill).sort(() => Math.random() - 0.5).slice(0, 5),
  [userStats.activeSkill, view]);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    if (idx === skillQuestions[currentQIndex].correctAnswer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQIndex < skillQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      const xpKey = userStats.activeSkill === SkillType.FINANCE ? 'xp' : 'entreXp';
      updateStats({ [xpKey]: userStats[xpKey] + (score * 20), quizScore: userStats.quizScore + score });
      if (score === skillQuestions.length) confetti({ particleCount: 150 });
      setView('RESULTS');
    }
  };

  if (view === 'MENU') {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-10 py-12">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-[2rem] shadow-xl mb-6 ${userStats.activeSkill === SkillType.FINANCE ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}><Zap size={48} /></div>
        <h1 className="text-5xl font-heading font-extrabold text-slate-900">Challenges</h1>
        <p className="text-xl text-slate-500">Test your {userStats.activeSkill.toLowerCase()} knowledge and earn XP.</p>
        <button onClick={() => setView('GAME')} className={`px-12 py-5 text-white rounded-3xl font-bold text-xl hover:scale-105 transition-all shadow-2xl ${userStats.activeSkill === SkillType.FINANCE ? 'bg-indigo-600' : 'bg-rose-600'}`}>Start Challenge</button>
      </div>
    );
  }

  if (view === 'GAME') {
    const question = skillQuestions[currentQIndex];
    if (!question) return <div className="text-center py-20">No questions available for this track yet.</div>;
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
          <span className="font-bold text-slate-400">Question {currentQIndex + 1}/5</span>
          <div className="flex gap-2">{skillQuestions.map((_, i) => (<div key={i} className={`h-2 w-8 rounded-full ${i <= currentQIndex ? 'bg-indigo-600' : 'bg-slate-100'}`} />))}</div>
        </div>
        <div className="glass-card p-10 rounded-[2.5rem] bg-white shadow-xl border border-slate-100">
          <h2 className="text-3xl font-heading font-bold mb-10 leading-tight">{question.question}</h2>
          <div className="space-y-4">
            {question.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)} className={`w-full p-6 text-left border-2 rounded-2xl font-bold transition-all ${isAnswered ? (i === question.correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : (i === selectedOpt ? 'bg-rose-50 border-rose-500 text-rose-700' : 'opacity-40 border-slate-100')) : 'border-slate-100 hover:border-indigo-400'}`}>{opt}</button>
            ))}
          </div>
          {isAnswered && (
            <div className="mt-10 animate-in slide-in-from-bottom-4">
              <div className="p-6 bg-indigo-50 rounded-2xl mb-8 border border-indigo-100 font-medium text-indigo-900 italic">" {question.explanation} "</div>
              <button onClick={handleNext} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-colors">Continue</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in">
      <Trophy size={100} className="mx-auto text-amber-500 mb-8" />
      <h2 className="text-5xl font-heading font-extrabold mb-4">Well Done!</h2>
      <p className="text-2xl text-slate-500 mb-12">You got <span className="text-indigo-600 font-bold">{score}/5</span> correct.</p>
      <div className="flex gap-4 justify-center">
        <button onClick={() => setView('MENU')} className="px-10 py-4 bg-slate-100 text-slate-600 rounded-full font-bold">Back to Menu</button>
        <button onClick={() => { setView('GAME'); setCurrentQIndex(0); setScore(0); setIsAnswered(false); setSelectedOpt(null); }} className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2"><RefreshCw size={20}/> Try Again</button>
      </div>
    </div>
  );
};

export default Quiz;
