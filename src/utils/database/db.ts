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
// กำหนดเวอร์ชันเริ่มต้น - จะถูกอัพเดทเมื่อมีการเปลี่ยนแปลงโครงสร้าง
const DB_INITIAL_VERSION = 1;
// เก็บค่าเวอร์ชันปัจจุบันไว้ในตัวแปรเพื่อป้องกันความขัดแย้ง
let currentVersion = DB_INITIAL_VERSION;

// สร้างรายการ stores ทั้งหมดพร้อมคุณสมบัติ
const STORE_CONFIGS = [
  { name: STORAGE_EXTREME_SONG, keyPath: "id", autoIncrement: true },
  { name: STORAGE_WALLPAPER, keyPath: "id", autoIncrement: true },
  { name: STORAGE_SOUNDFONT, keyPath: "id", autoIncrement: true },
  { name: STORAGE_USER_SONG, keyPath: "id", autoIncrement: true },
  { name: STORAGE_EXTREME_TRACKLIST, keyPath: "id", autoIncrement: true },
  { name: STORAGE_DRIVE_EXTREME_TRACKLIST, keyPath: "id", autoIncrement: true },
  { name: STORAGE_DRIVE_EXTREME_SONG, keyPath: "id", autoIncrement: true },
  { name: STORAGE_USER_TRACKLIST, keyPath: "id", autoIncrement: true },
  { name: STORAGE_DRIVE_SONG, keyPath: "id", autoIncrement: true },
  { name: STORAGE_DRIVE_TRACKLIST_SONG, keyPath: "id", autoIncrement: true },
];

// รายชื่อ stores ทั้งหมด
const storeNames = STORE_CONFIGS.map((config) => config.name);

/**
 * สร้างฐานข้อมูลและ object stores ทั้งหมด
 */
export async function initDatabase(): Promise<IDBPDatabase> {
  try {
    // ตรวจสอบเวอร์ชันปัจจุบันก่อนเปิดฐานข้อมูล
    const databases = await indexedDB.databases();
    const existingDB = databases.find((db) => db.name === DB_NAME);

    if (existingDB && existingDB.version) {
      currentVersion = existingDB.version;
    }

    // เปิดฐานข้อมูลด้วยเวอร์ชันปัจจุบัน
    const db = await openDB(DB_NAME, currentVersion, {
      upgrade(database, oldVersion, newVersion, transaction) {
        console.log(
          `Upgrading database from version ${oldVersion} to ${newVersion}`
        );

        // สร้าง object stores ที่ยังไม่มี
        STORE_CONFIGS.forEach((config) => {
          if (!database.objectStoreNames.contains(config.name)) {
            database.createObjectStore(config.name, {
              keyPath: config.keyPath,
              autoIncrement: config.autoIncrement,
            });
            console.log(`Created store: ${config.name}`);
          }
        });
      },
      blocked() {
        console.warn(
          "Database upgrade was blocked - close other tabs using this application"
        );
      },
      blocking() {
        console.warn("This connection is blocking a database upgrade");
      },
      terminated() {
        console.error("Database connection was terminated unexpectedly");
      },
    });

    // ตรวจสอบว่ามี stores ที่หายไปหรือไม่
    const missingStores = storeNames.filter(
      (name) => !db.objectStoreNames.contains(name)
    );

    // ถ้ามี stores ที่หายไป ให้เพิ่มเวอร์ชันและอัพเกรดใหม่
    if (missingStores.length > 0) {
      console.log("Missing stores detected:", missingStores);
      db.close();
      currentVersion++;
      return openDB(DB_NAME, currentVersion, {
        upgrade(database, oldVersion, newVersion, transaction) {
          console.log(
            `Creating missing stores from version ${oldVersion} to ${newVersion}`
          );
          missingStores.forEach((storeName) => {
            const config = STORE_CONFIGS.find(
              (config) => config.name === storeName
            );
            if (config) {
              database.createObjectStore(config.name, {
                keyPath: config.keyPath,
                autoIncrement: config.autoIncrement,
              });
              console.log(`Created missing store: ${config.name}`);
            }
          });
        },
      });
    }

    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    // ลองลบและสร้างใหม่ในกรณีที่เกิดข้อผิดพลาด
    await deleteDatabase();
    return initDatabase();
  }
}

/**
 * เตรียมฐานข้อมูลให้พร้อมใช้งาน - ควรเรียกเมื่อเริ่มต้นแอพพลิเคชัน
 */
