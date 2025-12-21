
import React, { useState, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, User, Heart, Settings, Home, Sparkles, Volume2, VolumeX, Languages, BookOpen } from 'lucide-react';
import { GameStatus, GameSettings, GameResult, Language } from './types';
import { COLORS, TRANSLATIONS } from './constants';
import GameBoard from './components/GameBoard';
import SetupScreen from './components/SetupScreen';
import HallOfFame from './components/HallOfFame';
import Coach from './components/Coach';
import { soundManager } from './utils/audio';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.SETUP);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lang, setLang] = useState<Language>('en');
  const [settings, setSettings] = useState<GameSettings>({
    player1: 'Michael',
    player2: 'Computer',
    isComputer: true,
    userTeam: 'w',
    difficulty: 'medium',
    language: 'en'
  });
  const [game, setGame] = useState(new Chess());
  const [showHug, setShowHug] = useState(false);
  const [isHugging, setIsHugging] = useState(false);
  const [coachMood, setCoachMood] = useState<'idle' | 'happy' | 'encouraging'>('idle');
  const [lastMessage, setLastMessage] = useState('');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (lastMessage && soundEnabled) {
      soundManager.speak(lastMessage, lang);
    }
  }, [lastMessage, lang, soundEnabled]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'he' : 'en';
    setLang(newLang);
    setSettings(prev => ({ ...prev, language: newLang }));
  };

  const triggerHug = () => {
    if (isHugging) return;
    
    setIsHugging(true);
    
    // Magical Multi-Shape Confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 0,
      shapes: ['star', 'circle', 'square'] as confetti.Shape[]
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      
      // Left side burst
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFB6C1', '#FF69B4', '#FF1493', '#FFD700', '#7FFFD4', '#00BFFF']
      });
      
      // Right side burst
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFB6C1', '#FF69B4', '#F472B6', '#A1E3F9', '#A8E6CF']
      });
    }, 250);

    if (soundEnabled) soundManager.playCapture(); // Chime sound
    
    setShowHug(true);
    setCoachMood('happy');
    const hugMsg = `${t.doingGreat} ${t.needsHug}`;
    setLastMessage(hugMsg);

    setTimeout(() => {
      setShowHug(false);
      setIsHugging(false);
    }, 3000);
  };

  const handleGameEnd = (winner: string, winnerTeam: 'Penguins' | 'Butterflies' | 'Draw') => {
    const result: GameResult = {
      id: Date.now().toString(),
      winner,
      winnerTeam,
      player1: settings.player1,
      player1Team: settings.userTeam,
      player2: settings.player2,
      player2Team: settings.userTeam === 'w' ? 'b' : 'w',
      date: new Date().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US'),
      duration: 'N/A'
    };
    
    const history = JSON.parse(localStorage.getItem('chess_hall_of_fame') || '[]');
    localStorage.setItem('chess_hall_of_fame', JSON.stringify([result, ...history]));
    setStatus(GameStatus.FINISHED);
  };

  const startNewGame = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setGame(new Chess());
    setStatus(GameStatus.PLAYING);
    setLastMessage(t.startMagic);
  };

  return (
    <div 
      className={`min-h-screen bg-blue-50 text-slate-800 flex flex-col items-center p-4 md:p-8 ${lang === 'he' ? 'rtl font-[Quicksand,sans-serif]' : 'ltr'}`}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      <header className="w-full max-w-4xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-2xl shadow-sm">
            <Sparkles className="text-yellow-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500">
            {t.title}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={toggleLanguage}
            className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 flex items-center gap-1 text-sm font-bold"
            title="Change Language"
          >
            <Languages size={20} />
            <span className="hidden sm:inline">{lang === 'en' ? 'EN / עב' : 'עב / EN'}</span>
          </button>
          <button 
            onClick={toggleSound}
            className={`p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all ${soundEnabled ? 'text-blue-500' : 'text-slate-400'}`}
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <button 
            onClick={() => setStatus(GameStatus.HALL_OF_FAME)}
            className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-indigo-600"
            title={t.hallOfFame}
          >
            <BookOpen size={24} />
          </button>
          {status !== GameStatus.SETUP && (
            <button 
              onClick={() => setStatus(GameStatus.SETUP)}
              className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600"
            >
              <Home size={24} />
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start justify-center">
        <AnimatePresence mode="wait">
          {status === GameStatus.SETUP && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <SetupScreen onStart={startNewGame} language={lang} />
            </motion.div>
          )}

          {status === GameStatus.PLAYING && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col lg:flex-row gap-8 items-center lg:items-start"
            >
              <div className="flex-1 flex flex-col items-center gap-8">
                <GameBoard 
                  game={game} 
                  setGame={setGame} 
                  settings={settings}
                  onEnd={handleGameEnd}
                  setLastMessage={setLastMessage}
                  isHugging={isHugging}
                />
                
                <div className="relative group">
                  {/* Outer Pulsing Glow */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-4 bg-pink-300 rounded-full blur-2xl z-0"
                  />

                  <motion.button
                    onClick={triggerHug}
                    whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 1, 0] }}
                    whileTap={{ scale: 0.9, y: 5 }}
                    animate={{ 
                      y: [0, -5, 0],
                      boxShadow: [
                        "0px 10px 20px rgba(219,39,119,0.2)",
                        "0px 20px 40px rgba(219,39,119,0.4)",
                        "0px 10px 20px rgba(219,39,119,0.2)"
                      ]
                    }}
                    transition={{ 
                      y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                      boxShadow: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                    }}
                    className="relative z-10 px-12 py-6 bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600 text-white rounded-full font-black text-2xl shadow-[0_10px_0_rgb(190,24,93)] border-t-2 border-white/30 flex items-center gap-4 transition-all active:shadow-none"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      <Heart fill="white" size={32} />
                    </motion.div>
                    
                    <span className="drop-shadow-md tracking-tight uppercase">
                      {t.giveHug}
                    </span>

                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={24} className="text-yellow-200" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>

              <div className="w-full lg:w-72 flex flex-col gap-6">
                <Coach mood={coachMood} message={lastMessage} language={lang} />
                <div className="bg-white p-4 rounded-3xl shadow-lg">
                   <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-600">
                     <Users size={20} />
                     {t.players}
                   </h3>
                   <div className="space-y-3">
                      <div className={`p-3 rounded-2xl border-2 ${game.turn() === 'w' ? 'border-blue-400 bg-blue-50' : 'border-transparent bg-slate-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">🐧 <span className="font-semibold">{settings.player1}</span></span>
                          {game.turn() === 'w' && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">{t.yourTurn}</span>}
                        </div>
                      </div>
                      <div className={`p-3 rounded-2xl border-2 ${game.turn() === 'b' ? 'border-green-400 bg-green-50' : 'border-transparent bg-slate-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">🦋 <span className="font-semibold">{settings.player2}</span></span>
                          {game.turn() === 'b' && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">{t.thinking}</span>}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === GameStatus.HALL_OF_FAME && (
            <motion.div 
              key="hall"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <HallOfFame onClose={() => setStatus(GameStatus.SETUP)} language={lang} />
            </motion.div>
          )}

          {status === GameStatus.FINISHED && (
             <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white p-8 rounded-[3rem] shadow-2xl text-center flex flex-col items-center gap-6 border-8 border-yellow-100"
             >
               <div className="text-6xl">🏆</div>
               <h2 className="text-3xl font-black text-slate-800">{t.gameOver}</h2>
               <p className="text-xl text-slate-600 font-medium">{t.wonderfulPerformance}</p>
               <div className="p-4 bg-blue-50 rounded-2xl w-full">
                  <p className="text-sm uppercase tracking-wider text-blue-500 font-bold mb-1">{t.winner}</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {game.isCheckmate() ? (game.turn() === 'w' ? settings.player2 : settings.player1) : t.draw}
                  </p>
               </div>
               <button 
                onClick={() => setStatus(GameStatus.SETUP)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
               >
                 {t.playAgain}
               </button>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showHug && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-4 border-8 border-pink-200 max-w-lg text-center">
              <span className="text-8xl animate-bounce">💖</span>
              <h2 className="text-3xl font-black text-pink-600 leading-tight">
                {t.doingGreat}<br/>
                <span className="text-xl font-bold text-slate-600 mt-2 block">{t.needsHug}</span>
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
