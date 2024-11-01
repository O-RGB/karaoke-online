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

const stores = [
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

export async function getDB(
  store_name: string,
  autoIncrement: boolean = false
) {
  // เปิดฐานข้อมูล
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ตรวจสอบว่ามีการสร้าง Object Store ใหม่หรือไม่
      if (!db.objectStoreNames.contains(store_name)) {
        db.createObjectStore(store_name, {
          keyPath: autoIncrement ? "id" : undefined,
          autoIncrement: autoIncrement,
        });
      }
    },
  });

  // สร้างการทำธุรกรรมกับ Object Store ที่ต้องการ
  return db;
}

export async function initDatabase(autoIncrement: boolean = true) {
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
  });
  return db;
}

export const closeDatabaseConnections = () => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.close(); // ปิดการเชื่อมต่อ
      console.log("Database connection closed");
      resolve(true);
    };

    request.onerror = (event) => {
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