export async function prepareDatabase(): Promise<IDBPDatabase> {
  try {
    // ปิดการเชื่อมต่อเก่าที่อาจค้างอยู่
    await closeDatabaseConnections();

    // ตรวจสอบว่ามีฐานข้อมูลอยู่แล้วหรือไม่
    const databases = await indexedDB.databases();
    const dbExists = databases.some((db) => db.name === DB_NAME);

    if (!dbExists) {
      // ถ้าไม่มีฐานข้อมูล ให้สร้างใหม่
      return initDatabase();
    }

    // เปิดฐานข้อมูลที่มีอยู่เพื่อตรวจสอบ stores
    const db = await openDB(DB_NAME);
    currentVersion = db.version;

    // ตรวจสอบว่ามี stores ครบหรือไม่
    const missingStores = storeNames.filter(
      (name) => !db.objectStoreNames.contains(name)
    );

    if (missingStores.length > 0) {
      // ถ้า stores ไม่ครบ ให้ปิดการเชื่อมต่อและสร้าง stores ที่หายไป
      console.log("Missing stores detected:", missingStores);
      db.close();
      currentVersion++;

      return openDB(DB_NAME, currentVersion, {
        upgrade(database, oldVersion, newVersion, transaction) {
          console.log(
            `Creating missing stores from version ${oldVersion} to ${newVersion}`
          );
          missingStores.forEach((storeName) => {
            const config = STORE_CONFIGS.find(
              (config) => config.name === storeName
            );
            if (config) {
              database.createObjectStore(config.name, {
                keyPath: config.keyPath,
                autoIncrement: config.autoIncrement,
              });
              console.log(`Created missing store: ${config.name}`);
            }
          });
        },
      });
    }

    return db;
  } catch (error) {
    console.error("Error preparing database:", error);
    // ลองลบและสร้างใหม่ในกรณีที่เกิดข้อผิดพลาด
    await deleteDatabase();
    return initDatabase();
  }
}

/**
 * เปิดฐานข้อมูลและเข้าถึง store ที่ต้องการ
 */
export async function getDB(storeName: string): Promise<IDBPDatabase> {
  try {
    // ตรวจสอบว่า storeName อยู่ในรายการที่กำหนดไว้หรือไม่
    if (!storeNames.includes(storeName)) {
      throw new Error(`Invalid store name: ${storeName}`);
    }

    const db = await openDB(DB_NAME, currentVersion);

    // ตรวจสอบว่ามี store ที่ต้องการหรือไม่
    if (!db.objectStoreNames.contains(storeName)) {
      // ถ้าไม่มี ให้ปิดการเชื่อมต่อและอัพเกรด
      console.log(`Store ${storeName} does not exist. Upgrading database...`);
      db.close();
      currentVersion++;

      return openDB(DB_NAME, currentVersion, {
        upgrade(database, oldVersion, newVersion, transaction) {
          console.log(
            `Upgrading database from ${oldVersion} to ${newVersion} to add ${storeName}`
          );
          const config = STORE_CONFIGS.find(
            (config) => config.name === storeName
          );
          if (config && !database.objectStoreNames.contains(config.name)) {
            database.createObjectStore(config.name, {
              keyPath: config.keyPath,
              autoIncrement: config.autoIncrement,
            });
            console.log(`Created store: ${config.name}`);
          }
        },
      });
    }

    return db;
  } catch (error) {
    console.error(`Error getting database for store ${storeName}:`, error);
    // ลองเตรียมฐานข้อมูลใหม่ในกรณีที่เกิดข้อผิดพลาด
    return prepareDatabase();
  }
}

/**
 * ปิดการเชื่อมต่อฐานข้อมูลที่เปิดอยู่
 */
export async function closeDatabaseConnections(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.close();
        console.log("Database connection closed");
        resolve(true);
      };

      request.onerror = (event) => {
        console.error("Error closing database:", event);
        resolve(false);
      };
    } catch (error) {
      console.error("Error in closeDatabaseConnections:", error);
      resolve(false);
    }
  });
}

/**
 * ลบฐานข้อมูลทั้งหมด
 */
export async function deleteDatabase(
  dbName: string = DB_NAME
): Promise<boolean> {
  await closeDatabaseConnections();

  return new Promise<boolean>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);

    request.onsuccess = () => {
      console.log(`Database ${dbName} deleted successfully`);
      currentVersion = DB_INITIAL_VERSION; // รีเซ็ตเวอร์ชันเมื่อลบฐานข้อมูล
      resolve(true);
    };

    request.onerror = (event) => {
      console.error(`Error deleting database ${dbName}:`, event);
      reject(new Error(`Failed to delete database ${dbName}`));
    };

    request.onblocked = (event) => {
      console.warn(
        `Database deletion was blocked. Close all tabs and try again.`
      );
      reject(new Error(`Database deletion was blocked`));
    };
  });
}

/**
 * ลบทุก stores ในฐานข้อมูล
 */
export async function deleteAllStores(): Promise<boolean> {
  try {
    // ปิดการเชื่อมต่อเก่าที่อาจค้างอยู่
    await closeDatabaseConnections();

    // ลบฐานข้อมูลและสร้างใหม่เพื่อให้แน่ใจว่าลบได้หมด
    await deleteDatabase();
    await initDatabase();

    return true;
  } catch (error) {
    console.error("Error deleting all stores:", error);
    return false;
  }
}
