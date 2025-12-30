import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';
import { UserProfile } from '../types';
import { saveUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const profile: UserProfile = {
      name: user.displayName || 'User',
      email: user.email || '',
      picture: user.photoURL || '',
    };
    
    // Save to Firestore
    if (user.uid) {
      await saveUserProfile(user.uid, profile);
    }
    
    return profile;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      // User closed the popup - not really an error
      return null;
    }
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Convert Firebase user to UserProfile
 */
export function firebaseUserToProfile(user: FirebaseUser): UserProfile {
  return {
    name: user.displayName || 'User',
    email: user.email || '',
    picture: user.photoURL || '',
  };
}

