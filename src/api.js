import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, query, orderBy, limit, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvSU7f_QWDK1AkWtXcVaOkLrrzrukHOYE",
  authDomain: "gamblehub-db.firebaseapp.com",
  projectId: "gamblehub-db",
  storageBucket: "gamblehub-db.firebasestorage.app",
  messagingSenderId: "44269751263",
  appId: "1:44269751263:web:c415d1004a73276fb5526a"
};

export class API {
  constructor(localDb) {
    this.db = localDb;
    this.isOnline = false;
    
    try {
      this.app = initializeApp(firebaseConfig);
      this.firestore = getFirestore(this.app);
      this.isOnline = true;
    } catch(e) {
      console.error("Firebase init failed", e);
    }
  }

  // Získá globální leaderboard z Firebase
  async getGlobalLeaderboard() {
    if (this.isOnline) {
      try {
        const q = query(collection(this.firestore, "leaderboard"), orderBy("castka", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
          results.push({ jmeno: doc.id, castka: doc.data().castka });
        });
        return results;
      } catch (e) {
        console.error('Failed to fetch global leaderboard', e);
        return this.db.getLeaderboard(); // fallback na lokální
      }
    } else {
      return Promise.resolve(this.db.getLeaderboard());
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
      const { increment } = await import('firebase/firestore');
      const ipRef = doc(this.firestore, 'visits', ip);
      await setDoc(ipRef, { count: increment(1) }, { merge: true });
      const globalRef = doc(this.firestore, 'visits', 'global');
      await setDoc(globalRef, { total: increment(1) }, { merge: true });
      const ipSnap = await getDoc(ipRef);
      const globalSnap = await getDoc(globalRef);
      const ipCount = ipSnap.data()?.count || 1;
      const total = globalSnap.data()?.total || 1;
      return { ipCount, total };
    } catch (e) {
      console.error('Visit record failed', e);
      return { ipCount: Number(localStorage.getItem('visitCount') || 0) + 1, total: null };
    }
  }

  async submitScore(username, balance) {
    if (this.isOnline && balance > 100) {
      try {
        await setDoc(doc(this.firestore, "leaderboard", username), {
          castka: balance,
          updatedAt: new Date().toISOString()
        }, { merge: true });
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
        const matchesCol = collection(this.firestore, "matches");
        const matchDoc = doc(matchesCol);
        await setDoc(matchDoc, {
          username,
          gameName,
          bet,
          resultText,
          isWin,
          winAmount,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to submit match to Firebase', e);
      }
    }
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
