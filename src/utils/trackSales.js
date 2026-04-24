import { db } from '../firebase';
import { ref, increment, update } from 'firebase/database';

export const trackSale = async (amount) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentMonth = today.substring(0, 7); // YYYY-MM format

  const updates = {};
  updates[`analytics/sales/total/amount`] = increment(amount);
  updates[`analytics/sales/total/count`] = increment(1);

  updates[`analytics/sales/daily/${today}/amount`] = increment(amount);
  updates[`analytics/sales/daily/${today}/count`] = increment(1);

  updates[`analytics/sales/monthly/${currentMonth}/amount`] = increment(amount);
  updates[`analytics/sales/monthly/${currentMonth}/count`] = increment(1);

  try {
    await update(ref(db), updates);
  } catch (error) {
    console.error("Error tracking sale:", error);
  }
};
