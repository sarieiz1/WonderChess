import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, GameResult } from '../types';

// Collections
const USERS_COLLECTION = 'users';
const GAME_HISTORY_COLLECTION = 'gameHistory';

/**
 * Save user profile to Firestore
 */
export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...profile,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        name: data.name,
        email: data.email,
        picture: data.picture,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Save game result to Firestore
 */
export async function saveGameResult(gameResult: GameResult, userId?: string): Promise<void> {
  try {
    const gameRef = doc(db, GAME_HISTORY_COLLECTION, gameResult.id);
    await setDoc(gameRef, {
      ...gameResult,
      userId: userId || 'anonymous',
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving game result:', error);
    throw error;
  }
}

/**
 * Get game history from Firestore
 * Note: Currently returns all games for Hall of Fame. Can be filtered by userId in the future if needed.
 */
export async function getGameHistory(userId?: string, limitCount: number = 100): Promise<GameResult[]> {
  try {
    const q = query(
      collection(db, GAME_HISTORY_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const games: GameResult[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      // Convert Firestore Timestamp to string date
      const date = data.createdAt && data.createdAt.toDate
        ? data.createdAt.toDate().toLocaleDateString()
        : data.date || new Date().toLocaleDateString();
      
      games.push({
        id: doc.id,
        winner: data.winner,
        winnerTeam: data.winnerTeam,
        player1: data.player1,
        player1Team: data.player1Team,
        player1Picture: data.player1Picture,
        player2: data.player2,
        player2Team: data.player2Team,
        date: date,
        duration: data.duration || 'N/A',
      });
    });
    
    return games;
  } catch (error) {
    console.error('Error getting game history:', error);
    return [];
  }
}

/**
 * Migrate localStorage data to Firestore
 */
export async function migrateLocalStorageToFirestore(userId: string): Promise<void> {
  try {
    // Migrate user profile
    const savedUser = localStorage.getItem('wonderchess_user');
    if (savedUser) {
      try {
        const userProfile: UserProfile = JSON.parse(savedUser);
        await saveUserProfile(userId, userProfile);
        console.log('User profile migrated to Firestore');
      } catch (e) {
        console.warn('Failed to parse user profile from localStorage:', e);
      }
    }

    // Migrate game history
    const savedHistory = localStorage.getItem('chess_hall_of_fame');
    if (savedHistory) {
      try {
        const history: GameResult[] = JSON.parse(savedHistory);
        // Save each game result
        for (const game of history) {
          await saveGameResult(game, userId);
        }
        console.log(`Migrated ${history.length} game results to Firestore`);
      } catch (e) {
        console.warn('Failed to parse game history from localStorage:', e);
      }
    }
  } catch (error) {
    console.error('Error migrating localStorage to Firestore:', error);
    // Don't throw - migration failure shouldn't break the app
  }
}

