
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

// Standard piece values in centipawns for better granularity
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Basic positional bonuses to make the AI smarter (e.g., centralizing pieces)
const POSITION_BONUS: Record<string, number[][]> = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ]
};

const GameBoard: React.FC<GameBoardProps> = ({ game, setGame, settings, onEnd, setLastMessage, isHugging }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  
  const [pieceIdMap, setPieceIdMap] = useState<Record<string, string>>({});
  const isFirstRender = useRef(true);
  const coachMsgs = COACH_MESSAGES_I18N[settings.language];

  const syncPieceIds = useCallback((chess: Chess) => {
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
    setPieceIdMap(newMap);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      syncPieceIds(game);
      isFirstRender.current = false;
    }
  }, [game, syncPieceIds]);

  const evaluateBoard = (chess: Chess): number => {
    let totalEvaluation = 0;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          let value = PIECE_VALUES[piece.type] || 0;
          
          // Apply positional bonuses
          const bonusTable = POSITION_BONUS[piece.type];
          if (bonusTable) {
            // Flip table for black pieces
            const bonus = piece.color === 'w' 
              ? bonusTable[r][c] 
              : bonusTable[7 - r][c];
            value += bonus;
          }
          
          totalEvaluation += (piece.color === 'w' ? value : -value);
        }
      }
    }
    return totalEvaluation;
  };

  const minimax = (chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0 || chess.isGameOver()) {
      return -evaluateBoard(chess);
    }
    const moves = chess.moves();
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const score = minimax(chess, depth - 1, alpha, beta, !isMaximizing);
        chess.undo();
        bestScore = Math.max(bestScore, score);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const move of moves) {
        chess.move(move);
        const score = minimax(chess, depth - 1, alpha, beta, !isMaximizing);
        chess.undo();
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    }
  };

  const getBestMove = (chess: Chess, depth: number): string => {
    const moves = chess.moves();
    // Sort moves to help with alpha-beta pruning (captures first)
    moves.sort((a, b) => {
        if (a.includes('x') && !b.includes('x')) return -1;
        if (!a.includes('x') && b.includes('x')) return 1;
        return 0;
    });

    let bestMove = moves[0];
    let bestValue = -Infinity;
    
    for (const move of moves) {
      chess.move(move);
      // AI assumes it is the "black" player if user is "white" (userTeam 'w')
      // but minimax here is relative to material sign. 
      // evaluateBoard returns white - black.
      // If AI is black, it wants to MINIMIZE white-black (Maximizing -Evaluate)
      const boardValue = minimax(chess, depth - 1, -Infinity, Infinity, false);
      chess.undo();
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
    return bestMove;
  };

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

        setPieceIdMap(prev => {
          const next = { ...prev };
          const pieceId = next[result.from];
          delete next[result.from];
          if (result.promotion) {
             next[result.to] = `${result.color}${result.promotion}-${pieceId.split('-')[1]}`;
          } else {
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
      return false;
    }
    return false;
  }, [game, setGame, settings, onEnd, setLastMessage, coachMsgs]);

  useEffect(() => {
    if (settings.isComputer && game.turn() !== settings.userTeam && !game.isGameOver()) {
      const timer = setTimeout(() => {
        const moves = game.moves();
        if (moves.length === 0) return;
        
        let selectedMove: string;
        const currentChess = new Chess(game.fen());
        
        if (settings.difficulty === 'easy') {
          // Mostly random, occasional depth 1
          if (Math.random() < 0.7) {
            selectedMove = moves[Math.floor(Math.random() * moves.length)];
          } else {
            selectedMove = getBestMove(currentChess, 1);
          }
        } else if (settings.difficulty === 'medium') {
          // Decent play at depth 2
          selectedMove = getBestMove(currentChess, 2);
        } else {
          // Serious play at depth 4 with positional awareness
          selectedMove = getBestMove(currentChess, 4);
        }
        
        makeMove(selectedMove);
      }, 600); // Slightly faster response feel, but deep calculation takes over
      
      return () => clearTimeout(timer);
    }
  }, [game, settings, makeMove]);

  const onSquareClick = (square: Square) => {
    if (game.isGameOver() || isHugging) return;
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setValidMoves(moves.map(m => m.to));
      return;
    }
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
        const pieceId = pieceIdMap[square];
        
        const headpiece = 
          (piece?.color === 'w' && piece?.type === 'k') ? PIECE_MAP['wk_head'] : 
          (piece?.color === 'w' && piece?.type === 'q') ? PIECE_MAP['wq_head'] :
          (piece?.color === 'b' && piece?.type === 'k') ? PIECE_MAP['bk_head'] :
          (piece?.color === 'b' && piece?.type === 'q') ? PIECE_MAP['bq_head'] : null;

        board.push(
          <div
            key={square}
            onClick={() => onSquareClick(square)}
            className={`relative flex items-center justify-center cursor-pointer select-none square-inner-shadow`}
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
                     {/* Headpiece (Crown/Bow) - Positioned PERFECTLY on the head */}
                     {headpiece && (
                      <span className="absolute -top-[45%] text-xl md:text-3xl z-30 select-none pointer-events-none">
                        {headpiece}
                      </span>
                    )}

                    {/* Base Character Emoji */}
                    <span className="text-3xl md:text-5xl leading-none">
                      {PIECE_MAP[`${piece.color}${piece.type}`]}
                    </span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Hug Hearts */}
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
