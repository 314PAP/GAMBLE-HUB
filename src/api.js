import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, query, orderBy, limit, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (import.meta.env.DEV) {
  console.debug('[Firebase] env apiKey=', Boolean(import.meta.env.VITE_FIREBASE_API_KEY));
  console.debug('[Firebase] env authDomain=', Boolean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN));
  console.debug('[Firebase] env projectId=', Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID));
  console.debug('[Firebase] config=', JSON.stringify({ ...firebaseConfig, apiKey: firebaseConfig.apiKey ? '***' : '' }));
}

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

export function isValidScoreSubmission(balance, prevBest = 0) {
  if (typeof balance !== "number" || !Number.isFinite(balance)) return false;
  if (balance <= 500 || balance > 1_000_000_000) return false;
  const maxAllowedJump = Math.max(50_000, prevBest * 200);
  if (balance > maxAllowedJump) return false;
  return balance > prevBest;
}

export class API {
  constructor(localDb) {
    this.db = localDb;
    this.isOnline = false;
    this.uid = null;
    this.authReady = Promise.resolve(null);
    
    try {
      if (isFirebaseConfigured) {
        this.app = initializeApp(firebaseConfig);
        this.firestore = getFirestore(this.app);
        this.isOnline = true;
        this.authReady = this._initAuth();
      } else {
        console.warn('Firebase config missing — running in local-only mode');
      }
    } catch(e) {
      console.error("Firebase init failed", e);
    }
  }

  async _initAuth() {
    try {
      const auth = getAuth(this.app);
      if (auth.currentUser) {
        this.uid = auth.currentUser.uid;
        return this.uid;
      }
      const cred = await signInAnonymously(auth);
      this.uid = cred?.user?.uid || null;
      return this.uid;
    } catch (e) {
      console.warn("Firebase anonymous auth unavailable:", e?.message || e);
      return null;
    }
  }

  // Získá globální leaderboard z Firebase
  async getGlobalLeaderboard() {
    if (import.meta.env.DEV) console.debug('[API] getGlobalLeaderboard() called, isOnline=', this.isOnline);
    if (this.isOnline) {
      try {
        const q = query(collection(this.firestore, "leaderboard"), orderBy("castka", "desc"), limit(33));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
          results.push({ jmeno: doc.id, castka: doc.data().castka });
        });
        if (import.meta.env.DEV) console.debug('[API] getGlobalLeaderboard() results=', results.length);
        return results;
      } catch (e) {
        console.error('Failed to fetch global leaderboard', e);
        return this.db.getLeaderboard(); // fallback na lokální
      }
    } else {
      const local = this.db.getLeaderboard();
      if (import.meta.env.DEV) console.debug('[API] getGlobalLeaderboard() local fallback=', local.length);
      return Promise.resolve(local);
    }
  }

  // Odešle skóre hráče na server (pouze nejvyšší dosažené)
  /**
   * Record a visit for given IP, incrementing per-IP and global counters.
   * Returns an object { ipCount, total }.
   */
  async recordVisit(ip) {
    if (!this.isOnline) return { ipCount: Number(localStorage.getItem('visitCount') || 0) + 1, total: null };
    try {
      const ipRef = doc(this.firestore, 'visits', ip);
      const globalRef = doc(this.firestore, 'visits', 'global');
      await Promise.all([
        setDoc(ipRef, { count: increment(1) }, { merge: true }),
        setDoc(globalRef, { total: increment(1) }, { merge: true }),
      ]);
      const [ipSnap, globalSnap] = await Promise.all([getDoc(ipRef), getDoc(globalRef)]);
      const ipCount = ipSnap.data()?.count || 1;
      const total = globalSnap.data()?.total || 1;
      return { ipCount, total };
    } catch (e) {
      console.error('Visit record failed', e);
      return { ipCount: Number(localStorage.getItem('visitCount') || 0) + 1, total: null };
    }
  }

  async submitScore(username, balance) {
    if (this.isOnline && balance > 500) {
      try {
        await this.authReady;
        const scoreRef = doc(this.firestore, "leaderboard", username);
        const existing = await getDoc(scoreRef);
        const prevBest = existing.exists() ? (existing.data()?.castka || 0) : 0;
        if (isValidScoreSubmission(balance, prevBest)) {
          await setDoc(scoreRef, {
            castka: balance,
            uid: this.uid || null,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (e) {
        console.error('Failed to submit score to Firebase', e);
      }
    }
    return Promise.resolve(true);
  }

  // Odešle záznam o zápasu do historie na Firebase
  async submitMatch(username, gameName, bet, resultText, isWin, winAmount) {
    if (this.isOnline) {
      try {
        await this.authReady;
        const matchesCol = collection(this.firestore, "matches");
        const matchDoc = doc(matchesCol);
        await setDoc(matchDoc, {
          username,
          gameName,
          bet,
          resultText,
          isWin,
          winAmount,
          uid: this.uid || null,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to submit match to Firebase', e);
      }
    }
    return Promise.resolve(true); // Always resolve to prevent hanging
  }

  // Získá globální historii her z Firebase
  async getGlobalMatches() {
    if (this.isOnline) {
      try {
        const q = query(collection(this.firestore, "matches"), orderBy("timestamp", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
          results.push(doc.data());
        });
        return results;
      } catch (e) {
        console.error('Failed to fetch global matches', e);
        return [];
      }
    }
    return [];
  }
}