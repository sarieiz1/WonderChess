
import React, { useState, useEffect } from 'react';
import { GameSettings, Difficulty, Language, UserProfile } from '../types';
import { User as UserIcon, Users, Bot, Star, Shield, ShieldAlert, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
  language: Language;
  user: UserProfile | null;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, language, user }) => {
  const t = TRANSLATIONS[language];
  const [player1, setPlayer1] = useState(user?.name || (language === 'he' ? 'מיכאל' : 'Michael'));
  const [isComputer, setIsComputer] = useState(true);
  const [player2, setPlayer2] = useState(t.computer);
  const [userTeam, setUserTeam] = useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  // Update name when user signs in or language switches
  useEffect(() => {
    if (user) {
      setPlayer1(user.name);
    } else {
      if (player1 === 'Michael' && language === 'he') setPlayer1('מיכאל');
      if (player1 === 'מיכאל' && language === 'en') setPlayer1('Michael');
    }
  }, [language, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      player1,
      player2: isComputer ? t.snowman : player2,
      isComputer,
      userTeam,
      difficulty,
      language
    });
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border-b-8 border-blue-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-600 p-3 rounded-2xl text-white">
          <Star fill="currentColor" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t.newAdventure}</h2>
          <p className="text-slate-500 font-medium">{t.chooseKingdom}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">{t.yourName}</label>
          <div className="relative">
            {user ? (
               <img src={user.picture} className={`absolute ${language === 'he' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-blue-200`} />
            ) : (
               <UserIcon className={`absolute ${language === 'he' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
            )}
            <input
              type="text"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              disabled={!!user}
              className={`w-full ${language === 'he' ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all font-semibold ${user ? 'text-slate-500 cursor-not-allowed' : ''}`}
              placeholder="..."
              required
            />
            {user && (
              <CheckCircle2 className={`absolute ${language === 'he' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-green-500`} size={20} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIsComputer(true)}
            className={`p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${isComputer ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}
          >
            <Bot size={32} className={isComputer ? 'text-blue-600' : 'text-slate-500'} />
            <span className="font-bold">{t.vsComputer}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsComputer(false)}
            className={`p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${!isComputer ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}
          >
            <Users size={32} className={!isComputer ? 'text-indigo-600' : 'text-slate-500'} />
            <span className="font-bold">{t.local2P}</span>
          </button>
        </div>

        {isComputer && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-bold text-slate-700 mb-3 text-center">{t.difficulty}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${difficulty === 'easy' ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-100 text-slate-400'}`}
              >
                <Shield size={18} />
                <span className="text-xs font-bold uppercase">{t.easy}</span>
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('medium')}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${difficulty === 'medium' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
              >
                <ShieldCheck size={18} />
                <span className="text-xs font-bold uppercase">{t.medium}</span>
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${difficulty === 'hard' ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-100 text-slate-400'}`}
              >
                <ShieldAlert size={18} />
                <span className="text-xs font-bold uppercase">{t.hard}</span>
              </button>
            </div>
          </div>
        )}

        {!isComputer && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t.player2Name}</label>
            <input
              type="text"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none transition-all font-semibold"
              placeholder="..."
              required={!isComputer}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">{t.whichKingdom}</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserTeam('w')}
              className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${userTeam === 'w' ? 'border-cyan-400 bg-cyan-50' : 'border-slate-100 bg-slate-50 opacity-50'}`}
            >
              <span className="text-5xl">🐧</span>
              <span className="font-black text-slate-800">{t.penguins}</span>
            </button>
            <button
              type="button"
              onClick={() => setUserTeam('b')}
              className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${userTeam === 'b' ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50 opacity-50'}`}
            >
              <span className="text-5xl">🦋</span>
              <span className="font-black text-slate-800">{t.butterflies}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          {t.startMagic}
        </button>
      </form>
    </div>
  );
};

export default SetupScreen;
