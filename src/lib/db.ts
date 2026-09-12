// Tiny IndexedDB wrapper — Nomory meals cache on the device.
// The cache is namespaced per user id so accounts never see each other's
// offline meals on a shared device. Cloud D1 is the source of truth when
// signed in (see meals-cloud.ts).
const STORE = "meals";
const VERSION = 1;

const LEGACY_DB = "nomory-meals";

function dbName(namespace?: string) {
  // Keep the id safe for IndexedDB database names.
  const safe = (namespace ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  return safe ? `nomory-meals-${safe}` : LEGACY_DB;
}

function openDB(namespace?: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName(namespace), VERSION);
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

function tx<T>(
  namespace: string | undefined,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB(namespace).then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function dbGetAll<T>(namespace?: string): Promise<T[]> {
  return tx<T[]>(namespace, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
}

export function dbPut<T>(value: T, namespace?: string): Promise<unknown> {
  return tx(namespace, "readwrite", (s) => s.put(value as unknown as Record<string, unknown>));
}

export function dbDelete(id: string, namespace?: string): Promise<unknown> {
  return tx(namespace, "readwrite", (s) => s.delete(id));
}

export function dbClear(namespace?: string): Promise<unknown> {
  return tx(namespace, "readwrite", (s) => s.clear());
}
