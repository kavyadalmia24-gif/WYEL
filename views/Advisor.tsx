
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage, SkillType } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface Props {
    activeSkill: SkillType;
}

const Advisor: React.FC<Props> = ({ activeSkill }) => {
  const isFinance = activeSkill === SkillType.FINANCE;
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: isFinance 
        ? "Hello! I'm FinBot, your Denari AI assistant. I can explain complex financial concepts or decode market jargon. What's on your mind today?"
        : "Hi there! I'm EntreBot, your startup strategist. Thinking about validation, fundraising, or scaling? Let's build something great.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getFinancialAdvice(userMsg.text, activeSkill);
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-heading font-bold text-slate-900">{isFinance ? 'Financial Advisor' : 'Startup Mentor'}</h2>
            <p className="text-slate-500">{isFinance ? 'Your personal intelligence unit.' : 'Coaching you through the grind.'}</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
            <Sparkles size={14} /> Powered by Gemini
        </div>
      </div>

      <div className="flex-1 backdrop-blur-xl bg-white/60 rounded-[2rem] border border-white/60 shadow-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-indigo-600 border'}`}>
                {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
              </div>
              <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[2rem] text-[15px] leading-7 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white/80 text-slate-700 border rounded-tl-sm'}`}>
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-5"><div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 border flex items-center justify-center shadow-sm"><Bot size={24} /></div><div className="bg-white/80 p-6 rounded-[2rem] border flex items-center gap-3 text-slate-500 text-sm shadow-sm"><Loader2 size={18} className="animate-spin text-indigo-600" /> Thinking...</div></div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 bg-white/60 border-t backdrop-blur-md">
          <div className="flex gap-3 max-w-4xl mx-auto bg-white p-2 rounded-[1.5rem] border shadow-sm">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." className="flex-1 bg-transparent border-none px-4 py-3 focus:outline-none" disabled={isLoading} />
            <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-indigo-600 text-white w-12 h-12 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center"><Send size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advisor;
