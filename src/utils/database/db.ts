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

// export async function initDatabase(autoIncrement: boolean = true) {
//   const db = await openDB(DB_NAME, DB_VERSION, {
//     upgrade(db) {
//       stores.forEach((store_name) => {
//         if (!db.objectStoreNames.contains(store_name)) {
//           db.createObjectStore(store_name, {
//             keyPath: autoIncrement ? "id" : undefined,
//             autoIncrement: autoIncrement,
//           });
//         }
//       });
//     },
//   });
//   return db;
// }

export async function initDatabase(autoIncrement: boolean = true) {
  try {
    // ปิดการเชื่อมต่อที่มีอยู่ก่อน
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
        console.warn("Database upgrade was blocked");
      },
      blocking() {
        console.warn("Database is blocking upgrade");
      },
      terminated() {
        console.error("Database connection was terminated unexpectedly");
      },
    });

    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);

    // ถ้าเกิดข้อผิดพลาด ให้ลบฐานข้อมูลและลองใหม่
    console.log("Attempting to delete and recreate database...");

    try {
      // ปิดการเชื่อมต่อก่อนลบ
      await closeDatabaseConnections();

      // ลบฐานข้อมูล
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

      await new Promise((resolve, reject) => {
        deleteRequest.onsuccess = () => {
          console.log("Database deleted successfully");
          resolve(true);
        };

        deleteRequest.onerror = (event) => {
          console.error("Failed to delete database:", event);
          reject(event);
        };
      });

      // สร้างฐานข้อมูลใหม่
      const newDb = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          stores.forEach((store_name) => {
            db.createObjectStore(store_name, {
              keyPath: autoIncrement ? "id" : undefined,
              autoIncrement: autoIncrement,
            });
          });
        },
      });

      console.log("Database recreated successfully");
      return newDb;
    } catch (retryError) {
      console.error("Failed to recreate database:", retryError);
      throw new Error("Cannot initialize database after reset attempt");
    }
  }
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
