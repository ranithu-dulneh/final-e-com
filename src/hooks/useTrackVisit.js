import { useEffect } from 'react';
import { db } from '../firebase';
import { ref, increment, update } from 'firebase/database';

export const useTrackVisit = () => {
  useEffect(() => {
    // Basic session storage to avoid tracking same user multiple times in a short session
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (!hasVisited) {
      sessionStorage.setItem('hasVisited', 'true');

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const updates = {};
      updates[`analytics/visits/total`] = increment(1);
      updates[`analytics/visits/daily/${today}`] = increment(1);

      update(ref(db), updates).catch(console.error);
    }
  }, []);
};
