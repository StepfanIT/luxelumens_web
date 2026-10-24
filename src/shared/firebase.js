// Firebase project shared with the Luxe Lumens app.
export const PROJECT_ID = 'luxlumens-30ad4';

// Web app config for the admin panel's sign-in. It comes from the build
// environment (VITE_FIREBASE_* in .env.local or GitHub repository variables)
// instead of the repository.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
  storageBucket: `${PROJECT_ID}.firebasestorage.app`,
};

export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);

/**
 * Firestore emulator host for local testing (`?emulator` in the URL), e.g.
 * 127.0.0.1:8080. Only honoured on localhost.
 */
export function emulatorHost(kind = 'firestore') {
  if (typeof window === 'undefined') return null;
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (!local || !new URLSearchParams(window.location.search).has('emulator')) return null;
  return kind === 'auth' ? 'http://127.0.0.1:9099' : '127.0.0.1:8080';
}
