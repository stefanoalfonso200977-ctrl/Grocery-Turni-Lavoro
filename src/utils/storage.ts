import { HistoricalRecord } from '../types';

const DB_NAME = 'GroceryTurniAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_state';
const RECORD_KEY = 'last_uploaded_file';

export interface StoredFileState {
  fileName: string;
  uploadedAt: string;
  records: HistoricalRecord[];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB non supportato dal browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Salva l'ultimo file caricato con le relative righe estratte in IndexedDB
 */
export async function saveLastUploadedFile(
  fileName: string,
  records: HistoricalRecord[]
): Promise<void> {
  try {
    const db = await openDB();
    const payload: StoredFileState = {
      fileName,
      uploadedAt: new Date().toISOString(),
      records
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload, RECORD_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Errore salvataggio IndexedDB, fallback localStorage:', err);
    try {
      // Fallback leggero in localStorage se IndexedDB non disponibile
      const payload: StoredFileState = {
        fileName,
        uploadedAt: new Date().toISOString(),
        records
      };
      localStorage.setItem(RECORD_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Impossibile salvare in localStorage:', e);
    }
  }
}

/**
 * Recupera l'ultimo file caricato dalla memoria persistente
 */
export async function loadLastUploadedFile(): Promise<StoredFileState | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as StoredFileState);
        } else {
          // Controlla fallback in localStorage
          const local = localStorage.getItem(RECORD_KEY);
          if (local) {
            try {
              resolve(JSON.parse(local));
              return;
            } catch {
              resolve(null);
              return;
            }
          }
          resolve(null);
        }
      };

      req.onerror = () => {
        const local = localStorage.getItem(RECORD_KEY);
        if (local) {
          try {
            resolve(JSON.parse(local));
            return;
          } catch {
            resolve(null);
            return;
          }
        }
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Lettura IndexedDB fallita, controllo localStorage:', err);
    const local = localStorage.getItem(RECORD_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Rimuove il file salvato dalla memoria persistente
 */
export async function clearLastUploadedFile(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(RECORD_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Cancellazione IndexedDB fallita:', err);
  }
  try {
    localStorage.removeItem(RECORD_KEY);
  } catch (e) {
    // ignore
  }
}
