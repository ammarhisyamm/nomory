// Tiny IndexedDB wrapper — meals live on the device only.
const DB_NAME = "food-diary";
const STORE = "meals";
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function dbGetAll<T>(): Promise<T[]> {
  return tx<T[]>("readonly", (s) => s.getAll() as IDBRequest<T[]>);
}

export function dbPut<T>(value: T): Promise<unknown> {
  return tx("readwrite", (s) => s.put(value as unknown as Record<string, unknown>));
}

export function dbDelete(id: string): Promise<unknown> {
  return tx("readwrite", (s) => s.delete(id));
}

export function dbClear(): Promise<unknown> {
  return tx("readwrite", (s) => s.clear());
}
