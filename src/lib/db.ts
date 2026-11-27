// IndexedDB storage for the user's own music files -> plays with zero internet.
import type { Track } from "./types";

const DB = "artify";
const STORE = "files";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export const fileDb = {
  put: (id: string, blob: Blob) => tx("readwrite", (s) => s.put(blob, id)),
  get: (id: string) => tx<Blob | undefined>("readonly", (s) => s.get(id)),
  remove: (id: string) => tx("readwrite", (s) => s.delete(id)),
};

function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const a = new Audio();
    const url = URL.createObjectURL(file);
    a.preload = "metadata";
    a.src = url;
    a.onloadedmetadata = () => { resolve(isFinite(a.duration) ? a.duration : 0); URL.revokeObjectURL(url); };
    a.onerror = () => { resolve(0); URL.revokeObjectURL(url); };
  });
}

export async function importFiles(files: FileList | File[]): Promise<Track[]> {
  const out: Track[] = [];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|aac|flac|wav|ogg|opus)$/i.test(file.name)) continue;
    const localId = `local-${crypto.randomUUID()}`;
    await fileDb.put(localId, file);
    const base = file.name.replace(/\.[^.]+$/, "");
    const [artist, title] = base.includes(" - ") ? base.split(" - ", 2) : ["My Library", base];
    out.push({
      id: localId,
      localId,
      title: title.trim(),
      artist: artist.trim(),
      duration: await readDuration(file),
      source: "local",
      addedAt: Date.now(),
    });
  }
  return out;
}
