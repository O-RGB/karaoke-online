import { deleteDB, IDBPDatabase, openDB } from "idb";

const DB_NAME = "Karaoke-online";
const DB_VERSION = 1;

export async function getDB(
  store_name: string,
  autoIncrement: boolean = false
) {
  return upgradeDB(store_name, autoIncrement);
}

async function upgradeDB(store_name: string, autoIncrement: boolean) {
  const db = await openDB(DB_NAME);

  if (!db.objectStoreNames.contains(store_name)) {
    const newVersion = db.version + 1;
    db.close();

    return openDB(DB_NAME, newVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(store_name)) {
          db.createObjectStore(store_name, {
            keyPath: autoIncrement ? "id" : undefined,
            autoIncrement: autoIncrement,
          });
        }
      },
    });
  }
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
