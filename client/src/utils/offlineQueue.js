import { openDB } from 'idb';

const DB_NAME = 'printo-offline';
const STORE_NAME = 'pendingExpenses';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  },
});

export const enqueueExpense = async (expense) => {
  const db = await dbPromise;
  const id = await db.add(STORE_NAME, {
    ...expense,
    createdAt: Date.now(),
  });
  return id;
};

export const getPendingExpenses = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const removePendingExpense = async (id) => {
  const db = await dbPromise;
  return db.delete(STORE_NAME, id);
};

export const clearPendingExpenses = async () => {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  return tx.done;
};



















