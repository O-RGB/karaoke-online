import { getDB } from "@/utils/database/db";
import { IDBPDatabase, IDBPObjectStore, IDBPTransaction } from "idb";

// MODEL

export async function storageGet<T = any>(
  key: string | number,
  storage_name: string,
  mode: "readonly" = "readonly"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    const data = await store.get(key);

    await tx.done;
    if (data) {
      return data as T;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}

export async function storageGetAll<T = any[]>(
  storage_name: string,
  mode: "readonly" = "readonly"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    const data = await store.getAll(); // ใช้ getAll เพื่อดึงข้อมูลทั้งหมด

    await tx.done;
    if (data) {
      return data as T;
    } else {
      return [] as T;
    }
  } catch (error) {
    console.error(error);
    return [] as T;
  }
}

export async function storageGetAllKeys(storage_name: string) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, "readonly");
    const store = tx.objectStore(storage_name);
    const keys = await store.getAllKeys();

    await tx.done;
    return keys;
  } catch (error) {
    console.error("Error retrieving keys:", error);
    return [];
  }
}

export async function storageAdd(
  key: string,
  value: any,
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.add(value, key);

    await tx.done;
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
}

export async function Add(
  model: () => Promise<{
    store?: IDBPObjectStore<any, any, any, "readwrite">;
    tx?: IDBPTransaction<any, any, any>;
    db?: IDBPDatabase<any>;
    loaded: boolean;
  }>,
  value: { id: string; obj: any }
) {
  try {
    const { tx, store, loaded } = await model();
    if (!loaded) {
      return false;
    }
    store?.add(value.obj, value.id);
    await tx?.done;
    return true;
  } catch (error) {
    return false;
  }
}

export async function storageAddAll(
  list: { key: string; value: any }[],
  storage_name: string,
  onProgress?: (progress?: IProgressBar) => void,
  mode: "readwrite" = "readwrite"
) {
  const db = await getDB(storage_name);
  const tx = db.transaction(storage_name, mode);
  const store = tx.objectStore(storage_name);
  let error = undefined;
  for (let i = 0; i < list.length; i++) {
    try {
      await store.add(list[i].value, list[i].key);
    } catch (e) {
      error = JSON.stringify(e);
      if (error === "{}") {
        error = undefined;
      }
    }
    onProgress?.({
      progress: Math.round(((i + 1) / list.length) * 100),
      processing: list[i]?.key,
      error: error,
    });
  }

  await tx.done;
  return true;
}

export async function storageDelete(
  key: string,
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.delete(key);

    await tx.done;
    return true;
  } catch (error) {
    return false;
  }
}

export async function sortageDeleteAll(
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.clear();

    await tx.done;
    return true;
  } catch (error) {
    console.error("Error deleting all data:", error);
    return false;
  }
}
