import {
  STORAGE_DRIVE_EXTREME_SONG,
  STORAGE_USER_SONG,
  STORAGE_EXTREME_TRACKLIST,
  STORAGE_EXTREME_SONG,
  STORAGE_WALLPAPER,
  STORAGE_SOUNDFONT,
  STORAGE_DRIVE_EXTREME_TRACKLIST,
  STORAGE_USER_TRACKLIST,
  STORAGE_DRIVE_TRACKLIST_SONG,
  STORAGE_DRIVE_SONG,
} from "@/config/value";
import { IDBPDatabase, openDB } from "idb";

const DB_NAME = "Karaoke-online";
const DB_VERSION = 1;

const stores: string[] = [
  STORAGE_EXTREME_SONG,
  STORAGE_WALLPAPER,
  STORAGE_SOUNDFONT,
  STORAGE_USER_SONG,
  STORAGE_EXTREME_TRACKLIST,
  STORAGE_DRIVE_EXTREME_TRACKLIST,
  STORAGE_DRIVE_EXTREME_SONG,
  STORAGE_USER_TRACKLIST,
  STORAGE_DRIVE_SONG,
  STORAGE_DRIVE_TRACKLIST_SONG,
];

export async function ensureDatabaseInitialized(): Promise<void> {
  try {
    const db = await openDB(DB_NAME, DB_VERSION);
    const existingStores = Array.from(db.objectStoreNames);

    const missingStores = stores.filter(
      (store) => !existingStores.includes(store)
    );

    if (missingStores.length > 0) {
      console.warn("Missing stores detected. Recreating database...");
      db.close();
      await deleteDatabase();
      await initDatabase();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export async function getDB(
  store_name: string,
  autoIncrement: boolean = false
): Promise<IDBPDatabase> {
  await ensureDatabaseInitialized();

  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(store_name)) {
        db.createObjectStore(store_name, {
          keyPath: autoIncrement ? "id" : undefined,
          autoIncrement: autoIncrement,
        });
      }
    },
  });

  return db;
}

export async function initDatabase(
  autoIncrement: boolean = true
): Promise<IDBPDatabase> {
  try {
    // ปิดฐานข้อมูลทั้งหมดก่อน
    await closeDatabaseConnections();

    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        stores.forEach((store_name) => {
          if (!db.objectStoreNames.contains(store_name)) {
            db.createObjectStore(store_name, {
              keyPath: autoIncrement ? "id" : undefined,
              autoIncrement: autoIncrement,
            });
          }
        });
      },
      blocked() {
        console.warn(
          "Database upgrade was blocked. Closing old connections..."
        );
        alert("Database update blocked. Please reload the page.");
      },
      blocking() {
        console.warn("Database is blocking upgrade. Closing connection...");
        indexedDB.databases().then((dbs) => {
          dbs.forEach((dbInfo) => {
            if (dbInfo.name === DB_NAME) indexedDB.deleteDatabase(DB_NAME);
          });
        });
      },
      terminated() {
        console.error("Database connection was terminated unexpectedly");
      },
    });

    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);

    console.log("Attempting to delete and recreate database...");

    await closeDatabaseConnections();
    await deleteDatabase();

    // ลองใหม่หลังจากลบ
    return new Promise((resolve) => {
      setTimeout(async () => {
        resolve(await initDatabase());
      }, 500);
    });
  }
}

export const closeDatabaseConnections = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.close();
      console.log("Database connection closed");
      resolve(true);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

export async function deleteAllStores(): Promise<IDBPDatabase> {
  const db = await openDB(DB_NAME);
  const storeNames = Array.from(db.objectStoreNames);

  if (storeNames.length > 0) {
    const newVersion = db.version + 1;
    db.close();

    return openDB(DB_NAME, newVersion, {
      upgrade(db) {
        storeNames.forEach((storeName) => {
          db.deleteObjectStore(storeName);
        });
      },
    });
  }
  return db;
}

export function deleteDatabase(dbName: string = DB_NAME) {
  return indexedDB.deleteDatabase(dbName);
}
