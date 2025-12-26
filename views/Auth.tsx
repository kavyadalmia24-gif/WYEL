
import React, { useState } from 'react';
import { Rocket, Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, name: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // For this simple version, we use the email as the unique key.
    // In a real app, password verification would happen here.
    onLogin(email.toLowerCase(), name || email.split('@')[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl mb-6 shadow-2xl shadow-indigo-200">
            <Rocket className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight mb-2">Denari Studio</h1>
          <p className="text-slate-500 font-medium">Your journey to mastery starts here.</p>
        </div>

        <div className="glass-card p-10 rounded-[3rem] border bg-white shadow-2xl">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setIsRegistering(false)} 
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!isRegistering ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsRegistering(true)} 
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isRegistering ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-medium focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-medium focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                  placeholder="name@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-medium focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              {isRegistering ? 'Create Account' : 'Welcome Back'} <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} /> Progress Auto-Saved Locally
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-amber-400" /> Powered by Denari AI Engine
        </p>
      </div>
    </div>
  );
};

export default Auth;
