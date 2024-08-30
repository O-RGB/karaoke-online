// lib/db.ts
import { deleteDB, IDBPDatabase, openDB } from "idb";

const DB_NAME = "Karaoke-online";
const DB_VERSION = 1;

export async function getDB(store_name: string) {
  return upgradeDB(store_name);
}

// เพิ่ม function สำหรับการ upgrade version
async function upgradeDB(store_name: string) {
  const db = await openDB(DB_NAME);

  // ถ้าร้านค้ายังไม่มีอยู่ จะทำการเพิ่ม version ของ database และสร้าง store ใหม่
  if (!db.objectStoreNames.contains(store_name)) {
    const newVersion = db.version + 1;
    db.close();

    return openDB(DB_NAME, newVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(store_name)) {
          db.createObjectStore(store_name);
        }
      },
    });
  }
  return db;
}

// Function to delete all object stores in the database
export async function deleteAllStores(): Promise<IDBPDatabase> {
  const db = await openDB(DB_NAME);

  const storeNames = Array.from(db.objectStoreNames); // Convert TypedDOMStringList to Array

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
