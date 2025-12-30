
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { PIECE_MAP, COLORS, COACH_MESSAGES_I18N } from '../constants';
import { GameSettings } from '../types';
import { soundManager } from '../utils/audio';

interface GameBoardProps {
  game: Chess;
  setGame: (game: Chess) => void;
  settings: GameSettings;
  onEnd: (winner: string, winnerTeam: 'Penguins' | 'Butterflies' | 'Draw') => void;
  setLastMessage: (msg: string) => void;
  isHugging: boolean;
}

// Helper to generate IDs for pieces to keep them tracked during moves
const generatePieceIdMap = (chess: Chess) => {
  const newMap: Record<string, string> = {};
  const counts: Record<string, number> = {};
  const board = chess.board();
  
  for (let r = 0; r < 8; r++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[r][j];
      if (piece) {
        const typeColor = `${piece.color}${piece.type}`;
        counts[typeColor] = (counts[typeColor] || 0) + 1;
        const square = `${String.fromCharCode(97 + j)}${8 - r}`;
        newMap[square] = `${typeColor}-${counts[typeColor]}`;
      }
    }
  }
  return newMap;
};

const GameBoard: React.FC<GameBoardProps> = ({ game, setGame, settings, onEnd, setLastMessage, isHugging }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  
  // Initialize with the current game state to avoid blank first render
  const [pieceIdMap, setPieceIdMap] = useState<Record<string, string>>(() => generatePieceIdMap(game));
  const stockfishWorker = useRef<Worker | null>(null);
  const coachMsgs = COACH_MESSAGES_I18N[settings.language];

  // Initialize Stockfish Worker with Cross-Origin bypass
  useEffect(() => {
    let worker: Worker | null = null;

    const initWorker = async () => {
      try {
        // Fetch Stockfish script and create a Blob URL to avoid CORS/Worker-Origin issues
        const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
        const script = await response.text();
        const blob = new Blob([script], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        worker = new Worker(workerUrl);
        stockfishWorker.current = worker;

        worker.postMessage('uci');
        worker.postMessage('ucinewgame');
      } catch (err) {
        console.error("Failed to load Stockfish engine:", err);
      }
    };

    initWorker();

    return () => {
      if (worker) worker.terminate();
    };
  }, []);

  const makeMove = useCallback((move: any) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        setGame(gameCopy);
        setLastMove(result);
        
        if (result.captured) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 300);
          const randomMsg = coachMsgs.capture[Math.floor(Math.random() * coachMsgs.capture.length)];
          setLastMessage(randomMsg);
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        // Update Piece IDs based on the move
        setPieceIdMap(prev => {
          const next = { ...prev };
          const pieceId = next[result.from];
          delete next[result.from];
          if (result.promotion) {
             next[result.to] = `${result.color}${result.promotion}-${pieceId ? pieceId.split('-')[1] : Date.now()}`;
          } else if (pieceId) {
             next[result.to] = pieceId;
          }
          return next;
        });
        
        if (gameCopy.isCheck()) {
          const randomMsg = coachMsgs.check[Math.floor(Math.random() * coachMsgs.check.length)];
          setLastMessage(randomMsg);
          soundManager.playCheck();
        }

        if (gameCopy.isGameOver()) {
          let winner = 'Draw';
          let winnerTeam: 'Penguins' | 'Butterflies' | 'Draw' = 'Draw';
          if (gameCopy.isCheckmate()) {
            winner = gameCopy.turn() === 'w' ? settings.player2 : settings.player1;
            winnerTeam = gameCopy.turn() === 'w' ? 'Butterflies' : 'Penguins';
          }
          onEnd(winner, winnerTeam);
        }
        return true;
      }
    } catch (e) {
      console.error("Move error:", e);
      return false;
    }
    return false;
  }, [game, setGame, settings, onEnd, setLastMessage, coachMsgs]);

  // Handle Computer Turn via Stockfish
  useEffect(() => {
    if (settings.isComputer && game.turn() !== settings.userTeam && !game.isGameOver() && !isEngineThinking) {
      const worker = stockfishWorker.current;
      if (!worker) return;

      setIsEngineThinking(true);

      const onMessage = (e: MessageEvent) => {
        const line = e.data;
        if (line.startsWith('bestmove')) {
          const move = line.split(' ')[1];
          if (move && move !== '(none)') {
            makeMove({
              from: move.substring(0, 2),
              to: move.substring(2, 4),
              promotion: move.length === 5 ? move[4] : 'q'
            });
          }
          setIsEngineThinking(false);
          worker.removeEventListener('message', onMessage);
        }
      };

      worker.addEventListener('message', onMessage);

      let skillLevel = 20;
      let moveTime = 1000;

      if (settings.difficulty === 'easy') {
        skillLevel = 0;
        moveTime = 200;
      } else if (settings.difficulty === 'medium') {
        skillLevel = 8;
        moveTime = 600;
      }

      worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
      worker.postMessage(`position fen ${game.fen()}`);
      worker.postMessage(`go movetime ${moveTime}`);
    }
  }, [game, settings, makeMove, isEngineThinking]);

  const onSquareClick = (square: Square) => {
    if (game.isGameOver() || isHugging || isEngineThinking) return;
    const piece = game.get(square);
    
    // Select a piece
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setValidMoves(moves.map(m => m.to));
      return;
    }

    // Try to move to a square
    if (selectedSquare) {
      const moveSuccess = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q'
      });
      
      if (moveSuccess) {
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // If move failed, and we didn't click another of our pieces, clear selection
        if (!piece || piece.color !== game.turn()) {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    }
  };

  const renderBoard = () => {
    const board = [];
    const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const square = (cols[c] + rows[r]) as Square;
        const piece = game.get(square);
        const isLight = (r + c) % 2 === 0;
        const isSelected = selectedSquare === square;
        const isValidMoveTarget = validMoves.includes(square);
        const isLastMoveFrom = lastMove?.from === square;
        const isLastMoveTo = lastMove?.to === square;
        const pieceId = pieceIdMap[square] || `${square}-empty`;
        
        const headpiece = 
          (piece?.color === 'w' && piece?.type === 'k') ? PIECE_MAP['wk_head'] : 
          (piece?.color === 'w' && piece?.type === 'q') ? PIECE_MAP['wq_head'] :
          (piece?.color === 'b' && piece?.type === 'k') ? PIECE_MAP['bk_head'] :
          (piece?.color === 'b' && piece?.type === 'q') ? PIECE_MAP['bq_head'] : null;

        board.push(
          <div
            key={square}
            onClick={() => onSquareClick(square)}
            className="relative flex items-center justify-center cursor-pointer select-none square-inner-shadow"
            style={{ 
              backgroundColor: isLight ? '#F8FAFC' : '#D1FAE5',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Coordinate Labels */}
            {r === 7 && <span className="absolute bottom-1 right-1 text-[9px] font-bold text-slate-400">{cols[c]}</span>}
            {c === 0 && <span className="absolute top-1 left-1 text-[9px] font-bold text-slate-400">{rows[r]}</span>}

            {/* Selection and Move Highlights */}
            {(isLastMoveFrom || isLastMoveTo) && (
              <div className="absolute inset-0 bg-yellow-200/40" />
            )}

            {isValidMoveTarget && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${piece ? 'border-4 border-pink-400/50' : 'bg-slate-300/50'}`} />
              </div>
            )}

            {isSelected && <div className="absolute inset-0 bg-blue-400/20 z-10" />}

            {piece && (
              <div className="relative z-20 flex items-center justify-center w-full h-full">
                <motion.div
                  key={pieceId}
                  layoutId={pieceId}
                  className={`relative flex items-center justify-center ${isSelected ? 'piece-shadow-lifted' : 'piece-shadow'}`}
                  initial={false}
                  animate={isHugging ? {
                      y: [0, -30, 0],
                      scale: [1, 1.2, 1],
                  } : { 
                    scale: isSelected ? 1.2 : (isLastMoveTo && lastMove?.captured ? [1, 1.4, 0] : 1),
                    y: isSelected ? -8 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <div className="relative flex flex-col items-center">
                     {headpiece && (
                      <span className="absolute -top-[45%] text-xl md:text-3xl z-30 select-none pointer-events-none">
                        {headpiece}
                      </span>
                    )}
                    <span className="text-3xl md:text-5xl leading-none">
                      {PIECE_MAP[`${piece.color}${piece.type}`]}
                    </span>
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence>
                {isHugging && piece && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, y: 0 }}
                        animate={{ opacity: 1, scale: 1.5, y: -40 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 text-xl"
                    >
                        ❤️
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        );
      }
    }
    return board;
  };

  return (
    <div className="board-frame p-2 md:p-4 rounded-[2.5rem]">
      <motion.div 
        animate={isShaking ? { x: [-2, 2, -2, 2, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md md:max-w-xl aspect-square rounded-3xl overflow-hidden border-2 border-slate-700 bg-white"
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {renderBoard()}
        </div>
      </motion.div>
    </div>
  );
};

export default GameBoard;
