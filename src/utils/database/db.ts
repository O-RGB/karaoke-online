import {
  STORAGE_DRIVE,
  STORAGE_USER_SONG,
  STORAGE_TRACKLIST,
  STORAGE_KARAOKE_EXTREME,
  STORAGE_WALLPAPER,
  STORAGE_SOUNDFONT,
  STORAGE_SOUNDFONT_DIC,
  STORAGE_USER_DRIVE,
} from "@/config/value";
import { deleteDB, IDBPDatabase, openDB } from "idb";

const DB_NAME = "Karaoke-online";
const DB_VERSION = 1;

const stores = [
  STORAGE_KARAOKE_EXTREME,
  STORAGE_USER_SONG,
  STORAGE_TRACKLIST,
  STORAGE_SOUNDFONT,
  STORAGE_SOUNDFONT_DIC,
  STORAGE_WALLPAPER,
  STORAGE_DRIVE,
  STORAGE_USER_DRIVE,
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

export async function deleteDatabase(dbName: string = DB_NAME): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);

    request.onsuccess = () => {
      console.log(`Database ${dbName} deleted successfully.`);
      resolve(true);
    };

    request.onerror = (event) => {
      console.error(`Error deleting database ${dbName}:`, event);
      reject(false);
    };

    request.onblocked = () => {
      console.warn(`Database deletion blocked: ${dbName}`);
      // Handle case where the deletion is blocked by open connections
    };
  });
}
