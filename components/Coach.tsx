
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface CoachProps {
  mood: 'idle' | 'happy' | 'encouraging';
  message: string;
  language: Language;
}

const Coach: React.FC<CoachProps> = ({ mood, message, language }) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'he';

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-blue-50 relative">
      <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            rotate: mood === 'happy' ? [0, 10, -10, 0] : 0
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-5xl"
        >
          {mood === 'happy' ? '⛄️' : '🐌'}
        </motion.div>
        
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">{t.friendlyCoach}</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, x: isRtl ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-slate-700 font-semibold leading-tight"
            >
              {message || t.thinkNextMove}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Speech Bubble Arrow */}
      <div className={`absolute -bottom-2 ${isRtl ? 'right-10' : 'left-10'} w-4 h-4 bg-white border-b-2 ${isRtl ? 'border-l-2' : 'border-r-2'} border-blue-50 rotate-45`} />
    </div>
  );
};

export default Coach;
