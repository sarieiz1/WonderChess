
import React from 'react';
import { Trophy, ChevronLeft, Calendar, User, Crown, BookOpen } from 'lucide-react';
import { GameResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface HallOfFameProps {
  onClose: () => void;
  language: Language;
}

const HallOfFame: React.FC<HallOfFameProps> = ({ onClose, language }) => {
  const t = TRANSLATIONS[language];
  const history: GameResult[] = JSON.parse(localStorage.getItem('chess_hall_of_fame') || '[]');
  const isRtl = language === 'he';

  return (
    <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl border-b-8 border-indigo-100">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onClose} 
          className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft size={24} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <BookOpen className="text-indigo-500" size={32} />
          {t.hallOfFame}
        </h2>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
            <div className="text-7xl mb-6 grayscale opacity-20">📖</div>
            <p className="text-slate-400 font-bold text-xl">{t.firstTrophy}</p>
          </div>
        ) : (
          history.map((game) => (
            <div 
              key={game.id} 
              className="group relative p-6 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                <span className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Calendar size={14} />
                  {game.date}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  game.winnerTeam === 'Penguins' ? 'bg-blue-100 text-blue-600' : 
                  game.winnerTeam === 'Butterflies' ? 'bg-green-100 text-green-600' : 
                  'bg-slate-200 text-slate-600'
                }`}>
                  {game.winnerTeam === 'Penguins' ? t.penguins : game.winnerTeam === 'Butterflies' ? t.butterflies : t.draw}
                </span>
              </div>
              
              <div className={`flex items-center gap-4 justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-colors ${game.winner === game.player1 ? 'bg-yellow-50 border border-yellow-100' : 'bg-slate-50'}`}>
                  {game.player1Picture ? (
                    <img src={game.player1Picture} className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-sm" alt={game.player1} />
                  ) : (
                    <span className="text-4xl">{game.player1Team === 'w' ? '🐧' : '🦋'}</span>
                  )}
                  <span className={`font-black text-sm truncate w-full text-center ${game.winner === game.player1 ? 'text-slate-900' : 'text-slate-500'}`}>
                    {game.player1}
                  </span>
                  {game.winner === game.player1 && <Crown className="text-yellow-500 absolute top-2 left-2" size={16} />}
                </div>

                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-inner">
                     VS
                   </div>
                </div>

                <div className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-colors ${game.winner === game.player2 ? 'bg-yellow-50 border border-yellow-100' : 'bg-slate-50'}`}>
                  <span className="text-4xl">{game.player2Team === 'w' ? '🐧' : '🦋'}</span>
                  <span className={`font-black text-sm truncate w-full text-center ${game.winner === game.player2 ? 'text-slate-900' : 'text-slate-500'}`}>
                    {game.player2}
                  </span>
                  {game.winner === game.player2 && <Crown className="text-yellow-500 absolute top-2 right-2" size={16} />}
                </div>
              </div>

              {game.winner !== 'Draw' && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-2 bg-gradient-to-r from-transparent via-yellow-50 to-transparent">
                  <Trophy className="text-yellow-500" size={18} />
                  <span className="text-sm font-black text-slate-700 italic">
                    {game.winner} {t.winner}!
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HallOfFame;
