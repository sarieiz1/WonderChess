
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'en' | 'he';

export interface GameResult {
  id: string;
  winner: string;
  winnerTeam: 'Penguins' | 'Butterflies' | 'Draw';
  player1: string;
  player1Team: 'w' | 'b';
  player2: string;
  player2Team: 'w' | 'b';
  date: string;
  duration: string;
}

export interface GameSettings {
  player1: string;
  player2: string;
  isComputer: boolean;
  userTeam: 'w' | 'b';
  difficulty: Difficulty;
  language: Language;
}

export enum GameStatus {
  SETUP = 'setup',
  PLAYING = 'playing',
  FINISHED = 'finished',
  HALL_OF_FAME = 'hall_of_fame'
}
