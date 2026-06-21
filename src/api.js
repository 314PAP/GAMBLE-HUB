import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

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
}
