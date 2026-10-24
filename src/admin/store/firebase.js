import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { emulatorHost, firebaseConfig } from '../../shared/firebase.js';

// Firestore layout shared with the landing page and the security rules
// (firestore.rules in the app repository):
//   site/content  public texts, contacts and company details
//   site/admins   { emails: [...] } — who may use this panel
//   leads/{id}    quote requests from the form
//   gallery/{id}  photos of installations, stored inline as data URLs

function connect() {
  const emulated = emulatorHost();
  const config = emulated && !firebaseConfig.apiKey ? { ...firebaseConfig, apiKey: 'emulator', appId: 'emulator' } : firebaseConfig;
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (emulated) {
    connectAuthEmulator(auth, emulatorHost('auth'), { disableWarnings: true });
    const [host, port] = emulated.split(':');
    connectFirestoreEmulator(db, host, Number(port));
  }
  return { auth, db };
}

const toDate = (value) => (value?.toDate ? value.toDate().toISOString() : value ?? null);

export function createFirebaseStore() {
  const { auth, db } = connect();
  const content = doc(db, 'site', 'content');
  const admins = doc(db, 'site', 'admins');

  return {
    mode: 'firebase',
    onAuth(fn) {
      return onAuthStateChanged(auth, (user) => fn(user ? { email: user.email, name: user.displayName, uid: user.uid } : null));
    },
    signInGoogle() {
      return signInWithPopup(auth, new GoogleAuthProvider());
    },
    signInEmail(email, password) {
      return signInWithEmailAndPassword(auth, email, password);
    },
    signOut() {
      return signOut(auth);
    },
    /** True when the rules let this account read the admin list. */
    async checkAccess() {
      try {
        await getDoc(admins);
        return true;
      } catch (error) {
        if (error?.code === 'permission-denied') return false;
        throw error;
      }
    },
    watchLeads(fn, onError) {
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(500));
      return onSnapshot(
        q,
        (snapshot) =>
          fn(
            snapshot.docs.map((d) => {
              const data = d.data({ serverTimestamps: 'estimate' });
              return { ...data, id: d.id, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
            }),
          ),
        onError,
      );
    },
    updateLead(id, patch) {
      return updateDoc(doc(db, 'leads', id), { ...patch, updatedAt: serverTimestamp() });
    },
    deleteLead(id) {
      return deleteDoc(doc(db, 'leads', id));
    },
    async loadContent() {
      const snapshot = await getDoc(content);
      return snapshot.exists() ? snapshot.data() : null;
    },
    /** Replaces the given top-level parts (pl, en, contacts, company) only. */
    saveContent(part) {
      const fields = Object.keys(part);
      return setDoc(
        content,
        { ...part, updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.email ?? '' },
        { mergeFields: [...fields, 'updatedAt', 'updatedBy'] },
      );
    },
    watchGallery(fn, onError) {
      const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
      return onSnapshot(q, (snapshot) => fn(snapshot.docs.map((d) => ({ ...d.data(), id: d.id }))), onError);
    },
    addPhoto(photo) {
      return addDoc(collection(db, 'gallery'), { ...photo, createdAt: serverTimestamp() });
    },
    updatePhoto(id, patch) {
      return updateDoc(doc(db, 'gallery', id), patch);
    },
    deletePhoto(id) {
      return deleteDoc(doc(db, 'gallery', id));
    },
    async loadAdmins() {
      const snapshot = await getDoc(admins);
      return snapshot.exists() ? snapshot.data().emails ?? [] : [];
    },
    saveAdmins(emails) {
      return setDoc(admins, { emails, updatedAt: serverTimestamp() });
    },
  };
}
