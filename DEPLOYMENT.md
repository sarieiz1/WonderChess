# Vercel Deployment Checklist

## Prerequisites

### 1. Firebase Setup
- [ ] Create a Firebase project at https://console.firebase.google.com
- [ ] Enable **Firestore Database** (start in test mode, then add security rules)
- [ ] Enable **Authentication** → **Google** provider
- [ ] Get your Firebase config from Project Settings → General → Your apps
- [ ] Add your Vercel domain to Firebase Auth authorized domains (if needed)

### 2. Environment Variables

Add these in **Vercel Dashboard** → Your Project → Settings → Environment Variables:

**Required for Serverless Functions:**
- `GEMINI_API_KEY` - Your Gemini API key (server-side only)

**Required for Frontend (VITE_ prefix):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 3. Firestore Security Rules

Add these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Game history - authenticated users can read all, write their own
    match /gameHistory/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Deployment Steps

1. **Install dependencies locally** (to verify everything works):
   ```bash
   npm install
   ```

2. **Test locally** (optional but recommended):
   ```bash
   npm run dev
   ```

3. **Deploy to Vercel**:
   - Option A: Connect your Git repository to Vercel (recommended)
     - Push code to GitHub/GitLab/Bitbucket
     - Import project in Vercel
     - Add environment variables in Vercel dashboard
     - Deploy
   
   - Option B: Deploy via Vercel CLI:
     ```bash
     npm i -g vercel
     vercel
     ```
     Follow prompts and add environment variables when asked.

4. **Verify Deployment**:
   - Check that the app loads
   - Test Google Sign-In
   - Test game creation and saving
   - Test Hall of Fame loading

## Troubleshooting

- **Firebase errors**: Check that all `VITE_FIREBASE_*` env vars are set correctly
- **API route errors**: Check that `GEMINI_API_KEY` is set (not `VITE_GEMINI_API_KEY`)
- **Build errors**: Check Vercel build logs for missing dependencies
- **CORS errors**: The API route already handles CORS, but check browser console

## Post-Deployment

- [ ] Test authentication flow
- [ ] Test game saving to Firestore
- [ ] Test Hall of Fame loading
- [ ] Verify Gemini TTS API works (check browser console for errors)
- [ ] Set up Firestore indexes if needed (Vercel will warn you)

